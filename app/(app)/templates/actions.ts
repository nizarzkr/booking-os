"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type TemplateInput = {
  name: string;
  subject: string;
  body: string;
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

function normalize(input: TemplateInput) {
  return {
    name: input.name.trim(),
    subject: input.subject.trim(),
    body: input.body.trim(),
  };
}

function validate(fields: ReturnType<typeof normalize>): string | null {
  if (!fields.name) return "Le nom du template est requis.";
  return null;
}

export async function createTemplate(
  input: TemplateInput,
): Promise<ActionResult> {
  const fields = normalize(input);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  const { error } = await supabase
    .from("email_templates")
    .insert({ workspace_id, ...fields });

  if (error) return { error: "Impossible de créer le template. Réessaie." };

  revalidatePath("/templates");
  return { ok: true };
}

export async function updateTemplate(
  id: string,
  input: TemplateInput,
): Promise<ActionResult> {
  const fields = normalize(input);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const { error } = await supabase
    .from("email_templates")
    .update(fields)
    .eq("id", id);

  if (error) return { error: "Impossible de modifier le template. Réessaie." };

  revalidatePath("/templates");
  return { ok: true };
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("email_templates")
    .delete()
    .eq("id", id);

  if (error) return { error: "Impossible de supprimer le template. Réessaie." };

  revalidatePath("/templates");
  return { ok: true };
}
