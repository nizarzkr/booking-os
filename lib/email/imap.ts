import "server-only";

import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ImapSmtpAccount, MailSyncOutcome } from "@/lib/email/types";

/**
 * Réception des réponses entrantes via IMAP (miroir de la sync Gmail).
 *
 * On ne journalise que les messages qui **répondent à un email qu'on a envoyé**
 * (match `In-Reply-To`/`References` contre nos `Message-ID` sortants stockés
 * dans `email_logs.gmail_message_id`). La réponse hérite alors du
 * `contact_id`/`opportunity_id` du message d'origine → elle apparaît sur la
 * bonne fiche, et la coupure-sur-réponse des séquences se déclenche.
 * Idempotent : dédup par `Message-ID`.
 */

const MAX_BODY_LEN = 10_000;
const MAX_MESSAGES = 200; // garde-fou : on ne traite que les plus récents

/** Normalise un Message-ID pour comparaison (sans chevrons, minuscule). */
function normalizeMsgId(id: string): string {
  return id.trim().replace(/^<+/, "").replace(/>+$/, "").toLowerCase();
}

type Attribution = {
  contact_id: string | null;
  opportunity_id: string | null;
};

/**
 * Vérifie que les identifiants IMAP permettent de se connecter (login + TLS),
 * sans rien lire. Utilisé avant d'enregistrer une connexion.
 */
export async function verifyImap(account: ImapSmtpAccount): Promise<void> {
  const client = new ImapFlow({
    host: account.imap_host,
    port: account.imap_port,
    secure: account.imap_secure,
    auth: { user: account.username, pass: account.password },
    logger: false,
  });
  await client.connect();
  await client.logout();
}

export async function syncImapInbound(
  workspaceId: string,
  account: ImapSmtpAccount,
): Promise<MailSyncOutcome> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "not_configured" };
  }

  // Nos emails déjà journalisés : sortants (cibles de réponse) + entrants (dédup).
  const { data: logs, error: readError } = await admin
    .from("email_logs")
    .select("gmail_message_id, contact_id, opportunity_id, direction")
    .eq("workspace_id", workspaceId);
  if (readError) return { error: "read_failed" };

  const outboundById = new Map<string, Attribution>();
  const existingInbound = new Set<string>();
  for (const l of logs ?? []) {
    if (!l.gmail_message_id) continue;
    const norm = normalizeMsgId(l.gmail_message_id);
    if (l.direction === "outbound") {
      outboundById.set(norm, {
        contact_id: l.contact_id,
        opportunity_id: l.opportunity_id,
      });
    } else {
      existingInbound.add(norm);
    }
  }
  // Aucun sortant → aucune réponse à rattacher.
  if (outboundById.size === 0) return { inserted: 0 };

  const { data: acctRow } = await admin
    .from("email_accounts")
    .select("last_synced_at")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  const since = acctRow?.last_synced_at
    ? new Date(acctRow.last_synced_at)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const me = account.email.toLowerCase();
  const toInsert: {
    workspace_id: string;
    contact_id: string | null;
    opportunity_id: string | null;
    gmail_thread_id: null;
    gmail_message_id: string;
    subject: string | null;
    body: string;
    direction: "inbound";
    read: boolean;
    sent_at: string;
  }[] = [];

  const client = new ImapFlow({
    host: account.imap_host,
    port: account.imap_port,
    secure: account.imap_secure,
    auth: { user: account.username, pass: account.password },
    logger: false,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const found = await client.search({ since }, { uid: true });
      const uids = Array.isArray(found) ? found.slice(-MAX_MESSAGES) : [];
      if (uids.length > 0) {
        for await (const msg of client.fetch(
          uids,
          { source: true },
          { uid: true },
        )) {
          if (!msg.source) continue;
          const parsed = await simpleParser(msg.source);

          const rawId = parsed.messageId ?? "";
          const msgId = rawId ? normalizeMsgId(rawId) : "";
          if (!msgId || existingInbound.has(msgId)) continue;

          const fromAddr = (
            parsed.from?.value?.[0]?.address ?? ""
          ).toLowerCase();
          if (!fromAddr || fromAddr === me) continue; // ignore nos propres messages

          // Réponse à l'un de nos envois ?
          const refs: string[] = [];
          if (parsed.inReplyTo) refs.push(...parsed.inReplyTo.split(/\s+/));
          if (parsed.references) {
            const r = parsed.references;
            refs.push(...(Array.isArray(r) ? r : [r]));
          }
          let attribution: Attribution | undefined;
          for (const ref of refs) {
            const hit = outboundById.get(normalizeMsgId(ref));
            if (hit) {
              attribution = hit;
              break;
            }
          }
          if (!attribution) continue; // pas une réponse à nos envois → ignoré

          const rawBody = (parsed.text ?? "").trim();
          const body =
            rawBody.length > MAX_BODY_LEN
              ? `${rawBody.slice(0, MAX_BODY_LEN)}…`
              : rawBody;
          const sentAt = parsed.date
            ? parsed.date.toISOString()
            : new Date().toISOString();

          toInsert.push({
            workspace_id: workspaceId,
            contact_id: attribution.contact_id,
            opportunity_id: attribution.opportunity_id,
            gmail_thread_id: null,
            gmail_message_id: rawId,
            subject: parsed.subject ?? null,
            body,
            direction: "inbound",
            read: false,
            sent_at: sentAt,
          });
          existingInbound.add(msgId);
        }
      }
    } finally {
      lock.release();
    }
    await client.logout();
  } catch {
    try {
      await client.logout();
    } catch {
      // déjà déconnecté
    }
    return { error: "read_failed" };
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await admin
      .from("email_logs")
      .insert(toInsert);
    if (insertError) return { error: "insert_failed" };
  }

  await admin
    .from("email_accounts")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId);

  return { inserted: toInsert.length };
}
