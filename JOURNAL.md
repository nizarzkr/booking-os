# Booking OS — Journal de construction

> Log chronologique de toutes les décisions, changements et étapes complétées.
> À mettre à jour après chaque session de travail.
> **Usage Claude Code :** lire ce fichier en début de session pour avoir le contexte complet.

---

## 2026-07-02 — Étape 8.2 : Polish UX — fichiers spéciaux Next

### Contexte
Audit polish : les états vides existaient déjà sur toutes les vues liste (pipeline gère le vide par colonne), mais **aucun fichier spécial Next** (loading / error / not-found) → navigations sans feedback, erreurs prod moches, 404 par défaut.

### Construit
- `app/(app)/loading.tsx` — squelette générique (Mantine `Skeleton`) affiché pendant la navigation serveur.
- `app/(app)/error.tsx` — frontière d'erreur (client, `reset()` + `console.error`), UI de récupération (Réessayer / Dashboard).
- `app/(app)/not-found.tsx` — 404 dans le shell (déclenché par les `notFound()` des fiches).
- `app/not-found.tsx` — 404 racine (URLs top-level non matchées).

### Piège rencontré
- Build KO au prérendu de `/_not-found` : un Server Component qui passe `component={Link}` (fonction) à un Button Mantine (client) casse la sérialisation RSC. Fix : lien natif `component="a" href` sur les pages 404 (navigation pleine page, sans souci de frontière). `error.tsx` garde `component={Link}` car il est `"use client"`.
- typecheck/lint ne voyaient rien → **le build a attrapé le bug**.

### Vérifications
- typecheck ✅ · lint ✅ · build ✅ (`/_not-found` statique). Testable : naviguer vers `/contacts/<id-inexistant>` (404 dans le shell) ou une URL inconnue (404 racine).

### État
- Reste Phase 8.2 (subjectif, plus tard) : transitions/animations, revue responsive fine. Le reste dépend des creds Google (5.2/5.3 E2E, 5.4 inbound, Phase 6) ou est manuel (#5, 8.1 tests, 8.3 Stripe).

---

## 2026-07-02 — Étape 7.1 : Import CSV de contacts

### Contexte
Dernière grosse brique testable sans credential Google. Permet d'importer une liste existante (Excel/Sheets) au lieu de saisir à la main.

### Construit
- Dépendance **papaparse** (+ `@types/papaparse`) — parse CSV robuste côté navigateur.
- `components/contacts/contact-input.ts` — **validation mutualisée** (`EMAIL_RE`, `normalizeContact`, `validateContact`, types `ContactInput`/`NormalizedContact`), extraite de `contacts/actions.ts`. `contacts/actions.ts` refactoré pour la réutiliser (suppression du `CONTACT_ROLES` dupliqué → réutilise celui de `roles.ts`).
- `app/(app)/settings/import/actions.ts` — `importContacts(rows)` : valide, déduplique (email vs existant + dans le fichier), insert en masse, renvoie `{ inserted, skipped:[{line,reason}] }`. Cap 1000 lignes.
- `components/contacts/contact-importer.tsx` — flux client : upload (`FileButton`), auto-mapping des colonnes (heuristique sur en-têtes désaccentués), aperçu (table + compteurs sans-nom/email-invalide), import, rapport détaillé.
- `app/(app)/settings/import/page.tsx` + lien « Importer un CSV » dans `/settings`.

### Décisions
- Parse client → server action reçoit le tableau mappé (pas d'upload fichier serveur).
- Pas de contrainte unique DB sur `contacts.email` → dédup applicative, insert en masse sûr.
- Rôle inconnu → nul (pas d'erreur). Lignes sans email importées. Prénom/nom requis.

### Vérifications
- typecheck ✅ · lint ✅ · build ✅ (route `/settings/import`).
- **E2E à faire par l'utilisateur** avec le CSV de test fourni (7 lignes → attendu : 3 importés, 4 ignorés : email invalide, doublon existant `marie@lamaroquinerie.fr`, doublon fichier, prénom manquant).

### État
- Phase 7.1 complète. Reste code sans creds : Phase 8 (polish). Le reste (5.2/5.3 E2E, 5.4 inbound, Phase 6 Calendar) attend les credentials Google. Findings restants : #5.

---

## 2026-07-02 — 5.3 (fiche opportunité) + 5.4 (historique emails, affichage)

### 5.3 — envoi branché sur la fiche opportunité
- Fiche opportunité : bouton « Envoyer un email » (si le contact lié a un email). Variables résolues depuis l'oppo : `contact_name`, `artist_name`, `venue`, `city`, `gig_date` (formatée), `fee` (formaté). `email` ajouté au select du contact lié.
- `sendEmail` reçoit `contactId` + `opportunityId` → journalisation liée aux deux.

### 5.4 (partie affichage) — historique des emails sur les fiches
- Composant partagé `components/emails/email-history.tsx` : liste `email_logs` (badge Envoyé/Reçu, objet, extrait, date fr). État vide géré.
- Branché sur fiche **contact** et fiche **opportunité** (query `email_logs` triée par `sent_at desc`). Remplace les placeholders « Historique emails ».
- **Testable dès maintenant** en seedant une ligne `email_logs` (l'affichage ne dépend pas de Gmail ; le remplissage inbound = reste de la 5.4).
- `SoonCard` retirée de la fiche opportunité (devenue inutilisée).

### Vérifications
- typecheck ✅ · lint ✅ · build ✅.

### État
- 5.3 complète (scaffold, E2E envoi dépend de la boîte Gmail). 5.4 : reste la **synchronisation inbound** (polling/watch Gmail → insert email_logs inbound + non-lus au dashboard), qui nécessite une boîte connectée. Findings restants : #5 (leaked password protection).

---

## 2026-07-02 — Fix #3 (register) + Étape 5.3 : Envoi d'email — scaffold

### Fix #3 — confirmation email au register (audit)
- Avant : `signUp` avec confirmation ON ne renvoie pas de session → `redirectAfterAuth` renvoyait silencieusement vers `/login`, sans explication.
- Fix : `AuthState` gagne un variant `{ notice }`. Si `signUp` ne renvoie pas de session → message vert « Vérifie ta boîte mail pour confirmer ». Couvre aussi le cas « email déjà inscrit » (session nulle) sans divulguer l'existence du compte. `AuthForm` affiche error (rouge) / notice (vert). **Testable sans creds.**

### Étape 5.3 — Envoi d'email (scaffold, dépend des tokens 5.2)
- `lib/gmail/oauth.ts` : ajout `refreshAccessToken` (grant_type=refresh_token).
- `lib/gmail/client.ts` : `getGmailConnection(workspaceId)` — lit `gmail_tokens` (admin), rafraîchit si expiré (marge 1 min) et persiste le nouveau token, `null` si non connecté.
- `lib/gmail/send.ts` : `sendGmailMessage` — MIME texte UTF-8 (objet en encoded-word RFC 2047), base64url, `messages.send`.
- `app/(app)/emails/actions.ts` : `sendEmail` — valide, envoie via Gmail, journalise dans `email_logs` (direction outbound, `read:true`, gmail_message/thread_id) via le client authentifié (RLS `ws_all`). Erreur claire si aucune boîte connectée.
- `components/emails/send-email-modal.tsx` : modal réutilisable (choix template → pré-remplit objet+corps via `renderTemplate` + variables, tout éditable).
- Branché sur la **fiche contact** : bouton « Envoyer un email » (si email présent), variables `contact_name` + `artist_name` (nom du workspace). Page contact fetch templates + nom d'artiste.
- Reste : brancher aussi la fiche opportunité (variables venue/gig_date/fee/city) — à faire.

### Vérifications
- typecheck ✅ · lint ✅ · build ✅. Envoi Gmail **non testable** sans boîte connectée (creds 5.2). Fix #3 testable dès maintenant.

### État
- Findings d'audit restants : #5 (leaked password protection, toggle Supabase). Reprise : brancher l'envoi sur la fiche opportunité, puis **5.4 — Réception des réponses (inbound)**.

---

## 2026-07-02 — Étape 5.2 : Connexion Gmail (OAuth2) — scaffold

### Contexte
Choix « scaffolder le code d'abord » : toute la mécanique OAuth est écrite et lit les creds depuis `.env.local`. **Non testable E2E** tant que l'utilisateur n'a pas créé les creds Google + récupéré la `service_role` key (fait à la prochaine session).

### Construit
- `lib/supabase/admin.ts` — client service_role (`import "server-only"`) pour écrire `gmail_tokens` (table verrouillée service_role, illisible côté authenticated).
- `lib/gmail/oauth.ts` — URL de consentement (`access_type=offline` + `prompt=consent` → refresh_token garanti), échange code→tokens, lecture adresse Gmail, révocation.
- Routes `app/api/gmail/connect` (state anti-CSRF en cookie httpOnly posé sur la réponse) + `app/api/gmail/callback` (valide state, échange, stocke le refresh_token — 1 connexion/workspace via delete+insert).
- `app/(app)/settings/gmail-actions.ts` — déconnexion (révoque chez Google + supprime la ligne).
- `/settings` : bouton Connecter/Déconnecter + statut (email connecté) + flash de retour OAuth (`?gmail=…`). Bouton masqué/gated si creds absents (`getGoogleOAuthConfig()`), donc invisible et sans risque tant que non configuré.
- `.env.local.example` : URI de redirection exacte documentée (`/api/gmail/callback`).

### Prérequis manuels (prochaine session)
- Google Cloud : API Gmail activée, écran de consentement, ID client OAuth (App Web), redirect `http://localhost:3000/api/gmail/callback`, scopes readonly+send.
- Supabase : `service_role` key.
- `.env.local` : `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SUPABASE_SERVICE_ROLE_KEY`.

### Vérifications
- typecheck ✅ · lint ✅ · build ✅ (routes `/api/gmail/connect` + `/callback` générées). **E2E : à valider avec creds.**

### État
- Reprise : **5.3 — Envoi d'email depuis l'app** (scaffold aussi, dépend des tokens 5.2 au runtime).

---

## 2026-07-02 — Consolidation avant 5.2 : fuseau horaire + page /settings

### Contexte
Choix « consolider avant d'empiler Gmail » : traiter le finding d'audit #2 (le plus impactant produit) et créer un `/settings` minimal (prérequis pour héberger le bouton « Connecter Gmail » de la 5.2).

### Fix #2 — fuseau horaire (« aujourd'hui » faux)
- Cause : `dayjs()` calcule la date dans le fuseau du runtime → UTC en Server Component (Vercel), fuseau navigateur côté client → décalage d'un jour près de minuit sur « à relancer aujourd'hui »/« en retard ».
- Fix : helper centralisé `lib/utils/date.ts` (`todayISO`, `isoInDays`, `todayLabelFr`) figé sur **Europe/Paris** (plugins dayjs utc+timezone). Serveur et client toujours d'accord. Constante `APP_TZ` (à rendre configurable par workspace plus tard).
- Remplacé les 5 calculs épars (dashboard `page.tsx`, `task-types.ts`, `pipeline-view.tsx`). Plus aucun `dayjs()` « today » résiduel.
- Validé : sous process UTC à 22:30Z (= 00:30 Paris), ancien = 2 juillet (faux), helper = 3 juillet (correct).

### Page /settings (minimale)
- `app/(app)/settings/` (page serveur + action `updateWorkspace`) + `components/settings/settings-view.tsx`.
- Sections : **Espace de travail** (édition nom + ville), **Compte** (email), **Intégrations** (Gmail « Non connecté » — placeholder câblé en 5.2).
- `updateWorkspace` utilise `.select()` pour vérifier qu'une ligne est touchée (applique le finding #4 sur ce nouveau code).
- Lien « Réglages » ajouté à la sidebar.
- Note : statut de connexion Gmail non lisible côté client (`gmail_tokens` en RLS service_role only) → vrai statut à brancher en 5.2.

### Vérifications
- typecheck ✅ · lint ✅ · build prod ✅ (route `/settings` générée) · E2E navigateur validé par l'utilisateur.

### État
- Findings d'audit restants : #3 (confirmation email register), #5 (leaked password protection). Reprise : **5.2 — Connexion Gmail (OAuth2)**.

---

## 2026-07-02 — Audit qualité + sécurisation du travail (commit Phases 1→5.1)

### Contexte
Tout le travail des Phases 1→5.1 était **non commité** (working tree) et le repo n'avait que 3 commits (Phase 0). Audit qualité du code non commité demandé avant de sécuriser.

### Audit — bilan
Socle sain : typecheck ✅, RLS active sur les 12 tables, clients Supabase aux best practices (`getUser()` dans le proxy, cookies async), validation/normalisation partagées par module d'actions, pattern « nom cliquable → fiche `/[id]` avec Modifier/Supprimer » respecté partout.

Findings (par gravité) :
1. **Dérive de migration `email_templates`** (corrigé, cf. ci-dessous).
2. **Fuseau horaire dashboard** — `dashboard/page.tsx` calcule `today` via `dayjs()` côté serveur (UTC sur Vercel) → « à relancer aujourd'hui »/« en retard » décalés d'un jour près de minuit en France. **Non corrigé.**
3. **Register : confirmation email non gérée** — si confirmation ON, `signUp` sans session → redirect silencieux vers `/login`, pas de message « vérifie ta boîte ». **Non corrigé.**
4. **Faux `{ ok:true }` sur update/delete inter-workspace** — filtre `.eq("id", id)` seul, s'appuie sur la RLS ; si 0 ligne touchée, `error` null → succès sur no-op. **Non corrigé.**
5. **Protection mots de passe compromis désactivée** (advisor Supabase WARN, HaveIBeenPwned). **Non corrigé.**

### Fix #1 — dérive de migration `email_templates`
Table présente sur la DB distante (migration `20260701164213_create_email_templates`) + dans les types + le seed, mais **fichier de migration absent** en local (2/3) et table non documentée dans CLAUDE.md → un rebuild from scratch aurait cassé la feature Templates.
- Fichier `supabase/migrations/20260701164213_create_email_templates.sql` **recréé à l'identique** depuis le SQL distant (`supabase_migrations.schema_migrations`) : table + RLS `ws_all` + trigger `updated_at` + index.
- Table ajoutée au schéma dans `CLAUDE.md`.
- DB distante **non touchée** (migration déjà enregistrée) — pure remise en cohérence du repo.

### Vérifications
- Migrations locales alignées sur le distant (3/3). typecheck ✅.

### État
- Travail des Phases 1→5.1 sécurisé par commits (par phase). Findings #2→#5 restent à traiter. Reprise code produit : **5.2 — Connexion Gmail (OAuth2)**.

---

## 2026-07-02 — Refonte DA complète : passage « Hatch » → « Studio » (dark minimal)

### Contexte
La DA était devenue « Frankenstein » (Hatch pastel + sticker néo-brutaliste + besoin d'app dense = 3 langages). Audit + refonte guidés par l'utilisateur. **Correction de stack** : le prompt fourni supposait Tailwind+shadcn ; on est en **Mantine v8 + Tailwind v4** → design system piloté par le thème Mantine, on reste sur Mantine.

### Décisions validées (via AskUserQuestion)
- **Direction** : dark-first minimal (Linear/Raycast).
- **Accent** : violet électrique (unique couleur d'action).
- **Typo** : Geist (Sans partout + Mono pour les nombres).
- **Statuts** = seule famille sémantique colorée ; **rôles + types d'orga passent en neutre (gris)**.

### Étape 1 — Fondations
- Dépendance `geist` ajoutée. `app/layout.tsx` : Geist Sans+Mono, `defaultColorScheme="dark"`.
- `lib/theme.ts` réécrit : tuple `dark` custom (texte 0 → canvas 7), `violet` custom, `primaryColor:"violet"`, `primaryShade {dark:4}`, `autoContrast`+`luminanceThreshold`, radius (sm6/md8/lg12), headings Geist 600. **Suppression du look sticker.**
- `app/globals.css` purgé (retrait sticker/anchor/badge/marqueur mint + vars crème) → minimal.

### Étape 2 — Shell
- `app-nav.tsx` : sidebar+header en surface `dark.6`, item actif violet subtil (variant light), header discret, espacements normalisés.

### Étape 3 — Composants
- Remap couleurs : `STATUS_META` (gray/blue/yellow/violet/green/red), `ROLE_META` + `ORG_TYPE_META` → gray, `dueMeta` (retard=red, aujourd'hui=yellow). Landing + badges divers repassés en violet/red.
- **Retrait de tous les `radius="xl"` (pilules)** sur les badges → radius net par défaut.
- Couleurs pastel (mint/sky/peach) **retirées du thème** ; plus aucune référence.

### Étape 4 — Nombres en Geist Mono
- Compteurs du dashboard + cachets (dashboard, liste oppos, pipeline, fiche oppo) en `ff="monospace"`.

### Étape 5 — Doc
- `DESIGN_SYSTEM.md` entièrement réécrit (DA Studio). Commentaires obsolètes (« mint ») corrigés.
- Tailwind v4 : conservé mais inerte (retrait possible plus tard, non bloquant).

### Piège color scheme (important)
- Symptôme utilisateur : l'app rendait encore **crème + vert menthe** (ancienne DA) après la refonte. Cause : une **préférence `mantine-color-scheme` mémorisée en localStorage sur "light"** (l'app a tourné en `defaultColorScheme="light"` au début) **écrase** `defaultColorScheme="dark"` → rendu clair + CSS caché = illisible.
- **Fix** : `forceColorScheme="dark"` sur `ColorSchemeScript` **et** `MantineProvider` (app dark-only) → déterministe, ignore le localStorage. Nécessite un **hard reload** (Cmd+Shift+R) pour vider le CSS en cache.

### Vérifications
- typecheck / lint / **build production tous verts** à chaque étape.
- **Revue visuelle en vrai (dark) à faire par l'utilisateur** — écran par écran.

### État
- Toutes les fonctionnalités (blocs 0→4 + 5.1) sont désormais sous la DA Studio. Reprise code produit : **5.2 — Connexion Gmail (OAuth2)** (nécessite creds Google + service_role key).

## 2026-07-01 — Étape 5.1 : Templates d'email (variables + aperçu)

### Étapes complétées
- [x] 5.1 — Templates d'email avec variables dynamiques + prévisualisation

### Changements au schéma DB (via MCP)
- **Nouvelle table `email_templates`** (`id, workspace_id, name, subject, body, created_at, updated_at`). Migration `create_email_templates`.
- RLS : policy `ws_all` (ALL, authenticated, `workspace_id = private.current_workspace_id()`, USING+WITH CHECK) — miroir des autres tables.
- Trigger `email_templates_set_updated_at` (réutilise `public.set_updated_at()`), index sur `workspace_id`.
- Types régénérés (`types/database.types.ts`) via MCP `generate_typescript_types`.
- Advisors sécurité : clean (seuls les 2 lints pré-existants — `gmail_tokens` volontaire + option auth « leaked password »).

### Ce qui a été construit
- `components/templates/template-types.ts` : type `EmailTemplate`, `TEMPLATE_VARIABLES` (6 variables), `renderTemplate(text, vars)` (remplace `{{var}}` ; jeton sans valeur laissé tel quel).
- `app/(app)/templates/actions.ts` : create/update/delete (normalize/validate nom requis, revalidate).
- `components/templates/template-form-modal.tsx` : nom / objet / corps (Textarea autosize) + rappel visuel des variables disponibles (badges).
- `components/templates/template-preview-modal.tsx` : **aperçu sur données réelles** — sélecteurs contact + opportunité → variables résolues (`contact_name`, `artist_name` = nom du workspace, `venue`/`gig_date`/`fee`/`city` depuis l'oppo) → objet + corps rendus.
- `components/templates/templates-view.tsx` + `app/(app)/templates/page.tsx` : liste (nom + objet), actions Aperçu / Modifier / Supprimer, empty state. Page fetch templates + contacts + opportunités + nom d'artiste.
- `components/layout/app-nav.tsx` : « Templates » activé — **plus aucune entrée « bientôt »** (toutes les features de nav sont livrées).

### Seed
- Un template d'exemple (« Prise de contact ») ajouté en base **et** dans `supabase/seed.sql` (avec les 6 variables) pour tester l'aperçu immédiatement.

### Variables & source des données
- `{{contact_name}}` (contact sélectionné), `{{artist_name}}` (= `workspaces.name`, posé à l'onboarding), `{{venue}}` `{{gig_date}}` `{{fee}}` `{{city}}` (opportunité sélectionnée).

### Vérifications
- typecheck / lint / build **verts** ; route `/templates` générée.
- Migration appliquée + advisors clean + insert de test OK.
- **E2E navigateur à jouer** : créer/éditer un template, ouvrir l'aperçu et changer le contact/oppo pour voir les variables se résoudre, supprimer.

### État
- **Toute la navigation est désormais fonctionnelle.** Prochaine étape : **5.2 — Connexion Gmail (OAuth2)**, puis 5.3 envoi (avec sélection de template) et 5.4 réception. Nécessitera les creds Google (`GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI`) et la `SUPABASE_SERVICE_ROLE_KEY` (table `gmail_tokens` en service_role).

## 2026-07-01 — Étape 3.3 : Vue Pipeline (Kanban)

### Étapes complétées
- [x] 3.3 — Vue Pipeline (colonnes par statut + déplacement des cartes)

### Décision : boutons de déplacement plutôt que drag & drop
- La roadmap autorise « drag & drop **ou** boutons de changement de statut ». Choisi **colonnes + flèches ◀ ▶** sur chaque carte : robuste, testable, accessible clavier, **zéro nouvelle dépendance** (pas de @dnd-kit). Cohérent avec les mémoires (le DnD en portail + l'automation navigateur sont peu fiables). Le vrai glisser-déposer pourra s'ajouter plus tard.

### Ce qui a été construit
- `app/(app)/opportunities/actions.ts` : action légère `setOpportunityStatus(id, status)` (validation enum ; revalidate `/pipeline` + `/opportunities` + fiche + `/dashboard`).
- `components/opportunities/pipeline-view.tsx` (client) : une colonne par statut (`STATUS_ORDER`), en-tête = badge statut + compteur, scroll horizontal. Cartes : titre (lien fiche), contact/orga, date de gig (+ badge « Dépassé » si gig passé sur oppo ouverte), cachet. Flèches ◀ ▶ pour avancer/reculer d'un statut (désactivées aux extrémités) → `setOpportunityStatus` + `router.refresh()`.
- `app/(app)/pipeline/page.tsx` (server) : fetch RLS-scopé (jointures contact/orga), map vers `OpportunityListItem` (réutilise le type de la liste).
- `components/layout/app-nav.tsx` : « Pipeline » activé (placé en 2e, juste après Dashboard). Reste « Templates » en bientôt.

### Vérifications
- typecheck / lint / build **verts** ; route `/pipeline` générée.
- DB via MCP : répartition des statuts = prospect 2 / negotiation 1 / option 2 (colonnes remplies pour tester le déplacement).
- **E2E navigateur à jouer** : ouvrir /pipeline, déplacer une carte ◀ ▶ entre colonnes, vérifier le report en base + sur la fiche/dashboard.

### État
- Bloc 3 complet (3.1→3.4). Prochaine étape du chemin critique : **5.1 — Templates email**, puis Gmail (5.2–5.4).

## 2026-07-01 — Étape 4.2 : Dashboard « Aujourd'hui »

### Étapes complétées
- [x] 4.2 — Dashboard « Aujourd'hui » (écran d'accueil action-first)

### Ce qui a été construit
- `app/(app)/dashboard/page.tsx` réécrit en **server component** (fetch RLS-scopé, `Promise.all`) :
  - **Compteurs** cliquables : Contacts, Opportunités actives (`status in prospect/contacted/negotiation/option`), Tâches en retard (alerte pink si > 0).
  - **À relancer aujourd'hui** : tâches ouvertes dont l'échéance ≤ aujourd'hui, avec badge (« En retard »/« Aujourd'hui ») + lien vers l'oppo/contact associé.
  - **Prochaines dates confirmées** : opportunités `confirmed` avec `gig_date` dans les 30 prochains jours (cachet + date).
  - **Options en cours** : opportunités `option` (date limite = gig_date).
  - Chaque item est cliquable → fiche. États vides on-brand (« Rien à relancer 🎉 »).
- Réutilise les helpers existants (`formatFee`/`formatGigDate`/`STATUS_META`, `dueMeta`/`formatDueDate`, `fullName`) — zéro duplication.

### Décisions / points techniques
- Comptage via `select("*", { count: "exact", head: true })` (pas de transfert de lignes).
- Filtre statut : `.in("status", [...ACTIVE_STATUSES])` (spread pour passer d'un tuple `as const` readonly à un array mutable attendu par le client typé).
- Dashboard reste sur `/dashboard` (routing post-login inchangé), pas sur `/`.

### Bug RSC attrapé au runtime (pas au build)
- 1re version : dashboard en **server component** rendant directement `Anchor`/`Card` avec `component={Link}` → erreur runtime React 19/Next 16 « Functions cannot be passed directly to Client Components ». **Le build passait au vert**, l'erreur n'apparaissait qu'à l'ouverture de /dashboard (repérée dans le log du serveur dev). Illustration de la mémoire « vérifier en vrai, pas juste build ».
- **Fix** : scission `page.tsx` (server, fetch + mapping en données sérialisables) → `components/dashboard/dashboard-view.tsx` (`"use client"`, tout le rendu + `component={Link}`). Pattern identique aux autres pages (OpportunitiesView, etc.).

### Vérifications
- typecheck / lint / build **verts** + **recompilation dev sans erreur runtime** après le fix.
- DB via MCP (simulation à la date 2026-07-01) : relance = 3, confirmées 30j = 0 (empty state), options = 2, compteurs 4 contacts / 5 oppos actives / 3 en retard. Cohérent.
- **E2E navigateur à jouer** : ouvrir /dashboard, vérifier les 3 sections + compteurs, cliquer un item → fiche.

### Bloc 4 (cœur action-first) : tâches + dashboard en place
- Restent optionnels : 3.3 Pipeline Kanban (améliration visuelle). Prochaine étape du chemin critique : **5.1 — Templates email**, puis 5.2–5.4 (Gmail).

## 2026-07-01 — Refonte lisibilité DA (direction « sticker »)

### Contexte
Retour utilisateur : couleurs peu lisibles, boutons peu visibles. Passe ciblée sur la charte (pas de refonte structurelle).

### Ce qui a changé (câblé en CSS, `app/globals.css` @layer components)
- **Boutons « sticker »** : contour noir 2px + ombre dure décalée (`3px 3px 0 #000`) + effet d'enfoncement au hover/clic. Variantes `subtle`/`transparent` = boutons texte (hiérarchie préservée). `lib/theme.ts` : retrait du `borderWidth` inline (conflit).
- **Inputs** : bordure noire nette (hors focus, où Mantine garde le mint).
- **Liens** (`Anchor`) : avant colorés en primaire (mint → illisible sur blanc). Désormais **texte encre + soulignement mint 2px** (hover → soulignement noir). Corrige les noms de contacts/orgas et titres d'opportunités cliquables.
- **Badges** (statuts/rôles/types) : fond pastel conservé + **texte encre gras + contour noir 1px** (petit sticker lisible).
- **Titres `h1`** (pages + noms d'entités) : **marqueur mint** signature Hatch (surlignement bas derrière le texte).
- `DESIGN_SYSTEM.md` mis à jour (boutons sticker, liens, badges, titres ; règle « zéro ombre » désormais limitée aux cards/surfaces).

### Décision
- La règle « mint = seule couleur d'action » est conservée, mais le mint pâle (#99ffcc) ne portait pas le contraste seul → on ajoute contour/ombre/soulignement pour la lisibilité, plutôt que de changer la couleur d'action. Direction validée par l'utilisateur (« sticker »).

---

## 2026-07-01 — Étape 4.1 : Système de tâches (+ vue /tasks et intégration fiches)

### Étapes complétées
- [x] 4.1 — Tâches (CRUD, liaison contact/oppo, ajout rapide depuis les fiches)
- [x] 4.3 — Vue « Toutes les tâches » (`/tasks`, filtres, marquage rapide) — livrée en même temps (une tâche a besoin d'un endroit où être vue)

### Décision de périmètre
- Pas de page `/tasks/[id]` : une tâche est un **item d'action léger** (titre, échéance, fait/non-fait, lien), pas une entité-profil → édition via modal, coche inline. La mémoire `entity-detail-pages-expected` vise les entités-profil (contacts/orgas/oppos), pas les tâches.
- Schéma réel `tasks` **sans colonne `notes`** (la roadmap la mentionnait à tort) → champ omis.

### Ce qui a été construit
- `components/tasks/task-types.ts` : type `Task`, helpers `formatDueDate`/`isOverdue`/`dueMeta` (badge « En retard »/« Aujourd'hui »), filtres (`todo`/`overdue`/`week`/`done`/`all`) + `matchesFilter`.
- `app/(app)/tasks/actions.ts` : `createTask`/`updateTask`/`setTaskDone`/`deleteTask` (normalize/validate ; revalidate `/tasks` + `/dashboard` + fiches liées).
- `components/tasks/task-form-modal.tsx` : create/edit (@mantine/form, DateInput). **Preset + lockLinks** : depuis une fiche, l'oppo/contact est pré-rempli et les sélecteurs masqués.
- `components/tasks/tasks-view.tsx` + `app/(app)/tasks/page.tsx` : vue globale (filtre, coche inline `setTaskDone`, titre barré si fait, badge d'échéance, lien vers oppo/contact, menu edit/delete).
- `components/tasks/task-section.tsx` : section « Tâches » embarquée (liste liée + coche + supprimer + ajout rapide pré-lié). Intégrée dans **fiche opportunité** (`presetOpportunityId`) et **fiche contact** (`presetContactId`), en remplacement des placeholders. Pages `[id]` : fetch des tâches liées.
- `components/layout/app-nav.tsx` : « Tâches » activé (reste « Pipeline », « Templates » en bientôt).

### Vérifications
- typecheck / lint / build **verts** ; route `/tasks` générée.
- DB via MCP : requête miroir OK (3 tâches de seed, jointures oppo/contact, tri done→échéance). Policy `ws_all` (ALL, authenticated) confirmée sur `tasks`.
- **E2E navigateur à jouer** : créer une tâche (globale + depuis une fiche), cocher/décocher, filtres (En retard sur les tâches de seed), éditer, supprimer.

### État en fin de session
- Prochaine étape : **4.2 — Dashboard « Aujourd'hui »** (à relancer aujourd'hui / prochaines dates confirmées / options en cours + compteurs). Toutes les briques (oppos, statuts, tâches + échéances) sont désormais en place.

## 2026-07-01 — Étapes 3.1 + 3.2 + 3.4 : Opportunités (liste + CRUD + fiche)

### Étapes complétées
- [x] 3.1 — Liste des opportunités
- [x] 3.2 — Création / édition / suppression
- [x] 3.4 — Fiche opportunité détaillée
- (3.3 Pipeline Kanban : reporté à la prochaine session)

### Décision de périmètre
- Livrer **liste + CRUD + fiche en un bloc** (au lieu de la seule liste 3.1) pour respecter la mémoire `entity-detail-pages-expected` : toute entité listée doit avoir sa fiche `/[id]` d'emblée (nom cliquable + Modifier/Supprimer visibles). Évite le trou UX vécu sur les organisations.

### Ce qui a été construit (miroir contacts/organisations)
- `components/opportunities/opportunity-types.ts` : type `Opportunity`, `STATUS_META` (libellés FR + couleurs pastel ; mint réservé à l'action), `STATUS_ORDER`/options select/filtre, helpers `formatFee` (Intl EUR) et `formatGigDate` (dayjs + locale `fr` importée).
- `app/(app)/opportunities/actions.ts` : `createOpportunity` / `updateOpportunity` / `deleteOpportunity` (normalize : vides→null, `fee` en number|null, `status` validé contre l'enum, `contact_id`/`organization_id` null si vide ; validate : titre requis, fee ≥ 0 ; revalidatePath liste + fiche).
- `app/(app)/opportunities/page.tsx` + `components/opportunities/opportunities-view.tsx` : liste RLS-scopée (jointures `contacts(...)`/`organizations(...)`, tri gig_date asc nulls last puis created_at desc), toolbar recherche (titre/ville/venue/contact/orga) + filtre statut, table (titre cliquable, badge statut, contact/orga, lieu, date, cachet), menu ⋯, modal de suppression **en submit**.
- `components/opportunities/opportunity-form-modal.tsx` : create/edit (@mantine/form, remount par `key`), `DateInput` (Mantine v8 = valeurs string "YYYY-MM-DD"), `NumberInput` cachet, selects searchable contact/orga.
- `app/(app)/opportunities/[id]/page.tsx` (params async) + `components/opportunities/opportunity-detail.tsx` : fiche avec Modifier/Supprimer visibles, **changement rapide de statut** (Select → updateOpportunity + refresh), contact/orga liés en Anchor, placeholders Tâches (4.x) / Emails (5.x).
- `components/layout/app-nav.tsx` : « Opportunités » passé de `SOON_ITEMS` à `NAV_ITEMS`.

### Points techniques
- Mantine v8 : `@mantine/dates` travaille désormais en **valeurs string** (pas Date) → aligne directement avec `opportunities.gig_date` (date). CSS `@mantine/dates/styles.layer.css` déjà importé.
- Changement rapide de statut : reconstruit un `OpportunityInput` complet depuis l'oppo courante (l'update remplace les champs), nulls → "" pour les champs texte.

### Vérifications
- typecheck / lint / build **verts** ; routes `/opportunities` et `/opportunities/[id]` générées.
- DB via MCP Supabase : requête miroir de la page OK (3 opportunités de seed, jointures contact/orga, ordre gig_date asc nulls last). Policy `ws_all` (ALL, authenticated, USING+WITH CHECK scopées workspace) confirmée → CRUD autorisé et scopé.
- **E2E navigateur à jouer** (test manuel guidé) : create → liste → fiche → changement de statut → edit → delete, + recherche/filtre.

### État en fin de session
- Prochaine étape : **3.3 — Vue Pipeline (Kanban)** (`/pipeline`, colonnes par statut, changement de statut par carte).

## 2026-07-01 — Étape 1.1 : Authentification

### Étapes complétées
- [x] 1.1 — Auth (email + mot de passe via Supabase Auth)

### Ce qui a été construit
- `lib/supabase/proxy.ts` (`updateSession`) + `proxy.ts` racine : refresh de session + garde des routes `/(app)`.
- `app/(auth)/actions.ts` : Server Actions `login` / `register` / `logout` (`useActionState`, React 19).
- `components/auth/auth-form.tsx` (partagé) + pages `/login` et `/register`.
- `app/(auth)/auth/confirm/route.ts` : route de confirmation email (prête pour activation future).
- `app/(app)/layout.tsx` (garde serveur) + placeholders `/dashboard` et `/onboarding`.

### Décisions prises
- Auth email + mot de passe ; Google OAuth reporté.
- **Next 16** : `middleware.ts` déprécié → fichier `proxy.ts` (export `proxy`). Piège confirmé dans les docs `node_modules/next/dist/docs`.
- Routing post-login piloté par `users.workspace_id` (NULL → onboarding, sinon dashboard).
- Cap produit : synthèse vision + PRD ; séquences via `pg_cron`/`pgmq` (pas BullMQ+Redis).

### Vérifications
- typecheck + lint + build : OK. Build liste bien `ƒ Proxy (Middleware)`.
- `GET /dashboard` sans session → 307 vers `/login` ; `/login` → 200.
- Signup test : utilisateur créé, trigger `handle_new_user` a bien inséré `public.users` (workspace_id NULL, role owner). Utilisateur de test supprimé après vérif.

### Problèmes rencontrés / à traiter
- **Confirmation email encore ON** côté projet Supabase (signup ne renvoie pas de session). À basculer OFF : Dashboard > Authentication > Providers > Email > désactiver « Confirm email ». Tant que c'est ON, le register renvoie vers `/login` sans session.

### Direction artistique — pivot « Hatch »
- Nouveau dossier `DESIGN BOOKING OS/` fourni par l'utilisateur (DA claire/pastel « Hatch »). Réorganisé : `reference/DESIGN.md` + `tokens/` (json/css) + `README.md`.
- Décision : DA **adaptée product-UI** remplace l'ancienne DA sombre. Substituts de polices libres (DM Serif Display + Inter). Appliquée **avant 1.2**.
- Recablé : `lib/theme.ts` (light, mint primary, autoContrast, radius, aucune ombre), `app/layout.tsx` (fonts + light scheme), `app/globals.css` (canvas crème + vars marque). `DESIGN_SYSTEM.md` réécrit. Placeholders passés en mint/pink.
- Vérif : typecheck/lint/build OK ; screenshots `/` et `/login` conformes (crème + serif + pill mint).

## 2026-07-01 — Vérification E2E du bloc 2 + fiche organisation

### Contexte
Session de vérification E2E complète (bloc 2), pilotée manuellement par l'utilisateur (vrais clics) avec vérif DB via MCP Supabase — l'automation navigateur ayant été peu fiable.

### Résultat
- ✅ Contacts : create / update / delete (via menu ⋯ liste ET via fiche) — vérifiés.
- ✅ Fiche contact : lien/délien organisation, edit, delete — vérifiés.
- ✅ Organisations : create / update / delete — vérifiés.

### Correctif suite retour utilisateur
- **Manque UX signalé** : les organisations n'avaient pas de fiche ni de nom cliquable → l'utilisateur ne trouvait pas comment « développer le profil / modifier / supprimer » (le menu ⋯ existait mais peu évident).
- **Ajouté** : `app/(app)/organizations/[id]/page.tsx` + `components/organizations/organization-detail.tsx` (infos, Modifier/Supprimer visibles, contacts liés en lecture, placeholders). Nom d'orga rendu cliquable dans la liste.
- Mémoires créées : `entity-detail-pages-expected`, `verifier-e2e-navigateur-avant-de-valider`.

### Nettoyage
- Compte de test « Nizar Zekri » supprimé (à la demande de l'utilisateur). Base = seed uniquement (workspace Lou Vega, 3 contacts, 2 orgs).

### Bloc 2 : entièrement vérifié E2E ✅
Prochaine étape : **3.1 — Liste opportunités** (pipeline de booking). Penser à livrer la fiche `/[id]` d'emblée (cf. mémoire).

---

## 2026-07-01 — Étape 2.4 : Fiche contact (fin du bloc 2)

### Étapes complétées
- [x] 2.4 — Fiche contact

### Ce qui a été construit
- `app/(app)/contacts/[id]/page.tsx` : page détail server. **Next 16 : `params` est async** (`await params`). Fetch contact (maybeSingle + notFound), organisations liées (jointure `contact_organizations → organizations(...)`), et toutes les orgs du workspace (sélecteur).
- `app/(app)/contacts/[id]/actions.ts` : `linkOrganization` / `unlinkOrganization` (insert/delete dans contact_organizations, revalidatePath de la fiche).
- `components/contacts/contact-detail.tsx` : coordonnées (email mailto, tél, notes), Modifier (réutilise ContactFormModal), Supprimer (confirm en submit → redirect /contacts), **organisations liées** (liste + délier + sélecteur searchable des orgs non liées + Lier). Sections placeholder Opportunités (3.x) / Tâches (4.x) / Emails (5.x). Erreurs via notifications.
- `contacts-view.tsx` : le nom de chaque contact est désormais un lien vers `/contacts/[id]`.

### Décisions / points techniques
- Jointure Supabase imbriquée `select("organizations(...)")` : le typage généré la traite comme objet nullable → `.filter((o): o is Organization => o !== null)` pour typer proprement.
- Boutons de page (link/unlink/delete) en onClick simple (hors portail = OK) ; confirm delete en submit de formulaire.

### Vérifications
- typecheck/lint/build verts, route `/contacts/[id]` générée.
- RLS `contact_orgs_all` (ALL, authenticated) confirmée → link/unlink autorisés. Seed sans liens (normal).
- **E2E navigateur à rejouer** (extension déconnectée cette session).

### Bloc 2 terminé
Contacts (2.1/2.2), Organisations (2.3), Fiche contact (2.4) : ✅. Reste à rejouer les E2E navigateur (delete contact + CRUD orgs + fiche/liaison) quand l'extension est reconnectée.

### État en fin de session
- Prochaine étape : **3.1 — Liste opportunités** (début du pipeline de booking).

---

## 2026-07-01 — Étape 2.3 : Organisations

### Étapes complétées
- [x] 2.3 — Organisations (CRUD)

### Ce qui a été construit (miroir des contacts)
- `app/(app)/organizations/actions.ts` : create/update/delete (workspace_id, validation name, normalisation, revalidatePath).
- `components/organizations/org-types.ts` : type Organization, ORG_TYPE_META (salle/festival/agence/label/autre), options select/filtre.
- `components/organizations/organization-form-modal.tsx` : formulaire (nom, type, ville, pays, site web, notes), remount par `key`.
- `components/organizations/organizations-view.tsx` : toolbar (recherche nom/ville + filtre type) + table (badge type, lien web cliquable) + menu de ligne + modal de confirmation **en submit dès le départ** (leçon du 2.2).
- `app/(app)/organizations/page.tsx` (fetch RLS-scoped). Nav « Organisations » ajoutée dans `app-nav.tsx`.

### Vérifications
- typecheck/lint/build verts, route `/organizations` générée.
- Requête miroir de la page exécutée en base : OK (2 organisations de seed, colonnes valides).
- RLS : policy `ws_all` (cmd ALL, authenticated) confirmée sur `organizations` → create/update/delete/select autorisés et scopés.
- **E2E navigateur non rejoué** : l'extension Claude-in-Chrome s'est déconnectée en cours de session. À refaire au prochain passage (create/edit/delete via l'UI).

### État en fin de session
- Prochaine étape : **2.4 — Fiche contact** (vue détail : infos, organisation(s) liée(s) via contact_organizations, historique, tâches, notes).

---

## 2026-07-01 — Étape 2.2 : CRUD contacts

### Étapes complétées
- [x] 2.2 — CRUD contacts (créer / éditer / supprimer)

### Ce qui a été construit
- `app/(app)/contacts/actions.ts` : `createContact` / `updateContact` / `deleteContact` (récup workspace_id pour l'insert, normalisation vides→null, validation first_name + email, `revalidatePath('/contacts')`).
- `components/contacts/roles.ts` (meta partagée : libellés/couleurs de rôle, type Contact, fullName).
- `components/contacts/contact-form-modal.tsx` : formulaire create/edit (@mantine/form) ; remonté via `key` à chaque ouverture → initialValues frais, zéro useEffect (respecte `react-hooks/set-state-in-effect`).
- `components/contacts/contacts-view.tsx` : remplace contacts-table ; toolbar + bouton Ajouter + table + menu de ligne (Modifier/Supprimer) + modal de confirmation de suppression (custom Mantine, PAS de window.confirm).
- Bouton « Ajouter » activé (étape 2.1 le laissait désactivé).

### Décisions / points techniques
- Boutons des modals en **submit de formulaire** (create/edit et confirmation de suppression) : plus accessible (Entrée valide) et robuste.
- Suppression : modal de confirmation maison pour éviter les dialogs natifs bloquants.

### Vérifications (E2E navigateur + SQL + logs serveur)
- **Create** : contact créé via modal → liste rafraîchie → confirmé en base + log `createContact`.
- **Update** : édition (ajout du nom « Bikini ») → liste rafraîchie → confirmé en base (`last_name`) + log `updateContact`.
- **Delete** : le menu de ligne et le modal de confirmation s'affichent correctement (rendus vérifiés). L'action `deleteContact` + RLS (policy `ws_all` FOR ALL couvre DELETE) sont corrects. Le clic final de confirmation n'a pas pu être joué de façon fiable via l'automation navigateur (flakiness du menu Mantine en portail + extension Chrome qui injecte des scripts) — artefact d'automation, pas un bug applicatif. Bouton de confirmation durci en submit de formulaire pour fiabiliser (comme create/edit qui fonctionnent).
- typecheck/lint/build verts. Compte de test supprimé (cascade OK, seed intacte).

### À refaire quand l'occasion se présente
- Rejouer une suppression E2E dans un navigateur propre (sans l'extension qui déclenche le warning d'hydratation) pour cocher définitivement le delete.

### État en fin de session
- Prochaine étape : **2.3 — Organisations** (salles/festivals/agences/labels, + lien contact ↔ organisation).

---

## 2026-07-01 — Étape 2.1 : Liste des contacts

### Étapes complétées
- [x] 2.1 — Liste des contacts (+ shell applicatif)

### Ce qui a été construit
- **Shell app** : `components/layout/app-nav.tsx` (Mantine AppShell — header, sidebar avec nom du workspace, nav Dashboard/Contacts actifs, Pipeline/Opportunités/Tâches/Templates « bientôt », logout). `app/(app)/layout.tsx` gère auth + garde workspace + rend le shell. Dashboard simplifié.
- **Onboarding déplacé** : `app/(app)/onboarding` → nouveau groupe `app/(onboarding)/` avec son layout (auth seule, sans shell). Évite la boucle : le layout (app) redirige vers /onboarding si pas de workspace.
- **Contacts** : `app/(app)/contacts/page.tsx` (fetch RLS-scoped) + `components/contacts/contacts-table.tsx` (client : recherche nom/email, filtre par rôle, table Mantine, badges de rôle colorés, empty state). Bouton « Ajouter » désactivé (création = 2.2).

### Problèmes rencontrés / solutions
- **Server error** sur /contacts : `onClick` passé à un Button depuis un Server Component (« Event handlers cannot be passed to Client Component props »). Fix : bouton `disabled` sans handler (retrait du Tooltip).
- **Cache `.next/types` obsolète** après déplacement d'onboarding → erreur typecheck sur l'ancien chemin. Résolu par un `build` qui régénère les types.
- **Warning « 1 Issue » (hydratation)** : PAS notre code — une extension Chrome (`lgblnfidahcdcjddiepkckcfdhpknnjh/popups-script.js`) injecte un `src` dans le `<script>` Mantine avant hydratation. Dev-only, propre au navigateur de l'utilisateur, absent en prod. Confirmé via read_console_messages.

### Vérifications (E2E navigateur + SQL)
- register → onboarding → dashboard (shell OK, workspace « The Midnight Echoes »).
- /contacts vide → empty state ; 5 contacts insérés via SQL → table triée, badges rôle, `—` pour nulls, compteur ; recherche « printemps » → 1/5. RLS scope OK. Compte de test supprimé (cascade OK, seed intacte).
- typecheck/lint/build verts.

### État en fin de session
- Prochaine étape : **2.2 — CRUD contacts** (créer / éditer / supprimer, activer le bouton « Ajouter », + import CSV plus tard en 7.1).

---

## 2026-07-01 — Étape 1.2 : Onboarding

### Étapes complétées
- [x] 1.2 — Onboarding (création workspace + profil artiste)

### Ce qui a été construit
- `app/(app)/onboarding/actions.ts` (`completeOnboarding`) : workspace → `users.workspace_id` → `artist_profiles`, dans cet ordre imposé par la RLS. Client authentifié uniquement (pas de service_role — la clé est d'ailleurs vide).
- `components/onboarding/onboarding-form.tsx` + page `/onboarding` réelle (nom d'artiste requis, ville optionnelle), on-brand Hatch.
- Gardes de redirection : `/onboarding` → dashboard si déjà onboardé ; `/dashboard` → onboarding si `workspace_id` null. Dashboard affiche le nom du workspace.

### Décisions prises
- Onboarding **minimal** (nom + ville) conforme au principe « profil progressif » (Risque 3 de la vision : éviter trop de champs). Le **type d'utilisateur** (solo/groupe/manager/booker/label) est reporté : pas de colonne DB, nécessiterait une migration.
- Confirmation email désactivée par l'utilisateur → signup renvoie une session, flux fluide.

### Vérifications (E2E navigateur + SQL)
- register → session immédiate → `/onboarding` → formulaire → `/dashboard` affichant « ESPACE : Nizar Demo Band ».
- SQL : workspace créé (name+city), `owner_id` = user, `users.workspace_id` posé, `artist_profiles` créé (prouve l'ordre RLS). Compte de test supprimé (cascade OK, seed « Lou Vega » intacte).

### État en fin de session
- Prochaine étape : **2.1 — Liste contacts** (première vraie feature métier scopée par workspace).

---

## 2026-07-01 — Étape 1.1 : Authentification

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

## 2026-06-02 — Étape 0.2 : Setup Supabase (avec Claude Code)

### Étapes complétées
- [x] 0.2 — Setup Supabase (schéma, RLS, seed, types, clients)

### Décisions prises
- **Projet cloud** (Docker absent → pas de stack local) : `mybooking`, ref `vsbcvqeewmqntvgrphcw`, org `nizarzkr's Org`, région eu-west-3, gratuit. Provisionné via le **MCP Supabase**.
- **Auth** : email + mot de passe uniquement (magic link / Google reportés).
- **Clé publiable moderne** (`sb_publishable_...`) côté front → variable `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **RLS** : policies `TO authenticated` + prédicat d'ownership (`workspace_id = private.current_workspace_id()`), `USING` + `WITH CHECK`. Helpers SECURITY DEFINER déplacés dans le schéma `private` (non exposé à la Data API).
- **`gmail_tokens`** : RLS sans policy → accès `service_role` uniquement.

### Migrations
- `20260602161830_initial_schema` — 11 tables, 5 enums, RLS, triggers (`handle_new_user`, `updated_at`).
- `20260602162025_harden_rls_helper_functions` — helpers vers schéma `private`, policies recréées.

### Seed
- User démo `demo@bookingos.test` / `Demo123!` + 1 workspace, 3 contacts, 2 organisations, 3 opportunités, 3 tâches (dont 1 en retard, 1 option avec deadline). Idempotent. Fichier : `supabase/seed.sql`.

### Changements au schéma DB
- Ajout `created_at` sur `gmail_tokens`, `google_calendar_event_id` sur `opportunities` (déjà au schéma cible). Schéma `private` pour les helpers.

### Vérifications
- Advisors sécurité : **clean** (1 INFO voulu sur `gmail_tokens`).
- `list_tables` : 11 tables, RLS active partout.
- Types TS générés → `types/database.types.ts`. Clients Supabase câblés avec `<Database>`.

### À faire / reporté
- Confirmation email (ON par défaut) : à gérer en 1.1.
- `supabase link` + `db push` (CI/prod) : nécessite `supabase login`.
- Service role key : à récupérer au dashboard pour la phase Gmail.

### État en fin de session
- Prochaine étape : **1.1 — Authentification**

---

> ℹ️ **Note de continuité :** les phases **1 → 5.1**, ainsi que **7.1** et **8.2**, ont été construites lors de sessions intermédiaires sans entrée de journal dédiée. L'état détaillé et vérifié de chaque étape fait foi dans le **tableau d'avancement de `CLAUDE.md`** (source de vérité), tenu à jour à chaque étape.

---

## 2026-07-06 — Validation E2E des emails (Gmail 5.2 + 5.3) et fix server actions

### Étapes complétées
- [x] 5.2 — Connexion Gmail (OAuth2) — **validée E2E avec vrais credentials**
- [x] 5.3 — Envoi d'email réel — **validé E2E (email envoyé ET reçu)**
- [~] 5.4 — statut clarifié : **partiel** (affichage historique OK, réception inbound à faire)

### Ce qui a été fait
- **Setup credentials réels** : activation de l'API Gmail + écran de consentement OAuth (mode *Testing*, `nizarmgmt@gmail.com` en test user), scopes `gmail.send` + `gmail.readonly`, client OAuth « Web application » avec redirect `http://localhost:3000/api/gmail/callback`. Renseigné `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` + `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local` (les creds avaient d'abord été collés en format lisible `Client ID : …` → non lus par Next ; remis au format `CLE=valeur`).
- **Test OAuth (5.2)** : connexion → consentement → callback. Vérifié en base (`gmail_tokens`) : ligne présente pour `nizarmgmt@gmail.com` avec `access_token` **et `refresh_token`** (le cas `norefresh` est bien évité grâce à `access_type=offline`+`prompt=consent`), token valide.
- **Test envoi (5.3)** : email réel envoyé depuis une fiche contact vers `nizarmgmt@gmail.com`, **reçu** dans la boîte. Journalisé dans `email_logs` (outbound, `gmail_message_id` + `thread_id`).

### Problème rencontré / solution
- **Bug bloquant découvert en testant l'envoi** : le bouton « Envoyer » restait en chargement (HTTP 500). Cause : `export type { ContactInput };` dans `app/(app)/contacts/actions.ts` (fichier `"use server"`). Turbopack (Next 16) n'efface pas ce ré-export d'un type importé type-only → `ReferenceError: ContactInput is not defined` au module evaluation, cassant **tout** le loader de server actions de la route `/contacts/[id]` (dont `sendEmail`). Invisible pour `tsc`.
  - **Fix** (commit `113bd67`) : retrait du ré-export ; `contact-form-modal.tsx` importe désormais `ContactInput` depuis sa source (`components/contacts/contact-input`). Règle ajoutée aux décisions de `CLAUDE.md`.

### Note MCP Gmail
- Le MCP Gmail de la session est connecté à **`nizar@pillarops.fr`**, pas à `nizarmgmt@gmail.com` → il ne peut pas servir à vérifier les envois de l'app. La vérification de réception a été faite manuellement par Nizar. (Rappel : le MCP Gmail est un outil de l'agent, pas une brique produit — l'app doit garder son propre OAuth par workspace.)

### État en fin de session
- Emails **5.2 + 5.3 validés E2E**. Docs (`CLAUDE.md` + `JOURNAL.md`) resynchronisées.
- Prochaine étape : **5.4 (réception inbound)** — enchaînée dans la foulée (ci-dessous).

---

## 2026-07-06 (suite) — Étape 5.4 : réception des réponses entrantes

### Étapes complétées
- [x] 5.4 — Réception inbound Gmail. **Phase 5 (emails) désormais complète.**

### Décisions prises
- **Déclencheur du polling : « à la demande + route sécurisée »** (choix utilisateur). Sync au chargement de `/inbox` (auto + bouton Rafraîchir) via server action, ET route `GET /api/gmail/sync` protégée par `CRON_SECRET`, prête pour un Vercel Cron. Écarté : Vercel Cron seul (intestable en local), pg_cron/Edge Function (trop lourd maintenant).
- Récupération limitée aux **threads déjà connus** du workspace (`email_logs.gmail_thread_id`) : simple et suffisant pour capter les *réponses* aux emails envoyés depuis l'app (pas un client mail générique).
- **Manipulation via client admin** (`service_role`) dans `receive.ts` pour rester réutilisable côté action ET côté cron (pas de session) ; scope workspace explicite.

### Ce qui a été mis en place
- `lib/gmail/receive.ts` : `syncInboundForWorkspace` (idempotent, dédup par `gmail_message_id`, héritage `contact_id`/`opportunity_id`, thread illisible non bloquant) + parsing MIME (base64url, walk text/plain>html nettoyé, décodage RFC 2047, corps plafonné 10k).
- `app/(app)/inbox/actions.ts` (`syncInbox`, `markAllInboundRead`), page `/inbox` + `components/inbox/inbox-view.tsx`.
- `app/api/gmail/sync/route.ts` (cron, `CRON_SECRET`) + exclusion de la garde dans `lib/supabase/proxy.ts`.
- Nav « Réponses » + badge non-lus (`app-nav` + compteur dans `layout`), bannière dashboard.
- `.env.local.example` : `CRON_SECRET` documenté.

### Vérifications
- Route testée : 401 sans/mauvais secret, 200 avec (`{ok:true, workspaces:1, inserted:0}` sur thread sans réponse).
- **E2E complet** : email app → réponse reçue → sync → ligne `inbound` créée (`subject` décodé « Re: … », rattachée au contact, `read:false`). Confirmé en base.
- `typecheck` + `lint` verts.

### État en fin de session
- **Phase 5 (emails) terminée et validée E2E.**
- Prochaine étape : **Phase 6 — Google Calendar** (6.1 OAuth + 6.2 sync des options/dates confirmées).
- Note infra : brancher un **Vercel Cron** sur `/api/gmail/sync` (avec `CRON_SECRET`) au déploiement, pour la sync inbound en arrière-plan.

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
