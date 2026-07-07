@AGENTS.md

# Booking OS — Contexte pour Claude Code

> ⚠️ **Next.js 16** est installé (version majeure, breaking changes vs Next 14/15). Lire `AGENTS.md` (importé ci-dessus) et les guides `node_modules/next/dist/docs/` avant d'écrire du code Next. En particulier : les Request APIs (`cookies()`, `headers()`, `params`, `searchParams`) sont **async** — important pour le client Supabase serveur (étape 0.2).

## Ce qu'on construit

SaaS de booking musical pour artistes indépendants. L'objectif MVP : permettre à un musicien de savoir exactement qui contacter ou relancer aujourd'hui pour obtenir plus de dates.

Pas un CRM généraliste. Un outil d'action quotidienne, simple, orienté musiciens.

**Roadmap complète :** voir `ROADMAP.md`
**Historique de construction :** voir `JOURNAL.md`

---

## Stack technique

| Couche | Outil |
|--------|-------|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript strict |
| Styles | Tailwind CSS v4 (config CSS-based, pas de `tailwind.config.js`) |
| Composants UI | Mantine v8 |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Email sortant | Gmail API (OAuth2) — fallback Resend |
| Email entrant | Gmail API (polling) |
| Calendar | Google Calendar API (OAuth2) |
| Monitoring | Sentry |
| Déploiement | Vercel |
| Billing | Stripe (phase 8, pas encore implémenté) |

---

## Structure du projet

```
/app
  /(auth)         → login, register, onboarding
  /(app)          → pages protégées (dashboard, contacts, etc.)
    /dashboard    → vue "aujourd'hui"
    /contacts     → liste + fiche contact
    /organizations
    /opportunities
    /pipeline
    /tasks
    /inbox        → emails centralisés
    /templates    → templates d'email
    /settings
/components
  /ui             → composants génériques réutilisables
  /layout         → sidebar, header, navigation
  /[feature]      → composants spécifiques à une feature
/lib
  /supabase       → client supabase (server + client)
  /gmail          → helpers Gmail API
  /google-calendar → helpers Google Calendar API
  /utils          → fonctions utilitaires
/types            → types TypeScript globaux
/hooks            → custom React hooks
```

---

## Schéma de base de données

```sql
workspaces (id, name, owner_id, city, created_at)

users (id, email, workspace_id, role, created_at)

artist_profiles (
  id, workspace_id,
  spotify_url, apple_music_url, bandcamp_url, soundcloud_url,
  instagram_url, facebook_url, tiktok_url, youtube_url,
  created_at
)

artist_media (id, workspace_id, title, url, created_at)

contacts (
  id, workspace_id,
  first_name, last_name, email, phone,
  role, -- booker | programmateur | agent | label | presse | autre
  notes, created_at
)

organizations (
  id, workspace_id,
  name,
  type, -- salle | festival | agence | label | autre
  city, country, website, notes, created_at
)

contact_organizations (contact_id, organization_id)

opportunities (
  id, workspace_id, contact_id, organization_id,
  title, status, gig_date, fee, city, venue, notes,
  google_calendar_event_id,
  created_at, updated_at
)
-- statuts : prospect → contacted → negotiation → option → confirmed → cancelled

tasks (
  id, workspace_id, opportunity_id, contact_id,
  title, due_date, done, created_at
)

email_logs (
  id, workspace_id, contact_id, opportunity_id,
  gmail_thread_id, gmail_message_id,
  subject, body,
  direction, -- outbound | inbound
  read, sent_at
)

gmail_tokens (
  id, workspace_id,
  access_token, refresh_token,
  email, expires_at
)

email_templates (
  id, workspace_id,
  name, subject, body,
  created_at, updated_at
)
```

**RLS activée sur toutes les tables.** Chaque requête doit filtrer par `workspace_id`. Ne jamais exposer des données cross-workspace.

---

## Conventions de code

### Général
- TypeScript strict (`strict: true` dans tsconfig)
- Pas de `any` — typer explicitement
- Composants en PascalCase, fichiers en kebab-case
- Fonctions utilitaires en camelCase

### Next.js
- Utiliser l'App Router (pas Pages Router)
- Server Components par défaut — Client Components (`"use client"`) uniquement si nécessaire (interactivité, hooks)
- Les appels Supabase côté serveur utilisent le client server (`createServerClient`)
- Les appels côté client utilisent le client browser (`createBrowserClient`)

### Supabase
- Toujours filtrer par `workspace_id` dans les queries
- Utiliser les types générés par Supabase (`supabase gen types typescript`)
- Les mutations passent par des Server Actions ou des Route Handlers

### Gestion d'erreurs
- Toujours gérer les erreurs Supabase (vérifier `error` avant d'utiliser `data`)
- Afficher des messages d'erreur lisibles pour l'utilisateur (pas de stack trace en prod)
- Logger les erreurs via Sentry

---

## Variables d'environnement requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # clé publiable sb_publishable_... (front)
SUPABASE_SERVICE_ROLE_KEY=              # serveur uniquement

# Google OAuth (Gmail + Calendar)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Resend (fallback email)
RESEND_API_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Design system

**Fichiers de référence :** `DESIGN_SYSTEM.md` (appliqué) + `DESIGN BOOKING OS/` (tokens bruts + référence complète). ✅

DA « **Hatch** » adaptée product-UI (voir DESIGN_SYSTEM.md) :
- **Light mode** : canvas crème `#f5f4f0`, surfaces blanches, bordures noires 1px, **aucune ombre**.
- **Mint `#99ffcc` = seule couleur d'action** ; sky/peach/pink = décoratif uniquement.
- Titres **DM Serif Display**, corps **Inter** (substituts libres de Recoleta/Lota Grotesque).
- Boutons pill, cards arrondies (16px), respiration généreuse mais densité raisonnable pour l'app.
- États vides toujours avec un call-to-action clair ; décor (swash, confettis) parcimonieux.

---

## Avancement du projet

> Mettre à jour cette section après chaque étape complétée.

**🔖 Reprise (au 2026-07-07) :** Blocs 0→4 complets + **Phase 5 Emails COMPLÈTE et validée E2E avec de vrais credentials Google** : 5.1 Templates, 5.2 OAuth Gmail (token + `refresh_token` stockés), 5.3 envoi réel (email envoyé ET reçu, journalisé), **5.4 réception inbound** (sync des réponses via `lib/gmail/receive`, page `/inbox`, route cron `/api/gmail/sync` protégée par `CRON_SECRET`, badge non-lus nav + dashboard — testé E2E : réponse reçue → ligne inbound rattachée au contact). **Phase 6 Google Calendar COMPLÈTE et validée E2E** : connexion réutilisée (scope `calendar.events` sur l'OAuth Gmail) + sync auto des opportunités (option→jaune, confirmed→vert, cancelled→suppression). **7.1 Import CSV** livré (page déplacée dans la section Contacts : `/contacts/import`), **7.2 Settings COMPLÈTE** (signature/reply-to + suppression de compte). **8.2 Polish COMPLÈTE** (animations CSS subtiles, skeletons par page, cohérence titres). **8.1 DÉPLOYÉ en prod : https://booking-os-psi.vercel.app** (Vercel auto-deploy sur `main`, landing publique avec login/register, env prod + cron configurés). **Refonte UX + Séquences (A→F) validée E2E le 2026-07-07 et MERGÉE dans `main`** (merge commit `13403b7`, build prod OK, push → déploiement Vercel) — voir bloc ci-dessous. DA « Studio » (dark-first, accent violet, Geist) — voir `DESIGN_SYSTEM.md`. **MVP en ligne.** **Prochaine étape : inviter les beta-testeurs (Test users Google) + collecter le feedback ; 8.3 billing Stripe optionnel.** Note : suppression de compte (7.2) non testée E2E (destructive) — valider sur un compte jetable. Rappel : livrer la fiche `/[id]` d'emblée pour toute nouvelle entité-profil (cf. mémoires ; les tâches en sont exemptées). ⚠️ **Piège Next 16 confirmé** : jamais de `export type { X }` (ré-export de type importé) dans un fichier `"use server"` — Turbopack ne l'efface pas → `ReferenceError` runtime (voir décisions).

**🎨 Refonte UX + Séquences (2026-07-06, A→F) :** suite à un audit UX, l'architecture de l'info est passée en **hubs** et le pilier Outreach a été complété. **A** sidebar en sections + vocabulaire musicien. **B** rubrique **« Dates »** = fusion Pipeline+Opportunités en 3 vues (Kanban/Liste/**Calendrier**), statuts « grand public », `/pipeline`→redirection. **C** hub **« Contacts »** à onglets Personnes/Lieux, `/organizations`→redirection. **D** hub **« Prospection »** (`/outreach`) à onglets Séquences/Modèles/Réception, `/templates` & `/inbox`→redirections, badge non-lus migré. **E** **moteur de séquences** (tables `sequences`/`sequence_steps`/`sequence_enrollments`, `lib/sequences/run.ts`, cron `/api/sequences/run`, builder `/sequences/[id]`, enrôlement fiche/liste/séquence). **F** **drag & drop du Kanban** (`@hello-pangea/dnd`, flèches gardées en fallback). ✅ **Validé E2E le 2026-07-07** (tout le cycle authentifié : nav/hubs + redirections, Dates Kanban DnD/Liste/Calendrier, hubs Contacts & Prospection, et surtout **moteur de séquences — envoi immédiat réel de l'étape à délai 0 + coupure sur réponse confirmés**). **Mergé dans `main`** (merge `13403b7`, build prod OK) → **déployé en prod**. Anciennes routes en redirections (aucun lien cassé).

**➕ Onboarding & email (2026-07-07, suite) :** **(1) Bibliothèque de modèles de séquences** (galerie « Partir d'un modèle » → clone 1 des 5 séquences prêtes dans les séquences de l'artiste ; `sequence-blueprints.ts` + `blueprint-gallery.tsx` + action `createSequenceFromBlueprint`). **(2) Aide contextuelle** (bouton « ? » header → Drawer par page, `components/help/`) + **checklist « Démarrage »** Dashboard (`getting-started.tsx`). **(3) Connexion email hors-Google IMAP/SMTP universel** : table `email_accounts` (service_role, mdp **chiffré AES-256-GCM** via `EMAIL_ENCRYPTION_KEY`), couche `lib/email/` (`getMailConnection`/`sendMail`/`syncInboundForWorkspace` dispatch Gmail↔IMAP ; nodemailer + imapflow + mailparser ; détection de réponse via `In-Reply-To`), presets Gmail/Outlook/Yahoo/iCloud/Autre + tutoriel intégré, UI Réglages. Une seule méthode d'envoi/workspace (Gmail prioritaire). Tous les flux (envoi manuel, séquences, sync inbox, cron) passent par l'abstraction. **Verts en statique** ; connexion testée en local ; `EMAIL_ENCRYPTION_KEY` sur Vercel. Nouvelle migration `20260707120000_create_email_accounts`.

| Étape | Statut | Notes |
|-------|--------|-------|
| 0.1 — Setup repo | ✅ Fait | Next 16 + React 19 + Tailwind v4 + Mantine v8. Build/typecheck/lint OK. Sentry reporté. |
| 0.2 — Setup Supabase | ✅ Fait | Projet cloud `mybooking` (ref `vsbcvqeewmqntvgrphcw`). 11 tables + RLS, helpers en schéma `private`, seed + types TS. Advisors clean. |
| 1.1 — Auth | ✅ Fait | Email + mot de passe (Supabase Auth). `proxy.ts` (Next 16, ex-middleware) protège `/(app)` + refresh session. Server Actions login/register/logout. Redirection post-login selon `workspace_id`. Route `/auth/confirm` prête. Confirmation email désactivée côté projet (session immédiate à l'inscription). |
| 1.2 — Onboarding | ✅ Fait | Formulaire minimal (nom d'artiste requis + ville). Server action `completeOnboarding` : crée workspace → pose `users.workspace_id` → crée `artist_profiles` (ordre imposé par la RLS, client authentifié, pas de service_role). Gardes : `/onboarding` et `/dashboard` redirigent selon `workspace_id`. Vérifié E2E (register→onboarding→dashboard). Type d'utilisateur (solo/groupe/manager…) reporté (pas de colonne DB). |
| 2.1 — Liste contacts | ✅ Fait | Shell app (Mantine AppShell : sidebar Dashboard/Contacts + features « bientôt », nom workspace, logout). Onboarding sorti du groupe (app) → groupe (onboarding) pour éviter la boucle de garde. Page `/contacts` (RLS-scoped) + table (recherche nom/email, filtre rôle, badges, empty state). Création = 2.2. Vérifié E2E (liste + recherche). |
| 2.2 — CRUD contacts | ✅ Fait | Server actions create/update/delete (`app/(app)/contacts/actions.ts`, validation + normalisation + revalidatePath). Modal formulaire (@mantine/form, create/edit via remount par `key`), menu de ligne Modifier/Supprimer, modal de confirmation (custom, pas de window.confirm). Boutons en submit de formulaire (accessible + robuste). Vérifié E2E (create/update/delete via liste ET fiche OK avec vrais clics). |
| 2.3 — Organisations | ✅ Fait | CRUD organisations en miroir des contacts. **+ Fiche organisation `/organizations/[id]`** ajoutée après retour utilisateur (nom cliquable, boutons Modifier/Supprimer, contacts liés en lecture). Vérifié E2E (create/update/delete via fiche OK). |
| 2.4 — Fiche contact | ✅ Fait | Page `/contacts/[id]` (params async Next 16, notFound si absent). Composant détail : coordonnées, édition (ContactFormModal réutilisé), suppression + redirect, **gestion des organisations liées** (link/unlink via `contact_organizations`, sélecteur searchable des orgs non liées). Sections placeholder Opportunités/Tâches/Emails. Nom cliquable depuis la liste. Vérifié E2E (fiche, lien/délien org, edit/delete OK). |
| 3.1 — Liste opportunités | ✅ Fait | Page `/opportunities` (RLS-scopée, jointures contact/orga, tri gig_date). Table (titre cliquable, badge statut, lieu, date, cachet) + recherche + filtre statut. Checks statiques + DB/RLS OK ; E2E nav à jouer. |
| 3.2 — CRUD opportunités | ✅ Fait | Server actions create/update/delete (`opportunities/actions.ts`). Modal formulaire (@mantine/form, DateInput v8 string, NumberInput cachet, selects contact/orga). Suppression en submit. |
| 3.3 — Vue pipeline | ✅ Fait | `/pipeline` : colonnes par statut (`STATUS_ORDER`), cartes (titre/contact/date/cachet + badge « Dépassé »), déplacement par flèches ◀ ▶ (action `setOpportunityStatus`). Pas de drag & drop (choix : robustesse + zéro dépendance). Nav « Pipeline » activée. Checks + DB OK ; E2E nav à jouer. |
| 3.4 — Fiche opportunité | ✅ Fait | Page `/opportunities/[id]` (params async) + fiche : infos, contact/orga liés cliquables, **changement rapide de statut**, Modifier/Supprimer visibles, placeholders Tâches/Emails. |
| 4.1 — Tâches | ✅ Fait | Système de tâches : actions create/update/setDone/delete (`tasks/actions.ts`), modal (DateInput, preset+lock des liens depuis une fiche). Section `TaskSection` embarquée dans fiche oppo (`presetOpportunityId`) et fiche contact (`presetContactId`) : liste liée + coche + ajout rapide. Schéma réel sans `notes`. Checks + DB/RLS OK ; E2E nav à jouer. |
| 4.2 — Dashboard today | ✅ Fait | `/dashboard` server component : compteurs cliquables (contacts / oppos actives / tâches en retard), « À relancer aujourd'hui » (tâches ouvertes échéance ≤ today + lien fiche), « Prochaines dates confirmées » (30j), « Options en cours ». Items cliquables → fiche. Checks + simulation DB OK ; E2E nav à jouer. |
| 4.3 — Vue tâches | ✅ Fait | Page `/tasks` : liste filtrable (à faire / en retard / cette semaine / terminées / toutes), coche inline, badge d'échéance, lien vers oppo/contact, edit/delete. Nav « Tâches » activée. |
| 5.1 — Templates email | ✅ Fait | Table `email_templates` (migration + RLS `ws_all` + trigger updated_at + types régénérés). Page `/templates` : CRUD + **aperçu sur données réelles** (variables `{{contact_name}}`/`{{artist_name}}`/`{{venue}}`/`{{gig_date}}`/`{{fee}}`/`{{city}}` résolues via contact + oppo sélectionnés). `renderTemplate()` dans template-types. Nav « Templates » activée (plus de « bientôt »). Template d'exemple seedé. |
| 5.2 — Connexion Gmail | ✅ Fait | OAuth2 Google (`api/gmail/connect` + `callback`, `lib/gmail/oauth`). State anti-CSRF (cookie httpOnly), `access_type=offline`+`prompt=consent` → `refresh_token` exigé (cas `norefresh` géré). Tokens stockés via client `service_role` (`gmail_tokens` verrouillée). Refresh auto avec marge 1 min (`lib/gmail/client`). Statut affiché dans `/settings`, déconnexion + révocation. **Validé E2E 2026-07-06 avec vrais creds : token stocké avec refresh_token.** |
| 5.3 — Envoi email | ✅ Fait | `sendEmail` (`emails/actions.ts`) → `sendGmailMessage` (API Gmail `messages.send`, MIME base64url, en-têtes RFC 2047). `SendEmailModal` (destinataire éditable, templates, variables résolues). Journalisé dans `email_logs` (outbound, `gmail_message_id`+`thread_id`). Fallback Resend non implémenté (Gmail requis). **Validé E2E 2026-07-06 : email réellement envoyé ET reçu.** |
| 5.4 — Réception emails | ✅ Fait | `lib/gmail/receive.ts` (`syncInboundForWorkspace`) : parcourt les threads connus (`email_logs.gmail_thread_id`), récupère via l'API Gmail, insère les réponses entrantes non déjà journalisées (`direction: inbound`, dédup par `gmail_message_id`), hérite du `contact_id`/`opportunity_id` du thread. Parsing MIME (base64url, text/plain>html, en-têtes RFC 2047, corps plafonné). **Déclencheurs** : server action `syncInbox()` (auto à l'ouverture de `/inbox` + bouton Rafraîchir) **et** route `GET /api/gmail/sync` protégée par `CRON_SECRET` (prête pour Vercel Cron, exclue de la garde proxy). **UI** : page `/inbox` (`InboxView`, badges « Nouveau », liens fiches, sync auto), nav « Réponses » + badge non-lus, bannière dashboard. Affichage sur fiches déjà géré par `EmailHistory`. **Validé E2E 2026-07-06** (réponse reçue → ligne inbound rattachée au contact). |
| 6.1 — Connexion Google Calendar | ✅ Fait | **Connexion réutilisée** (pas de flow séparé) : scope `calendar.events` ajouté à l'OAuth Google du compte Gmail (`lib/gmail/oauth`). Réglages : bloc « Google » (Gmail + Agenda) + bouton **Reconnecter** (re-consent pour acquérir le scope sur un token déjà émis). **Validé E2E 2026-07-06.** |
| 6.2 — Sync Calendar | ✅ Fait | `lib/google-calendar/` : `client.ts` (create/update/delete event, API Calendar v3, événement journée entière sur `gig_date`, colorId option=jaune/confirmed=vert, 404/410 gérés) + `sync.ts` (`syncOpportunityCalendar` : upsert si `option|confirmed` + date, suppression sinon ; réécrit `google_calendar_event_id` ; **best-effort**, n'échoue jamais l'action métier). Branché sur create/update/setStatus/delete des opportunités. Réutilise `opportunities.google_calendar_event_id` (aucune migration). **Validé E2E** : confirmed→événement créé, cancelled→supprimé. |
| 7.1 — Import CSV | ✅ Fait | Page **`/contacts/import`** (déplacée depuis `/settings/import` le 2026-07-06 — l'import vit dans la section Contacts). Upload CSV, mapping colonnes, aperçu, import avec rapport (`contact-importer.tsx` + `contacts/import/actions.ts`, validation email, cap `MAX_ROWS` 1000). Point d'entrée : bouton « Importer un CSV » dans l'en-tête de la liste `/contacts`. |
| 7.2 — Settings | ✅ Fait | Page `/settings` : nom/ville workspace, email compte, connexion Google (Gmail+Agenda), **signature + reply-to** (migration `workspaces.email_signature`/`reply_to` ; appliqués à l'envoi : header Reply-To + signature au corps), **suppression de compte** (zone de danger, `deleteAccount` : révoque Google → supprime workspace en cascade → user public+auth ; modale confirmée par saisie du nom). Hors-scope assumé : adresse d'envoi custom-domain (on envoie depuis la vraie adresse Gmail) ; « déconnexion Calendar » séparée = la déconnexion Google (connexion réutilisée). Suppression de compte non testée E2E (destructive). |
| 8.1 — Beta test | 🟢 Déployé | **Prod live : https://booking-os-psi.vercel.app** (Vercel, auto-deploy sur `main`). Landing publique avec accès `/login` + `/register` (Server Component → liens `component="a"`). `vercel.json` : cron quotidien `0 8 * * *` sur `/api/gmail/sync` (Hobby limite à 1×/jour ; `CRON_SECRET` injecté en Bearer par Vercel). Env de prod configurées (URL, redirect Google, Supabase Site URL). **Reste** : inviter les testeurs (ajouter leurs emails en *Test users* Google, l'app OAuth étant en mode Testing) + collecte de feedback. |
| 8.2 — Polish UX | ✅ Fait | États vides+CTA partout, error/not-found, tables responsives, nav burger, pipeline scroll (déjà là). **Ajouté 2026-07-06** : animations **CSS only** (`globals.css` : `page-enter` fondu à la navigation via `PageTransition` keyée sur pathname ; `.interactive-card` hover/focus sur cartes cliquables dashboard/pipeline/inbox ; guard `prefers-reduced-motion`). **Skeletons par page** (`DetailSkeleton` + `loading.tsx` dashboard & fiches `[id]`). **Titres** uniformisés `order={1}`. Responsive : primitives déjà correctes, aucun fix requis (vrai-mobile à eyeballer côté device). |
| 8.3 — Billing Stripe | ⬜ À faire | |

---

## Décisions techniques prises

> Historique des choix importants pour ne pas les remettre en question à chaque session.

| Date | Décision | Raison |
|------|----------|--------|
| 2026-06-02 | Gmail API plutôt que Resend inbound pour la centralisation email | Permet d'utiliser la vraie boîte mail de l'utilisateur, pas une adresse intermédiaire |
| 2026-06-02 | Polling Gmail pour MVP (pas Gmail watch/Pub/Sub) | Moins de complexité infra pour commencer |
| 2026-06-02 | RLS Supabase pour l'isolation multi-tenant | Sécurité au niveau DB, pas seulement applicatif |
| 2026-06-02 | Mantine retenu comme librairie de composants UI | Flexibilité, richesse des composants, bonne DX |
| 2026-06-02 | Next.js **16** (et non 14) + React 19 | `create-next-app@latest` installe la dernière version ; mieux supporté par Node 25. Breaking changes : Request APIs (`cookies`, `params`) async, Turbopack par défaut. |
| 2026-06-02 | Tailwind **v4** (config CSS-based) + Mantine via CSS *layered* | create-next-app fournit Tailwind v4 ; cohabitation gérée par ordre de `@layer` (`theme, base, mantine, components, utilities`) pour éviter que le preflight Tailwind n'écrase Mantine. |
| 2026-06-02 | Projet npm nommé `mybooking`, repo dans `Desktop/BOOKING OS/mybooking/` | « BOOKING OS » invalide comme nom npm (espaces/majuscules) ; nom clarifie aussi l'arborescence. Dossier imbriqué en double supprimé. |
| 2026-06-02 | Sentry reporté (compte existant, DSN à brancher plus tard) | Wizard interactif ; placeholder `NEXT_PUBLIC_SENTRY_DSN` laissé dans `.env.local.example`. |
| 2026-06-02 | Projet Supabase cloud (pas de stack local) | Docker absent sur la machine ; provisionné via le MCP Supabase. Projet `mybooking` ref `vsbcvqeewmqntvgrphcw` (eu-west-3). |
| 2026-06-02 | Isolation RLS via `private.current_workspace_id()` (SECURITY DEFINER) | Helpers déplacés du schéma `public` vers `private` pour ne pas être appelables via la Data API (advisors 0028/0029). Policies `TO authenticated` + prédicat d'ownership. |
| 2026-06-02 | Clé publiable moderne (`sb_publishable_...`) côté front | Best practice Supabase (rotation indépendante) ; variable `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` au lieu de l'ancienne `..._ANON_KEY`. |
| 2026-06-02 | `gmail_tokens` : RLS sans policy (accès `service_role` uniquement) | Les tokens OAuth ne doivent jamais fuiter au navigateur ; gérés exclusivement côté serveur. |
| 2026-07-01 | Auth par email + mot de passe (Google OAuth reporté) | Socle simple et fiable pour le MVP ; le login Google s'ajoutera sans casser l'existant. |
| 2026-07-01 | Fichier `proxy.ts` (export `proxy`) au lieu de `middleware.ts` | Next 16 déprécie la convention `middleware` → renommée `proxy`. Les guides Supabase (qui disent `middleware.ts`) doivent être adaptés. |
| 2026-07-01 | Redirection post-login pilotée par `users.workspace_id` | `workspace_id` NULL → `/onboarding` (1.2), sinon `/dashboard`. Le proxy ne fait que la garde auth ; le routing workspace est dans les Server Actions / layout app (évite une requête DB par requête proxy). |
| 2026-07-01 | Produit : synthèse « assistant booking perso » + moteur de séquences | Le PRD (cold-emailing) et la vision d'origine sont fusionnés : socle action-first + séquences avec coupure-sur-réponse et garde-fous anti-spam. |
| 2026-07-01 | Moteur de séquences via Supabase `pg_cron` + `pgmq` (pas BullMQ+Redis) | BullMQ nécessite un worker persistant hors Vercel (serverless) ; pg_cron/pgmq reste dans Supabase, zéro infra en plus. Délais en jours natifs. |
| 2026-07-01 | DA « Hatch » claire/pastel adaptée product-UI (remplace le dark Linear/Raycast) | Choix DA de l'utilisateur (`DESIGN BOOKING OS/`). Esprit conservé pour marque/landing, densité calmée pour l'app. Thème Mantine recablé (light, mint primary, autoContrast). |
| 2026-07-01 | Polices : substituts libres DM Serif Display + Inter | Recoleta/Lota Grotesque sont commerciales ; substituts Google Fonts intégrés via next/font. **Remplacé le 2026-07-02 par Geist.** |
| 2026-07-02 | **Pivot DA « Hatch » → « Studio »** (dark-first minimal, accent violet unique, Geist) | La DA pastel/sticker était devenue incohérente (« Frankenstein »). Refonte vers un langage sobre type Linear/Vercel, adapté à un outil de travail. Piloté par le thème Mantine (pas de shadcn : migrer coûterait une réécriture totale sans bénéfice). Statuts = seule famille sémantique colorée. |
| 2026-07-06 | ⚠️ **Interdit : `export type { X }` (ré-export d'un type importé type-only) dans un fichier `"use server"`** | Turbopack (Next 16) n'efface pas le ré-export → `ReferenceError: X is not defined` au module evaluation, ce qui casse **tout** le loader de server actions de la route (pas juste la ligne). Invisible pour `tsc` (TS valide), purement runtime. Latent depuis la phase 2, débusqué en testant l'envoi Gmail. Règle : un fichier `"use server"` n'exporte que des fonctions async (+ types **définis localement**) ; les types se ré-exposent depuis leur module source. |
| 2026-07-06 | Envoi email : **Gmail requis, fallback Resend non implémenté** | Le MVP suppose une boîte Gmail connectée. `sendEmail` renvoie une erreur claire si aucune connexion. Le fallback Resend de la roadmap 5.3 est reporté (pas prioritaire tant que Gmail couvre le besoin). |
| 2026-07-06 | Inbound Gmail : **déclencheur « à la demande + route cron sécurisée »** | Sync au chargement de `/inbox` (auto + bouton) via server action, ET `GET /api/gmail/sync` protégée par `CRON_SECRET` (prête pour Vercel Cron). Testable en local tout de suite, zéro infra ; brancher le Cron au déploiement. Écarté : Cron seul (intestable local), pg_cron/Edge Function (trop lourd). |
| 2026-07-06 | Google Calendar : **connexion Google réutilisée** (pas de flow séparé) | Choix utilisateur : le compte Gmail sert aussi de connexion Calendar (même compte Google). Scope `calendar.events` ajouté à l'OAuth existant ; sync via le token `gmail_tokens`. Simplicité (une connexion, pas de table ni migration). Contrepartie : Gmail et Calendar couplés, reconnexion requise pour acquérir le scope. Table de tokens séparée écartée. |
| 2026-07-06 | Refonte nav en **hubs à onglets** (Dates, Contacts, Prospection) + anciennes routes en **redirections** | Réduit la charge cognitive (audit UX) sans casser aucun lien/bookmark. Vue/onglet courant synchronisé dans l'URL (`?view=`/`?tab=`) via `history.replaceState` — état local = source de vérité, **pas de refetch**. Vues existantes (`PipelineView`, `OpportunitiesView`, `ContactsView`, `OrganizationsView`, `TemplatesView`, `InboxView`) réutilisées telles quelles dans des panneaux. |
| 2026-07-06 | Séquences : **Vercel Cron + route API** (remplace la note pg_cron/pgmq du 2026-07-01) | `GET /api/sequences/run` protégée par `CRON_SECRET`, 2ᵉ cron `vercel.json` à `0 9` (après le sync inbound `0 8` → réponses connues avant relance). Réutilise l'infra déjà en prod (même pattern que `/api/gmail/sync`, envoi via `getGmailConnection`+`sendGmailMessage`). pg_cron/pgmq écarté (infra en plus, Edge Function appelant Gmail). Granularité **jour** (plan Hobby, cohérent avec délais en jours). Cœur d'envoi `lib/sequences/run.ts` en **client admin** → partagé cron + action d'enrôlement (envoi immédiat de l'étape à délai 0). Coupure sur réponse = présence d'un `email_logs` inbound du contact depuis l'enrôlement. |
| 2026-07-06 | Étape de séquence : **sujet/corps propres** (pas de FK vers un Modèle) | Choix utilisateur : chaque étape porte son texte (avec variables `{{…}}` résolues par `renderTemplate`), plus simple qu'un couplage aux Modèles. `step_order` maintenu **contigu** (renumérotation à la suppression) pour que la progression `current_step`→`+1` du moteur reste juste. |
| 2026-07-06 | Kanban DnD : **`@hello-pangea/dnd`** + flèches ◀ ▶ conservées | Fork maintenu de react-beautiful-dnd (compatible React 19, Strict Mode). État local **optimiste** (revert+toast si l'action échoue), resync sur changement de props via le pattern React « ajuster l'état pendant le rendu » (pas de `setState` en effet → respecte `react-hooks/set-state-in-effect`). Flèches gardées pour le fallback tactile/clavier ; drag clavier natif de la lib en bonus a11y. |

---

*Mettre à jour ce fichier après chaque session de travail significative.*
