import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ContactImporter } from "@/components/contacts/contact-importer";

export default async function ImportContactsPage() {
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

  return <ContactImporter />;
}
