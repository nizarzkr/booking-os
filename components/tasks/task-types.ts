import dayjs from "dayjs";
import "dayjs/locale/fr";

import type { Database } from "@/types/database.types";

export type Task = Pick<
  Database["public"]["Tables"]["tasks"]["Row"],
  "id" | "title" | "due_date" | "done" | "opportunity_id" | "contact_id"
>;

/** Date d'échéance formatée (`15 août 2026`), tiret si absente. */
export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "—";
  return dayjs(dueDate).locale("fr").format("D MMM YYYY");
}

/**
 * Métadonnée d'échéance pour un badge : uniquement pour les tâches ouvertes
 * en retard ou dues aujourd'hui. `null` sinon (date affichée en texte simple).
 */
export function dueMeta(
  task: Pick<Task, "due_date" | "done">,
): { label: string; color: string } | null {
  if (task.done || !task.due_date) return null;
  const today = dayjs().format("YYYY-MM-DD");
  if (task.due_date < today) return { label: "En retard", color: "red" };
  if (task.due_date === today) return { label: "Aujourd'hui", color: "yellow" };
  return null;
}

/** Une tâche ouverte est-elle en retard (échéance dépassée) ? */
export function isOverdue(task: Pick<Task, "due_date" | "done">): boolean {
  if (task.done || !task.due_date) return false;
  return task.due_date < dayjs().format("YYYY-MM-DD");
}

// Filtres de la vue globale /tasks.
export type TaskFilter = "todo" | "overdue" | "week" | "done" | "all";

export const TASK_FILTER_OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: "todo", label: "À faire" },
  { value: "overdue", label: "En retard" },
  { value: "week", label: "Cette semaine" },
  { value: "done", label: "Terminées" },
  { value: "all", label: "Toutes" },
];

/** Applique un filtre à une tâche (utilisé côté client pour la vue globale). */
export function matchesFilter(
  task: Pick<Task, "due_date" | "done">,
  filter: TaskFilter,
): boolean {
  const today = dayjs().format("YYYY-MM-DD");
  switch (filter) {
    case "todo":
      return !task.done;
    case "overdue":
      return !task.done && !!task.due_date && task.due_date < today;
    case "week": {
      if (task.done || !task.due_date) return false;
      const weekEnd = dayjs().add(7, "day").format("YYYY-MM-DD");
      return task.due_date <= weekEnd;
    }
    case "done":
      return task.done;
    case "all":
    default:
      return true;
  }
}
