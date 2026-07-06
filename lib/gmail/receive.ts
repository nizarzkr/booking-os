import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getGmailConnection } from "@/lib/gmail/client";

/**
 * Récupération des réponses entrantes (inbound) via l'API Gmail.
 *
 * Stratégie MVP (pas de Gmail watch/Pub/Sub, cf. décisions) : on ne parcourt
 * que les threads dont on a déjà envoyé un email depuis l'app (`email_logs` avec
 * `gmail_thread_id`). Pour chacun, on récupère les messages du thread et on
 * insère comme `inbound` tout message qui n'est pas de nous et pas encore
 * journalisé. Le `contact_id`/`opportunity_id` est hérité de l'email sortant du
 * même thread → la réponse apparaît sur la bonne fiche.
 *
 * `email_logs` et `gmail_tokens` étant manipulées via le client admin, cette
 * fonction est réutilisable côté server action (utilisateur connecté) ET côté
 * route cron (aucune session). Le scope workspace est toujours explicite.
 */

const MAX_BODY_LEN = 10_000;

type GmailHeader = { name: string; value: string };
type GmailPart = {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailPart[];
  headers?: GmailHeader[];
};
type GmailMessage = {
  id: string;
  threadId: string;
  internalDate?: string;
  snippet?: string;
  payload?: GmailPart;
};
type GmailThread = { id: string; messages?: GmailMessage[] };

function getHeader(headers: GmailHeader[] | undefined, name: string): string {
  const lower = name.toLowerCase();
  return headers?.find((h) => h.name.toLowerCase() === lower)?.value ?? "";
}

/** Extrait l'adresse email d'un en-tête « Nom <email> » (ou brut). */
function extractEmail(from: string): string {
  const m = from.match(/<([^>]+)>/);
  return (m ? m[1] : from).trim().toLowerCase();
}

function decodeBase64Url(data?: string): string {
  if (!data) return "";
  return Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf-8");
}

/** Décode les en-têtes MIME encoded-word (RFC 2047), ex. sujets accentués. */
function decodeMimeWords(s: string): string {
  return s.replace(
    /=\?[^?]+\?([bBqQ])\?([^?]*)\?=/g,
    (_full, enc: string, text: string) => {
      try {
        if (enc.toUpperCase() === "B") {
          return Buffer.from(text, "base64").toString("utf-8");
        }
        const q = text
          .replace(/_/g, " ")
          .replace(/=([0-9A-Fa-f]{2})/g, (_m, h: string) =>
            String.fromCharCode(parseInt(h, 16)),
          );
        return Buffer.from(q, "binary").toString("utf-8");
      } catch {
        return text;
      }
    },
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Cherche récursivement la première partie d'un type MIME donné. */
function findPart(part: GmailPart | undefined, mime: string): string | null {
  if (!part) return null;
  if (part.mimeType === mime && part.body?.data) {
    return decodeBase64Url(part.body.data);
  }
  for (const p of part.parts ?? []) {
    const found = findPart(p, mime);
    if (found) return found;
  }
  return null;
}

/** Corps texte lisible : text/plain en priorité, sinon text/html nettoyé. */
function extractBody(payload: GmailPart | undefined, snippet: string): string {
  const plain = findPart(payload, "text/plain");
  const html = plain ? null : findPart(payload, "text/html");
  const raw = plain ?? (html ? stripHtml(html) : "");
  const body = (raw || snippet).trim();
  return body.length > MAX_BODY_LEN ? `${body.slice(0, MAX_BODY_LEN)}…` : body;
}

async function fetchThread(
  accessToken: string,
  threadId: string,
): Promise<GmailThread> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) {
    throw new Error(`Lecture du thread Gmail échouée (${res.status}).`);
  }
  return (await res.json()) as GmailThread;
}

export type SyncOutcome =
  | { error: "no_connection" | "not_configured" | "read_failed" | "insert_failed" }
  | { inserted: number };

type ThreadInfo = { contact_id: string | null; opportunity_id: string | null };

/**
 * Synchronise les réponses entrantes d'un workspace. Idempotent : ne réinsère
 * jamais un message déjà journalisé (dédup par `gmail_message_id`).
 */
export async function syncInboundForWorkspace(
  workspaceId: string,
): Promise<SyncOutcome> {
  const connection = await getGmailConnection(workspaceId);
  if (!connection) return { error: "no_connection" };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "not_configured" };
  }

  const { data: logs, error: readError } = await admin
    .from("email_logs")
    .select("gmail_thread_id, gmail_message_id, contact_id, opportunity_id")
    .eq("workspace_id", workspaceId)
    .not("gmail_thread_id", "is", null);
  if (readError) return { error: "read_failed" };
  if (!logs || logs.length === 0) return { inserted: 0 };

  const existingMsgIds = new Set(
    logs.map((l) => l.gmail_message_id).filter((v): v is string => Boolean(v)),
  );

  // Un thread peut avoir plusieurs lignes ; on agrège le meilleur rattachement.
  const threads = new Map<string, ThreadInfo>();
  for (const l of logs) {
    if (!l.gmail_thread_id) continue;
    const info = threads.get(l.gmail_thread_id);
    if (!info) {
      threads.set(l.gmail_thread_id, {
        contact_id: l.contact_id,
        opportunity_id: l.opportunity_id,
      });
    } else {
      if (!info.contact_id && l.contact_id) info.contact_id = l.contact_id;
      if (!info.opportunity_id && l.opportunity_id)
        info.opportunity_id = l.opportunity_id;
    }
  }

  const me = connection.email.toLowerCase();
  const toInsert: {
    workspace_id: string;
    contact_id: string | null;
    opportunity_id: string | null;
    gmail_thread_id: string;
    gmail_message_id: string;
    subject: string | null;
    body: string;
    direction: "inbound";
    read: boolean;
    sent_at: string;
  }[] = [];

  for (const [threadId, info] of threads) {
    let thread: GmailThread;
    try {
      thread = await fetchThread(connection.accessToken, threadId);
    } catch {
      continue; // un thread illisible ne doit pas bloquer les autres
    }
    for (const msg of thread.messages ?? []) {
      if (existingMsgIds.has(msg.id)) continue;
      const from = extractEmail(getHeader(msg.payload?.headers, "From"));
      if (!from || from === me) continue; // on ne journalise que l'entrant

      const subject = getHeader(msg.payload?.headers, "Subject");
      const sentAt = msg.internalDate
        ? new Date(Number(msg.internalDate)).toISOString()
        : new Date().toISOString();

      toInsert.push({
        workspace_id: workspaceId,
        contact_id: info.contact_id,
        opportunity_id: info.opportunity_id,
        gmail_thread_id: threadId,
        gmail_message_id: msg.id,
        subject: subject ? decodeMimeWords(subject) : null,
        body: extractBody(msg.payload, msg.snippet ?? ""),
        direction: "inbound",
        read: false,
        sent_at: sentAt,
      });
      existingMsgIds.add(msg.id); // dédup intra-boucle
    }
  }

  if (toInsert.length === 0) return { inserted: 0 };

  const { error: insertError } = await admin.from("email_logs").insert(toInsert);
  if (insertError) return { error: "insert_failed" };
  return { inserted: toInsert.length };
}
