import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database.types";

/**
 * Rafraîchit la session Supabase et garde les routes.
 *
 * Next 16 : ce helper est appelé depuis `proxy.ts` (ex-`middleware.ts`, déprécié).
 * Pattern SSR Supabase : ne PAS recréer le NextResponse renvoyé, sinon les
 * cookies de session rafraîchis sont perdus.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT : ne rien exécuter entre createServerClient et getUser().
  // getUser() valide le JWT côté serveur Supabase (best practice en proxy).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  // La route cron s'authentifie par `CRON_SECRET` (pas de session) : elle ne
  // doit pas être redirigée vers /login par la garde.
  const isCronRoute =
    pathname === "/api/gmail/sync" || pathname === "/api/sequences/run";
  const isPublicRoute =
    pathname === "/" ||
    isAuthRoute ||
    isCronRoute ||
    pathname.startsWith("/auth");

  // Non authentifié sur une route protégée → login.
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authentifié sur login/register → dashboard (le layout app réoriente vers
  // /onboarding si le workspace n'est pas encore rattaché).
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
