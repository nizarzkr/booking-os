"use client";

import Link from "next/link";
import { Button, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";

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
    <Card withBorder padding="lg" radius="lg">
      <Stack gap="md">
        <Stack gap={2}>
          <Group justify="space-between" align="center">
            <Text fw={700}>Démarrage</Text>
            <Text c="dimmed" size="sm">
              {doneCount}/{STEPS.length}
            </Text>
          </Group>
          <Text c="dimmed" size="sm">
            Trois étapes pour tirer le meilleur de Booking OS.
          </Text>
        </Stack>

        <Stack gap="sm">
          {STEPS.map((step) => {
            const done = setup[step.key];
            return (
              <Group key={step.key} justify="space-between" wrap="nowrap" gap="md">
                <Group gap="sm" wrap="nowrap" align="flex-start">
                  <ThemeIcon
                    size="md"
                    radius="xl"
                    variant={done ? "filled" : "default"}
                    color={done ? "green" : "gray"}
                  >
                    <Text fz={12} fw={700}>
                      {done ? "✓" : ""}
                    </Text>
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text
                      size="sm"
                      fw={500}
                      td={done ? "line-through" : undefined}
                      c={done ? "dimmed" : undefined}
                    >
                      {step.label}
                    </Text>
                    {!done && (
                      <Text c="dimmed" size="xs">
                        {step.hint}
                      </Text>
                    )}
                  </Stack>
                </Group>
                {!done && (
                  <Button
                    component={Link}
                    href={step.href}
                    size="xs"
                    variant="light"
                    style={{ flexShrink: 0 }}
                  >
                    {step.cta}
                  </Button>
                )}
              </Group>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}
