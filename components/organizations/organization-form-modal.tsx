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
import { useForm } from "@mantine/form";

import {
  createOrganization,
  updateOrganization,
  type OrganizationInput,
} from "@/app/(app)/organizations/actions";
import {
  ORG_TYPE_SELECT_OPTIONS,
  type Organization,
} from "@/components/organizations/org-types";

type Props = {
  onClose: () => void;
  onSaved: () => void;
  organization: Organization | null; // null = création
};

/** Monté uniquement à l'ouverture, remonté via `key` → initialValues frais. */
export function OrganizationFormModal({
  onClose,
  onSaved,
  organization,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: organization?.name ?? "",
      type: organization?.type ?? null,
      city: organization?.city ?? "",
      country: organization?.country ?? "",
      website: organization?.website ?? "",
      notes: organization?.notes ?? "",
    },
    validate: {
      name: (v) => (v.trim() ? null : "Ce champ est requis."),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    setServerError(null);
    const input: OrganizationInput = values;
    const result = organization
      ? await updateOrganization(organization.id, input)
      : await createOrganization(input);
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
      title={organization ? "Modifier l'organisation" : "Nouvelle organisation"}
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          {serverError && (
            <Alert color="red" variant="light" radius="md">
              {serverError}
            </Alert>
          )}

          <Group grow>
            <TextInput
              label="Nom"
              placeholder="La Maroquinerie"
              required
              key={form.key("name")}
              {...form.getInputProps("name")}
            />
            <Select
              label="Type"
              placeholder="Choisir…"
              data={ORG_TYPE_SELECT_OPTIONS}
              clearable
              key={form.key("type")}
              {...form.getInputProps("type")}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Ville"
              placeholder="Paris"
              key={form.key("city")}
              {...form.getInputProps("city")}
            />
            <TextInput
              label="Pays"
              placeholder="France"
              key={form.key("country")}
              {...form.getInputProps("country")}
            />
          </Group>

          <TextInput
            label="Site web"
            placeholder="https://…"
            key={form.key("website")}
            {...form.getInputProps("website")}
          />

          <Textarea
            label="Notes"
            placeholder="Jauge, style, contexte…"
            autosize
            minRows={2}
            key={form.key("notes")}
            {...form.getInputProps("notes")}
          />

          <Group justify="flex-end" mt="xs">
            <Button
              type="button"
              variant="subtle"
              color="gray"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type="submit" loading={loading}>
              {organization ? "Enregistrer" : "Créer l'organisation"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
