"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string } | { ok: true };

/** Lie une organisation à un contact (RLS `contact_orgs_all` vérifie les deux). */
export async function linkOrganization(
  contactId: string,
  organizationId: string,
): Promise<ActionResult> {
  if (!organizationId) return { error: "Choisis une organisation." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_organizations")
    .insert({ contact_id: contactId, organization_id: organizationId });

  if (error) return { error: "Impossible de lier l'organisation. Réessaie." };

  revalidatePath(`/contacts/${contactId}`);
  return { ok: true };
}

export async function unlinkOrganization(
  contactId: string,
  organizationId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_organizations")
    .delete()
    .eq("contact_id", contactId)
    .eq("organization_id", organizationId);

  if (error) return { error: "Impossible de délier l'organisation. Réessaie." };

  revalidatePath(`/contacts/${contactId}`);
  return { ok: true };
}
