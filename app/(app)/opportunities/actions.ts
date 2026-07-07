"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  syncOpportunityCalendar,
  removeOpportunityEvent,
} from "@/lib/google-calendar/sync";

type OpportunityStatus = Database["public"]["Enums"]["opportunity_status"];

const OPPORTUNITY_STATUSES: OpportunityStatus[] = [
  "prospect",
  "contacted",
  "negotiation",
  "option",
  "confirmed",
  "cancelled",
];

export type OpportunityInput = {
  title: string;
  status: string;
  contact_id: string | null;
  organization_id: string | null;
  gig_date: string | null; // ISO "YYYY-MM-DD"
  city: string;
  venue: string;
  fee: number | null;
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

/** Trim, vides → null, statut validé contre l'enum, fee normalisé. */
function normalize(input: OpportunityInput) {
  const clean = (v: string) => {
    const t = v.trim();
    return t.length > 0 ? t : null;
  };
  const status = OPPORTUNITY_STATUSES.includes(input.status as OpportunityStatus)
    ? (input.status as OpportunityStatus)
    : "prospect";
  const fee =
    typeof input.fee === "number" && Number.isFinite(input.fee)
      ? input.fee
      : null;
  return {
    title: input.title.trim(),
    status,
    contact_id: input.contact_id || null,
    organization_id: input.organization_id || null,
    gig_date: input.gig_date || null,
    city: clean(input.city),
    venue: clean(input.venue),
    fee,
    notes: clean(input.notes),
  };
}

/** Validation partagée create/update. */
function validate(fields: ReturnType<typeof normalize>): string | null {
  if (!fields.title) return "Le titre est requis.";
  if (fields.fee !== null && fields.fee < 0)
    return "Le cachet ne peut pas être négatif.";
  return null;
}

export async function createOpportunity(
  input: OpportunityInput,
): Promise<ActionResult> {
  const fields = normalize(input);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  const { data: created, error } = await supabase
    .from("opportunities")
    .insert({ workspace_id, ...fields })
    .select("id")
    .single();

  if (error || !created)
    return { error: "Impossible de créer l'opportunité. Réessaie." };

  // Sync agenda (best-effort) : crée l'événement si option/confirmed + date.
  await syncOpportunityCalendar(workspace_id, created.id);

  revalidatePath("/opportunities");
  return { ok: true };
}

export async function updateOpportunity(
  id: string,
  input: OpportunityInput,
): Promise<ActionResult> {
  const fields = normalize(input);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  // RLS scope la mise à jour au workspace courant.
  const { error } = await supabase
    .from("opportunities")
    .update(fields)
    .eq("id", id);

  if (error) return { error: "Impossible de modifier l'opportunité. Réessaie." };

  // Sync agenda (statut/date peuvent avoir changé).
  await syncOpportunityCalendar(workspace_id, id);

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
  return { ok: true };
}

export async function deleteOpportunity(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);

  // Lire l'event_id AVANT suppression pour pouvoir retirer l'événement agenda.
  const { data: opp } = await supabase
    .from("opportunities")
    .select("google_calendar_event_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("opportunities").delete().eq("id", id);

  if (error)
    return { error: "Impossible de supprimer l'opportunité. Réessaie." };

  if (workspace_id && opp?.google_calendar_event_id) {
    await removeOpportunityEvent(workspace_id, opp.google_calendar_event_id);
  }

  revalidatePath("/opportunities");
  return { ok: true };
}

/** Changement de statut seul (vue pipeline). Valide contre l'enum. */
export async function setOpportunityStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  if (!OPPORTUNITY_STATUSES.includes(status as OpportunityStatus))
    return { error: "Statut invalide." };

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  const { error } = await supabase
    .from("opportunities")
    .update({ status: status as OpportunityStatus })
    .eq("id", id);

  if (error) return { error: "Impossible de changer le statut. Réessaie." };

  // Sync agenda : option→jaune, confirmed→vert, autre→suppression.
  await syncOpportunityCalendar(workspace_id, id);

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
