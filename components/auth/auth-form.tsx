"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Alert,
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import type { AuthState } from "@/app/(auth)/actions";

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
    <Paper w="100%" maw={400} p="xl" radius="lg" withBorder>
      <form action={formAction}>
        <Stack gap="md">
          <Title order={2} fw={600}>
            {title}
          </Title>

          {state && "error" in state && (
            <Alert color="red" variant="light" radius="md">
              {state.error}
            </Alert>
          )}

          {state && "notice" in state && (
            <Alert color="green" variant="light" radius="md">
              {state.notice}
            </Alert>
          )}

          <TextInput
            name="email"
            type="email"
            label="Email"
            placeholder="toi@exemple.com"
            autoComplete="email"
            required
          />
          <PasswordInput
            name="password"
            label="Mot de passe"
            placeholder="••••••••"
            autoComplete={passwordAutoComplete}
            required
          />

          <Button type="submit" loading={isPending} fullWidth mt="xs">
            {submitLabel}
          </Button>

          <Text size="sm" c="dimmed" ta="center">
            {altText}{" "}
            <Anchor component={Link} href={altHref} inherit>
              {altLinkLabel}
            </Anchor>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
