import { redirect } from "next/navigation";
import { Center } from "@mantine/core";

import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Déjà onboardé → dashboard (évite de recréer un workspace).
  const { data: profile } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();

  if (profile?.workspace_id) redirect("/dashboard");

  return (
    <Center mih="100dvh" p="md">
      <OnboardingForm />
    </Center>
  );
}
