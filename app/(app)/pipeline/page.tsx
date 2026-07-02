import { Alert, Stack, Text, Title } from "@mantine/core";

import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/components/contacts/roles";
import { type OpportunityListItem } from "@/components/opportunities/opportunities-view";
import { PipelineView } from "@/components/opportunities/pipeline-view";

export default async function PipelinePage() {
  const supabase = await createClient();

  // RLS scope automatiquement au workspace courant.
  const { data: rows, error } = await supabase
    .from("opportunities")
    .select(
      "id, title, status, gig_date, fee, city, venue, notes, contact_id, organization_id, contacts(first_name, last_name), organizations(name)",
    )
    .order("gig_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

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
    contact_name: o.contacts ? fullName(o.contacts) || null : null,
    organization_name: o.organizations?.name ?? null,
  }));

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={1}>Pipeline</Title>
        <Text c="dimmed" size="sm">
          Fais avancer chaque opportunité d&apos;un statut à l&apos;autre avec
          les flèches ◀ ▶.
        </Text>
      </Stack>

      {error ? (
        <Alert color="red" variant="light" radius="md">
          Impossible de charger le pipeline. Réessaie.
        </Alert>
      ) : (
        <PipelineView opportunities={opportunities} />
      )}
    </Stack>
  );
}
