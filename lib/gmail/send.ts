import "server-only";

const GMAIL_SEND_URL =
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

function toBase64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Encode un en-tête non-ASCII en MIME encoded-word (RFC 2047). */
function encodeHeader(value: string): string {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf-8").toString("base64")}?=`;
}

export type SendMessageParams = {
  from: string;
  to: string;
  subject: string;
  body: string;
  threadId?: string;
};

export type SendResult = { id: string; threadId: string };

/**
 * Envoie un email texte via l'API Gmail (`messages.send`).
 * Corps encodé base64 (UTF-8 sûr), message complet en base64url.
 */
export async function sendGmailMessage(
  accessToken: string,
  { from, to, subject, body, threadId }: SendMessageParams,
): Promise<SendResult> {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ];
  const mime =
    headers.join("\r\n") +
    "\r\n\r\n" +
    Buffer.from(body, "utf-8").toString("base64");
  const raw = toBase64Url(Buffer.from(mime, "utf-8"));

  const res = await fetch(GMAIL_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(threadId ? { raw, threadId } : { raw }),
  });

  if (!res.ok) {
    throw new Error(`Envoi Gmail échoué (${res.status}).`);
  }

  const data = (await res.json()) as { id: string; threadId: string };
  return { id: data.id, threadId: data.threadId };
}
