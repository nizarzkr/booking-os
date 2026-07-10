"use client";

import { useActionState } from "react";
import Link from "next/link";

import type { AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";

type AuthAction = (
  prevState: AuthState,
  formData: FormData,
) => Promise<AuthState>;

type AuthFormProps = {
  action: AuthAction;
  title: string;
  submitLabel: string;
  altText: string;
  altHref: string;
  altLinkLabel: string;
  passwordAutoComplete: "current-password" | "new-password";
};

export function AuthForm({
  action,
  title,
  submitLabel,
  altText,
  altHref,
  altLinkLabel,
  passwordAutoComplete,
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-6">
        <form action={formAction} className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold">{title}</h1>

          {state && "error" in state && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          {state && "notice" in state && (
            <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
              {state.notice}
            </div>
          )}

          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="toi@exemple.com"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Mot de passe" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete={passwordAutoComplete}
              required
            />
          </Field>

          <Button type="submit" disabled={isPending} className="mt-1 w-full">
            {isPending ? "…" : submitLabel}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {altText}{" "}
            <Link href={altHref} className="text-primary hover:underline">
              {altLinkLabel}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
