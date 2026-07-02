"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthState =
  | { error: string }
  | { notice: string } // succès non bloquant (ex : email de confirmation envoyé)
  | null;

/**
 * Après authentification : rattachement workspace ?
 * - workspace_id NULL → onboarding (étape 1.2)
 * - sinon → dashboard
 */
async function redirectAfterAuth(): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();

  redirect(profile?.workspace_id ? "/dashboard" : "/onboarding");
}

function parseCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

export async function login(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = parseCredentials(formData);

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  await redirectAfterAuth();
  return null;
}

export async function register(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = parseCredentials(formData);

  if (!email) {
    return { error: "Email requis." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    // Message déjà lisible côté Supabase (ex : "User already registered").
    return { error: error.message };
  }

  // Confirmation email activée (défaut Supabase) → pas de session renvoyée.
  // On informe l'utilisateur plutôt que de le rediriger silencieusement vers
  // /login. Couvre aussi le cas « email déjà inscrit » (session nulle,
  // identities obfusquées) sans divulguer l'existence du compte.
  if (!data.session) {
    return {
      notice:
        "Compte créé. Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.",
    };
  }

  await redirectAfterAuth();
  return null;
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
