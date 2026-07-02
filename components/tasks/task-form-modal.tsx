"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";

import {
  createTask,
  updateTask,
  type TaskInput,
} from "@/app/(app)/tasks/actions";
import { type Task } from "@/components/tasks/task-types";

export type LinkOption = { value: string; label: string };

type Props = {
  onClose: () => void;
  onSaved: () => void;
  task: Task | null; // null = création
  opportunityOptions: LinkOption[];
  contactOptions: LinkOption[];
  // Pré-remplissage + verrouillage des liens (création depuis une fiche).
  presetOpportunityId?: string | null;
  presetContactId?: string | null;
  lockLinks?: boolean;
};

/**
 * Monté uniquement quand ouvert (remonté via `key`) → initialValues frais,
 * aucun useEffect. Depuis une fiche, les liens sont pré-remplis et masqués.
 */
export function TaskFormModal({
  onClose,
  onSaved,
  task,
  opportunityOptions,
  contactOptions,
  presetOpportunityId = null,
  presetContactId = null,
  lockLinks = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: task?.title ?? "",
      due_date: task?.due_date ?? null,
      opportunity_id: task?.opportunity_id ?? presetOpportunityId,
      contact_id: task?.contact_id ?? presetContactId,
    },
    validate: {
      title: (v) => (v.trim() ? null : "Ce champ est requis."),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    setServerError(null);
    const input: TaskInput = {
      title: values.title,
      due_date: values.due_date,
      opportunity_id: values.opportunity_id,
      contact_id: values.contact_id,
    };
    const result = task
      ? await updateTask(task.id, input)
      : await createTask(input);
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
      title={task ? "Modifier la tâche" : "Nouvelle tâche"}
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          {serverError && (
            <Alert color="red" variant="light" radius="md">
              {serverError}
            </Alert>
          )}

          <TextInput
            label="Titre"
            placeholder="Relancer pour la date d'automne"
            required
            data-autofocus
            key={form.key("title")}
            {...form.getInputProps("title")}
          />

          <DateInput
            label="Échéance"
            placeholder="Choisir une date…"
            valueFormat="D MMMM YYYY"
            clearable
            key={form.key("due_date")}
            {...form.getInputProps("due_date")}
          />

          {!lockLinks && (
            <Group grow>
              <Select
                label="Opportunité"
                placeholder="Aucune"
                data={opportunityOptions}
                searchable
                clearable
                nothingFoundMessage="Aucune opportunité"
                key={form.key("opportunity_id")}
                {...form.getInputProps("opportunity_id")}
              />
              <Select
                label="Contact"
                placeholder="Aucun"
                data={contactOptions}
                searchable
                clearable
                nothingFoundMessage="Aucun contact"
                key={form.key("contact_id")}
                {...form.getInputProps("contact_id")}
              />
            </Group>
          )}

          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={loading}>
              {task ? "Enregistrer" : "Créer la tâche"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
