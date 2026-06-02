import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Palette sombre alignée sur DESIGN_SYSTEM.md (échelle Zinc de Tailwind).
// Mantine utilise dark[7] pour le fond du body et dark[6] pour les surfaces/cards.
const zinc: MantineColorsTuple = [
  "#fafafa", // 0 — texte principal (zinc-50)
  "#e4e4e7", // 1 — (zinc-200)
  "#a1a1aa", // 2 — texte secondaire (zinc-400)
  "#71717a", // 3 — (zinc-500)
  "#3f3f46", // 4 — bordures d'inputs (zinc-700)
  "#27272a", // 5 — bordures subtiles (zinc-800)
  "#18181b", // 6 — surfaces / cards (zinc-900)
  "#09090b", // 7 — fond principal (zinc-950)
  "#050506", // 8
  "#000000", // 9
];

export const theme = createTheme({
  primaryColor: "violet",
  fontFamily: "var(--font-jakarta), sans-serif",
  headings: {
    fontFamily: "var(--font-jakarta), sans-serif",
    fontWeight: "600",
  },
  defaultRadius: "md",
  colors: {
    dark: zinc,
  },
  components: {
    // DESIGN_SYSTEM.md : boutons en pill (rounded-full).
    Button: {
      defaultProps: { radius: "xl" },
    },
  },
});
