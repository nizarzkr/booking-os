-- Booking OS — Schéma initial (étape 0.2)
-- Multi-tenant par workspace, RLS activée sur toutes les tables.
-- Voir CLAUDE.md / ROADMAP.md pour le contexte.

-- ============================================================
-- 1. Types énumérés
-- ============================================================
create type public.user_role as enum ('owner', 'member');

create type public.contact_role as enum (
  'booker', 'programmateur', 'agent', 'label', 'presse', 'autre'
);

create type public.organization_type as enum (
  'salle', 'festival', 'agence', 'label', 'autre'
);

create type public.opportunity_status as enum (
  'prospect', 'contacted', 'negotiation', 'option', 'confirmed', 'cancelled'
);

create type public.email_direction as enum ('outbound', 'inbound');

-- ============================================================
-- 2. Tables
-- ============================================================

-- Un workspace = un espace artiste. Propriétaire = un compte auth.
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  city text,
  created_at timestamptz not null default now()
);

-- Profil applicatif lié 1:1 à un compte auth.users.
-- workspace_id est nullable : la ligne est créée à l'inscription (trigger),
-- le workspace est rattaché ensuite pendant l'onboarding (étape 1.2).
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  workspace_id uuid references public.workspaces (id) on delete set null,
  role public.user_role not null default 'owner',
  created_at timestamptz not null default now()
);

-- Profil artiste (liens streaming + réseaux), un seul par workspace.
create table public.artist_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces (id) on delete cascade,
  spotify_url text,
  apple_music_url text,
  bandcamp_url text,
  soundcloud_url text,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  youtube_url text,
  created_at timestamptz not null default now()
);

-- Médias (vidéos de concerts) du profil artiste.
create table public.artist_media (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  first_name text not null,
  last_name text,
  email text,
  phone text,
  role public.contact_role,
  notes text,
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  type public.organization_type,
  city text,
  country text,
  website text,
  notes text,
  created_at timestamptz not null default now()
);

-- Table de liaison N:N entre contacts et organisations.
create table public.contact_organizations (
  contact_id uuid not null references public.contacts (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  primary key (contact_id, organization_id)
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  title text not null,
  status public.opportunity_status not null default 'prospect',
  gig_date date,
  fee numeric(10, 2),
  city text,
  venue text,
  notes text,
  google_calendar_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  opportunity_id uuid references public.opportunities (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete cascade,
  title text not null,
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  opportunity_id uuid references public.opportunities (id) on delete set null,
  gmail_thread_id text,
  gmail_message_id text,
  subject text,
  body text,
  direction public.email_direction not null,
  read boolean not null default false,
  sent_at timestamptz not null default now()
);

-- Tokens OAuth Gmail. SENSIBLE : accès serveur uniquement (service_role).
-- RLS activée sans policy → invisible via la Data API côté client.
create table public.gmail_tokens (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces (id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  email text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3. Index (perf RLS + lookups fréquents)
-- ============================================================
create index idx_users_workspace on public.users (workspace_id);
create index idx_artist_media_workspace on public.artist_media (workspace_id);
create index idx_contacts_workspace on public.contacts (workspace_id);
create index idx_organizations_workspace on public.organizations (workspace_id);
create index idx_contact_orgs_org on public.contact_organizations (organization_id);
create index idx_opportunities_workspace on public.opportunities (workspace_id);
create index idx_opportunities_contact on public.opportunities (contact_id);
create index idx_opportunities_organization on public.opportunities (organization_id);
create index idx_opportunities_status on public.opportunities (status);
create index idx_opportunities_gig_date on public.opportunities (gig_date);
create index idx_tasks_workspace on public.tasks (workspace_id);
create index idx_tasks_opportunity on public.tasks (opportunity_id);
create index idx_tasks_contact on public.tasks (contact_id);
create index idx_tasks_due_open on public.tasks (due_date) where done = false;
create index idx_email_logs_workspace on public.email_logs (workspace_id);
create index idx_email_logs_contact on public.email_logs (contact_id);
create index idx_email_logs_opportunity on public.email_logs (opportunity_id);
create index idx_email_logs_thread on public.email_logs (gmail_thread_id);

-- ============================================================
-- 4. Fonctions utilitaires
-- ============================================================

-- Renvoie le workspace_id de l'utilisateur courant.
-- SECURITY DEFINER pour lire public.users sans déclencher la RLS (évite la
-- récursion infinie quand les policies appellent cette fonction). Sûr car
-- filtré par auth.uid() : un appelant anonyme obtient NULL.
create or replace function public.current_workspace_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select workspace_id from public.users where id = (select auth.uid());
$$;

-- Crée automatiquement la ligne public.users à l'inscription.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Met à jour updated_at sur les opportunités.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger opportunities_set_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();

-- ============================================================
-- 5. Row Level Security
-- ============================================================
alter table public.workspaces enable row level security;
alter table public.users enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.artist_media enable row level security;
alter table public.contacts enable row level security;
alter table public.organizations enable row level security;
alter table public.contact_organizations enable row level security;
alter table public.opportunities enable row level security;
alter table public.tasks enable row level security;
alter table public.email_logs enable row level security;
alter table public.gmail_tokens enable row level security;

-- ---- workspaces : accès par le propriétaire ----
create policy "workspaces_select" on public.workspaces
  for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "workspaces_insert" on public.workspaces
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "workspaces_update" on public.workspaces
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "workspaces_delete" on public.workspaces
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- ---- users : chacun ne voit/modifie que sa propre ligne ----
-- (pas de policy INSERT : la ligne est créée par le trigger en SECURITY DEFINER)
create policy "users_select_self" on public.users
  for select to authenticated
  using (id = (select auth.uid()));

create policy "users_update_self" on public.users
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---- tables scopées par workspace ----
create policy "ws_all" on public.artist_profiles
  for all to authenticated
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "ws_all" on public.artist_media
  for all to authenticated
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "ws_all" on public.contacts
  for all to authenticated
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "ws_all" on public.organizations
  for all to authenticated
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "ws_all" on public.opportunities
  for all to authenticated
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "ws_all" on public.tasks
  for all to authenticated
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "ws_all" on public.email_logs
  for all to authenticated
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

-- ---- contact_organizations : scopée via le workspace du contact ET de l'org ----
create policy "contact_orgs_all" on public.contact_organizations
  for all to authenticated
  using (
    exists (
      select 1 from public.contacts c
      where c.id = contact_id and c.workspace_id = public.current_workspace_id()
    )
  )
  with check (
    exists (
      select 1 from public.contacts c
      where c.id = contact_id and c.workspace_id = public.current_workspace_id()
    )
    and exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.workspace_id = public.current_workspace_id()
    )
  );

-- ---- gmail_tokens : aucune policy → accès serveur uniquement (service_role) ----
