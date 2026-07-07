import { Alert, Stack, Title } from "@mantine/core";

import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/components/contacts/roles";
import { OutreachHub, type OutreachTab } from "@/components/outreach/outreach-hub";
import { type EmailTemplate } from "@/components/templates/template-types";
import { type PreviewOpportunity } from "@/components/templates/template-preview-modal";
import { type InboxItem } from "@/components/inbox/inbox-view";
import { type SequenceListItem } from "@/components/sequences/sequence-types";

const VALID_TABS: OutreachTab[] = ["sequences", "templates", "inbox"];

export default async function OutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab: OutreachTab = VALID_TABS.includes(tab as OutreachTab)
    ? (tab as OutreachTab)
    : "inbox";

  const supabase = await createClient();

  // RLS scope tout au workspace courant (current_workspace_id()).
  const [
    { data: templates, error: templatesError },
    { data: contacts },
    { data: opportunities },
    { data: workspace },
    { data: inboxRows, error: inboxError },
    { data: sequenceRows, error: sequencesError },
    { data: stepRows },
    { data: activeEnrollments },
  ] = await Promise.all([
    supabase
      .from("email_templates")
      .select("id, name, subject, body")
      .order("name", { ascending: true }),
    supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .order("first_name", { ascending: true }),
    supabase
      .from("opportunities")
      .select("id, title, venue, gig_date, fee, city")
      .order("created_at", { ascending: false }),
    supabase.from("workspaces").select("name").limit(1).maybeSingle(),
    supabase
      .from("email_logs")
      .select(
        "id, subject, body, sent_at, read, contact_id, opportunity_id, contacts(first_name, last_name), opportunities(title)",
      )
      .eq("direction", "inbound")
      .order("sent_at", { ascending: false })
      .limit(100),
    supabase.from("sequences").select("id, name").order("name", { ascending: true }),
    supabase.from("sequence_steps").select("sequence_id"),
    supabase
      .from("sequence_enrollments")
      .select("sequence_id")
      .eq("status", "active"),
  ]);

  const previewContacts = (contacts ?? []).map((c) => ({
    id: c.id,
    name: fullName(c),
  }));
  const previewOpportunities: PreviewOpportunity[] = opportunities ?? [];
  const artistName = workspace?.name ?? "";

  const inboxItems: InboxItem[] = (inboxRows ?? []).map((r) => {
    const href = r.opportunity_id
      ? `/opportunities/${r.opportunity_id}`
      : r.contact_id
        ? `/contacts/${r.contact_id}`
        : null;
    const from = r.opportunity_id
      ? (r.opportunities?.title ?? "Opportunité")
      : r.contacts
        ? fullName(r.contacts)
        : "Contact inconnu";
    return {
      id: r.id,
      subject: r.subject,
      body: r.body,
      sent_at: r.sent_at,
      read: r.read,
      href,
      from,
    };
  });

  // Compteurs par séquence (étapes + enrôlements actifs).
  const stepCounts = new Map<string, number>();
  for (const s of stepRows ?? [])
    stepCounts.set(s.sequence_id, (stepCounts.get(s.sequence_id) ?? 0) + 1);
  const activeCounts = new Map<string, number>();
  for (const e of activeEnrollments ?? [])
    activeCounts.set(e.sequence_id, (activeCounts.get(e.sequence_id) ?? 0) + 1);
  const sequences: SequenceListItem[] = (sequenceRows ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    stepCount: stepCounts.get(s.id) ?? 0,
    activeCount: activeCounts.get(s.id) ?? 0,
  }));

  const error = templatesError ?? inboxError ?? sequencesError;

  return (
    <Stack gap="lg">
      <Title order={1}>Prospection</Title>

      {error ? (
        <Alert color="red" variant="light" radius="md">
          Impossible de charger la prospection. Réessaie.
        </Alert>
      ) : (
        <OutreachHub
          sequences={sequences}
          templates={(templates ?? []) as EmailTemplate[]}
          previewContacts={previewContacts}
          previewOpportunities={previewOpportunities}
          artistName={artistName}
          inboxItems={inboxItems}
          initialTab={initialTab}
        />
      )}
    </Stack>
  );
}
