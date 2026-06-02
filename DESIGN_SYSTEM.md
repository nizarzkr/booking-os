# **DESIGN\_SYSTEM.md**

## **Philosophie et Ton visuel**

* **Ambiance** : Musiques actuelles, moderne, créatif et ludique.  
* **Mots-clés** : Vibrant, Amical, Épuré, "Punchy".  
* **Inspirations** : Claap, Mailchimp (pour le côté friendly et les formes douces), Spotify (pour le contraste sombre/fluo).  
* **Thème principal** : Dark mode natif (prévu pour être inversé en Light mode si besoin, mais pensé d'abord pour le sombre).

## **Couleurs (Basé sur Tailwind CSS)**

*Les couleurs ci-dessous sont pensées pour le Dark Mode.*

* **Background (Fond principal)** : Zinc-950 (`#09090b`) \- Un noir très profond mais texturé.  
* **Surface (Cards, Modals)** : Zinc-900 (`#18181b`) \- Légèrement plus clair pour détacher les éléments du fond.  
* **Primary / Accent** : Violet-500 (`#8b5cf6`) ou Indigo-500 (`#6366f1`). *Note: Apporte le côté pop, créatif et Claap/Mailchimp.*  
* **Accent secondaire (Tags, Success, actions rapides)** : Emerald-400 (`#34d399`) \- Un vert néon doux qui rappelle les codes de la musique/Spotify.  
* **Text primary** : Zinc-50 (`#fafafa`) \- Blanc cassé pour ne pas fatiguer les yeux.  
* **Text secondary** : Zinc-400 (`#a1a1aa`) \- Gris moyen pour les labels et les infos secondaires (ex: nom de la salle, date passée).  
* **Border** : Zinc-800 (`#27272a`) \- Ligne très subtile.

## **Typographie**

* **Font-family** : `Plus Jakarta Sans`   
* **Heading** : Font-weight 600 (Semibold) ou 700 (Bold), tracking-tight (lettres resserrées pour un look moderne).  
* **Body** : Font-weight 400 (Regular), leading-relaxed (interligne aéré pour le confort de lecture des contrats/notes).

## **Composants (UI)**

* **Boutons** : Toujours `rounded-full` (pill shape), aucune ombre (`shadow-none`). En mode hover, jouer sur la luminosité ou un léger scale (`hover:scale-105 transition-transform`).  
* **Cards** : `rounded-2xl` (des coins bien ronds pour le côté Mailchimp/Claap), `border border-zinc-800`, aucune ombre portée (`shadow-none`).  
* **Inputs & Champs de formulaire** : `rounded-xl` ou `rounded-full`, fond légèrement contrasté (`bg-zinc-900/50`), border au focus de la couleur Accent.  
* **Tags (Genres musicaux, Statuts de booking)** : `rounded-full`, petits, avec des couleurs de fond avec 10% ou 20% d'opacité (ex: `bg-violet-500/10 text-violet-400`).

## **Spacing & Layout**

* **Système de grille** : Flexbox / CSS Grid.  
* **Spacing** : Multiples de 4px (Standard Tailwind : p-2, p-4, p-6).  
* **Respiration** : Laisser beaucoup de `padding` dans les cards (ex: `p-6` ou `p-8`) pour garder l'aspect "très léger et agréable". Ne pas surcharger l'écran.

