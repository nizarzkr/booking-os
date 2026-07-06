import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/components/contacts/roles";
import { InboxView, type InboxItem } from "@/components/inbox/inbox-view";

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS scope la lecture au workspace courant.
  const { data: rows } = await supabase
    .from("email_logs")
    .select(
      "id, subject, body, sent_at, read, contact_id, opportunity_id, contacts(first_name, last_name), opportunities(title)",
    )
    .eq("direction", "inbound")
    .order("sent_at", { ascending: false })
    .limit(100);

  const items: InboxItem[] = (rows ?? []).map((r) => {
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

  return <InboxView items={items} />;
}
