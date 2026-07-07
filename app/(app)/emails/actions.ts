"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getMailConnection } from "@/lib/email/connection";
import { sendMail } from "@/lib/email/send";

export type SendEmailInput = {
  to: string;
  subject: string;
  body: string;
  contactId: string | null;
  opportunityId: string | null;
};

export type ActionResult = { error: string } | { ok: true };

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Envoie un email depuis la boîte Gmail connectée et journalise l'envoi
 * (`email_logs`, direction outbound). `email_logs` est en RLS `ws_all` →
 * insertion via le client authentifié.
 */
export async function sendEmail(input: SendEmailInput): Promise<ActionResult> {
  const to = input.to.trim();
  const subject = input.subject.trim();
  const body = input.body;

  if (!EMAIL_RE.test(to)) return { error: "Adresse destinataire invalide." };
  if (!subject) return { error: "L'objet est requis." };
  if (!body.trim()) return { error: "Le message est vide." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session invalide. Reconnecte-toi." };

  const { data: profile } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();
  if (!profile?.workspace_id) return { error: "Aucun espace de travail." };

  const connection = await getMailConnection(profile.workspace_id);
  if (!connection) {
    return {
      error: "Connecte ta boîte mail dans les réglages pour envoyer un email.",
    };
  }

  // Signature + reply-to configurés dans les réglages (étape 7.2).
  const { data: ws } = await supabase
    .from("workspaces")
    .select("email_signature, reply_to")
    .eq("id", profile.workspace_id)
    .single();

  const signature = ws?.email_signature?.trim();
  const finalBody = signature ? `${body}\n\n-- \n${signature}` : body;
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
    return { error: "L'envoi a échoué. Réessaie." };
  }

  // Journalisation (best-effort : l'email est parti, on ne bloque pas dessus).
  // `gmail_message_id` = Message-ID (Gmail ou SMTP) → sert à la détection de
  // réponse. `gmail_thread_id` reste null hors Gmail.
  await supabase.from("email_logs").insert({
    workspace_id: profile.workspace_id,
    contact_id: input.contactId,
    opportunity_id: input.opportunityId,
    subject,
    body,
    direction: "outbound",
    gmail_message_id: sent.messageId,
    gmail_thread_id: sent.threadId,
    read: true,
  });

  if (input.contactId) revalidatePath(`/contacts/${input.contactId}`);
  if (input.opportunityId)
    revalidatePath(`/opportunities/${input.opportunityId}`);
  return { ok: true };
}
