import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Chip de statut en « ton doux » : fond teinté léger + texte de la couleur.
 * Piloté par les clés de couleur sémantiques déjà utilisées dans l'app
 * (STATUS_META, dueMeta…) pour ne pas dupliquer la logique métier.
 */
const TONE: Record<string, string> = {
  gray: "#8a857a",
  blue: "#3e6dae", // ardoise
  yellow: "#c08a2e", // ambre
  violet: "#6d5ac0", // indigo doux (option / pré-réservé)
  green: "#1e8a5f", // vert accent
  red: "#c15a54", // destructif
};

export function StatusBadge({
  color,
  children,
  className,
}: {
  color: string;
  children: ReactNode;
  className?: string;
}) {
  const c = TONE[color] ?? TONE.gray;
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
      style={{
        backgroundColor: `color-mix(in oklch, ${c} 14%, transparent)`,
        color: c,
      }}
    >
      {children}
    </span>
  );
}
