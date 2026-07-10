"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SetupState = {
  mailConnected: boolean;
  hasContacts: boolean;
  hasSequence: boolean;
};

type Step = {
  key: keyof SetupState;
  label: string;
  hint: string;
  href: string;
  cta: string;
};

const STEPS: Step[] = [
  {
    key: "mailConnected",
    label: "Connecte ta boîte mail",
    hint: "Indispensable pour envoyer des emails et lancer des séquences.",
    href: "/settings",
    cta: "Connecter",
  },
  {
    key: "hasContacts",
    label: "Ajoute tes contacts",
    hint: "Crée-les à la main ou importe ta liste existante en CSV.",
    href: "/contacts",
    cta: "Ajouter",
  },
  {
    key: "hasSequence",
    label: "Crée ta première séquence",
    hint: "Pars d'un modèle prêt à l'emploi et personnalise-le.",
    href: "/sequences",
    cta: "Commencer",
  },
];

export function GettingStarted({ setup }: { setup: SetupState }) {
  const doneCount = STEPS.filter((s) => setup[s.key]).length;
  // Tout est fait → on n'encombre plus le Dashboard.
  if (doneCount === STEPS.length) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Démarrage</CardTitle>
          <span className="text-sm text-muted-foreground tabular-nums">
            {doneCount}/{STEPS.length}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Trois étapes pour tirer le meilleur de Booking OS.
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {STEPS.map((step) => {
          const done = setup[step.key];
          return (
            <div
              key={step.key}
              className="flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                    done
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border text-transparent",
                  )}
                >
                  <Check className="size-3" />
                </span>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      done && "text-muted-foreground line-through",
                    )}
                  >
                    {step.label}
                  </span>
                  {!done && (
                    <span className="text-xs text-muted-foreground">
                      {step.hint}
                    </span>
                  )}
                </div>
              </div>
              {!done && (
                <Button
                  render={<Link href={step.href} />}
                  size="sm"
                  variant="secondary"
                  className="shrink-0"
                >
                  {step.cta}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
