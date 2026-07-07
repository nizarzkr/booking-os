import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getMailConnection } from "@/lib/email/connection";
import { syncInboundForWorkspace as syncGmailInbound } from "@/lib/gmail/receive";
import { syncImapInbound } from "@/lib/email/imap";
import type { MailSyncOutcome } from "@/lib/email/types";

/**
 * Sync inbound d'un workspace, tous providers confondus (dispatcher).
 * Gmail → sync par threads (API Gmail) ; IMAP/SMTP → sync IMAP (imapflow).
 */
export async function syncInboundForWorkspace(
  workspaceId: string,
): Promise<MailSyncOutcome> {
  const connection = await getMailConnection(workspaceId);
  if (!connection) return { error: "no_connection" };

  if (connection.provider === "gmail") {
    return syncGmailInbound(workspaceId);
  }
  return syncImapInbound(workspaceId, connection.account);
}

/**
 * Liste des workspaces ayant une boîte connectée (Gmail OU IMAP/SMTP), dédupliquée.
 * Utilisé par le cron pour parcourir toutes les connexions.
 */
export async function listConnectedWorkspaceIds(): Promise<string[]> {
  const admin = createAdminClient();
  const [{ data: gmail }, { data: imap }] = await Promise.all([
    admin.from("gmail_tokens").select("workspace_id"),
    admin.from("email_accounts").select("workspace_id"),
  ]);
  const ids = new Set<string>();
  for (const r of gmail ?? []) ids.add(r.workspace_id);
  for (const r of imap ?? []) ids.add(r.workspace_id);
  return [...ids];
}
