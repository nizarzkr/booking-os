"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type WorkspaceInput = {
  name: string;
  city: string;
};

export type ActionResult = { error: string } | { ok: true };

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

/** Met à jour le nom / la ville de l'espace de travail courant. */
export async function updateWorkspace(
  input: WorkspaceInput,
): Promise<ActionResult> {
  const name = input.name.trim();
  const city = input.city.trim() || null;

  if (!name) return { error: "Le nom de l'espace est requis." };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  // `.select()` pour confirmer qu'une ligne a bien été touchée (la RLS scope
  // au workspace courant) — évite un faux succès sur un no-op.
  const { data, error } = await supabase
    .from("workspaces")
    .update({ name, city })
    .eq("id", workspace_id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { error: "Impossible de mettre à jour l'espace. Réessaie." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
