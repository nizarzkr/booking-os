import { createTheme, type MantineColorsTuple } from "@mantine/core";

// DA « Studio » — dark-first minimal (esprit Linear/Raycast), accent violet,
// typo Geist. La bordure fait la surface ; ombres réservées aux overlays.
// Voir DESIGN_SYSTEM.md.

// Neutres : texte (0) → canvas (7). Pilote surfaces/bordures/texte en dark.
const dark: MantineColorsTuple = [
  "#F4F5F6", // 0 — texte principal (near-white)
  "#C4C8CC", // 1
  "#9BA1A6", // 2 — texte secondaire
  "#6B7178", // 3 — texte discret / placeholder
  "#33363D", // 4 — bordure forte (hover/focus neutre)
  "#26282D", // 5 — bordure
  "#141518", // 6 — surface (cards, modals, sidebar)
  "#0B0C0E", // 7 — canvas (body)
  "#08090A", // 8
  "#050506", // 9
];

// Accent unique — violet électrique. Texte blanc dessus (autoContrast).
const violet: MantineColorsTuple = [
  "#efeaff",
  "#dcd3ff",
  "#b7a5ff",
  "#9179ff",
  "#7c6aff", // 4 — primaire (dark)
  "#6f5bf5",
  "#6250e6",
  "#5340c9",
  "#4433a8",
  "#362888",
];

export const theme = createTheme({
  primaryColor: "violet",
  primaryShade: { light: 6, dark: 4 },
  autoContrast: true,
  luminanceThreshold: 0.4,
  white: "#ffffff",
  black: "#0B0C0E",

  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  fontFamilyMonospace: "var(--font-geist-mono), ui-monospace, monospace",
  headings: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    fontWeight: "600",
  },

  defaultRadius: "md",
  radius: {
    xs: "4px",
    sm: "6px", // badges/tags
    md: "8px", // boutons, inputs
    lg: "12px", // cards, modals
    xl: "16px",
  },

  colors: { dark, violet },

  components: {
    // Un seul langage d'élévation : bordure 1px, pas de sticker ni pill.
    Card: { defaultProps: { radius: "lg", withBorder: true } },
    Paper: { defaultProps: { radius: "lg" } },
    Modal: { defaultProps: { radius: "lg" } },
    Button: {
      defaultProps: { radius: "md" },
      styles: { root: { fontWeight: 500 } },
    },
    TextInput: { defaultProps: { radius: "md" } },
    PasswordInput: { defaultProps: { radius: "md" } },
    Textarea: { defaultProps: { radius: "md" } },
    Select: { defaultProps: { radius: "md" } },
    NumberInput: { defaultProps: { radius: "md" } },
    Badge: { defaultProps: { radius: "sm" } },
  },
});
