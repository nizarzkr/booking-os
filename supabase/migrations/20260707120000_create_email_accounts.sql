-- Comptes email IMAP/SMTP (fournisseurs hors-Google). Verrouillée service_role
-- (aucune policy → jamais lisible côté navigateur) : elle contient des
-- identifiants (mot de passe chiffré au repos par l'app). Un seul compte par
-- workspace. Même pattern de verrouillage que public.gmail_tokens.

create table public.email_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  email text not null,
  -- Envoi (SMTP)
  smtp_host text not null,
  smtp_port int not null,
  smtp_secure boolean not null default true, -- true = SSL implicite (465), false = STARTTLS (587)
  -- Réception (IMAP)
  imap_host text not null,
  imap_port int not null,
  imap_secure boolean not null default true,
  username text not null,
  password_encrypted text not null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_accounts enable row level security;
-- Aucune policy : accès service_role uniquement (identifiants sensibles).

create trigger email_accounts_set_updated_at
  before update on public.email_accounts
  for each row execute function public.set_updated_at();

create index email_accounts_workspace_id_idx
  on public.email_accounts (workspace_id);
