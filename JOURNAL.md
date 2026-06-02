# Booking OS — Journal de construction

> Log chronologique de toutes les décisions, changements et étapes complétées.
> À mettre à jour après chaque session de travail.
> **Usage Claude Code :** lire ce fichier en début de session pour avoir le contexte complet.

---

## 2026-06-02 — Session fondatrice (avec Claude / Cowork)

### Décisions prises

**Produit**
- Persona ciblé pour le MVP : artiste indépendant qui gère son propre booking (pas encore le manager ou le booker pro)
- Objectif MVP formulé : "permettre à un musicien de savoir exactement qui contacter ou relancer aujourd'hui pour obtenir plus de dates"
- Pas un CRM généraliste — un outil d'action quotidienne, taillé pour les musiciens

**Stack technique retenue**
- Frontend : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Composants UI : **Mantine** (retenu après comparaison avec shadcn/ui et Tremor)
- Backend / DB : Supabase (PostgreSQL + Auth + RLS)
- Email sortant : Gmail API (OAuth2) — fallback Resend
- Email entrant : Gmail API polling (pas de Gmail watch/Pub/Sub pour le MVP)
- Calendar : Google Calendar API (OAuth2)
- Monitoring : Sentry
- Déploiement : Vercel
- Billing : Stripe (phase 8, post-MVP)

**Pourquoi Gmail API plutôt que Resend inbound**
Permet d'utiliser la vraie boîte mail de l'utilisateur. L'utilisateur envoie depuis sa propre adresse, et les réponses arrivent dans Booking OS via polling. Resend reste en fallback si aucune boîte Gmail n'est connectée.

**Pourquoi Mantine**
Flexibilité, richesse des composants (tables, forms, modals, notifications), bonne DX TypeScript, adapté à une interface dense type dashboard.

**Architecture multi-tenant**
RLS Supabase activée sur toutes les tables. Isolation par `workspace_id` au niveau DB, pas seulement applicatif. Chaque utilisateur crée un workspace à l'inscription.

### Schéma de base de données validé

```sql
workspaces (id, name, owner_id, city, created_at)
users (id, email, workspace_id, role, created_at)
artist_profiles (id, workspace_id, spotify_url, apple_music_url, bandcamp_url, soundcloud_url, instagram_url, facebook_url, tiktok_url, youtube_url, created_at)
artist_media (id, workspace_id, title, url, created_at)
contacts (id, workspace_id, first_name, last_name, email, phone, role, notes, created_at)
organizations (id, workspace_id, name, type, city, country, website, notes, created_at)
contact_organizations (contact_id, organization_id)
opportunities (id, workspace_id, contact_id, organization_id, title, status, gig_date, fee, city, venue, notes, google_calendar_event_id, created_at, updated_at)
tasks (id, workspace_id, opportunity_id, contact_id, title, due_date, done, created_at)
email_logs (id, workspace_id, contact_id, opportunity_id, gmail_thread_id, gmail_message_id, subject, body, direction, read, sent_at)
gmail_tokens (id, workspace_id, access_token, refresh_token, email, expires_at)
```

Statuts opportunity : `prospect` → `contacted` → `negotiation` → `option` → `confirmed` → `cancelled`

### Onboarding artiste (étape 1.2) — contenu validé

Flow en 3 étapes :
1. Nom de l'artiste / projet + ville de base
2. Liens plateformes : Spotify, Apple Music, Bandcamp, SoundCloud
3. Liens réseaux sociaux : Instagram, Facebook, TikTok, YouTube

Page profil : nom, email, avatar, ville + liens plateformes + liens réseaux
Section "Médias" : vidéos concerts (YouTube, Vimeo, URL libre) avec titre

Genre musical et objectifs trimstriels : **retirés** de l'onboarding (trop CRM, pas assez action)

### Fichiers de référence créés

| Fichier | Rôle |
|---------|------|
| `CLAUDE.md` | Contexte technique complet pour Claude Code |
| `ROADMAP.md` | Roadmap détaillée étape par étape (22 étapes, 8 phases) |
| `DESIGN_SYSTEM.md` | Charte graphique et composants UI (créé par Nizar) |
| `JOURNAL.md` | Ce fichier — historique de construction |

### Chemin critique MVP validé

```
0.1 → 0.2 → 1.1 → 1.2 → 2.1 → 2.2 → 3.1 → 3.2 → 4.1 → 4.2 → 5.1 → 5.2 → 5.3 → 5.4
```

### État au fin de session

- Aucune ligne de code écrite
- Tous les fichiers de contexte en place
- Stack validée, schéma DB validé, roadmap validée
- Prêt à démarrer l'étape **0.1 — Setup repo**

---

## 2026-06-02 — Étape 0.1 : Setup repo (avec Claude Code)

### Étapes complétées
- [x] 0.1 — Setup du repo et de l'environnement

### Décisions prises
- **Next.js 16** (et non 14) + **React 19** : `create-next-app@latest` installe la dernière version, mieux supportée par Node 25. Le chef de projet (rédacteur de la roadmap) n'avait pas les versions à jour.
- **Tailwind v4** (config CSS-based, pas de `tailwind.config.js`) fourni par create-next-app.
- **Mantine v8** intégré via les CSS *layered* + ordre de `@layer` pour cohabiter avec le preflight Tailwind.
- Projet npm nommé **`mybooking`** (« BOOKING OS » invalide en npm). Repo : `Desktop/BOOKING OS/mybooking/`.
- **Sentry reporté** : compte déjà existant, DSN à brancher dans une session dédiée (placeholder laissé).
- Thème Mantine **dark natif** avec palette Zinc alignée sur `DESIGN_SYSTEM.md` (bg `#09090b`, surface `#18181b`), primaire violet, boutons pill, font Plus Jakarta Sans.

### Ce qui a été mis en place
- Next 16 / TS strict / Tailwind v4 / Mantine v8 / ESLint 9 (flat) + Prettier (`eslint-config-prettier/flat`, `no-console`, `no-explicit-any`).
- Structure de dossiers (`app/(auth)`, `app/(app)`, `components/ui`, `components/layout`, `lib/supabase`, `lib/utils`, `types`, `hooks`).
- Clients Supabase server (`cookies()` async — Next 16) + browser, prêts à être typés en 0.2.
- `.env.local.example` documenté ; versionné via `!` dans `.gitignore`.
- Page d'accueil placeholder « Booking OS — Coming soon » (Mantine, centrée, dark).
- `MantineProvider` + `Notifications` + `ColorSchemeScript` dans le layout racine.

### Problèmes rencontrés / solutions
- **Dossier imbriqué en double** (`BOOKING OS/BOOKING OS/`) : docs déplacées à la racine du repo `mybooking/`, dossier vide supprimé.
- **Nom npm invalide** : résolu en nommant le projet `mybooking`.
- **CLAUDE.md généré écrasé** par celui du projet : import `@AGENTS.md` (règles Next 16) réintégré en tête.

### Vérifications
- `npm run build` ✅ (Turbopack, page `/` statique)
- `npm run typecheck` ✅
- `npm run lint` ✅
- Smoke test serveur prod : page rend titre + dark mode actif.

### À faire / reporté
- Déploiement Vercel : **manuel** (à faire par Nizar).
- Sentry : à brancher (wizard interactif).
- Types Supabase (`<Database>`) : à générer en 0.2.

### État en fin de session
- Prochaine étape : **0.2 — Setup Supabase**

---

<!-- TEMPLATE — copier-coller pour chaque nouvelle session

## YYYY-MM-DD — [Titre de la session]

### Étapes complétées
- [ ] X.X — Nom de l'étape

### Décisions prises
-

### Problèmes rencontrés / solutions
-

### Changements au schéma DB
-

### Changements à la stack
-

### État en fin de session
- Prochaine étape : X.X — Nom

-->
