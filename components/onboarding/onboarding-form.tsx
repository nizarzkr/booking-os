"use client";

import { useActionState } from "react";

import { completeOnboarding } from "@/app/(onboarding)/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(
    completeOnboarding,
    null,
  );

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">Bienvenue 👋</h1>
            <p className="text-sm text-muted-foreground">
              Crée ton espace de travail pour commencer. Tu pourras compléter
              ton profil artiste plus tard.
            </p>
          </div>

          {state?.error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <Field label="Nom d'artiste ou de projet" htmlFor="name">
            <Input
              id="name"
              name="name"
              placeholder="Ton nom de scène, ton groupe…"
              required
            />
          </Field>
          <Field label="Ville / région" htmlFor="city">
            <Input id="city" name="city" placeholder="Optionnel" />
          </Field>

          <Button type="submit" disabled={isPending} className="mt-1 w-full">
            {isPending ? "…" : "Créer mon espace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
