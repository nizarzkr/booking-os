"use client";

import { usePathname } from "next/navigation";
import { HelpCircle, Star } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getHelpForPath } from "@/components/help/help-content";

/**
 * Aide contextuelle de la page courante, ouverte depuis le bouton « ? » du
 * header. Contenu statique curé (help-content.ts) choisi selon la route.
 */
export function HelpDrawer() {
  const pathname = usePathname();
  const help = getHelpForPath(pathname);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Aide sur cette page"
          />
        }
      >
        <HelpCircle />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Aide
          </p>
          <DialogTitle className="text-lg">{help.title}</DialogTitle>
          <DialogDescription>{help.intro}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Comment faire</h4>
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
              {help.howTo.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Conseils pour aller plus loin</h4>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              {help.tips.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <Star className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
