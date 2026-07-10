# DESIGN_SYSTEM.md — Booking OS

> DA « **Crème** » — clair, minimaliste chaleureux (reprise du projet sœur *Release OS*).
> Fond crème, accent vert, typo Inter, cartes à ombre douce, statuts en tons doux.
> **Stack : shadcn/ui** (base-ui + Tailwind v4), plus de Mantine.
> Tokens câblés dans `app/globals.css` (variables CSS shadcn). Composants dans `components/ui/`.

## Philosophie

- **Clair, chaleureux, calme.** Un outil de travail quotidien, respirant, pas clinique.
- **L'ombre douce fait l'élévation** : cartes blanches sur fond crème avec une ombre légère (pas de grosses ombres, pas de bordures noires).
- **Une seule couleur d'accent** (vert `#1e8a5f`) pour l'action, l'état actif, le focus. Le reste est neutre chaud.
- **Une seule famille sémantique colorée** : les statuts (opportunités, tâches, enrôlements). Rôles/types = neutres.

## Couleurs (tokens `app/globals.css`)

Light (défaut) :

| Rôle | Token | Hex |
|------|-------|-----|
| Fond (canvas) | `--background` | `#f6f3ec` |
| Texte | `--foreground` | `#22201c` |
| Surface (cards, popover) | `--card` / `--popover` | `#ffffff` |
| **Accent (primary)** | `--primary` | **`#1e8a5f`** |
| Texte sur accent | `--primary-foreground` | `#ffffff` |
| Secondaire | `--secondary` | `#fbfaf6` |
| Muted (fonds discrets) | `--muted` | `#f0ece2` |
| Texte secondaire | `--muted-foreground` | `#8a857a` |
| Accent hover / chips | `--accent` | `#efebe0` |
| Destructif | `--destructive` | `#c15a54` |
| Bordure | `--border` | `#ebe6db` |
| Focus ring | `--ring` | `#1e8a5f` |

Une **variante dark chaude** (`.dark`) est définie dans `globals.css` (fond `#17150f`, primary `#34b57e`). Non activée par défaut ; le thème light crème est le défaut.

**Chips de statut** (`components/ui/status-badge.tsx`) : fond teinté léger + texte de la couleur (`color-mix`). Pilotés par les clés couleur sémantiques existantes (`STATUS_META`, `dueMeta`, `ENROLLMENT_STATUS_META`, `ORG_TYPE_META`) : `gray` · `blue`(ardoise) · `yellow`(ambre) · `violet`(indigo) · `green` · `red`. Rôles de contact / types d'orga = neutres → `Badge variant="secondary"`.

## Typographie — Inter

- **Inter** partout (titres + corps), via `next/font/google` (`--font-sans`).
- **Geist Mono** pour les nombres (compteurs dashboard, cachets) : classe `font-mono tabular-nums`.
- Titres en `font-semibold` (600), `tracking-tight` / `-0.02em`. Corps 14px (`text-sm`) par défaut.

## Formes & élévation

- **Radius** : `--radius: 0.75rem` (12px). Échelle dérivée (`--radius-sm/md/lg/xl`). Cards 16px (`rounded-xl`), inputs/boutons `rounded-lg`, chips pleins (`rounded-full`).
- **Boutons** (`components/ui/button.tsx`) : `default` (vert plein), `outline`, `secondary`, `ghost`, `destructive` (fond destructif teinté), `link`. Poids 500.
- **Cards** (`components/ui/card.tsx`) : fond blanc, `ring-1 ring-foreground/10`, **ombre douce** intégrée. Pas de grosse ombre.
- **Ombres douces** : `0 1px 2px …/.04, 0 8px 24px …/.05`.

## Composants `components/ui/` (shadcn / base-ui)

button · card · input · label · textarea · select · dialog · badge · sonner (toasts) · skeleton · **status-badge** · table · tabs · dropdown-menu · field · checkbox · switch · popover · calendar · **date-picker** · segmented.

Conventions transverses :
- **Formulaires** : état React contrôlé + helper `Field` (Label + hint/erreur) + `Dialog`. Erreur serveur = encart `bg-destructive/10`. Toasts via **sonner** (`toast.success/error`).
- **Listes** : `Table` + `DropdownMenu` (menu ⋯) + `Input`/`Select` filtres + `Dialog` de confirmation.
- **Dates** : `DatePicker` (calendrier crème, react-day-picker) ; I/O en ISO `yyyy-mm-dd` (colonnes DB inchangées).
- **Cartes cliquables** : `<Link className="interactive-card block rounded-xl"><Card>…`.

## Shell

Header horizontal (`components/layout/app-header.tsx`) : marque + nav en ligne (Aujourd'hui / Dates / Contacts / Prospection + badge non-lus / Tâches / Réglages) + nom workspace + aide (`?` → Dialog) + déconnexion. Contenu centré `max-w-6xl`.

## Do / Don't

**Do** : crème + 1 accent vert · ombres douces pour l'élévation · statuts = seule couleur sémantique · nombres en mono · Inter partout · beaucoup d'air.
**Don't** : pas de bordures noires épaisses · pas de dark par défaut · pas de violet/pastels décoratifs en action · pas de serif · l'accent vert jamais en simple déco.

## Stack & maintenance

- Design system = **variables shadcn** (`app/globals.css`) + composants `components/ui/`. Config : `components.json`.
- Icônes : **`@tabler/icons-react` non utilisé** ; on est sur **`lucide-react`** (aligné shadcn/Release OS). Jamais d'emoji comme icône.
- Ancienne DA « Studio » (dark/violet/Geist, Mantine) : **retirée** (migration Mantine→shadcn terminée). Historique en mémoire `redesign-shadcn-migration`.
