import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

/**
 * Chiffrement symétrique des identifiants IMAP/SMTP (mot de passe d'application).
 *
 * AES-256-GCM avec une clé applicative `EMAIL_ENCRYPTION_KEY` (32 octets, en
 * base64 ou hex). Le mot de passe n'est JAMAIS stocké en clair : `email_accounts`
 * ne contient que le résultat de `encrypt()`, déchiffré côté serveur au dernier
 * moment (envoi SMTP / sync IMAP). Format stocké : `iv:authTag:ciphertext`
 * (chaque partie en base64).
 *
 * Sans clé configurée → lève : l'appelant désactive proprement la feature
 * (comme le fallback « non configuré » de Gmail).
 */

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.EMAIL_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("EMAIL_ENCRYPTION_KEY manquant.");
  }
  // Accepte base64 ou hex ; on exige 32 octets (256 bits).
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, "hex");
  } else {
    key = Buffer.from(raw, "base64");
  }
  if (key.length !== 32) {
    throw new Error(
      "EMAIL_ENCRYPTION_KEY invalide : 32 octets attendus (base64 ou hex).",
    );
  }
  return key;
}

/** Indique si le chiffrement est configuré (clé valide présente). */
export function isEmailCryptoConfigured(): boolean {
  try {
    getKey();
    return true;
  } catch {
    return false;
  }
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12); // 96 bits, recommandé pour GCM
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf-8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

export function decrypt(payload: string): string {
  const key = getKey();
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Charge chiffrée invalide.");
  }
  const decipher = createDecipheriv(
    ALGO,
    key,
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf-8");
}
