import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getGoogleOAuthConfig,
  exchangeCodeForTokens,
  fetchGmailAddress,
} from "@/lib/gmail/oauth";
import { STATE_COOKIE } from "@/app/api/gmail/connect/route";

/**
 * Callback OAuth Google : valide le `state`, échange le code contre des tokens,
 * puis persiste le refresh_token via le client service_role (la table
 * `gmail_tokens` est verrouillée service_role). Une connexion par workspace.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  // Chaque retour supprime le cookie state (usage unique) sur la réponse.
  const back = (status: string) => {
    const res = NextResponse.redirect(
      new URL(`/settings?gmail=${status}`, request.url),
    );
    res.cookies.delete(STATE_COOKIE);
    return res;
  };

  // L'utilisateur a refusé le consentement.
  if (url.searchParams.get("error")) return back("denied");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return back("error");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: profile } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();
  if (!profile?.workspace_id) return back("error");

  const config = getGoogleOAuthConfig();
  if (!config) return back("notconfigured");

  try {
    const tokens = await exchangeCodeForTokens(config, code);

    // Sans refresh_token on ne peut pas agir durablement → on refuse.
    // (Arrive si Google a déjà consenti sans `prompt=consent`.)
    if (!tokens.refresh_token) return back("norefresh");

    const email = await fetchGmailAddress(tokens.access_token);
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000,
    ).toISOString();

    const admin = createAdminClient();
    // Une seule connexion Gmail par workspace : on remplace l'existante.
    await admin
      .from("gmail_tokens")
      .delete()
      .eq("workspace_id", profile.workspace_id);

    const { error: insertError } = await admin.from("gmail_tokens").insert({
      workspace_id: profile.workspace_id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      email,
      expires_at: expiresAt,
    });
    if (insertError) return back("error");

    return back("connected");
  } catch {
    return back("error");
  }
}
