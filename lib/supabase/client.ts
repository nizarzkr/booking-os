import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";

/**
 * Client Supabase pour les Client Components (navigateur).
 * Utilise la clé publiable (sb_publishable_...).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
