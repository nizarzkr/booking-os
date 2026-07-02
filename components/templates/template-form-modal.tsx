"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";

import {
  createTemplate,
  updateTemplate,
  type TemplateInput,
} from "@/app/(app)/templates/actions";
import {
  TEMPLATE_VARIABLES,
  type EmailTemplate,
} from "@/components/templates/template-types";

type Props = {
  onClose: () => void;
  onSaved: () => void;
  template: EmailTemplate | null; // null = création
};

export function TemplateFormModal({ onClose, onSaved, template }: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: template?.name ?? "",
      subject: template?.subject ?? "",
      body: template?.body ?? "",
    },
    validate: {
      name: (v) => (v.trim() ? null : "Ce champ est requis."),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    setServerError(null);
    const input: TemplateInput = values;
    const result = template
      ? await updateTemplate(template.id, input)
      : await createTemplate(input);
    setLoading(false);

    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    onSaved();
  });

  return (
    <Modal
      opened
      onClose={onClose}
      title={template ? "Modifier le template" : "Nouveau template"}
      centered
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          {serverError && (
            <Alert color="red" variant="light" radius="md">
              {serverError}
            </Alert>
          )}

          <TextInput
            label="Nom du template"
            placeholder="Prise de contact — première approche"
            required
            key={form.key("name")}
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Objet de l'email"
            placeholder="Proposition de date — {{artist_name}}"
            key={form.key("subject")}
            {...form.getInputProps("subject")}
          />

          <Textarea
            label="Corps du message"
            placeholder={
              "Bonjour {{contact_name}},\n\nJe me permets de vous contacter…"
            }
            autosize
            minRows={6}
            key={form.key("body")}
            {...form.getInputProps("body")}
          />

          <Stack gap={4}>
            <Text c="dimmed" size="xs" fw={700}>
              Variables disponibles (à copier dans l&apos;objet ou le corps)
            </Text>
            <Group gap={6}>
              {TEMPLATE_VARIABLES.map((v) => (
                <Badge key={v.key} variant="light" color="violet" size="sm">
                  {`{{${v.key}}}`}
                </Badge>
              ))}
            </Group>
          </Stack>

          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={loading}>
              {template ? "Enregistrer" : "Créer le template"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
