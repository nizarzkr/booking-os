import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// Next 16 : convention `proxy` (l'ancien `middleware` est déprécié).
// L'export DOIT s'appeler `proxy` pour être chargé.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Toutes les routes sauf les assets statiques et l'optimisation d'images.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
