import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour les Client Components (navigateur).
 * À paramétrer avec `<Database>` une fois les types générés (étape 0.2).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
