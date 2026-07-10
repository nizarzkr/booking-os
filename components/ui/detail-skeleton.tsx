import { Skeleton } from "@/components/ui/skeleton";

/**
 * Squelette de chargement pour les fiches détail (contact / opportunité /
 * organisation) : en-tête titre + actions, grille d'infos, sections.
 * Cohérent avec la mise en page réelle des fiches.
 */
export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <Skeleton className="h-8 w-60" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11" />
        ))}
      </div>

      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
    </div>
  );
}
