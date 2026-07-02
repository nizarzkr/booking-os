import { Alert, Stack, Title } from "@mantine/core";

import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/components/contacts/roles";
import {
  OpportunitiesView,
  type OpportunityListItem,
} from "@/components/opportunities/opportunities-view";

export default async function OpportunitiesPage() {
  const supabase = await createClient();

  // RLS scope automatiquement au workspace courant (current_workspace_id()).
  const { data: rows, error } = await supabase
    .from("opportunities")
    .select(
      "id, title, status, gig_date, fee, city, venue, notes, contact_id, organization_id, contacts(first_name, last_name), organizations(name)",
    )
    .order("gig_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  // Listes pour les <Select> du formulaire (contact / organisation).
  const [{ data: contacts }, { data: organizations }] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .order("first_name", { ascending: true }),
    supabase
      .from("organizations")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  const opportunities: OpportunityListItem[] = (rows ?? []).map((o) => ({
    id: o.id,
    title: o.title,
    status: o.status,
    gig_date: o.gig_date,
    fee: o.fee,
    city: o.city,
    venue: o.venue,
    notes: o.notes,
    contact_id: o.contact_id,
    organization_id: o.organization_id,
    contact_name: o.contacts
      ? fullName(o.contacts) || null
      : null,
    organization_name: o.organizations?.name ?? null,
  }));

  const contactOptions = (contacts ?? []).map((c) => ({
    value: c.id,
    label: fullName(c),
  }));
  const organizationOptions = (organizations ?? []).map((org) => ({
    value: org.id,
    label: org.name,
  }));

  return (
    <Stack gap="lg">
      <Title order={1}>Opportunités</Title>

      {error ? (
        <Alert color="red" variant="light" radius="md">
          Impossible de charger les opportunités. Réessaie.
        </Alert>
      ) : (
        <OpportunitiesView
          opportunities={opportunities}
          contactOptions={contactOptions}
          organizationOptions={organizationOptions}
        />
      )}
    </Stack>
  );
}
