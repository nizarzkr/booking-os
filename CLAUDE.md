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

**Fichier de référence :** `DESIGN_SYSTEM.md` ✅

Principes clés :
- Dense mais pas surchargé — l'info utile avant tout
- Inspiré Linear / Raycast, pas Salesforce
- Mobile-first — les musiciens gèrent ça depuis leur téléphone
- États vides toujours avec un call-to-action clair
- Indicateurs visuels pour les urgences (tâches en retard, dates passées)

---

## Avancement du projet

> Mettre à jour cette section après chaque étape complétée.

| Étape | Statut | Notes |
|-------|--------|-------|
| 0.1 — Setup repo | ✅ Fait | Next 16 + React 19 + Tailwind v4 + Mantine v8. Build/typecheck/lint OK. Sentry reporté. |
| 0.2 — Setup Supabase | ✅ Fait | Projet cloud `mybooking` (ref `vsbcvqeewmqntvgrphcw`). 11 tables + RLS, helpers en schéma `private`, seed + types TS. Advisors clean. |
| 1.1 — Auth | ⬜ À faire | |
| 1.2 — Onboarding | ⬜ À faire | |
| 2.1 — Liste contacts | ⬜ À faire | |
| 2.2 — CRUD contacts | ⬜ À faire | |
| 2.3 — Organisations | ⬜ À faire | |
| 2.4 — Fiche contact | ⬜ À faire | |
| 3.1 — Liste opportunités | ⬜ À faire | |
| 3.2 — CRUD opportunités | ⬜ À faire | |
| 3.3 — Vue pipeline | ⬜ À faire | |
| 3.4 — Fiche opportunité | ⬜ À faire | |
| 4.1 — Tâches | ⬜ À faire | |
| 4.2 — Dashboard today | ⬜ À faire | |
| 4.3 — Vue tâches | ⬜ À faire | |
| 5.1 — Templates email | ⬜ À faire | |
| 5.2 — Connexion Gmail | ⬜ À faire | |
| 5.3 — Envoi email | ⬜ À faire | |
| 5.4 — Réception emails | ⬜ À faire | |
| 6.1 — Connexion Google Calendar | ⬜ À faire | |
| 6.2 — Sync Calendar | ⬜ À faire | |
| 7.1 — Import CSV | ⬜ À faire | |
| 7.2 — Settings | ⬜ À faire | |
| 8.1 — Beta test | ⬜ À faire | |
| 8.2 — Polish UX | ⬜ À faire | |
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

---

*Mettre à jour ce fichier après chaque session de travail significative.*
