import "server-only";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const GMAIL_PROFILE_URL =
  "https://gmail.googleapis.com/gmail/v1/users/me/profile";

/** Scopes demandés : lecture (réponses inbound) + envoi. */
export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

/**
 * Config OAuth depuis l'env. `null` si les creds ne sont pas encore renseignés
 * → l'UI affiche « Gmail non configuré » plutôt que de planter.
 */
export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

/** URL de consentement Google. `access_type=offline` + `prompt=consent`
 *  garantissent un `refresh_token` (indispensable pour agir plus tard). */
export function buildGmailAuthUrl(
  config: GoogleOAuthConfig,
  state: string,
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GoogleTokens = {
  access_token: string;
  refresh_token: string | null;
  expires_in: number; // secondes
  scope: string;
  token_type: string;
};

/** Échange le code d'autorisation contre des tokens. */
export async function exchangeCodeForTokens(
  config: GoogleOAuthConfig,
  code: string,
): Promise<GoogleTokens> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Échange du code OAuth échoué (${res.status}).`);
  }
  return (await res.json()) as GoogleTokens;
}

/** Adresse Gmail réellement connectée (pour l'afficher / matcher les envois). */
export async function fetchGmailAddress(accessToken: string): Promise<string> {
  const res = await fetch(GMAIL_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Lecture du profil Gmail échouée (${res.status}).`);
  }
  const data = (await res.json()) as { emailAddress?: string };
  return data.emailAddress ?? "";
}

/** Révocation best-effort d'un token (à la déconnexion). N'échoue jamais. */
export async function revokeGoogleToken(token: string): Promise<void> {
  try {
    await fetch(GOOGLE_REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    });
  } catch {
    // best-effort
  }
}
