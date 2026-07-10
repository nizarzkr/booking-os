import { createClient } from "@/lib/supabase/server";
import { ContactsHub, type ContactsTab } from "@/components/contacts/contacts-hub";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab: ContactsTab = tab === "places" ? "places" : "people";

  const supabase = await createClient();

  // RLS scope automatiquement au workspace courant (current_workspace_id()).
  const [
    { data: contacts, error: contactsError },
    { data: organizations, error: orgsError },
    { data: sequences },
  ] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, first_name, last_name, email, phone, role, notes")
      .order("first_name", { ascending: true }),
    supabase
      .from("organizations")
      .select("id, name, type, city, country, website, notes")
      .order("name", { ascending: true }),
    supabase.from("sequences").select("id, name").order("name", { ascending: true }),
  ]);

  const error = contactsError ?? orgsError;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Contacts</h1>

      {error ? (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Impossible de charger le carnet. Réessaie.
        </div>
      ) : (
        <ContactsHub
          contacts={contacts ?? []}
          organizations={organizations ?? []}
          sequences={sequences ?? []}
          initialTab={initialTab}
        />
      )}
    </div>
  );
}
