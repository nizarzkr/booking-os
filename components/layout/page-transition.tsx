"use client";

import { usePathname } from "next/navigation";

/**
 * Enveloppe le contenu principal d'un fondu doux rejoué à chaque navigation :
 * `key = pathname` remonte le nœud, ce qui relance l'animation CSS `.page-enter`
 * (voir app/globals.css). Respecte `prefers-reduced-motion`.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
