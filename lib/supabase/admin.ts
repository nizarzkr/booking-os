import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

/**
 * Client Supabase `service_role` — **SERVEUR UNIQUEMENT**.
 *
 * Bypasse la RLS : réservé aux tables verrouillées `service_role` (ex.
 * `gmail_tokens`, dont aucune policy n'autorise le rôle `authenticated`).
 * `import "server-only"` garantit une erreur de build si on l'importe depuis
 * un composant client. Ne JAMAIS exposer la clé service_role au navigateur.
 *
 * Lève si la clé n'est pas configurée → l'appelant gère le fallback
 * (« Gmail non configuré »).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL manquant.",
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
