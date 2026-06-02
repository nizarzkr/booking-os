import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase pour le serveur (Server Components, Route Handlers, Server Actions).
 * Next 16 : `cookies()` est asynchrone, donc cette fonction est `async`.
 * À paramétrer avec `<Database>` une fois les types générés (étape 0.2).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Appelé depuis un Server Component : on ignore.
            // Le middleware (étape 1.1) se chargera de rafraîchir la session.
          }
        },
      },
    },
  );
}
