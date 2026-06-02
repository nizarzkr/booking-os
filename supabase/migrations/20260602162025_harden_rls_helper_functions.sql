-- Durcissement : déplacer les fonctions SECURITY DEFINER hors du schéma public
-- exposé par la Data API. PostgREST n'expose que public/graphql_public, donc
-- `private.*` n'est pas appelable via /rest/v1/rpc. Les policies RLS et le
-- trigger peuvent toujours les appeler.
-- (Corrige les advisors 0028/0029 — anon/authenticated_security_definer_function_executable.)

create schema if not exists private;
grant usage on schema private to authenticated;

-- Helper workspace courant (dans private).
create or replace function private.current_workspace_id()
returns uuid language sql stable security definer set search_path = ''
as $$
  select workspace_id from public.users where id = (select auth.uid());
$$;
revoke execute on function private.current_workspace_id() from public;
grant execute on function private.current_workspace_id() to authenticated;

-- Trigger de création du profil utilisateur (dans private).
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  return new;
end;
$$;
revoke execute on function private.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Recréer les policies pour pointer vers private.current_workspace_id().
drop policy "ws_all" on public.artist_profiles;
create policy "ws_all" on public.artist_profiles
  for all to authenticated
  using (workspace_id = private.current_workspace_id())
  with check (workspace_id = private.current_workspace_id());

drop policy "ws_all" on public.artist_media;
create policy "ws_all" on public.artist_media
  for all to authenticated
  using (workspace_id = private.current_workspace_id())
  with check (workspace_id = private.current_workspace_id());

drop policy "ws_all" on public.contacts;
create policy "ws_all" on public.contacts
  for all to authenticated
  using (workspace_id = private.current_workspace_id())
  with check (workspace_id = private.current_workspace_id());

drop policy "ws_all" on public.organizations;
create policy "ws_all" on public.organizations
  for all to authenticated
  using (workspace_id = private.current_workspace_id())
  with check (workspace_id = private.current_workspace_id());

drop policy "ws_all" on public.opportunities;
create policy "ws_all" on public.opportunities
  for all to authenticated
  using (workspace_id = private.current_workspace_id())
  with check (workspace_id = private.current_workspace_id());

drop policy "ws_all" on public.tasks;
create policy "ws_all" on public.tasks
  for all to authenticated
  using (workspace_id = private.current_workspace_id())
  with check (workspace_id = private.current_workspace_id());

drop policy "ws_all" on public.email_logs;
create policy "ws_all" on public.email_logs
  for all to authenticated
  using (workspace_id = private.current_workspace_id())
  with check (workspace_id = private.current_workspace_id());

drop policy "contact_orgs_all" on public.contact_organizations;
create policy "contact_orgs_all" on public.contact_organizations
  for all to authenticated
  using (exists (select 1 from public.contacts c where c.id = contact_id and c.workspace_id = private.current_workspace_id()))
  with check (
    exists (select 1 from public.contacts c where c.id = contact_id and c.workspace_id = private.current_workspace_id())
    and exists (select 1 from public.organizations o where o.id = organization_id and o.workspace_id = private.current_workspace_id())
  );

-- Supprimer les fonctions publiques (plus aucune dépendance).
drop function public.current_workspace_id();
drop function public.handle_new_user();
