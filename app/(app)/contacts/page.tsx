import { Alert, Stack, Title } from "@mantine/core";

import { createClient } from "@/lib/supabase/server";
import { ContactsView } from "@/components/contacts/contacts-view";

export default async function ContactsPage() {
  const supabase = await createClient();

  // RLS scope automatiquement au workspace courant (current_workspace_id()).
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, email, phone, role, notes")
    .order("first_name", { ascending: true });

  return (
    <Stack gap="lg">
      <Title order={1}>Contacts</Title>

      {error ? (
        <Alert color="red" variant="light" radius="md">
          Impossible de charger les contacts. Réessaie.
        </Alert>
      ) : (
        <ContactsView contacts={contacts ?? []} />
      )}
    </Stack>
  );
}
