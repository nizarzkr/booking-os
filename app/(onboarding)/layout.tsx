import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Layout de l'onboarding : authentifié mais SANS le shell applicatif
 * (pas de sidebar tant que le workspace n'existe pas).
 */
export default async function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <>{children}</>;
}
