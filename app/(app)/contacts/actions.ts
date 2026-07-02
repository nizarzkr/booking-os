"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizeContact as normalize,
  validateContact as validate,
  type ContactInput,
} from "@/components/contacts/contact-input";

export type { ContactInput };

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
