# Booking OS — Un CRM d'outreach vertical pour le booking musical

**Un pipeline, des séquences d'emails, des relances automatiques et une inbox centralisée — appliqués à un métier précis : décrocher des dates de concert.**

La promesse tient en une phrase : **« le tableau de bord qui dit à un artiste, un manager ou un booker qui contacter ou relancer aujourd'hui pour obtenir plus de dates. »**

Ce n'est volontairement **pas** un CRM généraliste. C'est un outil d'action quotidienne.

> Produit conçu, spécifié et construit de bout en bout par [@nizarzkr](https://github.com/nizarzkr). Le code a été écrit avec Claude Code ; le modèle de données, la roadmap en 8 phases et les arbitrages produit sont les miens.

---

## Pourquoi ce projet est un projet de Sales Ops

Sous la surface « musique », c'est un moteur de prospection B2B complet. Les briques construites sont exactement celles d'une stack sales moderne :

| Brique Booking OS | L'équivalent Sales Ops |
|---|---|
| Contacts + organisations (salles, festivals, labels, agences) | Base de comptes et de contacts, hiérarchie account → contact |
| Opportunités + vue Kanban | Pipeline de deals et gestion des stages |
| Tâches de relance + dashboard « Aujourd'hui » | File de travail priorisée, cadence de suivi |
| Templates d'email à variables dynamiques | Personnalisation à l'échelle |
| Séquences multi-étapes avec runner | Sales engagement / automatisation de cadence |
| Inbox : centralisation des réponses entrantes | Boucle de réponse, arrêt automatique de séquence |
| Import CSV avec dédoublonnage et validation | Hygiène de données, gestion des doublons |
| Sync Google Calendar | Options et dates confirmées au bon endroit |

Concevoir ce système, c'est avoir eu à trancher les mêmes questions qu'en Rev Ops : quel objet porte la vérité, quand une séquence doit s'arrêter, comment dédoublonner un import sans perdre de données, et à quoi ressemble l'écran qui dit à un commercial quoi faire dans les 5 prochaines minutes.

## Différenciation produit

Face à Notion, Trello, un Google Sheet ou un CRM générique, l'outil est :

- spécialisé sur le booking musical (vocabulaire, objets et étapes du métier),
- orienté action quotidienne plutôt que reporting,
- centré sur **la relance**, qui est le vrai goulot d'étranglement du métier,
- capable d'envoyer des emails personnalisés depuis les données artiste / contact / gig,
- relié au calendrier.

**Promesse utilisateur :** ne plus oublier qui relancer, envoyer des emails de booking plus vite, et convertir davantage de contacts en dates confirmées.

Le raisonnement produit complet est dans [`PROJET_VISION.md`](./PROJET_VISION.md).

## Décisions notables

- **Refuser le scope du CRM généraliste.** Chaque champ générique en moins est un champ métier en plus. L'outil connaît la différence entre un programmateur et un booker ; un CRM générique ne la connaîtra jamais.
- **Migration Mantine → shadcn/ui en cours de route.** Le premier choix de librairie UI imposait sa direction artistique ; le second m'a rendu le contrôle du design. Refonte assumée plutôt que dette accumulée.
- **RLS Postgres dès la première migration.** L'isolation par workspace est une propriété de la base, pas une condition dans le code applicatif.
- **L'import CSV échoue explicitement.** Un import de 7 lignes qui n'en garde que 3 doit dire *lesquelles* ont été ignorées et *pourquoi* (email invalide, doublon en base, doublon dans le fichier, prénom manquant). Un import silencieux détruit la confiance dans la donnée.

## Stack

Next.js 16 (App Router) + React 19 + TypeScript strict · Tailwind CSS v4 + **shadcn/ui** · Supabase (PostgreSQL + Auth + RLS) · Gmail OAuth (envoi et réception) · Google Calendar · Sentry · Vercel.

## Démarrage local

```bash
cp .env.local.example .env.local   # puis remplir les valeurs
npm install
npm run dev                        # http://localhost:3000
```

| Script | Action |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Sert le build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run format` | Prettier |

## Structure

```
app/
  (auth)/          → login, register
  (onboarding)/    → création du workspace
  (app)/           → dashboard, contacts, organizations, opportunities,
                     pipeline, tasks, templates, sequences, outreach,
                     emails, inbox, settings
  api/             → gmail (connect, callback, sync), sequences (run)
components/        → ui génériques, layout
lib/               → clients Supabase (server + browser), helpers
supabase/          → migrations SQL + seed
types/             → types TypeScript globaux
```

## Documentation du dépôt

| Fichier | Contenu |
|---|---|
| [`PROJET_VISION.md`](./PROJET_VISION.md) | Vision, positionnement, personas, promesse |
| [`ROADMAP.md`](./ROADMAP.md) | Roadmap détaillée : 8 phases, 22 étapes, chemin critique du MVP |
| [`JOURNAL.md`](./JOURNAL.md) | Journal de construction, décisions session par session |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Charte graphique et composants |
| [`CLAUDE.md`](./CLAUDE.md) | Contexte technique : stack, schéma DB, conventions |
