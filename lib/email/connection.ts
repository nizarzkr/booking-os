import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getGmailConnection } from "@/lib/gmail/client";
import { decrypt, isEmailCryptoConfigured } from "@/lib/email/crypto";
import type { MailConnection } from "@/lib/email/types";

/**
 * Connexion email d'un workspace, tous providers confondus.
 *
 * Priorité à **Gmail** s'il est connecté (intégration plus riche + Calendar),
 * sinon on retombe sur le compte **IMAP/SMTP** (`email_accounts`, verrouillée
 * service_role → client admin, mot de passe déchiffré au dernier moment).
 * `null` si aucune boîte connectée / config manquante.
 */
export async function getMailConnection(
  workspaceId: string,
): Promise<MailConnection | null> {
  const gmail = await getGmailConnection(workspaceId);
  if (gmail) {
    return {
      provider: "gmail",
      email: gmail.email,
      accessToken: gmail.accessToken,
    };
  }

  if (!isEmailCryptoConfigured()) return null;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return null;
  }

  const { data: row } = await admin
    .from("email_accounts")
    .select(
      "email, username, password_encrypted, smtp_host, smtp_port, smtp_secure, imap_host, imap_port, imap_secure",
    )
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!row) return null;

  let password: string;
  try {
    password = decrypt(row.password_encrypted);
  } catch {
    return null; // clé changée / donnée corrompue → traité comme non connecté
  }

  return {
    provider: "imap_smtp",
    email: row.email,
    account: {
      email: row.email,
      username: row.username,
      password,
      smtp_host: row.smtp_host,
      smtp_port: row.smtp_port,
      smtp_secure: row.smtp_secure,
      imap_host: row.imap_host,
      imap_port: row.imap_port,
      imap_secure: row.imap_secure,
    },
  };
}
