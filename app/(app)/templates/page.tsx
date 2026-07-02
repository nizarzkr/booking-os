import { Alert, Stack, Text, Title } from "@mantine/core";

import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/components/contacts/roles";
import { TemplatesView } from "@/components/templates/templates-view";
import { type EmailTemplate } from "@/components/templates/template-types";
import { type PreviewOpportunity } from "@/components/templates/template-preview-modal";

export default async function TemplatesPage() {
  const supabase = await createClient();

  // RLS scope tout au workspace courant.
  const { data: templates, error } = await supabase
    .from("email_templates")
    .select("id, name, subject, body")
    .order("name", { ascending: true });

  // Données réelles pour l'aperçu (contacts, opportunités, nom d'artiste).
  const [{ data: contacts }, { data: opportunities }, { data: workspace }] =
    await Promise.all([
      supabase
        .from("contacts")
        .select("id, first_name, last_name")
        .order("first_name", { ascending: true }),
      supabase
        .from("opportunities")
        .select("id, title, venue, gig_date, fee, city")
        .order("created_at", { ascending: false }),
      supabase.from("workspaces").select("name").limit(1).maybeSingle(),
    ]);

  const previewContacts = (contacts ?? []).map((c) => ({
    id: c.id,
    name: fullName(c),
  }));
  const previewOpportunities: PreviewOpportunity[] = opportunities ?? [];
  const artistName = workspace?.name ?? "";

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={1}>Templates</Title>
        <Text c="dimmed" size="sm">
          Des modèles d&apos;email réutilisables, avec variables dynamiques et
          aperçu sur des données réelles.
        </Text>
      </Stack>

      {error ? (
        <Alert color="red" variant="light" radius="md">
          Impossible de charger les templates. Réessaie.
        </Alert>
      ) : (
        <TemplatesView
          templates={(templates ?? []) as EmailTemplate[]}
          contacts={previewContacts}
          opportunities={previewOpportunities}
          artistName={artistName}
        />
      )}
    </Stack>
  );
}
