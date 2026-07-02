"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type OrganizationType = Database["public"]["Enums"]["organization_type"];

const ORG_TYPES: OrganizationType[] = [
  "salle",
  "festival",
  "agence",
  "label",
  "autre",
];

export type OrganizationInput = {
  name: string;
  type: string | null;
  city: string;
  country: string;
  website: string;
  notes: string;
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

/** Trim, vides → null, type validé contre l'enum. */
function normalize(input: OrganizationInput) {
  const clean = (v: string) => {
    const t = v.trim();
    return t.length > 0 ? t : null;
  };
  const type =
    input.type && ORG_TYPES.includes(input.type as OrganizationType)
      ? (input.type as OrganizationType)
      : null;
  return {
    name: input.name.trim(),
    type,
    city: clean(input.city),
    country: clean(input.country),
    website: clean(input.website),
    notes: clean(input.notes),
  };
}

function validate(fields: ReturnType<typeof normalize>): string | null {
  if (!fields.name) return "Le nom de l'organisation est requis.";
  return null;
}

export async function createOrganization(
  input: OrganizationInput,
): Promise<ActionResult> {
  const fields = normalize(input);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  const { error } = await supabase
    .from("organizations")
    .insert({ workspace_id, ...fields });

  if (error) return { error: "Impossible de créer l'organisation. Réessaie." };

  revalidatePath("/organizations");
  return { ok: true };
}

export async function updateOrganization(
  id: string,
  input: OrganizationInput,
): Promise<ActionResult> {
  const fields = normalize(input);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update(fields)
    .eq("id", id);

  if (error) return { error: "Impossible de modifier l'organisation. Réessaie." };

  revalidatePath("/organizations");
  return { ok: true };
}

export async function deleteOrganization(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("organizations").delete().eq("id", id);

  if (error)
    return { error: "Impossible de supprimer l'organisation. Réessaie." };

  revalidatePath("/organizations");
  return { ok: true };
}
