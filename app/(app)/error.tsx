"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Frontière d'erreur des routes applicatives (App Router).
 * Remplace l'écran blanc / l'overlay dev par une UI de récupération.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log serveur/console ; Sentry prendra le relais quand branché.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {"Quelque chose s'est mal passé de notre côté. Réessaie, ou reviens au dashboard."}
      </p>
      <div className="mt-2 flex gap-2">
        <Button onClick={reset}>Réessayer</Button>
        <Button variant="outline" render={<Link href="/dashboard" />}>
          Retour au dashboard
        </Button>
      </div>
    </div>
  );
}
