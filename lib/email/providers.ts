// Presets de connexion IMAP/SMTP par fournisseur + instructions (tutoriel).
//
// Module de DONNÉES pur (ni "use client" ni "use server") : partagé par le
// formulaire de connexion (client) et les server actions (serveur).
//
// Presque tous les fournisseurs grand public exigent un « mot de passe
// d'application » (app password) distinct du mot de passe principal quand la
// 2FA est active. Chaque preset porte donc des instructions ciblées.

export type ProviderPreset = {
  id: string;
  label: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean; // true = SSL implicite (465), false = STARTTLS (587)
  imap_host: string;
  imap_port: number;
  imap_secure: boolean;
  // Étapes affichées dans le tutoriel de connexion.
  instructions: string[];
  // `true` = fournisseur connu (hôtes verrouillés) ; `false` = « Autre » (saisie manuelle).
  known: boolean;
};

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "gmail",
    label: "Gmail",
    smtp_host: "smtp.gmail.com",
    smtp_port: 465,
    smtp_secure: true,
    imap_host: "imap.gmail.com",
    imap_port: 993,
    imap_secure: true,
    known: true,
    instructions: [
      "Active la validation en deux étapes sur ton compte Google (obligatoire pour créer un mot de passe d'application).",
      "Va sur myaccount.google.com/apppasswords.",
      "Crée un mot de passe d'application (nomme-le « Booking OS ») et copie les 16 caractères générés.",
      "Colle ce mot de passe ici (pas ton mot de passe Google habituel).",
    ],
  },
  {
    id: "outlook",
    label: "Outlook / Hotmail",
    smtp_host: "smtp-mail.outlook.com",
    smtp_port: 587,
    smtp_secure: false,
    imap_host: "outlook.office365.com",
    imap_port: 993,
    imap_secure: true,
    known: true,
    instructions: [
      "Active la vérification en deux étapes sur ton compte Microsoft.",
      "Va sur account.microsoft.com → Sécurité → Options de sécurité avancées → Mots de passe d'application.",
      "Génère un mot de passe d'application et copie-le.",
      "Colle-le ici. Note : les comptes Microsoft 365 professionnels bloquent souvent l'accès IMAP — dans ce cas, contacte ton administrateur.",
    ],
  },
  {
    id: "yahoo",
    label: "Yahoo Mail",
    smtp_host: "smtp.mail.yahoo.com",
    smtp_port: 465,
    smtp_secure: true,
    imap_host: "imap.mail.yahoo.com",
    imap_port: 993,
    imap_secure: true,
    known: true,
    instructions: [
      "Va sur login.yahoo.com → Informations du compte → Sécurité du compte.",
      "Ouvre « Générer un mot de passe d'application » (le mot de passe d'application est requis).",
      "Crée-en un pour « Booking OS » et copie-le.",
      "Colle ce mot de passe ici.",
    ],
  },
  {
    id: "icloud",
    label: "iCloud Mail",
    smtp_host: "smtp.mail.me.com",
    smtp_port: 587,
    smtp_secure: false,
    imap_host: "imap.mail.me.com",
    imap_port: 993,
    imap_secure: true,
    known: true,
    instructions: [
      "La validation en deux étapes doit être active sur ton identifiant Apple.",
      "Va sur account.apple.com → Connexion et sécurité → Mots de passe pour applications.",
      "Génère un mot de passe pour « Booking OS » et copie-le.",
      "Colle ce mot de passe ici. Ton nom d'utilisateur est ton adresse iCloud complète.",
    ],
  },
  {
    id: "other",
    label: "Autre (domaine pro / hébergeur)",
    smtp_host: "",
    smtp_port: 465,
    smtp_secure: true,
    imap_host: "",
    imap_port: 993,
    imap_secure: true,
    known: false,
    instructions: [
      "Récupère les réglages IMAP et SMTP auprès de ton hébergeur (souvent dans l'aide « configurer un client mail »).",
      "SMTP (envoi) : en général port 465 en SSL, ou 587 en STARTTLS.",
      "IMAP (réception) : en général port 993 en SSL.",
      "Ton nom d'utilisateur est le plus souvent ton adresse email complète.",
    ],
  },
];

export function getPreset(id: string): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((p) => p.id === id);
}
