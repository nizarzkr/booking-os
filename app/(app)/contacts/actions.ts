"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type ContactRole = Database["public"]["Enums"]["contact_role"];

const CONTACT_ROLES: ContactRole[] = [
  "booker",
  "programmateur",
  "agent",
  "label",
  "presse",
  "autre",
];

export type ContactInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string | null;
  notes: string;
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

/** Trim, vides → null, rôle validé contre l'enum. */
function normalize(input: ContactInput) {
  const clean = (v: string) => {
    const t = v.trim();
    return t.length > 0 ? t : null;
  };
  const role =
    input.role && CONTACT_ROLES.includes(input.role as ContactRole)
      ? (input.role as ContactRole)
      : null;
  return {
    first_name: input.first_name.trim(),
    last_name: clean(input.last_name),
    email: clean(input.email),
    phone: clean(input.phone),
    role,
    notes: clean(input.notes),
  };
}

/** Validation partagée create/update. */
function validate(fields: ReturnType<typeof normalize>): string | null {
  if (!fields.first_name) return "Le prénom / nom est requis.";
  if (fields.email && !EMAIL_RE.test(fields.email))
    return "L'adresse email n'est pas valide.";
  return null;
}

export async function createContact(input: ContactInput): Promise<ActionResult> {
  const fields = normalize(input);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  const { error } = await supabase
    .from("contacts")
    .insert({ workspace_id, ...fields });

  if (error) return { error: "Impossible de créer le contact. Réessaie." };

  revalidatePath("/contacts");
  return { ok: true };
}

export async function updateContact(
  id: string,
  input: ContactInput,
): Promise<ActionResult> {
  const fields = normalize(input);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  // RLS scope la mise à jour au workspace courant.
  const { error } = await supabase.from("contacts").update(fields).eq("id", id);

  if (error) return { error: "Impossible de modifier le contact. Réessaie." };

  revalidatePath("/contacts");
  return { ok: true };
}

export async function deleteContact(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);

  if (error) return { error: "Impossible de supprimer le contact. Réessaie." };

  revalidatePath("/contacts");
  return { ok: true };
}
