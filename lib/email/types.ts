// Types partagés de la couche email (abstraction Gmail ↔ IMAP/SMTP).

/** Compte IMAP/SMTP prêt à l'emploi (mot de passe déjà déchiffré, côté serveur). */
export type ImapSmtpAccount = {
  email: string;
  username: string;
  password: string; // déchiffré — ne jamais renvoyer au client
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  imap_host: string;
  imap_port: number;
  imap_secure: boolean;
};

/** Connexion email résolue pour un workspace (provider + credentials). */
export type MailConnection =
  | { provider: "gmail"; email: string; accessToken: string }
  | { provider: "imap_smtp"; email: string; account: ImapSmtpAccount };

/** Résultat d'une sync inbound (compatible avec le type Gmail existant). */
export type MailSyncOutcome = { error: string } | { inserted: number };
