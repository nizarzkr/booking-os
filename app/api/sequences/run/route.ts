import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { runDueSteps } from "@/lib/sequences/run";

/**
 * Envoi des étapes de séquence dues, pour TOUS les workspaces.
 *
 * Destinée au planificateur (Vercel Cron) :
 *   GET /api/sequences/run  avec  Authorization: Bearer <CRON_SECRET>
 *
 * Protégée par `CRON_SECRET`. Sans secret configuré → 503 (désactivée).
 * Programmée après le sync inbound Gmail pour que les réponses de la nuit
 * soient connues (coupure sur réponse) avant l'envoi des relances.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const result = await runDueSteps(admin);
  return NextResponse.json({ ok: true, ...result });
}
