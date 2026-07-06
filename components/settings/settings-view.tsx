"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { disconnectGmail } from "@/app/(app)/settings/gmail-actions";

type GmailState = { configured: boolean; email: string | null };

type Props = {
  workspace: { name: string; city: string | null };
  accountEmail: string;
  gmail: GmailState;
  gmailFlash: string | null;
};

/** Messages de retour du flow OAuth (query `?gmail=...`). */
const GMAIL_FLASH: Record<string, { color: string; message: string }> = {
  connected: { color: "green", message: "Gmail connecté." },
  denied: { color: "yellow", message: "Connexion Gmail annulée." },
  norefresh: {
    color: "red",
    message:
      "Google n'a pas renvoyé d'autorisation durable. Révoque l'accès dans ton compte Google puis réessaie.",
  },
  notconfigured: {
    color: "red",
    message: "Intégration Gmail non configurée côté serveur.",
  },
  error: { color: "red", message: "La connexion Gmail a échoué. Réessaie." },
};

export function SettingsView({
  workspace,
  accountEmail,
  gmail,
  gmailFlash,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [gmailLoading, setGmailLoading] = useState(false);

  // Notification de retour OAuth, une seule fois.
  const flashed = useRef(false);
  useEffect(() => {
    if (flashed.current || !gmailFlash) return;
    flashed.current = true;
    const flash = GMAIL_FLASH[gmailFlash];
    if (flash) notifications.show(flash);
    // Nettoie l'URL (retire ?gmail=…).
    window.history.replaceState(null, "", window.location.pathname);
  }, [gmailFlash]);

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

  const handleDisconnect = async () => {
    setGmailLoading(true);
    const result = await disconnectGmail();
    setGmailLoading(false);
    if ("error" in result) {
      notifications.show({ color: "red", message: result.error });
      return;
    }
    notifications.show({ color: "green", message: "Gmail déconnecté." });
  };

  const isConnected = gmail.email !== null;

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

      {/* Import de contacts */}
      <Paper p="lg" radius="lg" withBorder>
        <Group justify="space-between">
          <Stack gap={2}>
            <Text fw={600}>Importer des contacts</Text>
            <Text c="dimmed" size="sm">
              Ajoute ta liste existante depuis un fichier CSV.
            </Text>
          </Stack>
          <Button component={Link} href="/settings/import" variant="default">
            Importer un CSV
          </Button>
        </Group>
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

      {/* Intégrations — Gmail (étape 5.2) */}
      <Paper p="lg" radius="lg" withBorder>
        <Stack gap="md">
          <Stack gap={2}>
            <Text fw={600}>Intégrations</Text>
            <Text c="dimmed" size="sm">
              Connecte ton compte Google pour envoyer et suivre tes emails
              (Gmail) et synchroniser tes dates dans ton agenda (Calendar).
            </Text>
          </Stack>

          <Group justify="space-between">
            <Group gap="sm">
              <Text fw={500}>Google</Text>
              {isConnected ? (
                <Badge color="green" variant="light">
                  {gmail.email}
                </Badge>
              ) : (
                <Badge color="gray" variant="light">
                  Non connecté
                </Badge>
              )}
            </Group>

            {isConnected ? (
              <Group gap="xs">
                <Button component="a" href="/api/gmail/connect" variant="light">
                  Reconnecter
                </Button>
                <Button
                  variant="default"
                  color="gray"
                  loading={gmailLoading}
                  onClick={handleDisconnect}
                >
                  Déconnecter
                </Button>
              </Group>
            ) : gmail.configured ? (
              <Button component="a" href="/api/gmail/connect">
                Connecter Google
              </Button>
            ) : (
              <Button variant="default" disabled>
                Non configuré
              </Button>
            )}
          </Group>

          {isConnected && (
            <Text c="dimmed" size="xs">
              Gmail + Agenda utilisent cette connexion. Connecté avant l&apos;ajout
              de l&apos;agenda ? Clique <strong>Reconnecter</strong> pour
              autoriser Google&nbsp;Calendar.
            </Text>
          )}

          {!gmail.configured && !isConnected && (
            <Text c="dimmed" size="xs">
              Ajoute <code>GOOGLE_CLIENT_ID</code>,{" "}
              <code>GOOGLE_CLIENT_SECRET</code>, <code>GOOGLE_REDIRECT_URI</code>{" "}
              et <code>SUPABASE_SERVICE_ROLE_KEY</code> dans{" "}
              <code>.env.local</code> pour activer la connexion.
            </Text>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
