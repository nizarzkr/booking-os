import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { syncInboundForWorkspace } from "@/lib/gmail/receive";

/**
 * Récupération inbound pour TOUS les workspaces connectés.
 *
 * Destinée à être appelée par un planificateur (Vercel Cron) :
 *   GET /api/gmail/sync  avec en-tête  Authorization: Bearer <CRON_SECRET>
 *
 * Protégée par `CRON_SECRET` (jamais exposé au navigateur). Sans secret
 * configuré, la route renvoie 503 (désactivée) plutôt que d'être ouverte.
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

  const { data: tokens } = await admin
    .from("gmail_tokens")
    .select("workspace_id");

  let inserted = 0;
  let workspaces = 0;
  for (const t of tokens ?? []) {
    const result = await syncInboundForWorkspace(t.workspace_id);
    workspaces += 1;
    if ("inserted" in result) inserted += result.inserted;
  }

  return NextResponse.json({ ok: true, workspaces, inserted });
}
