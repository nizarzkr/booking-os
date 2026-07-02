"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type TaskInput = {
  title: string;
  due_date: string | null; // ISO "YYYY-MM-DD"
  opportunity_id: string | null;
  contact_id: string | null;
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

function normalize(input: TaskInput) {
  return {
    title: input.title.trim(),
    due_date: input.due_date || null,
    opportunity_id: input.opportunity_id || null,
    contact_id: input.contact_id || null,
  };
}

function validate(fields: ReturnType<typeof normalize>): string | null {
  if (!fields.title) return "Le titre de la tâche est requis.";
  return null;
}

/** Rafraîchit la vue globale + les fiches potentiellement liées. */
function revalidateTaskViews(fields: {
  opportunity_id: string | null;
  contact_id: string | null;
}) {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (fields.opportunity_id)
    revalidatePath(`/opportunities/${fields.opportunity_id}`);
  if (fields.contact_id) revalidatePath(`/contacts/${fields.contact_id}`);
}

export async function createTask(input: TaskInput): Promise<ActionResult> {
  const fields = normalize(input);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  const { error } = await supabase
    .from("tasks")
    .insert({ workspace_id, ...fields });

  if (error) return { error: "Impossible de créer la tâche. Réessaie." };

  revalidateTaskViews(fields);
  return { ok: true };
}

export async function updateTask(
  id: string,
  input: TaskInput,
): Promise<ActionResult> {
  const fields = normalize(input);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update(fields).eq("id", id);

  if (error) return { error: "Impossible de modifier la tâche. Réessaie." };

  revalidateTaskViews(fields);
  return { ok: true };
}

export async function setTaskDone(
  id: string,
  done: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ done }).eq("id", id);

  if (error) return { error: "Impossible de mettre à jour la tâche. Réessaie." };

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) return { error: "Impossible de supprimer la tâche. Réessaie." };

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { ok: true };
}
