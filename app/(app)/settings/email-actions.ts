"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt, isEmailCryptoConfigured } from "@/lib/email/crypto";
import { verifySmtp } from "@/lib/email/smtp";
import { verifyImap } from "@/lib/email/imap";
import { getPreset } from "@/lib/email/providers";
import type { ImapSmtpAccount } from "@/lib/email/types";

export type ConnectEmailInput = {
  providerId: string;
  email: string;
  username: string;
  password: string;
  // Utilisés uniquement pour le fournisseur « Autre » (saisie manuelle).
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure?: boolean;
  imap_host?: string;
  imap_port?: number;
  imap_secure?: boolean;
};

export type EmailActionResult = { error: string } | { ok: true };

const EMAIL_RE = /^\S+@\S+\.\S+$/;

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

/**
 * Teste puis enregistre une connexion IMAP/SMTP pour le workspace courant.
 * Le mot de passe est chiffré (jamais stocké en clair). Une seule méthode
 * d'envoi par workspace : on refuse si Google est déjà connecté.
 */
export async function connectEmailAccount(
  input: ConnectEmailInput,
): Promise<EmailActionResult> {
  if (!isEmailCryptoConfigured()) {
    return {
      error:
        "Connexion email non configurée côté serveur (EMAIL_ENCRYPTION_KEY manquante).",
    };
  }

  const email = input.email.trim().toLowerCase();
  const username = input.username.trim() || email;
  const password = input.password;

  if (!EMAIL_RE.test(email)) return { error: "Adresse email invalide." };
  if (!password) return { error: "Le mot de passe est requis." };

  // Résolution des hôtes : preset verrouillé pour les fournisseurs connus,
  // saisie manuelle pour « Autre ».
  const preset = getPreset(input.providerId);
  if (!preset) return { error: "Fournisseur inconnu." };

  let account: ImapSmtpAccount;
  if (preset.known) {
    account = {
      email,
      username,
      password,
      smtp_host: preset.smtp_host,
      smtp_port: preset.smtp_port,
      smtp_secure: preset.smtp_secure,
      imap_host: preset.imap_host,
      imap_port: preset.imap_port,
      imap_secure: preset.imap_secure,
    };
  } else {
    const smtp_host = input.smtp_host?.trim();
    const imap_host = input.imap_host?.trim();
    if (!smtp_host || !imap_host) {
      return { error: "Renseigne les serveurs SMTP et IMAP." };
    }
    account = {
      email,
      username,
      password,
      smtp_host,
      smtp_port: input.smtp_port || 465,
      smtp_secure: input.smtp_secure ?? true,
      imap_host,
      imap_port: input.imap_port || 993,
      imap_secure: input.imap_secure ?? true,
    };
  }

  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return { error: "Session invalide. Reconnecte-toi." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Serveur non configuré (service_role manquant)." };
  }

  // Une seule méthode à la fois : Google déjà connecté → on refuse.
  const { data: gmail } = await admin
    .from("gmail_tokens")
    .select("id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (gmail) {
    return {
      error:
        "Google est déjà connecté. Déconnecte-le d'abord pour utiliser une autre adresse.",
    };
  }

  // Test des identifiants avant tout enregistrement.
  try {
    await verifySmtp(account);
  } catch {
    return {
      error:
        "Connexion SMTP (envoi) refusée. Vérifie l'adresse, le mot de passe d'application et les serveurs.",
    };
  }
  try {
    await verifyImap(account);
  } catch {
    return {
      error:
        "Connexion IMAP (réception) refusée. Vérifie le mot de passe d'application et les serveurs.",
    };
  }

  const { error } = await admin.from("email_accounts").upsert(
    {
      workspace_id: workspaceId,
      email,
      username,
      password_encrypted: encrypt(password),
      smtp_host: account.smtp_host,
      smtp_port: account.smtp_port,
      smtp_secure: account.smtp_secure,
      imap_host: account.imap_host,
      imap_port: account.imap_port,
      imap_secure: account.imap_secure,
      last_synced_at: null,
    },
    { onConflict: "workspace_id" },
  );
  if (error) {
    return { error: "Enregistrement impossible. Réessaie." };
  }

  revalidatePath("/settings");
  return { ok: true };
}

/** Déconnecte (supprime) le compte IMAP/SMTP du workspace courant. */
export async function disconnectEmailAccount(): Promise<EmailActionResult> {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return { error: "Session invalide. Reconnecte-toi." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Serveur non configuré." };
  }

  const { error } = await admin
    .from("email_accounts")
    .delete()
    .eq("workspace_id", workspaceId);
  if (error) return { error: "Déconnexion impossible. Réessaie." };

  revalidatePath("/settings");
  return { ok: true };
}
