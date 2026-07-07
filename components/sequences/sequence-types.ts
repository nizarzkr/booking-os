import dayjs from "dayjs";
import "dayjs/locale/fr";

import type { Database } from "@/types/database.types";

export type Sequence = Pick<
  Database["public"]["Tables"]["sequences"]["Row"],
  "id" | "name"
>;

export type SequenceStep = Pick<
  Database["public"]["Tables"]["sequence_steps"]["Row"],
  "id" | "step_order" | "delay_days" | "subject" | "body"
>;

export type EnrollmentStatus = "active" | "completed" | "stopped";

export const ENROLLMENT_STATUS_META: Record<
  EnrollmentStatus,
  { label: string; color: string }
> = {
  active: { label: "Actif", color: "blue" },
  completed: { label: "Terminé", color: "gray" },
  stopped: { label: "Arrêté", color: "red" },
};

// Motif d'arrêt → libellé lisible (colonne `stop_reason`).
export const STOP_REASON_LABEL: Record<string, string> = {
  replied: "a répondu",
  manual: "arrêt manuel",
  no_email: "pas d'email",
  send_failed: "échec d'envoi",
};

// Séquence + compteurs pour la liste du hub.
export type SequenceListItem = Sequence & {
  stepCount: number;
  activeCount: number;
};

// Ligne d'enrôlement affichée dans le builder.
export type EnrollmentRow = {
  id: string;
  contact_id: string;
  contact_name: string;
  status: EnrollmentStatus;
  current_step: number;
  next_send_at: string | null;
  stop_reason: string | null;
};

/** Prochaine relance formatée (`12 juil. 2026`), tiret si absente. */
export function formatNextSend(iso: string | null): string {
  if (!iso) return "—";
  return dayjs(iso).locale("fr").format("D MMM YYYY");
}

/** Libellé de délai d'une étape : « immédiat » ou « J+3 ». */
export function formatDelay(days: number): string {
  return days === 0 ? "immédiat" : `J+${days}`;
}
