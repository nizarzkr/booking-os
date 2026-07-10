import { Skeleton } from "@/components/ui/skeleton";

/**
 * UI de chargement affichée pendant la navigation serveur (App Router).
 * Squelette générique cohérent avec la mise en page des vues liste.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-56" />
      <div className="flex gap-4">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-52" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
