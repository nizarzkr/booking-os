import Link from "next/link";

import { Button } from "@/components/ui/button";

/** 404 racine (URLs non reconnues hors shell applicatif). */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 p-4 text-center">
      <h2 className="text-xl font-semibold">Page introuvable</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {"Cette page n'existe pas."}
      </p>
      <Button render={<Link href="/dashboard" />} className="mt-2">
        {"Retour à l'accueil"}
      </Button>
    </div>
  );
}
