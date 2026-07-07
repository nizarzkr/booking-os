"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Group,
  List,
  Modal,
  NumberInput,
  PasswordInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import {
  connectEmailAccount,
  type ConnectEmailInput,
} from "@/app/(app)/settings/email-actions";
import { PROVIDER_PRESETS, getPreset } from "@/lib/email/providers";

export function EmailConnectModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [providerId, setProviderId] = useState("gmail");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState<number>(465);
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState<number>(993);
  const [imapSecure, setImapSecure] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preset = useMemo(() => getPreset(providerId), [providerId]);
  const isOther = preset ? !preset.known : false;

  async function handleSubmit() {
    setError(null);
    setPending(true);
    const input: ConnectEmailInput = {
      providerId,
      email,
      username,
      password,
      ...(isOther
        ? {
            smtp_host: smtpHost,
            smtp_port: smtpPort,
            smtp_secure: smtpSecure,
            imap_host: imapHost,
            imap_port: imapPort,
            imap_secure: imapSecure,
          }
        : {}),
    };
    const res = await connectEmailAccount(input);
    setPending(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    notifications.show({ color: "green", message: "Adresse connectée." });
    onClose();
    router.refresh();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Connecter une adresse email"
      size="lg"
      centered
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Stack gap="md">
          <Select
            label="Fournisseur"
            data={PROVIDER_PRESETS.map((p) => ({
              value: p.id,
              label: p.label,
            }))}
            value={providerId}
            onChange={(v) => v && setProviderId(v)}
            allowDeselect={false}
          />

          {/* Tutoriel — instructions du fournisseur sélectionné */}
          {preset && (
            <Alert color="gray" variant="light" radius="md">
              <Stack gap={6}>
                <Text fw={600} size="sm">
                  Comment obtenir tes identifiants
                </Text>
                <List spacing={4} size="sm" type="ordered">
                  {preset.instructions.map((step, i) => (
                    <List.Item key={i}>{step}</List.Item>
                  ))}
                </List>
                <Group gap={6} wrap="nowrap" align="flex-start" mt={2}>
                  <ThemeIcon color="green" size={16} radius="xl">
                    <Text fz={9} fw={700}>
                      i
                    </Text>
                  </ThemeIcon>
                  <Text c="dimmed" size="xs">
                    Utilise un <strong>mot de passe d&apos;application</strong>,
                    jamais ton mot de passe habituel. Il est chiffré et n&apos;est
                    utilisé que pour envoyer et relever tes emails.
                  </Text>
                </Group>
              </Stack>
            </Alert>
          )}

          <TextInput
            label="Adresse email"
            placeholder="toi@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            data-autofocus
          />

          <PasswordInput
            label="Mot de passe d'application"
            placeholder="Le mot de passe généré ci-dessus"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />

          {isOther && (
            <>
              <TextInput
                label="Nom d'utilisateur"
                description="Souvent identique à ton adresse email — laisse vide si c'est le cas."
                placeholder="toi@exemple.com"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
              />

              <Group grow align="flex-start">
                <TextInput
                  label="Serveur SMTP (envoi)"
                  placeholder="smtp.exemple.com"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.currentTarget.value)}
                  required
                />
                <NumberInput
                  label="Port SMTP"
                  value={smtpPort}
                  onChange={(v) => setSmtpPort(Number(v) || 465)}
                  min={1}
                  max={65535}
                />
              </Group>
              <Switch
                label="SMTP en SSL (port 465). Décoche pour STARTTLS (port 587)."
                checked={smtpSecure}
                onChange={(e) => setSmtpSecure(e.currentTarget.checked)}
              />

              <Group grow align="flex-start">
                <TextInput
                  label="Serveur IMAP (réception)"
                  placeholder="imap.exemple.com"
                  value={imapHost}
                  onChange={(e) => setImapHost(e.currentTarget.value)}
                  required
                />
                <NumberInput
                  label="Port IMAP"
                  value={imapPort}
                  onChange={(v) => setImapPort(Number(v) || 993)}
                  min={1}
                  max={65535}
                />
              </Group>
              <Switch
                label="IMAP en SSL (port 993)."
                checked={imapSecure}
                onChange={(e) => setImapSecure(e.currentTarget.checked)}
              />
            </>
          )}

          {error && (
            <Alert color="red" variant="light" radius="md">
              {error}
            </Alert>
          )}

          <Group justify="flex-end">
            <Button
              type="button"
              variant="subtle"
              color="gray"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type="submit" loading={pending}>
              Tester et connecter
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
