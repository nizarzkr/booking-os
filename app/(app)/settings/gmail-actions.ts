"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revokeGoogleToken } from "@/lib/gmail/oauth";

export type ActionResult = { error: string } | { ok: true };

/** Déconnecte Gmail : révoque le token chez Google (best-effort) et supprime
 *  la ligne `gmail_tokens` du workspace. */
export async function disconnectGmail(): Promise<ActionResult> {
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

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Intégration non configurée côté serveur." };
  }

  const { data: rows } = await admin
    .from("gmail_tokens")
    .select("refresh_token")
    .eq("workspace_id", profile.workspace_id);

  for (const row of rows ?? []) {
    if (row.refresh_token) await revokeGoogleToken(row.refresh_token);
  }

  const { error } = await admin
    .from("gmail_tokens")
    .delete()
    .eq("workspace_id", profile.workspace_id);
  if (error) return { error: "Impossible de déconnecter Gmail. Réessaie." };

  revalidatePath("/settings");
  return { ok: true };
}
