import { Alert, Stack, Title } from "@mantine/core";

import { createClient } from "@/lib/supabase/server";
import { OrganizationsView } from "@/components/organizations/organizations-view";

export default async function OrganizationsPage() {
  const supabase = await createClient();

  // RLS scope automatiquement au workspace courant (current_workspace_id()).
  const { data: organizations, error } = await supabase
    .from("organizations")
    .select("id, name, type, city, country, website, notes")
    .order("name", { ascending: true });

  return (
    <Stack gap="lg">
      <Title order={1}>Organisations</Title>

      {error ? (
        <Alert color="red" variant="light" radius="md">
          Impossible de charger les organisations. Réessaie.
        </Alert>
      ) : (
        <OrganizationsView organizations={organizations ?? []} />
      )}
    </Stack>
  );
}
