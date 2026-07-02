-- Templates d'email (étape 5.1) : messages réutilisables avec variables
-- dynamiques, scopés au workspace. Même pattern que les autres tables :
-- RLS `ws_all` (ownership via private.current_workspace_id()) + trigger updated_at.
-- Fichier reconstitué à l'identique depuis la migration distante du même nom.

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  subject text not null default '',
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_templates enable row level security;

create policy ws_all on public.email_templates
  for all
  to authenticated
  using (workspace_id = private.current_workspace_id())
  with check (workspace_id = private.current_workspace_id());

create trigger email_templates_set_updated_at
  before update on public.email_templates
  for each row execute function public.set_updated_at();

create index email_templates_workspace_id_idx
  on public.email_templates (workspace_id);
