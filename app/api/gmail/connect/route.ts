import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getGoogleOAuthConfig, buildGmailAuthUrl } from "@/lib/gmail/oauth";

export const STATE_COOKIE = "gmail_oauth_state";

/**
 * Démarre le flow OAuth Gmail : pose un `state` anti-CSRF en cookie httpOnly,
 * puis redirige vers l'écran de consentement Google.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const config = getGoogleOAuthConfig();
  if (!config) {
    return NextResponse.redirect(
      new URL("/settings?gmail=notconfigured", request.url),
    );
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(buildGmailAuthUrl(config, state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
