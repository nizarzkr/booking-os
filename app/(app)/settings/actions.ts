"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revokeGoogleToken } from "@/lib/gmail/oauth";
import type { Database } from "@/types/database.types";

export type WorkspaceInput = {
  name: string;
  city: string;
  email_signature: string;
  reply_to: string;
};

export type ActionResult = { error: string } | { ok: true };

const EMAIL_RE = /^\S+@\S+\.\S+$/;

async function getWorkspaceId(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();
  return data?.workspace_id ?? null;
}

/** Met à jour le nom / la ville / signature / reply-to de l'espace courant. */
export async function updateWorkspace(
  input: WorkspaceInput,
): Promise<ActionResult> {
  const name = input.name.trim();
  const city = input.city.trim() || null;
  const email_signature = input.email_signature.trim() || null;
  const reply_to = input.reply_to.trim() || null;

  if (!name) return { error: "Le nom de l'espace est requis." };
  if (reply_to && !EMAIL_RE.test(reply_to))
    return { error: "L'adresse de réponse (reply-to) est invalide." };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  // `.select()` pour confirmer qu'une ligne a bien été touchée (la RLS scope
  // au workspace courant) — évite un faux succès sur un no-op.
  const { data, error } = await supabase
    .from("workspaces")
    .update({ name, city, email_signature, reply_to })
    .eq("id", workspace_id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { error: "Impossible de mettre à jour l'espace. Réessaie." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Supprime définitivement le compte : révoque Google, supprime le workspace
 * (cascade sur toutes les données) puis l'utilisateur (public + auth).
 * Irréversible. L'utilisateur doit retaper le nom de son espace en confirmation.
 */
export async function deleteAccount(
  confirmation: string,
): Promise<ActionResult> {
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
  const workspaceId = profile?.workspace_id ?? null;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Suppression indisponible (configuration serveur)." };
  }

  if (workspaceId) {
    // Confirmation forte : le nom saisi doit correspondre à l'espace.
    const { data: ws } = await admin
      .from("workspaces")
      .select("name")
      .eq("id", workspaceId)
      .single();
    if (!ws) return { error: "Espace introuvable." };
    if (confirmation.trim() !== ws.name) {
      return { error: "Le nom saisi ne correspond pas à ton espace." };
    }

    // Révoquer le token Google avant que la cascade ne l'efface (best-effort).
    const { data: tok } = await admin
      .from("gmail_tokens")
      .select("refresh_token")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (tok?.refresh_token) await revokeGoogleToken(tok.refresh_token);

    // Supprimer l'espace → cascade (contacts, oppos, tâches, emails, tokens…).
    const { error: wsErr } = await admin
      .from("workspaces")
      .delete()
      .eq("id", workspaceId);
    if (wsErr) return { error: "Impossible de supprimer les données. Réessaie." };
  }

  // Supprimer la ligne applicative puis l'utilisateur auth (ordre robuste).
  await admin.from("users").delete().eq("id", user.id);
  const { error: authErr } = await admin.auth.admin.deleteUser(user.id);
  if (authErr) return { error: "Impossible de supprimer le compte. Réessaie." };

  await supabase.auth.signOut();
  return { ok: true };
}
