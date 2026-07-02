"use client";

import { useActionState } from "react";
import {
  Alert,
  Button,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { completeOnboarding } from "@/app/(onboarding)/onboarding/actions";

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(
    completeOnboarding,
    null,
  );

  return (
    <Paper w="100%" maw={440} p="xl" radius="lg" withBorder>
      <form action={formAction}>
        <Stack gap="md">
          <Stack gap={4}>
            <Title order={2} fw={400}>
              Bienvenue 👋
            </Title>
            <Text c="dimmed" size="sm">
              Crée ton espace de travail pour commencer. Tu pourras compléter ton
              profil artiste plus tard.
            </Text>
          </Stack>

          {state?.error && (
            <Alert color="red" variant="light" radius="md">
              {state.error}
            </Alert>
          )}

          <TextInput
            name="name"
            label="Nom d'artiste ou de projet"
            placeholder="Ton nom de scène, ton groupe…"
            required
            data-autofocus
          />
          <TextInput
            name="city"
            label="Ville / région"
            placeholder="Optionnel"
          />

          <Button type="submit" loading={isPending} fullWidth mt="xs">
            Créer mon espace
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
