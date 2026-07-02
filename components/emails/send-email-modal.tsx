"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { sendEmail } from "@/app/(app)/emails/actions";
import {
  renderTemplate,
  type EmailTemplate,
  type TemplateVars,
} from "@/components/templates/template-types";

type Props = {
  onClose: () => void;
  onSent: () => void;
  defaultTo: string;
  templates: EmailTemplate[];
  vars: Partial<TemplateVars>;
  contactId: string | null;
  opportunityId: string | null;
};

/**
 * Monté uniquement à l'ouverture (état frais, pas de useEffect). Choisir un
 * template pré-remplit objet + corps avec les variables résolues ; tout reste
 * éditable avant envoi.
 */
export function SendEmailModal({
  onClose,
  onSent,
  defaultTo,
  templates,
  vars,
  contactId,
  opportunityId,
}: Props) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateOptions = templates.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  function applyTemplate(id: string | null) {
    setTemplateId(id);
    if (!id) return;
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setSubject(renderTemplate(tpl.subject, vars));
    setBody(renderTemplate(tpl.body, vars));
  }

  async function handleSend() {
    setLoading(true);
    setError(null);
    const result = await sendEmail({ to, subject, body, contactId, opportunityId });
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    notifications.show({ color: "green", message: "Email envoyé." });
    onSent();
  }

  return (
    <Modal opened onClose={onClose} title="Envoyer un email" centered size="lg">
      <Stack gap="sm">
        {error && (
          <Alert color="red" variant="light" radius="md">
            {error}
          </Alert>
        )}

        {templateOptions.length > 0 && (
          <Select
            label="Template"
            placeholder="Partir d'un template (optionnel)"
            data={templateOptions}
            value={templateId}
            onChange={applyTemplate}
            clearable
          />
        )}

        <TextInput
          label="Destinataire"
          type="email"
          value={to}
          onChange={(e) => setTo(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Objet"
          value={subject}
          onChange={(e) => setSubject(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Message"
          value={body}
          onChange={(e) => setBody(e.currentTarget.value)}
          autosize
          minRows={8}
          required
        />

        <Group justify="flex-end" mt="xs">
          <Button variant="default" color="gray" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSend} loading={loading}>
            Envoyer
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
