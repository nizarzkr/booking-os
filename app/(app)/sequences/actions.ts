"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processEnrollment } from "@/lib/sequences/run";
import { SEQUENCE_BLUEPRINTS } from "@/components/sequences/sequence-blueprints";
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ActionResult = { error: string } | { ok: true };
export type CreateResult = { error: string } | { ok: true; id: string };

export type StepInput = {
  delay_days: number;
  subject: string;
  body: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

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

// --- Séquences -----------------------------------------------------------

export async function createSequence(name: string): Promise<CreateResult> {
  const clean = name.trim();
  if (!clean) return { error: "Le nom de la séquence est requis." };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  const { data, error } = await supabase
    .from("sequences")
    .insert({ workspace_id, name: clean })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Impossible de créer la séquence. Réessaie." };
  }

  revalidatePath("/outreach");
  return { ok: true, id: data.id };
}

/**
 * Clone un modèle de la bibliothèque dans les séquences du workspace :
 * crée la séquence + ses étapes (step_order contigu 0..n), prête à éditer.
 */
export async function createSequenceFromBlueprint(
  blueprintId: string,
): Promise<CreateResult> {
  const blueprint = SEQUENCE_BLUEPRINTS.find((b) => b.id === blueprintId);
  if (!blueprint) return { error: "Modèle introuvable." };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  const { data: seq, error: seqError } = await supabase
    .from("sequences")
    .insert({ workspace_id, name: blueprint.name })
    .select("id")
    .single();
  if (seqError || !seq) {
    return { error: "Impossible de créer la séquence. Réessaie." };
  }

  const { error: stepsError } = await supabase.from("sequence_steps").insert(
    blueprint.steps.map((step, i) => ({
      workspace_id,
      sequence_id: seq.id,
      step_order: i,
      delay_days: step.delay_days,
      subject: step.subject,
      body: step.body,
    })),
  );
  if (stepsError) {
    // Best-effort : évite une séquence orpheline sans étapes.
    await supabase.from("sequences").delete().eq("id", seq.id);
    return { error: "Impossible de créer les étapes du modèle. Réessaie." };
  }

  revalidatePath("/outreach");
  return { ok: true, id: seq.id };
}

export async function renameSequence(
  id: string,
  name: string,
): Promise<ActionResult> {
  const clean = name.trim();
  if (!clean) return { error: "Le nom de la séquence est requis." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("sequences")
    .update({ name: clean })
    .eq("id", id);

  if (error) return { error: "Impossible de renommer la séquence. Réessaie." };

  revalidatePath("/outreach");
  revalidatePath(`/sequences/${id}`);
  return { ok: true };
}

export async function deleteSequence(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("sequences").delete().eq("id", id);
  if (error) return { error: "Impossible de supprimer la séquence. Réessaie." };

  revalidatePath("/outreach");
  return { ok: true };
}

// --- Étapes --------------------------------------------------------------

function normalizeStep(input: StepInput) {
  return {
    delay_days: Math.max(0, Math.round(input.delay_days || 0)),
    subject: input.subject.trim(),
    body: input.body.trim(),
  };
}

function validateStep(fields: ReturnType<typeof normalizeStep>): string | null {
  if (!fields.subject) return "L'objet de l'étape est requis.";
  if (!fields.body) return "Le message de l'étape est requis.";
  return null;
}

export async function addStep(
  sequenceId: string,
  input: StepInput,
): Promise<ActionResult> {
  const fields = normalizeStep(input);
  const invalid = validateStep(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  // step_order contigu : max + 1 (0 si première étape).
  const { data: last } = await supabase
    .from("sequence_steps")
    .select("step_order")
    .eq("sequence_id", sequenceId)
    .order("step_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const step_order = last ? last.step_order + 1 : 0;

  const { error } = await supabase
    .from("sequence_steps")
    .insert({ workspace_id, sequence_id: sequenceId, step_order, ...fields });

  if (error) return { error: "Impossible d'ajouter l'étape. Réessaie." };

  revalidatePath(`/sequences/${sequenceId}`);
  return { ok: true };
}

export async function updateStep(
  stepId: string,
  sequenceId: string,
  input: StepInput,
): Promise<ActionResult> {
  const fields = normalizeStep(input);
  const invalid = validateStep(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const { error } = await supabase
    .from("sequence_steps")
    .update(fields)
    .eq("id", stepId);

  if (error) return { error: "Impossible de modifier l'étape. Réessaie." };

  revalidatePath(`/sequences/${sequenceId}`);
  return { ok: true };
}

export async function deleteStep(
  stepId: string,
  sequenceId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sequence_steps")
    .delete()
    .eq("id", stepId);
  if (error) return { error: "Impossible de supprimer l'étape. Réessaie." };

  // Renumérote les étapes restantes pour garder step_order contigu (0..n).
  const { data: rest } = await supabase
    .from("sequence_steps")
    .select("id")
    .eq("sequence_id", sequenceId)
    .order("step_order", { ascending: true });
  await Promise.all(
    (rest ?? []).map((s, i) =>
      supabase
        .from("sequence_steps")
        .update({ step_order: i })
        .eq("id", s.id),
    ),
  );

  revalidatePath(`/sequences/${sequenceId}`);
  return { ok: true };
}

export async function moveStep(
  stepId: string,
  sequenceId: string,
  dir: "up" | "down",
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: steps } = await supabase
    .from("sequence_steps")
    .select("id, step_order")
    .eq("sequence_id", sequenceId)
    .order("step_order", { ascending: true });
  if (!steps) return { error: "Étapes introuvables." };

  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx === -1) return { error: "Étape introuvable." };
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= steps.length) return { ok: true };

  const a = steps[idx];
  const b = steps[swapIdx];
  await Promise.all([
    supabase
      .from("sequence_steps")
      .update({ step_order: b.step_order })
      .eq("id", a.id),
    supabase
      .from("sequence_steps")
      .update({ step_order: a.step_order })
      .eq("id", b.id),
  ]);

  revalidatePath(`/sequences/${sequenceId}`);
  return { ok: true };
}

// --- Enrôlements ---------------------------------------------------------

export async function enrollContacts(
  sequenceId: string,
  contactIds: string[],
): Promise<ActionResult> {
  if (contactIds.length === 0) return { error: "Aucun contact sélectionné." };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  // Première étape (délai initial) — refuse si la séquence est vide.
  const { data: firstStep } = await supabase
    .from("sequence_steps")
    .select("step_order, delay_days")
    .eq("sequence_id", sequenceId)
    .order("step_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!firstStep) {
    return { error: "Ajoute au moins une étape avant d'enrôler des contacts." };
  }

  // Contacts déjà enrôlés dans cette séquence → à ignorer.
  const { data: existing } = await supabase
    .from("sequence_enrollments")
    .select("contact_id")
    .eq("sequence_id", sequenceId)
    .in("contact_id", contactIds);
  const already = new Set((existing ?? []).map((e) => e.contact_id));
  const toEnroll = contactIds.filter((id) => !already.has(id));
  if (toEnroll.length === 0) return { ok: true };

  const nextSendAt = new Date(
    Date.now() + firstStep.delay_days * DAY_MS,
  ).toISOString();

  const { data: inserted, error } = await supabase
    .from("sequence_enrollments")
    .insert(
      toEnroll.map((contact_id) => ({
        workspace_id,
        sequence_id: sequenceId,
        contact_id,
        current_step: firstStep.step_order,
        next_send_at: nextSendAt,
        status: "active",
      })),
    )
    .select("id");

  if (error) return { error: "Impossible d'enrôler les contacts. Réessaie." };

  // Envoi immédiat de la 1re étape si son délai est 0 (sinon le cron s'en charge).
  if (firstStep.delay_days === 0 && inserted) {
    try {
      const admin = createAdminClient();
      await Promise.all(
        inserted.map((e) => processEnrollment(admin, e.id)),
      );
    } catch {
      // Best-effort : les enrollments sont créés, le cron rattrapera l'envoi.
    }
  }

  revalidatePath("/outreach");
  revalidatePath(`/sequences/${sequenceId}`);
  return { ok: true };
}

export async function stopEnrollment(
  enrollmentId: string,
  sequenceId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sequence_enrollments")
    .update({ status: "stopped", stop_reason: "manual", next_send_at: null })
    .eq("id", enrollmentId);

  if (error) return { error: "Impossible d'arrêter l'enrôlement. Réessaie." };

  revalidatePath(`/sequences/${sequenceId}`);
  return { ok: true };
}
