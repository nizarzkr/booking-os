-- Moteur de séquences (étape E) : séquences de relances email, étapes avec
-- délais en jours, et enrôlements de contacts. Même pattern que les autres
-- tables : RLS `ws_all` (ownership via private.current_workspace_id()) +
-- trigger updated_at + index workspace_id.

-- 1. Séquences -------------------------------------------------------------
create table public.sequences (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sequences enable row level security;

create policy ws_all on public.sequences
  for all
  to authenticated
  using (workspace_id = private.current_workspace_id())
  with check (workspace_id = private.current_workspace_id());

create trigger sequences_set_updated_at
  before update on public.sequences
  for each row execute function public.set_updated_at();

create index sequences_workspace_id_idx on public.sequences (workspace_id);

-- 2. Étapes ----------------------------------------------------------------
create table public.sequence_steps (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  sequence_id uuid not null references public.sequences(id) on delete cascade,
  step_order int not null default 0,
  delay_days int not null default 0,
  subject text not null default '',
  body text not null default '',
  created_at timestamptz not null default now()
);

alter table public.sequence_steps enable row level security;

create policy ws_all on public.sequence_steps
  for all
  to authenticated
  using (workspace_id = private.current_workspace_id())
  with check (workspace_id = private.current_workspace_id());

create index sequence_steps_workspace_id_idx
  on public.sequence_steps (workspace_id);
create index sequence_steps_sequence_order_idx
  on public.sequence_steps (sequence_id, step_order);

-- 3. Enrôlements -----------------------------------------------------------
create table public.sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  sequence_id uuid not null references public.sequences(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'completed', 'stopped')),
  stop_reason text,
  current_step int not null default 0,
  next_send_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sequence_id, contact_id)
);

alter table public.sequence_enrollments enable row level security;

create policy ws_all on public.sequence_enrollments
  for all
  to authenticated
  using (workspace_id = private.current_workspace_id())
  with check (workspace_id = private.current_workspace_id());

create trigger sequence_enrollments_set_updated_at
  before update on public.sequence_enrollments
  for each row execute function public.set_updated_at();

create index sequence_enrollments_workspace_id_idx
  on public.sequence_enrollments (workspace_id);
create index sequence_enrollments_due_idx
  on public.sequence_enrollments (status, next_send_at);
create index sequence_enrollments_contact_id_idx
  on public.sequence_enrollments (contact_id);
