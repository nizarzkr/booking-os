import "server-only";

import { sendGmailMessage } from "@/lib/gmail/send";
import { sendSmtpMessage } from "@/lib/email/smtp";
import type { MailConnection } from "@/lib/email/types";

export type SendMailParams = {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
};

export type SendMailResult = {
  messageId: string;
  threadId: string | null; // Gmail uniquement ; null en IMAP/SMTP
};

/**
 * Envoie un email via la connexion résolue du workspace (Gmail ou IMAP/SMTP).
 * Le `from` est toujours l'adresse de la boîte connectée.
 */
export async function sendMail(
  connection: MailConnection,
  params: SendMailParams,
): Promise<SendMailResult> {
  if (connection.provider === "gmail") {
    const sent = await sendGmailMessage(connection.accessToken, {
      from: connection.email,
      to: params.to,
      subject: params.subject,
      body: params.body,
      replyTo: params.replyTo,
    });
    return { messageId: sent.id, threadId: sent.threadId };
  }

  const sent = await sendSmtpMessage(connection.account, {
    from: connection.email,
    to: params.to,
    subject: params.subject,
    body: params.body,
    replyTo: params.replyTo,
  });
  return { messageId: sent.messageId, threadId: null };
}
