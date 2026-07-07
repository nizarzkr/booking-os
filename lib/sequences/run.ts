import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getMailConnection } from "@/lib/email/connection";
import { sendMail } from "@/lib/email/send";
import { renderTemplate } from "@/components/templates/template-types";

type Admin = ReturnType<typeof createAdminClient>;

export type ProcessOutcome =
  | "sent"
  | "completed"
  | "stopped_replied"
  | "stopped_no_email"
  | "stopped_send_failed"
  | "skipped_no_gmail"
  | "skipped";

const DAY_MS = 24 * 60 * 60 * 1000;

function isoInDays(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

async function stop(
  admin: Admin,
  enrollmentId: string,
  reason: string,
): Promise<void> {
  await admin
    .from("sequence_enrollments")
    .update({ status: "stopped", stop_reason: reason, next_send_at: null })
    .eq("id", enrollmentId);
}

/**
 * Traite un enrollment : coupure sur réponse, envoi de l'étape courante, puis
 * avance à l'étape suivante (ou complète). Best-effort et idempotent-ish : à
 * n'appeler que sur des enrollments dus. Utilise le client admin (hors session).
 */
export async function processEnrollment(
  admin: Admin,
  enrollmentId: string,
): Promise<ProcessOutcome> {
  const { data: enr } = await admin
    .from("sequence_enrollments")
    .select(
      "id, workspace_id, sequence_id, contact_id, status, current_step, created_at",
    )
    .eq("id", enrollmentId)
    .maybeSingle();

  if (!enr || enr.status !== "active") return "skipped";

  // 1. Coupure sur réponse : une réponse entrante du contact depuis l'enrôlement.
  const { count: replyCount } = await admin
    .from("email_logs")
    .select("id", { count: "exact", head: true })
    .eq("contact_id", enr.contact_id)
    .eq("direction", "inbound")
    .gte("sent_at", enr.created_at);
  if ((replyCount ?? 0) > 0) {
    await stop(admin, enr.id, "replied");
    return "stopped_replied";
  }

  // 2. Étape courante.
  const { data: step } = await admin
    .from("sequence_steps")
    .select("id, subject, body, step_order")
    .eq("sequence_id", enr.sequence_id)
    .eq("step_order", enr.current_step)
    .maybeSingle();

  if (!step) {
    await admin
      .from("sequence_enrollments")
      .update({ status: "completed", next_send_at: null })
      .eq("id", enr.id);
    return "completed";
  }

  // 3. Contact + adresse.
  const { data: contact } = await admin
    .from("contacts")
    .select("first_name, last_name, email")
    .eq("id", enr.contact_id)
    .maybeSingle();

  const to = contact?.email?.trim();
  if (!to) {
    await stop(admin, enr.id, "no_email");
    return "stopped_no_email";
  }

  // 4. Connexion mail (Gmail ou IMAP/SMTP) : si absente, on laisse
  // l'enrollment en l'état (retry au prochain passage).
  const connection = await getMailConnection(enr.workspace_id);
  if (!connection) return "skipped_no_gmail";

  // 5. Workspace : nom d'artiste (variable) + signature + reply-to.
  const { data: ws } = await admin
    .from("workspaces")
    .select("name, email_signature, reply_to")
    .eq("id", enr.workspace_id)
    .maybeSingle();

  const contactName = [contact?.first_name, contact?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const vars = { contact_name: contactName, artist_name: ws?.name ?? "" };

  const subject = renderTemplate(step.subject, vars);
  const renderedBody = renderTemplate(step.body, vars);
  const signature = ws?.email_signature?.trim();
  const finalBody = signature
    ? `${renderedBody}\n\n-- \n${signature}`
    : renderedBody;
  const replyTo = ws?.reply_to?.trim() || undefined;

  let sent;
  try {
    sent = await sendMail(connection, {
      to,
      subject,
      body: finalBody,
      replyTo,
    });
  } catch {
    await stop(admin, enr.id, "send_failed");
    return "stopped_send_failed";
  }

  // Journalisation (outbound) — permet la détection des réponses (Message-ID
  // pour IMAP, thread pour Gmail).
  await admin.from("email_logs").insert({
    workspace_id: enr.workspace_id,
    contact_id: enr.contact_id,
    subject,
    body: renderedBody,
    direction: "outbound",
    gmail_message_id: sent.messageId,
    gmail_thread_id: sent.threadId,
    read: true,
  });

  // 6. Avance : étape suivante si elle existe, sinon complète.
  const nextOrder = enr.current_step + 1;
  const { data: nextStep } = await admin
    .from("sequence_steps")
    .select("delay_days")
    .eq("sequence_id", enr.sequence_id)
    .eq("step_order", nextOrder)
    .maybeSingle();

  if (nextStep) {
    await admin
      .from("sequence_enrollments")
      .update({
        current_step: nextOrder,
        next_send_at: isoInDays(nextStep.delay_days),
      })
      .eq("id", enr.id);
  } else {
    await admin
      .from("sequence_enrollments")
      .update({ status: "completed", next_send_at: null })
      .eq("id", enr.id);
  }

  return "sent";
}

/**
 * Envoie toutes les étapes dues (tous workspaces). Destiné au cron quotidien.
 */
export async function runDueSteps(
  admin: Admin,
): Promise<{ processed: number; sent: number; stopped: number }> {
  const { data: due } = await admin
    .from("sequence_enrollments")
    .select("id")
    .eq("status", "active")
    .not("next_send_at", "is", null)
    .lte("next_send_at", new Date().toISOString());

  let processed = 0;
  let sent = 0;
  let stopped = 0;
  for (const row of due ?? []) {
    const outcome = await processEnrollment(admin, row.id);
    processed += 1;
    if (outcome === "sent") sent += 1;
    if (outcome.startsWith("stopped")) stopped += 1;
  }

  return { processed, sent, stopped };
}
