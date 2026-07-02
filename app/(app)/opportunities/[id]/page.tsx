import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/components/contacts/roles";
import { OpportunityDetail } from "@/components/opportunities/opportunity-detail";

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 16 : params est async.
  const { id } = await params;
  const supabase = await createClient();

  // RLS scope au workspace courant → maybeSingle + notFound si absent/inaccessible.
  const { data: opportunity } = await supabase
    .from("opportunities")
    .select(
      "id, title, status, gig_date, fee, city, venue, notes, contact_id, organization_id, contacts(id, first_name, last_name, email), organizations(id, name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!opportunity) notFound();

  // Listes pour le modal d'édition, tâches liées, templates + nom d'artiste
  // (pour l'envoi d'email).
  const [
    { data: contacts },
    { data: organizations },
    { data: tasks },
    { data: templates },
    { data: ws },
  ] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .order("first_name", { ascending: true }),
    supabase
      .from("organizations")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, title, due_date, done, opportunity_id, contact_id")
      .eq("opportunity_id", id)
      .order("done", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("email_templates")
      .select("id, name, subject, body")
      .order("name", { ascending: true }),
    supabase.from("workspaces").select("name").limit(1).maybeSingle(),
  ]);

  // Historique des emails de cette opportunité.
  const { data: emailLogs } = await supabase
    .from("email_logs")
    .select("id, subject, body, direction, sent_at, read")
    .eq("opportunity_id", id)
    .order("sent_at", { ascending: false });

  const contactOptions = (contacts ?? []).map((c) => ({
    value: c.id,
    label: fullName(c),
  }));
  const organizationOptions = (organizations ?? []).map((org) => ({
    value: org.id,
    label: org.name,
  }));

  return (
    <OpportunityDetail
      opportunity={{
        id: opportunity.id,
        title: opportunity.title,
        status: opportunity.status,
        gig_date: opportunity.gig_date,
        fee: opportunity.fee,
        city: opportunity.city,
        venue: opportunity.venue,
        notes: opportunity.notes,
        contact_id: opportunity.contact_id,
        organization_id: opportunity.organization_id,
      }}
      contact={
        opportunity.contacts
          ? {
              id: opportunity.contacts.id,
              name: fullName(opportunity.contacts),
            }
          : null
      }
      organization={
        opportunity.organizations
          ? {
              id: opportunity.organizations.id,
              name: opportunity.organizations.name,
            }
          : null
      }
      contactOptions={contactOptions}
      organizationOptions={organizationOptions}
      tasks={tasks ?? []}
      contactEmail={opportunity.contacts?.email ?? null}
      templates={templates ?? []}
      artistName={ws?.name ?? ""}
      emailLogs={emailLogs ?? []}
    />
  );
}
