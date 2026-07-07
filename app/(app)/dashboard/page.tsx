import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fullName } from "@/components/contacts/roles";
import { todayISO, isoInDays, todayLabelFr } from "@/lib/utils/date";
import {
  DashboardView,
  type ConfirmedItem,
  type OptionItem,
  type RelanceItem,
} from "@/components/dashboard/dashboard-view";

const ACTIVE_STATUSES = [
  "prospect",
  "contacted",
  "negotiation",
  "option",
] as const;

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = todayISO();
  const in30 = isoInDays(30);
  const todayLabel = todayLabelFr();

  const [
    { data: relanceRows },
    { data: confirmedRows },
    { data: optionRows },
    { count: contactCount },
    { count: activeOppCount },
    { count: overdueCount },
    { count: unreadInboxCount },
    { count: sequenceCount },
  ] = await Promise.all([
    // À relancer : tâches ouvertes dont l'échéance est passée ou = aujourd'hui.
    supabase
      .from("tasks")
      .select(
        "id, title, due_date, opportunity_id, contact_id, opportunities(title), contacts(first_name, last_name)",
      )
      .eq("done", false)
      .lte("due_date", today)
      .order("due_date", { ascending: true }),
    // Prochaines dates confirmées (30 jours).
    supabase
      .from("opportunities")
      .select("id, title, gig_date, fee")
      .eq("status", "confirmed")
      .gte("gig_date", today)
      .lte("gig_date", in30)
      .order("gig_date", { ascending: true }),
    // Options en cours.
    supabase
      .from("opportunities")
      .select("id, title, gig_date")
      .eq("status", "option")
      .order("gig_date", { ascending: true, nullsFirst: false }),
    // Compteurs.
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase
      .from("opportunities")
      .select("*", { count: "exact", head: true })
      .in("status", [...ACTIVE_STATUSES]),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("done", false)
      .lt("due_date", today),
    // Réponses entrantes non lues.
    supabase
      .from("email_logs")
      .select("*", { count: "exact", head: true })
      .eq("direction", "inbound")
      .eq("read", false),
    // Séquences existantes (checklist Démarrage).
    supabase.from("sequences").select("*", { count: "exact", head: true }),
  ]);

  // État de configuration pour la checklist « Démarrage ».
  // La connexion mail vit dans `gmail_tokens` (verrouillée service_role) →
  // besoin du workspace_id + client admin. Best-effort : « non connecté » si KO.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let mailConnected = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("workspace_id")
      .eq("id", user.id)
      .single();
    if (profile?.workspace_id) {
      try {
        const admin = createAdminClient();
        const { data: token } = await admin
          .from("gmail_tokens")
          .select("id")
          .eq("workspace_id", profile.workspace_id)
          .maybeSingle();
        mailConnected = token !== null;
      } catch {
        mailConnected = false;
      }
    }
  }

  const relance: RelanceItem[] = (relanceRows ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    due_date: t.due_date,
    href: t.opportunity_id
      ? `/opportunities/${t.opportunity_id}`
      : t.contact_id
        ? `/contacts/${t.contact_id}`
        : null,
    linkLabel: t.opportunity_id
      ? (t.opportunities?.title ?? "Opportunité")
      : t.contact_id
        ? t.contacts
          ? fullName(t.contacts)
          : "Contact"
        : null,
  }));

  const confirmed: ConfirmedItem[] = (confirmedRows ?? []).map((o) => ({
    id: o.id,
    title: o.title,
    gig_date: o.gig_date,
    fee: o.fee,
  }));

  const options: OptionItem[] = (optionRows ?? []).map((o) => ({
    id: o.id,
    title: o.title,
    gig_date: o.gig_date,
  }));

  return (
    <DashboardView
      todayLabel={todayLabel}
      counts={{
        contacts: contactCount ?? 0,
        activeOpps: activeOppCount ?? 0,
        overdue: overdueCount ?? 0,
        unreadInbox: unreadInboxCount ?? 0,
      }}
      relance={relance}
      confirmed={confirmed}
      options={options}
      setup={{
        mailConnected,
        hasContacts: (contactCount ?? 0) > 0,
        hasSequence: (sequenceCount ?? 0) > 0,
      }}
    />
  );
}
