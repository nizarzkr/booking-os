"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import {
  normalizeContact,
  validateContact,
  type ContactInput,
  type NormalizedContact,
} from "@/components/contacts/contact-input";

const MAX_ROWS = 1000;

export type ImportReport = {
  inserted: number;
  skipped: { line: number; reason: string }[];
};

export type ImportResult = { error: string } | ImportReport;

async function getWorkspaceId(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();
  return data?.workspace_id ?? null;
}

/**
 * Importe des contacts en masse depuis un CSV déjà mappé côté client.
 * Valide chaque ligne, ignore emails invalides et doublons (dans le fichier
 * comme vs l'existant), insère les valides en une requête. Renvoie un rapport.
 */
export async function importContacts(
  rows: ContactInput[],
): Promise<ImportResult> {
  if (rows.length === 0) return { error: "Aucune ligne à importer." };
  if (rows.length > MAX_ROWS) {
    return { error: `Trop de lignes (max ${MAX_ROWS} par import).` };
  }

  const supabase = await createClient();
  const workspace_id = await getWorkspaceId(supabase);
  if (!workspace_id) return { error: "Session invalide. Reconnecte-toi." };

  // Emails déjà présents dans le workspace (dédup vs existant).
  const { data: existing } = await supabase
    .from("contacts")
    .select("email")
    .not("email", "is", null);
  const existingEmails = new Set(
    (existing ?? [])
      .map((c) => c.email?.toLowerCase())
      .filter((e): e is string => !!e),
  );

  const skipped: ImportReport["skipped"] = [];
  const seenEmails = new Set<string>();
  const toInsert: (NormalizedContact & { workspace_id: string })[] = [];

  rows.forEach((row, i) => {
    const line = i + 1;
    const fields = normalizeContact(row);

    const invalid = validateContact(fields);
    if (invalid) {
      skipped.push({ line, reason: invalid });
      return;
    }

    if (fields.email) {
      const key = fields.email.toLowerCase();
      if (existingEmails.has(key)) {
        skipped.push({ line, reason: "Doublon (email déjà présent)." });
        return;
      }
      if (seenEmails.has(key)) {
        skipped.push({ line, reason: "Doublon dans le fichier." });
        return;
      }
      seenEmails.add(key);
    }

    toInsert.push({ ...fields, workspace_id });
  });

  if (toInsert.length > 0) {
    const { error } = await supabase.from("contacts").insert(toInsert);
    if (error) {
      return { error: "L'import a échoué. Réessaie." };
    }
    revalidatePath("/contacts");
  }

  return { inserted: toInsert.length, skipped };
}
