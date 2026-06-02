# Booking OS — Roadmap de construction
> Référence de travail pour Claude Code et Nizar
> Persona ciblé : artiste indépendant qui gère son propre booking
> Chaque étape = une feature livrable et testable

---

## PHASE 0 — Fondations du projet

### Étape 0.1 — Setup du repo et de l'environnement
- Initialisation Next.js 14 (App Router) + TypeScript
- Configuration Tailwind CSS + librairie de composants (Tremor ou Mantine — à valider)
- ESLint, Prettier, husky (pre-commit hooks)
- Structure de dossiers définie (`/app`, `/components`, `/lib`, `/types`, `/hooks`)
- Variables d'environnement `.env.local` documentées
- Déploiement initial vide sur Vercel (CI/CD actif dès le départ)
- Sentry intégré (error tracking dès le début)

**Livrable :** repo propre, déployé sur Vercel, page d'accueil blanche fonctionnelle.

---

### Étape 0.2 — Setup Supabase
- Création du projet Supabase
- Configuration Auth (email/password + magic link)
- Activation Row Level Security (RLS) globale
- Création du schéma de base de données initial (voir détail ci-dessous)
- Seed de données de test
- Client Supabase configuré côté Next.js (SSR + client-side)

**Schéma initial :**
```
workspaces (id, name, owner_id, city, created_at)
users (id, email, workspace_id, role, created_at)
artist_profiles (id, workspace_id, spotify_url, apple_music_url, bandcamp_url, soundcloud_url, instagram_url, facebook_url, tiktok_url, youtube_url, created_at)
artist_media (id, workspace_id, title, url, created_at) -- vidéos concerts
contacts (id, workspace_id, first_name, last_name, email, phone, role, notes, created_at)
organizations (id, workspace_id, name, type, city, country, website, notes, created_at)
contact_organizations (contact_id, organization_id) -- table de liaison
opportunities (id, workspace_id, contact_id, organization_id, title, status, gig_date, fee, city, venue, notes, created_at, updated_at)
tasks (id, workspace_id, opportunity_id, contact_id, title, due_date, done, created_at)
email_logs (id, workspace_id, contact_id, opportunity_id, gmail_thread_id, gmail_message_id, subject, body, direction, read, sent_at)
gmail_tokens (id, workspace_id, access_token, refresh_token, email, expires_at)
```

**Statuts opportunity :** `prospect` → `contacted` → `negotiation` → `option` → `confirmed` → `cancelled`

**Livrable :** base de données opérationnelle, RLS activée, seed de test disponible.

---

## PHASE 1 — Auth et workspace

### Étape 1.1 — Authentification
- Page de connexion (email + password)
- Page d'inscription
- Magic link (connexion sans mot de passe)
- Gestion session côté serveur (middleware Next.js)
- Redirection post-login vers dashboard
- Page "mot de passe oublié"

**Livrable :** un utilisateur peut créer un compte, se connecter, et être redirigé.

---

### Étape 1.2 — Onboarding / création de workspace
- Après inscription, flow d'onboarding en 3 étapes :
  1. Nom de l'artiste / du projet + ville de base (champ texte libre)
  2. Liens plateformes de streaming : Spotify, Apple Music, Bandcamp, SoundCloud (optionnels)
  3. Liens réseaux sociaux : Instagram, Facebook, TikTok, YouTube (optionnels)
- Création automatique du workspace lié à l'utilisateur
- Page de profil : nom, email, avatar, ville, liens plateformes, liens réseaux sociaux
- Section "Médias" sur le profil : possibilité d'ajouter des liens vers des vidéos de concerts (YouTube, Vimeo, ou URL libre) avec titre

**Livrable :** un nouvel utilisateur a un workspace actif et un profil artiste complet après inscription.

---

## PHASE 2 — Contacts et organisations

### Étape 2.1 — Liste des contacts
- Page `/contacts` avec liste paginée
- Colonnes : nom, rôle (booker, programmateur, salle, agent...), organisation, dernière interaction
- Recherche par nom
- Filtre par rôle
- État vide avec call-to-action (premier contact)

**Livrable :** un utilisateur peut voir et chercher ses contacts.

---

### Étape 2.2 — Création / édition d'un contact
- Formulaire de création : prénom, nom, email, téléphone, rôle, organisation associée, notes
- Édition in-place ou page dédiée
- Suppression avec confirmation
- Validation des champs (email valide, etc.)

**Livrable :** CRUD complet sur les contacts.

---

### Étape 2.3 — Organisations (salles, festivals, labels, agences)
- Page `/organizations` avec liste
- Champs : nom, type (salle, festival, agence, label, autre), ville, pays, site web, notes
- Lien avec contacts (un contact peut appartenir à plusieurs orgs)
- CRUD complet

**Livrable :** CRUD complet sur les organisations, liées aux contacts.

---

### Étape 2.4 — Fiche contact détaillée
- Page `/contacts/[id]` 
- Affichage de toutes les infos du contact
- Liste des opportunités liées
- Historique des échanges (emails envoyés depuis l'app)
- Tâches de relance associées
- Bouton rapide "Nouvelle opportunité"
- Bouton rapide "Envoyer un email"

**Livrable :** vue 360° d'un contact depuis une seule page.

---

## PHASE 3 — Opportunités et pipeline

### Étape 3.1 — Liste des opportunités
- Page `/opportunities` avec liste filtrée
- Colonnes : titre, contact, ville/venue, date de gig, statut, fee
- Filtres : par statut, par date, par contact
- Tri par date de gig ou date de création

**Livrable :** vue liste de toutes les opportunités.

---

### Étape 3.2 — Création / édition d'une opportunité
- Formulaire : titre, contact associé, organisation, date du gig, ville, venue, fee, notes, statut
- Changement de statut via dropdown ou boutons rapides
- Suppression avec confirmation

**Livrable :** CRUD complet sur les opportunités.

---

### Étape 3.3 — Vue Pipeline (Kanban)
- Page `/pipeline` avec colonnes par statut
- Drag & drop des cartes entre colonnes (ou boutons de changement de statut)
- Chaque carte affiche : titre, contact, date, fee
- Indicateurs visuels (couleur par statut, date passée = alerte)

**Livrable :** vue pipeline visuelle, navigation rapide entre statuts.

---

### Étape 3.4 — Fiche opportunité détaillée
- Page `/opportunities/[id]`
- Toutes les infos de l'opportunité
- Historique des emails envoyés dans le cadre de cette oppo
- Tâches liées
- Changement de statut
- Notes libres
- Bouton "Envoyer un email"

**Livrable :** vue complète d'une opportunité avec historique.

---

## PHASE 4 — Tâches et relances

### Étape 4.1 — Création de tâches de relance
- Une tâche peut être liée à un contact, une opportunité, ou les deux
- Champs : titre, date d'échéance, notes, fait/pas fait
- Création rapide depuis la fiche contact ou fiche opportunité
- Création depuis le dashboard

**Livrable :** système de tâches opérationnel.

---

### Étape 4.2 — Dashboard "Aujourd'hui" (écran principal)
- Page `/` (home après login)
- Section "À relancer aujourd'hui" : tâches dont la date = aujourd'hui ou dépassée
- Section "Prochaines dates confirmées" : gigs confirmés dans les 30 prochains jours
- Section "Options en cours" : opportunités au statut `option` avec date limite
- Compteurs rapides : nb contacts, nb oppos actives, nb tâches en retard
- Chaque item est cliquable → redirige vers la fiche

**Livrable :** l'utilisateur sait exactement quoi faire en ouvrant l'app.

---

### Étape 4.3 — Vue "Toutes les tâches"
- Page `/tasks`
- Liste de toutes les tâches, filtrées par : à faire aujourd'hui / cette semaine / toutes / terminées
- Marquage rapide comme fait
- Lien vers contact/opportunité associé

**Livrable :** gestion complète des tâches depuis une vue dédiée.

---

## PHASE 5 — Emails

### Étape 5.1 — Templates d'email avec variables dynamiques
- Page `/templates`
- Création de templates avec éditeur de texte riche (ou markdown simple)
- Variables dynamiques supportées : `{{contact_name}}`, `{{artist_name}}`, `{{venue}}`, `{{gig_date}}`, `{{fee}}`, `{{city}}`
- CRUD sur les templates
- Prévisualisation avec données réelles d'un contact

**Livrable :** bibliothèque de templates réutilisables.

---

### Étape 5.2 — Connexion boîte mail (Gmail OAuth)
- Bouton "Connecter ma boîte Gmail" dans les settings (OAuth2 Google)
- Scopes demandés : lecture + envoi (`gmail.readonly` + `gmail.send`)
- Stockage sécurisé des tokens (access + refresh) en DB
- Affichage du statut de connexion (email connecté, dernière sync)
- Note : Outlook via Microsoft Graph prévu en étape ultérieure

**Livrable :** l'utilisateur connecte sa vraie boîte mail pro à Booking OS.

---

### Étape 5.3 — Envoi d'email depuis l'app (via boîte connectée)
- Depuis la fiche contact ou opportunité, bouton "Envoyer un email"
- Sélection d'un template (ou email libre)
- Preview avant envoi avec variables résolues
- Envoi via Gmail API (depuis l'adresse réelle de l'utilisateur)
- Fallback : envoi via Resend si aucune boîte connectée
- Enregistrement dans l'historique (table `email_logs`, `direction: 'outbound'`)

**Livrable :** l'utilisateur envoie des emails depuis sa vraie adresse, trackés dans l'app.

---

### Étape 5.4 — Réception et centralisation des réponses (inbound)
- Polling régulier de la boîte Gmail connectée (ou push via Gmail watch API)
- Détection des réponses à des emails envoyés depuis l'app (matching par thread ID)
- Stockage des réponses dans `email_logs` avec `direction: 'inbound'`
- Affichage des réponses dans la fiche contact et la fiche opportunité
- Notification visuelle dans le dashboard (nouvelles réponses non lues)
- Vue `/inbox` légère : liste des réponses récentes classées par contact/opportunité

**Livrable :** les échanges avec les contacts sont centralisés dans Booking OS, sans quitter l'app.

---

## PHASE 6 — Google Calendar

### Étape 6.1 — Connexion Google Calendar (OAuth)
- Bouton "Connecter Google Calendar" dans les settings
- OAuth2 flow avec Google
- Stockage sécurisé des tokens (refresh token en DB)
- Affichage du statut de connexion

**Livrable :** un utilisateur peut connecter son Google Calendar.

---

### Étape 6.2 — Sync des dates vers Google Calendar
- Quand une opportunité passe au statut `option` → création d'un event Google Calendar (type "option", couleur jaune)
- Quand une opportunité passe au statut `confirmed` → création/mise à jour d'un event (type "confirmé", couleur verte)
- Quand une opportunité est annulée → suppression de l'event
- Gestion des conflits (event déjà existant)

**Livrable :** les options et dates confirmées apparaissent automatiquement dans Google Calendar.

---

## PHASE 7 — Import et settings

### Étape 7.1 — Import CSV de contacts
- Page d'import dans settings
- Upload d'un fichier CSV
- Mapping des colonnes (prénom, nom, email, rôle...)
- Preview avant import
- Import avec rapport d'erreurs (doublons, emails invalides)

**Livrable :** un utilisateur peut importer ses contacts existants rapidement.

---

### Étape 7.2 — Settings du workspace
- Page `/settings`
- Nom du workspace / artiste
- Adresse email d'envoi (domaine custom ou sous-domaine Booking OS)
- Gestion du reply-to
- Déconnexion Google Calendar
- Suppression du compte

**Livrable :** configuration complète du workspace.

---

## PHASE 8 — Qualité et lancement beta

### Étape 8.1 — Tests utilisateurs (amis musiciens)
- Invitation de 3 à 5 testeurs
- Accès complet à l'app en production
- Collecte de feedback structuré (Tally ou Notion)
- Itérations rapides sur les frictions identifiées

---

### Étape 8.2 — Polish UX
- Animations et transitions (Framer Motion si besoin)
- États vides cohérents sur toutes les pages
- Messages d'erreur clairs
- Loading states propres
- Responsive mobile complet

---

### Étape 8.3 — Billing Stripe (optionnel au lancement)
- Intégration Stripe Checkout
- Plan gratuit (limité : ex. 50 contacts, 10 oppos actives)
- Plan Pro (illimité)
- Webhooks Stripe pour gestion des abonnements
- Page de pricing publique

---

## Ordre de priorité absolu (chemin critique MVP)

```
0.1 → 0.2 → 1.1 → 1.2 → 2.1 → 2.2 → 3.1 → 3.2 → 4.1 → 4.2 → 5.1 → 5.2 → 5.3 → 5.4
```

Les étapes `3.3`, `2.3`, `2.4`, `3.4`, `4.3`, `6.x`, `7.x` sont des améliorations post-premier-test.
> Note : 5.2 → 5.4 (email) sont dans le chemin critique car la centralisation des échanges est une feature différenciante clé.

---

## Stack retenue

| Couche | Outil |
|--------|-------|
| Frontend | Next.js 14 + TypeScript + Tailwind |
| Composants UI | Tremor ou Mantine (à valider) |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Email sortant | Gmail API (OAuth2) + Resend (fallback) |
| Email entrant | Gmail API (polling / watch) |
| Calendar | Google Calendar API (OAuth2) |
| Monitoring | Sentry |
| Déploiement | Vercel |
| Billing (phase 8) | Stripe |

---

*Document vivant — à mettre à jour au fil des décisions et itérations.*
