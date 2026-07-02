import type { Database } from "@/types/database.types";

export type OrganizationType = Database["public"]["Enums"]["organization_type"];

export type Organization = Pick<
  Database["public"]["Tables"]["organizations"]["Row"],
  "id" | "name" | "type" | "city" | "country" | "website" | "notes"
>;

// Libellés + couleurs des types (mint réservé à l'action → types en pastels/gris).
export const ORG_TYPE_META: Record<
  OrganizationType,
  { label: string; color: string }
> = {
  salle: { label: "Salle", color: "gray" },
  festival: { label: "Festival", color: "gray" },
  agence: { label: "Agence", color: "gray" },
  label: { label: "Label", color: "gray" },
  autre: { label: "Autre", color: "gray" },
};

export const ORG_TYPES = Object.keys(ORG_TYPE_META) as OrganizationType[];

export const ORG_TYPE_SELECT_OPTIONS = ORG_TYPES.map((t) => ({
  value: t,
  label: ORG_TYPE_META[t].label,
}));

export const ORG_TYPE_FILTER_OPTIONS = [
  { value: "", label: "Tous les types" },
  ...ORG_TYPE_SELECT_OPTIONS,
];
