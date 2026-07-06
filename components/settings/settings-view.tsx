"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import {
  updateWorkspace,
  deleteAccount,
  type WorkspaceInput,
} from "@/app/(app)/settings/actions";
import { disconnectGmail } from "@/app/(app)/settings/gmail-actions";

type GmailState = { configured: boolean; email: string | null };

type Props = {
  workspace: {
    name: string;
    city: string | null;
    email_signature: string | null;
    reply_to: string | null;
  };
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      email_signature: workspace.email_signature ?? "",
      reply_to: workspace.reply_to ?? "",
    },
    validate: {
      name: (v) => (v.trim() ? null : "Ce champ est requis."),
      reply_to: (v) =>
        !v.trim() || /^\S+@\S+\.\S+$/.test(v.trim())
          ? null
          : "Adresse email invalide.",
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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    const result = await deleteAccount(deleteConfirm);
    if ("error" in result) {
      setDeleteLoading(false);
      notifications.show({ color: "red", message: result.error });
      return;
    }
    // Compte supprimé : session invalidée → retour à l'accueil public.
    notifications.show({ color: "green", message: "Compte supprimé." });
    router.replace("/");
  };

  const isConnected = gmail.email !== null;
  const canDelete = deleteConfirm.trim() === workspace.name.trim();

  return (
    <Stack gap="xl" maw={640}>
      <Title order={1}>Réglages</Title>

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
            <TextInput
              label="Adresse de réponse (reply-to)"
              placeholder="Optionnel — où recevoir les réponses"
              description="Si renseigné, les réponses arriveront à cette adresse plutôt qu'à ta boîte Gmail d'envoi."
              key={form.key("reply_to")}
              {...form.getInputProps("reply_to")}
            />
            <Textarea
              label="Signature"
              placeholder={"Optionnel — ajoutée en bas de tes emails\nEx. : Nom, téléphone, liens…"}
              autosize
              minRows={3}
              key={form.key("email_signature")}
              {...form.getInputProps("email_signature")}
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

      {/* Zone de danger — suppression de compte */}
      <Paper p="lg" radius="lg" withBorder style={{ borderColor: "var(--mantine-color-red-8)" }}>
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text fw={600} c="red.4">
              Supprimer le compte
            </Text>
            <Text c="dimmed" size="sm">
              Efface définitivement ton espace et toutes tes données (contacts,
              opportunités, tâches, emails). Irréversible.
            </Text>
          </Stack>
          <Button color="red" variant="light" onClick={() => setDeleteOpen(true)}>
            Supprimer
          </Button>
        </Group>
      </Paper>

      <Modal
        opened={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteConfirm("");
        }}
        title="Supprimer définitivement le compte"
        centered
      >
        <Stack gap="md">
          <Alert color="red" variant="light" radius="md">
            Cette action est <strong>irréversible</strong>. Toutes tes données
            seront effacées et ne pourront pas être récupérées.
          </Alert>
          <TextInput
            label={`Tape le nom de ton espace pour confirmer : « ${workspace.name} »`}
            placeholder={workspace.name}
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.currentTarget.value)}
            data-autofocus
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              color="gray"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteConfirm("");
              }}
            >
              Annuler
            </Button>
            <Button
              color="red"
              disabled={!canDelete}
              loading={deleteLoading}
              onClick={handleDeleteAccount}
            >
              Supprimer définitivement
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
