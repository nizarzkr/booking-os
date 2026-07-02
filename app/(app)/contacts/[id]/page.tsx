import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ContactDetail } from "@/components/contacts/contact-detail";
import type { Contact } from "@/components/contacts/roles";
import type { Organization } from "@/components/organizations/org-types";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 16 : params est asynchrone.
  const { id } = await params;
  const supabase = await createClient();

  // RLS scope tout au workspace courant.
  const { data: contact } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, email, phone, role, notes")
    .eq("id", id)
    .maybeSingle();

  if (!contact) notFound();

  // Organisations liées (via la table de jointure).
  const { data: links } = await supabase
    .from("contact_organizations")
    .select("organizations(id, name, type, city, country, website, notes)")
    .eq("contact_id", id);

  const linkedOrgs: Organization[] = (links ?? [])
    .map((l) => l.organizations)
    .filter((o): o is Organization => o !== null);

  // Toutes les organisations du workspace (sélecteur de liaison), tâches liées,
  // templates d'email (pour l'envoi) et nom d'artiste (variable de template).
  const [{ data: allOrgs }, { data: tasks }, { data: templates }, { data: ws }] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("id, name, type, city, country, website, notes")
        .order("name", { ascending: true }),
      supabase
        .from("tasks")
        .select("id, title, due_date, done, opportunity_id, contact_id")
        .eq("contact_id", id)
        .order("done", { ascending: true })
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("email_templates")
        .select("id, name, subject, body")
        .order("name", { ascending: true }),
      supabase.from("workspaces").select("name").limit(1).maybeSingle(),
    ]);

  // Historique des emails de ce contact.
  const { data: emailLogs } = await supabase
    .from("email_logs")
    .select("id, subject, body, direction, sent_at, read")
    .eq("contact_id", id)
    .order("sent_at", { ascending: false });

  return (
    <ContactDetail
      contact={contact as Contact}
      linkedOrgs={linkedOrgs}
      allOrgs={allOrgs ?? []}
      tasks={tasks ?? []}
      templates={templates ?? []}
      artistName={ws?.name ?? ""}
      emailLogs={emailLogs ?? []}
    />
  );
}
