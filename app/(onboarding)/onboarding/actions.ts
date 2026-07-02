"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type OnboardingState = { error: string } | null;

/**
 * Bootstrap onboarding (étape 1.2).
 * Ordre imposé par la RLS :
 *   1. créer le workspace (owner_id = auth.uid())
 *   2. poser users.workspace_id  → `current_workspace_id()` renvoie ce workspace
 *   3. créer le profil artiste (workspace_id) — passe car RLS ws_all résout désormais
 * Tout se fait avec le client authentifié (pas de service_role nécessaire).
 */
export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim() || null;

  if (!name) {
    return { error: "Le nom d'artiste ou de projet est requis." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Idempotence : si un workspace est déjà rattaché, on ne recrée rien.
  const { data: profile } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();

  if (profile?.workspace_id) redirect("/dashboard");

  // 1. Workspace
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert({ name, city, owner_id: user.id })
    .select("id")
    .single();

  if (wsError || !workspace) {
    return { error: "Impossible de créer l'espace de travail. Réessaie." };
  }

  // 2. Rattacher le workspace à l'utilisateur
  const { error: userError } = await supabase
    .from("users")
    .update({ workspace_id: workspace.id })
    .eq("id", user.id);

  if (userError) {
    return { error: "Impossible de finaliser la configuration du compte." };
  }

  // 3. Profil artiste (conteneur 1:1, rempli progressivement plus tard)
  const { error: profileError } = await supabase
    .from("artist_profiles")
    .insert({ workspace_id: workspace.id });

  if (profileError) {
    // Non bloquant : le workspace existe, le profil pourra être créé plus tard.
    // On continue vers le dashboard.
  }

  redirect("/dashboard");
}
