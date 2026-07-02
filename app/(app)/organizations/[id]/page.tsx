import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { OrganizationDetail } from "@/components/organizations/organization-detail";
import type { Organization } from "@/components/organizations/org-types";
import type { Contact } from "@/components/contacts/roles";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 16 : params est asynchrone.
  const { id } = await params;
  const supabase = await createClient();

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name, type, city, country, website, notes")
    .eq("id", id)
    .maybeSingle();

  if (!organization) notFound();

  // Contacts liés (via la table de jointure) — en lecture (liaison gérée côté contact).
  const { data: links } = await supabase
    .from("contact_organizations")
    .select("contacts(id, first_name, last_name, email, phone, role, notes)")
    .eq("organization_id", id);

  const linkedContacts: Contact[] = (links ?? [])
    .map((l) => l.contacts)
    .filter((c): c is Contact => c !== null);

  return (
    <OrganizationDetail
      organization={organization as Organization}
      linkedContacts={linkedContacts}
    />
  );
}
