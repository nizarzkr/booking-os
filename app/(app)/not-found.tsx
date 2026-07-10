import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * 404 des routes applicatives — rendu dans le shell (header), déclenché par
 * les `notFound()` des fiches (contact / opportunité / organisation absente).
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <h2 className="text-xl font-semibold">Introuvable</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {"Cette page ou cette fiche n'existe pas (ou plus)."}
      </p>
      <Button render={<Link href="/dashboard" />} className="mt-2">
        Retour au dashboard
      </Button>
    </div>
  );
}
