"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { syncInboundForWorkspace } from "@/lib/gmail/receive";

export type SyncResult = { error: string } | { inserted: number };

async function getWorkspaceId(): Promise<string | null> {
  const supabase = await createClient();
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

/** Déclenche la récupération des réponses entrantes pour le workspace courant. */
export async function syncInbox(): Promise<SyncResult> {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return { error: "Session invalide. Reconnecte-toi." };

  const result = await syncInboundForWorkspace(workspaceId);
  if ("error" in result) {
    if (result.error === "no_connection") {
      return { error: "Connecte ta boîte Gmail dans les réglages." };
    }
    if (result.error === "not_configured") {
      return { error: "Intégration Gmail non configurée côté serveur." };
    }
    return { error: "La synchronisation a échoué. Réessaie." };
  }

  if (result.inserted > 0) {
    revalidatePath("/inbox");
    revalidatePath("/dashboard");
  }
  return { inserted: result.inserted };
}

/** Marque toutes les réponses entrantes non lues du workspace comme lues. */
export async function markAllInboundRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // RLS `ws_all` : la mise à jour est déjà scopée au workspace courant.
  await supabase
    .from("email_logs")
    .update({ read: true })
    .eq("direction", "inbound")
    .eq("read", false);

  revalidatePath("/inbox");
  revalidatePath("/dashboard");
}
