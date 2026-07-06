"use client";

import { useState } from "react";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import { addStep, updateStep } from "@/app/(app)/sequences/actions";
import { TEMPLATE_VARIABLES } from "@/components/templates/template-types";
import { type SequenceStep } from "@/components/sequences/sequence-types";

type Props = {
  sequenceId: string;
  step: SequenceStep | null;
  onClose: () => void;
  onSaved: () => void;
};

export function StepFormModal({ sequenceId, step, onClose, onSaved }: Props) {
  const [pending, setPending] = useState(false);

  const form = useForm({
    initialValues: {
      delay_days: step?.delay_days ?? 0,
      subject: step?.subject ?? "",
      body: step?.body ?? "",
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setPending(true);
    const payload = {
      delay_days: values.delay_days,
      subject: values.subject,
      body: values.body,
    };
    const res = step
      ? await updateStep(step.id, sequenceId, payload)
      : await addStep(sequenceId, payload);
    setPending(false);
    if ("error" in res) {
      notifications.show({ color: "red", message: res.error });
      return;
    }
    onSaved();
  }

  return (
    <Modal
      opened
      onClose={onClose}
      title={step ? "Modifier l'étape" : "Ajouter une étape"}
      centered
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <NumberInput
            label="Délai avant envoi (jours)"
            description="0 = envoi immédiat à l'enrôlement (ou juste après l'étape précédente)."
            min={0}
            max={365}
            {...form.getInputProps("delay_days")}
          />
          <TextInput
            label="Objet"
            placeholder="Ex. Une date chez vous ?"
            required
            {...form.getInputProps("subject")}
          />
          <Textarea
            label="Message"
            placeholder="Bonjour {{contact_name}}, …"
            autosize
            minRows={6}
            required
            {...form.getInputProps("body")}
          />
          <Text size="xs" c="dimmed">
            Variables :{" "}
            {TEMPLATE_VARIABLES.map((v) => `{{${v.key}}}`).join(" · ")}
          </Text>
          <Group justify="flex-end">
            <Button type="button" variant="subtle" color="gray" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={pending}>
              {step ? "Enregistrer" : "Ajouter"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
