-- Booking OS — Seed de données de test (étape 0.2)
-- Rejoué par `supabase db reset`. Idempotent : on supprime le user démo (cascade)
-- avant de réinsérer.
-- Login démo : demo@bookingos.test / Demo123!

delete from auth.users where id = '11111111-1111-1111-1111-111111111111';

-- Utilisateur démo
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'demo@bookingos.test',
  extensions.crypt('Demo123!', extensions.gen_salt('bf')),
  now(), now(), now(), '', '', '', ''
);

insert into auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'demo@bookingos.test', 'email_verified', true),
  'email', '11111111-1111-1111-1111-111111111111',
  now(), now(), now()
);

-- Le trigger on_auth_user_created a créé public.users. On crée le workspace + rattachement.
insert into public.workspaces (id, name, owner_id, city)
values ('22222222-2222-2222-2222-222222222222', 'Lou Vega (démo)', '11111111-1111-1111-1111-111111111111', 'Paris');

update public.users
set workspace_id = '22222222-2222-2222-2222-222222222222', role = 'owner'
where id = '11111111-1111-1111-1111-111111111111';

insert into public.artist_profiles (workspace_id, spotify_url, instagram_url, youtube_url)
values ('22222222-2222-2222-2222-222222222222',
        'https://open.spotify.com/artist/demo',
        'https://instagram.com/louvega',
        'https://youtube.com/@louvega');

insert into public.contacts (id, workspace_id, first_name, last_name, email, phone, role, notes) values
('c1111111-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Marie', 'Dubois', 'marie@lamaroquinerie.fr', '+33 6 12 34 56 78', 'programmateur', 'Rencontrée aux Trans Musicales 2025.'),
('c1111111-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Tom', 'Bernard', 'tom@vieillescharrues.com', null, 'booker', 'Programme la scène découvertes.'),
('c1111111-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Sarah', 'Lemoine', 'sarah@agence-indie.fr', null, 'agent', null);

insert into public.organizations (id, workspace_id, name, type, city, country, website) values
('01111111-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'La Maroquinerie', 'salle', 'Paris', 'France', 'https://lamaroquinerie.fr'),
('01111111-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Les Vieilles Charrues', 'festival', 'Carhaix', 'France', 'https://vieillescharrues.com');

insert into public.contact_organizations (contact_id, organization_id) values
('c1111111-0000-0000-0000-000000000001', '01111111-0000-0000-0000-000000000001'),
('c1111111-0000-0000-0000-000000000002', '01111111-0000-0000-0000-000000000002');

insert into public.opportunities (id, workspace_id, contact_id, organization_id, title, status, gig_date, fee, city, venue, notes) values
('09111111-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'c1111111-0000-0000-0000-000000000001', '01111111-0000-0000-0000-000000000001', 'Release party album', 'negotiation', current_date + 90, 800, 'Paris', 'La Maroquinerie', 'En attente de confirmation du cachet.'),
('09111111-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'c1111111-0000-0000-0000-000000000002', '01111111-0000-0000-0000-000000000002', 'Scène découvertes — été', 'option', current_date + 45, 1500, 'Carhaix', 'Scène Kerouac', 'Option posée, réponse attendue sous 2 semaines.'),
('09111111-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'c1111111-0000-0000-0000-000000000003', null, 'Booking tournée automne', 'prospect', null, null, null, null, 'Premier contact à initier.');

insert into public.tasks (workspace_id, opportunity_id, contact_id, title, due_date, done) values
('22222222-2222-2222-2222-222222222222', '09111111-0000-0000-0000-000000000001', 'c1111111-0000-0000-0000-000000000001', 'Relancer Marie sur le cachet', current_date, false),
('22222222-2222-2222-2222-222222222222', '09111111-0000-0000-0000-000000000002', 'c1111111-0000-0000-0000-000000000002', 'Confirmer l''option avant deadline', current_date + 7, false),
('22222222-2222-2222-2222-222222222222', '09111111-0000-0000-0000-000000000003', 'c1111111-0000-0000-0000-000000000003', 'Envoyer le dossier de presse à Sarah', current_date - 2, false);
