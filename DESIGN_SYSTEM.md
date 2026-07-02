# DESIGN_SYSTEM.md — Booking OS

> DA « **Studio** » — dark-first minimal (esprit Linear / Raycast / Vercel),
> accent violet, typo Geist. Câblée dans `lib/theme.ts` + `app/globals.css`.
> Piloté par **Mantine v8** (pas de shadcn). Tailwind v4 est présent mais inerte.

## Philosophie

- **Sombre, contrasté, pro.** Un outil de travail quotidien, pas un site vitrine.
- **La bordure fait la surface** : l'élévation vient du contraste canvas/surface + une bordure 1px, pas des ombres. Ombres réservées aux overlays (menus, modals).
- **Une seule couleur d'accent** (violet) pour l'action, l'état actif, le focus. Le reste est neutre.
- **Une seule famille sémantique colorée** : les statuts d'opportunité. Tout le reste (rôles, types d'orga) est neutre.

## Couleurs

Neutres (tuple Mantine `dark`, index 0 = texte → 7 = canvas) :

| Rôle | Hex | Token |
|------|-----|-------|
| Canvas (fond) | `#0B0C0E` | `dark.7` / `--mantine-color-body` |
| Surface (cards, sidebar, modals) | `#141518` | `dark.6` |
| Surface hover / input | `#1B1D21` | — |
| Bordure | `#26282D` | `dark.5` |
| Bordure forte (hover/focus) | `#33363D` | `dark.4` |
| Texte principal | `#F4F5F6` | `dark.0` |
| Texte secondaire | `#9BA1A6` | `dark.2` (`c="dimmed"`) |
| Texte discret | `#6B7178` | `dark.3` |

**Accent (Primary) — violet** : main `#7C6AFF` (`violet.4` en dark), texte blanc dessus (`autoContrast`). Usage **strict** : bouton primaire, item de nav actif, focus, élément « courant ». Jamais en décoration.

**Sémantique** (statuts / feedback uniquement) : Mantine `green` (positif), `yellow` (attention), `red` (danger/retard/annulé), `blue` (info), `gray` (neutre).

**Mapping statuts d'opportunité** (`STATUS_META`) : Prospect `gray` · Contacté `blue` · Négociation `yellow` · Option `violet` · Confirmé `green` · Annulé `red`.
**Rôles de contact / types d'orga** : `gray` (neutre, info secondaire).

## Typographie — Geist

- **Geist Sans** partout (titres + corps), via `geist/font/sans` (`--font-geist-sans`).
- **Geist Mono** pour les **nombres** (compteurs du dashboard, cachets) : `ff="monospace"`.
- Échelle : H1 28 / H2 20 / H3 16 / corps 14 / small 13 / xs 12. Poids **400 / 500 / 600** (600 pour titres et emphases, fini les 700 systématiques).

## Formes & élévation

- **Radius** : inputs/boutons `md` = 8px · cards/modals `lg` = 12px · badges/tags `sm` = 6px. **Pas de pilule (9999)**.
- **Boutons** : `filled` violet (primaire) · `default` = surface + bordure 1px · `subtle` = texte. Poids 500. Focus ring violet. **Aucun style « sticker »** (supprimé).
- **Cards / Paper / Modal** : bordure 1px `dark.5`, fond `dark.6`, pas d'ombre.
- **Badges** : `variant="light"` (fond teinté + texte de la couleur), radius `sm`. Neutres par défaut, colorés seulement pour les statuts.
- **Liens** (`Anchor`) : couleur par défaut Mantine (violet) ou near-white dans les tables, soulignement au hover. Plus de soulignement mint permanent.

## Espacement (base 4, strict)

`xs 4 · sm 8 · md 16 · lg 24 · xl 32`. Padding de card = `lg` (24) · gap de page = `lg` · gap toolbar = `sm/md` · gap intra-card = `xs/sm`.

## Do / Don't

**Do** : dark + 1 accent violet · bordures pour l'élévation · statuts = seule couleur sémantique · nombres en Geist Mono · échelles strictes.
**Don't** : pas d'ombres (hors overlays) · pas de pilules · pas de pastels décoratifs (mint/sky/peach retirés) · violet jamais en déco · pas de serif.

## Stack & maintenance

- Design system = **thème Mantine** (`lib/theme.ts`) + `app/globals.css` (minimal). Pas de tokens shadcn/HSL.
- Rester sur Mantine (migrer vers shadcn = réécrire toute l'app, sans bénéfice).
- Tailwind v4 : importé mais non utilisé pour le style produit ; à retirer si on veut alléger (non bloquant).
