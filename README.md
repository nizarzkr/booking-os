# Booking OS

SaaS de booking musical pour artistes indépendants. Objectif MVP : permettre à un musicien de savoir exactement **qui contacter ou relancer aujourd'hui** pour décrocher plus de dates.

> Outil d'action quotidienne, pas un CRM généraliste.

## Documentation projet

| Fichier | Rôle |
|---------|------|
| [`CLAUDE.md`](./CLAUDE.md) | Contexte technique (stack, schéma DB, conventions) |
| [`ROADMAP.md`](./ROADMAP.md) | Roadmap détaillée (8 phases, 22 étapes) |
| [`JOURNAL.md`](./JOURNAL.md) | Journal de construction (décisions, sessions) |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Charte graphique et composants UI |

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** strict
- **Tailwind CSS v4** + **Mantine v8** (thème sombre natif)
- **Supabase** (PostgreSQL + Auth + RLS) — _étape 0.2_
- **Sentry** (monitoring), **Vercel** (déploiement)

## Démarrage

```bash
# 1. Variables d'environnement
cp .env.local.example .env.local   # puis remplir les valeurs

# 2. Lancer le serveur de dev
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Action |
|--------|--------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run format` | Formate le code avec Prettier |
| `npm run format:check` | Vérifie le formatage sans écrire |

## Structure

```
app/
  (auth)/        → pages publiques (login, register) — à venir
  (app)/         → pages protégées (dashboard, contacts...) — à venir
components/
  ui/            → composants génériques réutilisables
  layout/        → sidebar, header, navigation
lib/
  supabase/      → clients Supabase (server + browser)
  utils/         → helpers
types/           → types TypeScript globaux
hooks/           → custom React hooks
```
