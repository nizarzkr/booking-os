# **Projet SaaS — Booking OS pour musiciens indépendants**

## **1\. Vision générale**

Le projet est un SaaS B2B/prosumer destiné aux **artistes indépendants, groupes, managers indés et bookers DIY**.

L’objectif est de créer un **Booking OS** : un outil simple, spécialisé et actionnable pour aider les utilisateurs à :

* centraliser leurs contacts booking,  
* suivre leurs opportunités de concerts,  
* gérer leurs relances,  
* créer des modèles de mails personnalisés,  
* envoyer des campagnes ou séquences d’emails ciblées,  
* centraliser l’historique des échanges,  
* connecter Google Calendar pour suivre les options et dates confirmées,  
* utiliser automatiquement les informations de leur profil artiste dans leurs emails.

Le produit ne doit pas être un CRM généraliste. Il doit être pensé comme :

**“Le tableau de bord quotidien qui dit à un artiste, manager ou booker qui contacter ou relancer aujourd’hui pour obtenir plus de dates.”**

---

# **2\. Positionnement produit**

## **Positionnement court**

**Un assistant de booking pour artistes, managers et bookers indés qui centralise contacts, gigs, emails et relances pour convertir plus d’opportunités en dates confirmées.**

## **Différenciation**

Contrairement à Notion, Trello, Google Sheets ou un CRM générique, le produit est :

* spécialisé pour le booking musical,  
* orienté action quotidienne,  
* centré sur les relances,  
* relié aux contacts et aux opportunités de concerts,  
* capable d’envoyer des emails personnalisés à partir des données artiste/contact/gig,  
* intégré au calendrier.

## **Promesse utilisateur**

**Ne plus oublier qui relancer, envoyer des emails de booking plus rapidement, et transformer davantage de contacts en dates confirmées.**

---

# **3\. Personas cibles**

## **Persona 1 — Artiste ou groupe semi-pro**

* Gère son propre booking.  
* A entre quelques dates et plusieurs dizaines de dates par an.  
* Utilise Gmail, Google Sheets, Notion, Trello ou Apple Notes.  
* Déteste l’administratif.  
* A besoin d’un outil très simple.  
* Souhaite contacter des salles/festivals et relancer sans perdre le fil.

## **Persona 2 — Manager indépendant**

* Gère plusieurs artistes.  
* Suit de nombreux contacts et opportunités.  
* A besoin de multi-projets / multi-artistes.  
* Veut des modèles d’emails réutilisables.  
* Veut suivre les échanges et relances.

## **Persona 3 — Booker indépendant / agent DIY**

* Travaille avec un volume élevé de contacts.  
* A besoin d’un pipeline clair par artiste, territoire, période.  
* A besoin de templates, relances, historique et reporting.  
* Plus susceptible de payer un prix plus élevé.

---

# **4\. Problèmes utilisateur**

Les utilisateurs ont aujourd’hui des données dispersées entre :

* Gmail,  
* Google Calendar,  
* Google Sheets,  
* Notion,  
* Trello,  
* Instagram,  
* fichiers PDF,  
* liens Linktree / SoundCloud / Spotify / YouTube,  
* notes personnelles.

Douleurs principales :

* contacts dispersés,  
* oubli des relances,  
* historique email difficile à retrouver,  
* absence de pipeline clair,  
* difficulté à savoir qui contacter aujourd’hui,  
* emails de booking répétitifs à rédiger,  
* difficulté à personnaliser les messages à grande échelle,  
* infos artiste éparpillées,  
* dates confirmées ou options mal synchronisées avec le calendrier.

---

# **5\. Boucle produit centrale**

La boucle cœur du produit est :

Créer profil artiste  
→ Importer / créer contacts  
→ Créer opportunités de gigs  
→ Envoyer emails personnalisés  
→ Créer tâches de relance  
→ Suivre réponses et échanges  
→ Poser option  
→ Confirmer date  
→ Synchroniser Google Calendar  
→ Mesurer ce qui avance

La boucle d’usage quotidienne doit être :

Ouvrir dashboard  
→ Voir tâches et relances du jour  
→ Envoyer ou préparer emails  
→ Mettre à jour statuts des gigs  
→ Créer prochaines actions

---

# **6\. Fonctionnalités principales du MVP**

## **6.1 Authentification et onboarding**

### **Objectif**

Lors de la création du compte, l’utilisateur doit créer un espace de travail et renseigner son profil artiste / projet.

### **Entités principales**

* User  
* Workspace  
* ArtistProfile / Project

### **Onboarding utilisateur**

Étapes recommandées :

1. Créer compte.  
2. Créer workspace.  
3. Choisir type d’utilisateur :  
   * artiste solo,  
   * groupe,  
   * manager,  
   * booker,  
   * label / collectif.  
4. Créer un premier profil artiste/projet.  
5. Renseigner les infos essentielles.  
6. Importer ou créer quelques contacts.  
7. Créer un premier gig ou une première campagne de booking.  
8. Proposer une première tâche de relance ou un premier email.

---

# **7\. Profil artiste / projet**

## **Objectif**

Le profil artiste centralise les informations utilisées dans :

* les emails personnalisés,  
* les modèles de mails,  
* les fiches contact,  
* le contexte des gigs,  
* les futures pages publiques ou EPK éventuels.

## **Champs recommandés**

### **Informations générales**

* Nom d’artiste / groupe  
* Type : artiste solo, groupe, DJ, producteur, collectif  
* Genre musical principal  
* Genres secondaires  
* Ville / région de base  
* Pays  
* Langue principale  
* Courte description / pitch une phrase  
* Bio courte  
* Bio longue  
* Photo / logo

### **Liens musique**

* Spotify  
* Apple Music  
* Deezer  
* SoundCloud  
* Bandcamp  
* YouTube  
* Site web  
* Linktree ou équivalent

### **Réseaux sociaux**

* Instagram  
* TikTok  
* Facebook  
* X / Twitter  
* Threads  
* LinkedIn si pertinent

### **Booking / presse**

* Email booking  
* Téléphone booking  
* Nom du représentant  
* Email du représentant  
* Dossier de presse / EPK  
* Fiche technique  
* Rider  
* Photos presse  
* Vidéos live  
* Clips  
* Communiqué / présentation

### **Données live**

* Nombre de concerts passés  
* Prochaines dates importantes  
* Lieux déjà joués  
* Festivals déjà joués  
* Références notables  
* Capacité de jauge habituelle  
* Format live :  
  * solo,  
  * duo,  
  * full band,  
  * DJ set,  
  * acoustic,  
  * autre.  
* Durée du set  
* Disponibilités générales  
* Territoires ciblés

### **Données commerciales**

* Cachet minimum  
* Fourchette de cachet habituelle  
* Conditions particulières  
* TVA / statut juridique si utile plus tard

---

# **8\. Variables dynamiques**

## **Objectif**

Permettre d’insérer automatiquement les données du profil artiste, du contact, de l’organisation et du gig dans les modèles d’emails.

## **Variables contact**

Exemples :

{{contact.first\_name}}  
{{contact.last\_name}}  
{{contact.full\_name}}  
{{contact.email}}  
{{contact.role}}

## **Variables organisation**

{{organization.name}}  
{{organization.type}}  
{{organization.city}}  
{{organization.country}}  
{{organization.website}}

## **Variables artiste**

{{artist.name}}  
{{artist.genre}}  
{{artist.city}}  
{{artist.short\_bio}}  
{{artist.long\_bio}}  
{{artist.spotify\_url}}  
{{artist.youtube\_url}}  
{{artist.instagram\_url}}  
{{artist.epk\_url}}  
{{artist.press\_kit\_url}}  
{{artist.live\_video\_url}}  
{{artist.booking\_email}}  
{{artist.next\_dates}}  
{{artist.past\_venues}}  
{{artist.notable\_references}}

## **Variables gig**

{{gig.name}}  
{{gig.city}}  
{{gig.venue}}  
{{gig.target\_date}}  
{{gig.confirmed\_date}}  
{{gig.status}}  
{{gig.fee\_range}}  
{{gig.next\_action}}

## **Variables utilisateur / signature**

{{user.first\_name}}  
{{user.last\_name}}  
{{user.email}}  
{{user.phone}}  
{{user.signature}}

---

# **9\. Modèles de mails**

## **Objectif**

Permettre aux utilisateurs de créer, sauvegarder et réutiliser des modèles d’emails personnalisés pour le booking.

## **Cas d’usage principaux**

* premier contact avec une salle,  
* candidature à un festival,  
* relance après absence de réponse,  
* relance après échange positif,  
* confirmation d’option,  
* envoi d’EPK,  
* proposition de dates disponibles,  
* recontact après plusieurs mois,  
* annonce de tournée dans une région.

## **Champs d’un modèle**

* Nom du modèle  
* Type :  
  * premier contact,  
  * relance,  
  * festival,  
  * salle,  
  * confirmation,  
  * autre.  
* Sujet  
* Corps du message  
* Langue  
* Artiste/projet associé ou global  
* Variables utilisées  
* Signature  
* Pièces jointes ou liens par défaut  
* Statut :  
  * brouillon,  
  * actif,  
  * archivé.

## **Fonctionnalités MVP**

* Créer un modèle.  
* Modifier un modèle.  
* Dupliquer un modèle.  
* Archiver un modèle.  
* Insérer des variables dynamiques.  
* Prévisualiser le rendu avec un contact réel.  
* Détecter les variables manquantes.  
* Envoyer un email de test à soi-même.  
* Utiliser un modèle depuis une fiche gig ou contact.

---

# **10\. Fonctionnalité mailing personnalisé**

## **Objectif**

Permettre d’envoyer des emails personnalisés à un ou plusieurs contacts avec remplacement automatique des variables.

Le mailing doit être pensé comme du **booking personnalisé**, pas comme une newsletter marketing massive.

---

## **Cas d’usage**

### **Envoi individuel depuis un gig**

Depuis une fiche gig, l’utilisateur choisit un modèle :

* premier contact,  
* relance,  
* confirmation,  
* envoi EPK.

Le système préremplit :

* destinataire,  
* sujet,  
* corps,  
* variables,  
* liens artiste,  
* signature.

L’utilisateur peut modifier avant envoi.

---

### **Envoi individuel depuis un contact**

Depuis une fiche contact, l’utilisateur peut :

* envoyer un email personnalisé,  
* créer automatiquement un gig lié,  
* planifier une relance.

---

### **Envoi groupé ciblé**

L’utilisateur sélectionne plusieurs contacts selon des filtres :

* ville,  
* pays,  
* type d’organisation,  
* tag,  
* statut relationnel,  
* dernière date de contact,  
* artiste/projet.

Puis il choisit un modèle et prévisualise l’envoi.

### **Règles importantes**

Même en envoi groupé, il faut conserver une logique de personnalisation :

* variables obligatoires,  
* aperçu avant envoi,  
* limitation du volume,  
* création automatique d’activités,  
* création automatique de tâches de relance.

---

## **Anti-spam / limites produit**

Le produit ne doit pas devenir une machine à spam.

Prévoir :

* limite d’envoi par jour selon plan,  
* obligation d’avoir un contact identifié,  
* désactivation des imports abusifs,  
* possibilité de marquer un contact comme “ne plus contacter”,  
* suivi des bounces,  
* pas d’envoi massif froid illimité,  
* throttling des envois,  
* logs d’envoi,  
* conformité RGPD.

---

# **11\. Email : approche technique recommandée**

## **Phase MVP : pas de Gmail sync complète**

Éviter dans le MVP :

* lecture complète de boîte Gmail,  
* scan automatique de tous les emails,  
* tracking d’ouverture,  
* modification/suppression de messages Gmail,  
* synchronisation bidirectionnelle profonde.

---

## **Approche recommandée**

### **1\. Envoi via provider transactionnel**

Utiliser un provider email type :

* Postmark,  
* Mailgun,  
* SendGrid,  
* Resend,  
* Amazon SES.

Fonctions nécessaires :

* envoi d’emails,  
* templates ou raw HTML/text,  
* tracking statut d’envoi,  
* gestion bounces,  
* inbound parse pour replies si possible,  
* webhooks.

Important : permettre idéalement l’envoi avec domaine vérifié ou adresse configurée.

---

### **2\. BCC/Forwarding intelligent**

Pour centraliser les échanges sans Gmail complet :

* chaque workspace ou gig dispose d’une adresse inbound unique,  
* l’utilisateur peut mettre cette adresse en BCC,  
* ou transférer un email reçu vers cette adresse,  
* le système parse l’email,  
* associe l’échange au contact/gig,  
* ajoute une activité dans l’historique,  
* peut suggérer une tâche de relance.

Exemples :

workspace123@inbound.app.com  
gig\_abc123@inbound.app.com

---

### **3\. Reply tracking**

Option intéressante :

Quand le SaaS envoie un email, configurer le `Reply-To` vers une adresse inbound unique.

Exemple :

reply+gig\_abc123@app.com

Quand le destinataire répond :

* l’email arrive dans le système,  
* est associé automatiquement au gig,  
* l’utilisateur peut être notifié,  
* le statut du gig peut passer à “Réponse reçue”,  
* une prochaine action peut être demandée.

Attention : selon le setup, il faut permettre à l’utilisateur de recevoir aussi la réponse dans sa vraie boîte mail ou lui transférer.

---

### **4\. Gmail OAuth en option plus tard**

Version future :

* connecter Gmail,  
* envoyer via Gmail,  
* synchroniser uniquement les threads explicitement sélectionnés,  
* éviter les scopes larges,  
* éviter le scan complet.

---

# **12\. Google Calendar**

## **Objectif**

Synchroniser les options et dates confirmées dans le calendrier de l’utilisateur.

## **MVP**

Fonctions :

* connexion Google Calendar,  
* créer événement quand gig passe à “Option posée” ou “Confirmé”,  
* mettre à jour événement si date ou lieu change,  
* proposer suppression ou annulation si gig perdu,  
* stocker l’ID de l’événement Google.

## **Titres recommandés**

\[OPTION\] {{artist.name}} — {{organization.name}} — {{organization.city}}

\[CONFIRMÉ\] {{artist.name}} — {{organization.name}} — {{organization.city}}

---

# **13\. Objets métier principaux**

## **User**

Utilisateur humain.

Champs :

* email,  
* prénom,  
* nom,  
* téléphone,  
* signature email,  
* rôle,  
* timezone,  
* langue.

## **Workspace**

Espace de travail.

Peut représenter :

* artiste solo,  
* groupe,  
* manager,  
* booker,  
* label,  
* collectif.

Champs :

* nom,  
* type,  
* plan,  
* owner,  
* settings.

## **ArtistProfile / Project**

Profil artiste ou projet musical.

Lié à un workspace.

## **Contact**

Personne de contact.

## **Organization**

Salle, festival, promoteur, agence, association.

## **Gig**

Opportunité de concert / date.

## **Task**

Relance ou action à faire.

## **EmailTemplate**

Modèle de mail.

## **EmailCampaign / Mailing**

Envoi individuel ou groupé personnalisé.

## **EmailMessage**

Email envoyé ou reçu.

## **CalendarEvent**

Événement synchronisé.

## **ActivityLog**

Historique global.

## **Attachment / Asset**

Fichiers ou liens liés au profil artiste :

* EPK,  
* photos,  
* rider,  
* fiche technique,  
* vidéos,  
* liens streaming.

---

# **14\. Pipeline de booking**

## **Statuts recommandés**

À contacter  
Contacté  
Réponse reçue  
En discussion  
Option posée  
Confirmé  
Perdu / refusé  
À recontacter plus tard

## **Transitions et automatisations**

### **Passage à “Contacté”**

* créer tâche de relance à J+7.  
* ajouter activité “email envoyé”.

### **Passage à “Réponse reçue”**

* demander prochaine action.  
* créer tâche manuelle ou suggérée.

### **Passage à “Option posée”**

* demander date limite d’option.  
* créer tâche de confirmation.  
* proposer événement Google Calendar `[OPTION]`.

### **Passage à “Confirmé”**

* proposer événement Google Calendar `[CONFIRMÉ]`.  
* créer tâches pré-show optionnelles :  
  * envoyer fiche technique,  
  * confirmer horaires,  
  * vérifier transport,  
  * contrat/facture.

### **Passage à “Perdu / refusé”**

* proposer tâche “recontacter dans 6 mois”.

---

# **15\. Écrans principaux**

## **Dashboard “Aujourd’hui”**

Écran prioritaire.

Contenu :

* tâches du jour,  
* relances en retard,  
* réponses reçues à traiter,  
* prochaines options,  
* prochaines dates confirmées,  
* gigs sans prochaine action,  
* bouton “envoyer un email”,  
* bouton “ajouter contact”,  
* bouton “ajouter gig”.

## **Pipeline booking**

Vue Kanban :

* cartes gigs,  
* statut,  
* contact,  
* ville,  
* date visée,  
* prochaine relance,  
* priorité.

## **Contacts**

* liste,  
* filtres,  
* tags,  
* recherche,  
* import CSV,  
* fiche contact.

## **Fiche contact**

* informations,  
* organisation,  
* tags,  
* historique gigs,  
* historique emails,  
* tâches,  
* notes.

## **Fiche gig**

* infos opportunité,  
* contact,  
* statut,  
* historique emails,  
* tâches,  
* notes,  
* calendrier,  
* bouton envoyer email,  
* bouton créer tâche.

## **Mail Composer**

* choix template,  
* insertion variables,  
* preview,  
* validation variables manquantes,  
* envoi test,  
* envoi réel,  
* création automatique tâche de relance.

## **Templates email**

* liste templates,  
* création,  
* édition,  
* duplication,  
* archivage,  
* preview.

## **Profil artiste**

* informations générales,  
* liens,  
* bio,  
* réseaux,  
* documents,  
* références live,  
* variables disponibles.

## **Calendrier**

* vue dates confirmées,  
* options,  
* synchro Google Calendar.

---

# **16\. Automatisations MVP**

## **Relance automatique après envoi**

Après chaque email envoyé :

* créer une tâche de relance à J+7 par défaut,  
* date modifiable avant envoi.

## **Réponse reçue**

Quand une réponse est reçue via inbound :

* créer activité,  
* notifier utilisateur,  
* passer gig à “Réponse reçue” si pertinent,  
* demander prochaine action.

## **Gigs sans prochaine action**

Chaque jour :

* détecter les gigs actifs sans tâche future,  
* les afficher dans le dashboard.

## **Option à confirmer**

Quand statut “Option posée” :

* demander deadline,  
* créer tâche de confirmation.

---

# **17\. Architecture technique recommandée**

## **Recommandation générale**

Construire un backend maîtrisé plutôt que détourner un CRM open source headless.

Stack possible :

* Frontend : Next.js / React  
* Backend : API Next.js, NestJS ou Fastify  
* Database : PostgreSQL  
* ORM : Prisma ou Drizzle  
* Auth : Supabase Auth, Clerk, Auth.js ou custom selon contraintes  
* Storage fichiers : S3 compatible / Supabase Storage  
* Email : Postmark / Mailgun / Resend / SendGrid  
* Jobs : Trigger.dev, Inngest, BullMQ, Temporal léger ou cron workers  
* Billing : Stripe  
* Calendar : Google Calendar API  
* Monitoring : Sentry  
* Analytics produit : PostHog ou équivalent

## **Besoins techniques importants**

* multi-tenant dès le départ,  
* permissions simples mais propres,  
* modèle workspace/user/project,  
* logs d’activité,  
* jobs asynchrones pour envoi email,  
* webhooks email provider,  
* webhooks Stripe,  
* gestion des quotas d’envoi,  
* stockage propre des messages,  
* gestion RGPD,  
* audit trail minimal.

---

# **18\. Données et modèle simplifié**

## **Relations principales**

User  
→ WorkspaceMember  
→ Workspace  
→ ArtistProfile  
→ Contact  
→ Organization  
→ Gig  
→ Task  
→ EmailMessage  
→ EmailTemplate  
→ EmailCampaign  
→ CalendarEvent  
→ ActivityLog

## **Relations importantes**

* Un workspace a plusieurs utilisateurs.  
* Un workspace a plusieurs artist profiles.  
* Un contact peut appartenir à une organisation.  
* Un gig est lié à un artist profile.  
* Un gig est lié à un contact principal.  
* Un gig peut être lié à une organisation.  
* Un email message peut être lié à un contact, un gig, une campaign.  
* Une tâche peut être liée à un gig, un contact, un email ou un artist profile.  
* Un template peut être global workspace ou spécifique à un artist profile.

---

# **19\. Contraintes non fonctionnelles**

## **UX**

* extrêmement simple,  
* rapide à utiliser,  
* mobile-friendly,  
* peu de champs obligatoires,  
* dark mode possible mais pas prioritaire,  
* vocabulaire métier musical,  
* éviter jargon CRM.

## **Performance**

* dashboard rapide,  
* recherche contacts rapide,  
* envoi email asynchrone,  
* pas de blocage UI lors des jobs.

## **Sécurité**

* isolation stricte par workspace,  
* OAuth sécurisé pour Google,  
* chiffrement des tokens,  
* gestion des permissions,  
* logs d’accès sensibles.

## **RGPD**

Prévoir :

* consentement et base légale pour contacts,  
* suppression contact,  
* export données,  
* suppression workspace,  
* désinscription / “ne plus contacter” si mailing,  
* logs des emails,  
* politique de conservation.

---

# **20\. Pricing hypothétique à tester**

## **Plan Solo**

15–19 €/mois

Pour artistes / groupes.

Inclut :

* 1 projet artiste,  
* nombre limité de contacts,  
* pipeline,  
* tâches,  
* templates,  
* envoi email limité,  
* Google Calendar.

## **Plan Pro**

29–49 €/mois

Pour artistes actifs / managers légers.

Inclut :

* plusieurs artistes,  
* contacts plus nombreux,  
* templates illimités,  
* envois email plus élevés,  
* automatisations,  
* reporting simple.

## **Plan Manager / Booker**

79–149 €/mois

Pour managers/bookers.

Inclut :

* multi-artistes,  
* collaboration,  
* volumes d’envoi plus élevés,  
* reporting,  
* support prioritaire.

## **Freemium**

Éviter un freemium trop généreux.

Préférer :

* essai gratuit 14 jours,  
* ou plan gratuit très limité :  
  * 25 contacts,  
  * 10 gigs actifs,  
  * 1 projet,  
  * peu d’envois email,  
  * pas d’automatisations avancées.

---

# **21\. Roadmap recommandée**

## **Phase 0 — Validation**

* interviews réseau,  
* prototype Figma,  
* test du wording,  
* simulation avec vrais contacts,  
* validation des emails types,  
* validation de la disposition à payer.

## **Phase 1 — Core booking**

* auth,  
* workspace,  
* artist profile,  
* contacts,  
* organizations,  
* gigs,  
* tâches,  
* dashboard aujourd’hui,  
* pipeline.

## **Phase 2 — Email templates & sending**

* templates,  
* variables dynamiques,  
* mail composer,  
* envoi individuel,  
* envoi test,  
* création tâche de relance après envoi.

## **Phase 3 — Email tracking léger**

* inbound BCC/forwarding,  
* reply-to unique,  
* association email → gig/contact,  
* historique d’échanges,  
* notifications réponses.

## **Phase 4 — Mailing ciblé**

* sélection contacts,  
* envoi groupé limité,  
* preview personnalisée,  
* quotas,  
* bounces,  
* désinscription / do-not-contact,  
* activité automatique.

## **Phase 5 — Google Calendar**

* connexion Google,  
* création événement option/confirmé,  
* update événement,  
* lien gig ↔ calendar event.

## **Phase 6 — Billing & bêta payante**

* Stripe,  
* plans,  
* quotas,  
* essai gratuit,  
* onboarding manuel.

---

# **22\. Risques principaux**

## **Risque 1 — Le produit devient un outil de spam**

Mitigation :

* limiter les volumes,  
* privilégier l’envoi personnalisé,  
* imposer preview,  
* gérer do-not-contact,  
* surveiller bounce rate,  
* bloquer comportements abusifs.

## **Risque 2 — Trop de complexité email**

Mitigation :

* commencer par provider email \+ inbound,  
* pas de Gmail sync complète,  
* pas d’ouverture tracking au MVP,  
* logs et webhooks dès le départ.

## **Risque 3 — Trop de données à remplir**

Mitigation :

* profil artiste progressif,  
* champs optionnels,  
* onboarding en plusieurs étapes,  
* variables utiles mises en avant,  
* possibilité de démarrer avec peu d’infos.

## **Risque 4 — Faible disposition à payer**

Mitigation :

* cibler managers/bookers,  
* prouver gain de temps \+ dates obtenues,  
* éviter freemium large,  
* tester prix tôt.

## **Risque 5 — UX trop CRM**

Mitigation :

* dashboard action-first,  
* pipeline booking,  
* vocabulaire musical,  
* peu de champs visibles,  
* actions rapides.

---

# **23\. Définition du MVP strict**

Le MVP doit inclure :

1. Auth \+ workspace.  
2. Profil artiste/projet.  
3. Contacts \+ organisations.  
4. Gigs/opportunités.  
5. Pipeline booking.  
6. Tâches/relances.  
7. Dashboard “Aujourd’hui”.  
8. Modèles de mails.  
9. Variables dynamiques.  
10. Envoi individuel d’email depuis un contact ou un gig.  
11. Création automatique de tâche de relance après envoi.  
12. Historique email simple.  
13. BCC/forwarding ou reply-to inbound pour centralisation.  
14. Google Calendar basique pour options/dates confirmées.

Le MVP ne doit pas inclure :

* CRM promo complet,  
* release planning,  
* facturation,  
* comptabilité,  
* scan Gmail complet,  
* IA avancée,  
* newsletter marketing massive,  
* tracking d’ouverture,  
* scraping de contacts,  
* marketplace de salles.

---

# **24\. Phrase de brief final pour IA architecte**

Je veux construire un SaaS appelé provisoirement Booking OS, destiné aux artistes indépendants, managers et bookers DIY. Le produit aide à gérer le booking musical : profils artistes, contacts, organisations, opportunités de gigs, pipeline, tâches de relance, modèles d’emails personnalisés avec variables dynamiques, envoi d’emails ciblés, centralisation légère des échanges via inbound/reply-to/BCC, et synchronisation Google Calendar pour les options et dates confirmées. Le produit doit être simple, multi-tenant, orienté action quotidienne, et éviter la complexité d’un CRM généraliste. L’objectif MVP est de permettre à un utilisateur de savoir qui contacter ou relancer aujourd’hui pour obtenir plus de dates. L’architecture doit privilégier un backend maîtrisé avec PostgreSQL, jobs asynchrones, provider email transactionnel, stockage fichiers, intégration Google Calendar et billing Stripe à terme.

