import { CONTACT_ROLES, type ContactRole } from "@/components/contacts/roles";

/** Saisie brute d'un contact (formulaire ou ligne CSV mappée). */
export type ContactInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string | null;
  notes: string;
};

/** Contact normalisé, prêt pour l'insert (`workspace_id` ajouté par l'appelant). */
export type NormalizedContact = {
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: ContactRole | null;
  notes: string | null;
};

export const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Trim, chaînes vides → null, rôle validé contre l'enum (inconnu → null). */
export function normalizeContact(input: ContactInput): NormalizedContact {
  const clean = (v: string) => {
    const t = v.trim();
    return t.length > 0 ? t : null;
  };
  const role =
    input.role && CONTACT_ROLES.includes(input.role as ContactRole)
      ? (input.role as ContactRole)
      : null;
  return {
    first_name: input.first_name.trim(),
    last_name: clean(input.last_name),
    email: clean(input.email),
    phone: clean(input.phone),
    role,
    notes: clean(input.notes),
  };
}

/** Validation partagée (create / update / import). `null` si OK. */
export function validateContact(fields: NormalizedContact): string | null {
  if (!fields.first_name) return "Le prénom / nom est requis.";
  if (fields.email && !EMAIL_RE.test(fields.email))
    return "L'adresse email n'est pas valide.";
  return null;
}
