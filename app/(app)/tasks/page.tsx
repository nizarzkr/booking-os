import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/components/contacts/roles";
import {
  TasksView,
  type TaskListItem,
} from "@/components/tasks/tasks-view";

export default async function TasksPage() {
  const supabase = await createClient();

  // RLS scope automatiquement au workspace courant.
  const { data: rows, error } = await supabase
    .from("tasks")
    .select(
      "id, title, due_date, done, opportunity_id, contact_id, opportunities(title), contacts(first_name, last_name)",
    )
    .order("done", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false });

  // Listes pour les <Select> du formulaire (opportunité / contact).
  const [{ data: opportunities }, { data: contacts }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id, title")
      .order("created_at", { ascending: false }),
    supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .order("first_name", { ascending: true }),
  ]);

  const tasks: TaskListItem[] = (rows ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    due_date: t.due_date,
    done: t.done,
    opportunity_id: t.opportunity_id,
    contact_id: t.contact_id,
    opportunity_title: t.opportunities?.title ?? null,
    contact_name: t.contacts ? fullName(t.contacts) || null : null,
  }));

  const opportunityOptions = (opportunities ?? []).map((o) => ({
    value: o.id,
    label: o.title,
  }));
  const contactOptions = (contacts ?? []).map((c) => ({
    value: c.id,
    label: fullName(c),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Tâches</h1>

      {error ? (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Impossible de charger les tâches. Réessaie.
        </div>
      ) : (
        <TasksView
          tasks={tasks}
          opportunityOptions={opportunityOptions}
          contactOptions={contactOptions}
        />
      )}
    </div>
  );
}
