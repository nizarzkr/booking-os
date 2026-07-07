import "server-only";

import nodemailer from "nodemailer";

import type { ImapSmtpAccount } from "@/lib/email/types";

export type SmtpSendParams = {
  from: string;
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
};

/**
 * Envoi d'un email texte via SMTP (nodemailer). Retourne le `Message-ID`
 * généré (avec chevrons) — stocké côté `email_logs` pour la détection de
 * réponse (match `In-Reply-To`/`References` à la réception IMAP).
 */
export async function sendSmtpMessage(
  account: ImapSmtpAccount,
  { from, to, subject, body, replyTo }: SmtpSendParams,
): Promise<{ messageId: string }> {
  const transporter = nodemailer.createTransport({
    host: account.smtp_host,
    port: account.smtp_port,
    secure: account.smtp_secure, // true = SSL (465), false = STARTTLS (587)
    auth: { user: account.username, pass: account.password },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: body,
    replyTo,
  });

  return { messageId: info.messageId };
}

/**
 * Vérifie que les identifiants SMTP sont valides (login + handshake), sans
 * envoyer d'email. Utilisé avant d'enregistrer une connexion.
 */
export async function verifySmtp(account: ImapSmtpAccount): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: account.smtp_host,
    port: account.smtp_port,
    secure: account.smtp_secure,
    auth: { user: account.username, pass: account.password },
  });
  await transporter.verify();
}
