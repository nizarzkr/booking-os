import type { Database } from "@/types/database.types";

export type EmailTemplate = Pick<
  Database["public"]["Tables"]["email_templates"]["Row"],
  "id" | "name" | "subject" | "body"
>;

// Variables dynamiques supportées dans les templates.
export type TemplateVars = {
  contact_name: string;
  artist_name: string;
  venue: string;
  gig_date: string;
  fee: string;
  city: string;
};

export const TEMPLATE_VARIABLES: {
  key: keyof TemplateVars;
  label: string;
}[] = [
  { key: "contact_name", label: "Nom du contact" },
  { key: "artist_name", label: "Nom d'artiste" },
  { key: "venue", label: "Salle / venue" },
  { key: "gig_date", label: "Date du gig" },
  { key: "fee", label: "Cachet" },
  { key: "city", label: "Ville" },
];

/**
 * Remplace les jetons `{{variable}}` par leur valeur. Un jeton dont la valeur
 * est absente/vide est laissé tel quel (pour repérer ce qui manque en aperçu).
 */
export function renderTemplate(
  text: string,
  vars: Partial<TemplateVars>,
): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
    const value = vars[key as keyof TemplateVars];
    return value ? value : match;
  });
}
