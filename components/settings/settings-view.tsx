"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import {
  updateWorkspace,
  type WorkspaceInput,
} from "@/app/(app)/settings/actions";

type Props = {
  workspace: { name: string; city: string | null };
  accountEmail: string;
};

export function SettingsView({ workspace, accountEmail }: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: workspace.name ?? "",
      city: workspace.city ?? "",
    },
    validate: {
      name: (v) => (v.trim() ? null : "Ce champ est requis."),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    setServerError(null);
    const input: WorkspaceInput = values;
    const result = await updateWorkspace(input);
    setLoading(false);

    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    notifications.show({ color: "green", message: "Espace mis à jour." });
  });

  return (
    <Stack gap="xl" maw={640}>
      <Title order={2} fw={400}>
        Réglages
      </Title>

      {/* Espace de travail */}
      <Paper p="lg" radius="lg" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Stack gap={2}>
              <Text fw={600}>Espace de travail</Text>
              <Text c="dimmed" size="sm">
                Le nom affiché dans la barre latérale et sur tes envois.
              </Text>
            </Stack>

            {serverError && (
              <Alert color="red" variant="light" radius="md">
                {serverError}
              </Alert>
            )}

            <TextInput
              label="Nom d'artiste ou de projet"
              placeholder="Ton nom de scène, ton groupe…"
              key={form.key("name")}
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Ville / région"
              placeholder="Optionnel"
              key={form.key("city")}
              {...form.getInputProps("city")}
            />

            <Group justify="flex-end">
              <Button type="submit" loading={loading}>
                Enregistrer
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      {/* Compte */}
      <Paper p="lg" radius="lg" withBorder>
        <Stack gap={2}>
          <Text fw={600}>Compte</Text>
          <Text c="dimmed" size="sm">
            Connecté en tant que{" "}
            <Text span c="bright">
              {accountEmail}
            </Text>
          </Text>
        </Stack>
      </Paper>

      {/* Intégrations — placeholder, câblé en 5.2 */}
      <Paper p="lg" radius="lg" withBorder>
        <Stack gap="md">
          <Stack gap={2}>
            <Text fw={600}>Intégrations</Text>
            <Text c="dimmed" size="sm">
              Connecte tes outils pour envoyer et suivre tes emails depuis
              Booking OS.
            </Text>
          </Stack>

          <Group justify="space-between">
            <Group gap="sm">
              <Text fw={500}>Gmail</Text>
              <Badge color="gray" variant="light">
                Non connecté
              </Badge>
            </Group>
            <Button variant="default" disabled>
              Bientôt
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
