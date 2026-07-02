# Design — Booking OS (DA « Hatch »)

Direction artistique retenue pour Booking OS. Style : thème **clair**, canvas crème,
quatuor pastel (mint/rose/pêche/ciel), gros titres serif, esprit *zine dessiné main*,
bordures noires 1px, **aucune ombre**. Boutons pill, coins arrondis généreux.

## Organisation du dossier

```
DESIGN BOOKING OS/
├── README.md              ← ce fichier (index + règles d'usage)
├── reference/
│   └── DESIGN.md          ← référence de style complète (couleurs, typo, composants, do/don't)
└── tokens/
    ├── tokens.json        ← SOURCE DE VÉRITÉ — design tokens format W3C
    ├── theme.css          ← même jeu de tokens en @theme (Tailwind v4)
    └── variables.css      ← même jeu de tokens en :root (CSS custom properties)
```

Les trois fichiers de `tokens/` décrivent **le même jeu de tokens** dans des formats
différents. En cas de divergence, `tokens.json` fait foi.

## Comment ces tokens s'appliquent dans l'app (stack Mantine v8)

On n'utilise ni Tailwind `@theme` seul ni shadcn : les tokens sont câblés dans
**`lib/theme.ts`** (thème Mantine) + une couche de variables dans **`app/globals.css`**.

- **Couleurs** → palettes Mantine + CSS vars. Mint `#99ffcc` = couleur d'action primaire
  UNIQUEMENT (boutons + swash de titre) ; sky/pêche/rose = décoratif seulement.
- **Rayons** → `defaultRadius` + overrides (cards 16px, boutons 12px, pills 9999px, tags 100px).
- **Ombres** → désactivées. La profondeur vient du contraste crème/blanc + bordure noire 1px.

## Polices ⚠️

Recoleta et Lota Grotesque sont **commerciales** (pas sur Google Fonts).
Substituts gratuits retenus par défaut (indiqués dans `DESIGN.md`) :

| Rôle | Idéal (payant) | Substitut (Google Fonts) |
|------|----------------|--------------------------|
| Titres | Recoleta 700 | **DM Serif Display** |
| UI / corps | Lota Grotesque | **Inter** |

→ On part sur les substituts tant qu'aucune licence n'est fournie.

## Décisions ouvertes (à trancher avec l'utilisateur)

1. **Cette DA remplace-t-elle l'ancienne** (`DESIGN_SYSTEM.md` sombre + `lib/theme.ts` violet) ?
   Si oui : réécrire `DESIGN_SYSTEM.md`, refaire `lib/theme.ts` (light + pastel), et
   reprendre les pages d'auth déjà construites (actuellement en dark).
2. **Portée** : « Hatch » complet (landing marketing) vs version **adaptée product-UI**
   pour l'app dense (pipeline, tables, dashboard) — la doc elle-même se dit « registre
   zine, pas product-UI ».
3. **Polices** : substituts gratuits (DM Serif Display + Inter) ou licences Recoleta/Lota ?

> Note : « Hatch » et la mascotte sont issus d'une marque tierce (agence vidéo) prise
> comme *référence de style*. Le produit reste **Booking OS** — on adapte la DA, on ne
> copie ni le wordmark « HATCH » ni la mascotte à l'identique.
