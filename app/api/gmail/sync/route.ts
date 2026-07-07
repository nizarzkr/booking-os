import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  syncInboundForWorkspace,
  listConnectedWorkspaceIds,
} from "@/lib/email/receive";

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

  // Vérifie que le service_role est configuré (le dispatcher en dépend).
  try {
    createAdminClient();
  } catch {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const workspaceIds = await listConnectedWorkspaceIds();

  let inserted = 0;
  let workspaces = 0;
  for (const workspaceId of workspaceIds) {
    const result = await syncInboundForWorkspace(workspaceId);
    workspaces += 1;
    if ("inserted" in result) inserted += result.inserted;
  }

  return NextResponse.json({ ok: true, workspaces, inserted });
}
