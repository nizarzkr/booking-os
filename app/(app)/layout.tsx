import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/layout/app-nav";

/**
 * Layout des routes applicatives protégées (avec shell/sidebar).
 * Gardes serveur : auth + workspace. L'onboarding vit dans le groupe
 * (onboarding) SANS ce shell, donc rediriger ici ne boucle pas.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile?.workspace_id) redirect("/onboarding");

  const [{ data: workspace }, { count: unreadInbox }] = await Promise.all([
    supabase
      .from("workspaces")
      .select("name")
      .eq("id", profile.workspace_id)
      .single(),
    // Réponses entrantes non lues (RLS scope au workspace courant).
    supabase
      .from("email_logs")
      .select("*", { count: "exact", head: true })
      .eq("direction", "inbound")
      .eq("read", false),
  ]);

  return (
    <AppNav
      workspaceName={workspace?.name ?? "Mon espace"}
      unreadInbox={unreadInbox ?? 0}
    >
      {children}
    </AppNav>
  );
}
