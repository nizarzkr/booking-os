import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGoogleOAuthConfig } from "@/lib/gmail/oauth";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ gmail?: string }>;
}) {
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

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, city")
    .eq("id", profile.workspace_id)
    .single();

  // Statut Gmail : table `gmail_tokens` verrouillée service_role → client admin.
  // Si la clé service_role n'est pas configurée, on retombe sur « non connecté ».
  const gmailConfigured = getGoogleOAuthConfig() !== null;
  let gmailEmail: string | null = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("gmail_tokens")
      .select("email")
      .eq("workspace_id", profile.workspace_id)
      .maybeSingle();
    gmailEmail = data?.email ?? null;
  } catch {
    gmailEmail = null;
  }

  const { gmail: gmailFlash } = await searchParams;

  return (
    <SettingsView
      workspace={{ name: workspace?.name ?? "", city: workspace?.city ?? null }}
      accountEmail={user.email ?? "—"}
      gmail={{
        configured: gmailConfigured,
        email: gmailEmail,
      }}
      gmailFlash={gmailFlash ?? null}
    />
  );
}
