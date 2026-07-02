import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
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

  return (
    <SettingsView
      workspace={{ name: workspace?.name ?? "", city: workspace?.city ?? null }}
      accountEmail={user.email ?? "—"}
    />
  );
}
