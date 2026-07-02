import type { Database } from "@/types/database.types";

export type ContactRole = Database["public"]["Enums"]["contact_role"];

export type Contact = Pick<
  Database["public"]["Tables"]["contacts"]["Row"],
  "id" | "first_name" | "last_name" | "email" | "phone" | "role" | "notes"
>;

// Libellés des rôles. Info secondaire → badge neutre (gris) pour ne pas
// concurrencer les statuts (seule famille sémantique colorée). Voir DESIGN_SYSTEM.md.
export const ROLE_META: Record<ContactRole, { label: string; color: string }> = {
  booker: { label: "Booker", color: "gray" },
  programmateur: { label: "Programmateur", color: "gray" },
  agent: { label: "Agent", color: "gray" },
  label: { label: "Label", color: "gray" },
  presse: { label: "Presse", color: "gray" },
  autre: { label: "Autre", color: "gray" },
};

export const CONTACT_ROLES = Object.keys(ROLE_META) as ContactRole[];

// Options pour le <Select> du formulaire (rôle optionnel).
export const ROLE_SELECT_OPTIONS = CONTACT_ROLES.map((r) => ({
  value: r,
  label: ROLE_META[r].label,
}));

// Options pour le filtre de la liste (avec « Tous »).
export const ROLE_FILTER_OPTIONS = [
  { value: "", label: "Tous les rôles" },
  ...ROLE_SELECT_OPTIONS,
];

export function fullName(c: Pick<Contact, "first_name" | "last_name">) {
  return [c.first_name, c.last_name].filter(Boolean).join(" ");
}
