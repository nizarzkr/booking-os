import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getGoogleOAuthConfig, refreshAccessToken } from "@/lib/gmail/oauth";

export type GmailConnection = { accessToken: string; email: string };

/**
 * Access token valide pour le workspace, rafraîchi si nécessaire.
 * `null` si aucune boîte connectée, creds absents, ou refresh échoué.
 *
 * `gmail_tokens` étant verrouillée service_role, tout passe par le client admin.
 */
export async function getGmailConnection(
  workspaceId: string,
): Promise<GmailConnection | null> {
  const config = getGoogleOAuthConfig();
  if (!config) return null;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return null;
  }

  const { data: row } = await admin
    .from("gmail_tokens")
    .select("access_token, refresh_token, email, expires_at")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!row) return null;

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  // Marge d'1 min pour éviter d'utiliser un token qui expire pendant l'envoi.
  if (expiresAt - Date.now() > 60_000) {
    return { accessToken: row.access_token, email: row.email };
  }

  // Expiré (ou proche) → rafraîchir et persister le nouveau token.
  try {
    const refreshed = await refreshAccessToken(config, row.refresh_token);
    const newExpiresAt = new Date(
      Date.now() + refreshed.expires_in * 1000,
    ).toISOString();
    await admin
      .from("gmail_tokens")
      .update({
        access_token: refreshed.access_token,
        expires_at: newExpiresAt,
      })
      .eq("workspace_id", workspaceId);
    return { accessToken: refreshed.access_token, email: row.email };
  } catch {
    return null;
  }
}
