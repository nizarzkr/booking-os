import dayjs from "dayjs";
import "dayjs/locale/fr";

import type { Database } from "@/types/database.types";

export type OpportunityStatus = Database["public"]["Enums"]["opportunity_status"];

export type Opportunity = Pick<
  Database["public"]["Tables"]["opportunities"]["Row"],
  | "id"
  | "title"
  | "status"
  | "gig_date"
  | "fee"
  | "city"
  | "venue"
  | "notes"
  | "contact_id"
  | "organization_id"
>;

// Libellés + couleurs des statuts. Mint est réservé à l'action → statuts en
// pastels décoratifs. `confirmed` reste positif (teal) sans être le mint pur.
// Une seule famille sémantique (pas de déco) : progression neutre → accent →
// positif, avec rouge pour l'annulation.
export const STATUS_META: Record<
  OpportunityStatus,
  { label: string; color: string }
> = {
  prospect: { label: "À contacter", color: "gray" },
  contacted: { label: "Contacté", color: "blue" },
  negotiation: { label: "En discussion", color: "yellow" },
  option: { label: "Pré-réservé", color: "violet" },
  confirmed: { label: "Confirmé", color: "green" },
  cancelled: { label: "Annulé", color: "red" },
};

// Ordre du pipeline (utile pour tri/affichage et future vue Kanban).
export const STATUS_ORDER: OpportunityStatus[] = [
  "prospect",
  "contacted",
  "negotiation",
  "option",
  "confirmed",
  "cancelled",
];

// Options pour le <Select> du formulaire / changement de statut.
export const STATUS_SELECT_OPTIONS = STATUS_ORDER.map((s) => ({
  value: s,
  label: STATUS_META[s].label,
}));

// Options pour le filtre de la liste (avec « Tous »).
export const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  ...STATUS_SELECT_OPTIONS,
];

/** Fee formaté en euros (`1 200 €`), tiret si absent. */
export function formatFee(fee: number | null): string {
  if (fee === null || fee === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(fee);
}

/** Date de gig formatée (`15 août 2026`), tiret si absente. */
export function formatGigDate(gigDate: string | null): string {
  if (!gigDate) return "—";
  return dayjs(gigDate).locale("fr").format("D MMM YYYY");
}
