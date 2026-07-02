"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";

import {
  createOpportunity,
  updateOpportunity,
  type OpportunityInput,
} from "@/app/(app)/opportunities/actions";
import {
  STATUS_SELECT_OPTIONS,
  type Opportunity,
} from "@/components/opportunities/opportunity-types";

export type ContactOption = { value: string; label: string };
export type OrganizationOption = { value: string; label: string };

type Props = {
  onClose: () => void;
  onSaved: () => void;
  opportunity: Opportunity | null; // null = création
  contactOptions: ContactOption[];
  organizationOptions: OrganizationOption[];
};

/**
 * Monté uniquement quand le formulaire est ouvert (voir OpportunitiesView), et
 * remonté via `key` selon la cible → initialValues frais, aucun useEffect.
 */
export function OpportunityFormModal({
  onClose,
  onSaved,
  opportunity,
  contactOptions,
  organizationOptions,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: opportunity?.title ?? "",
      status: opportunity?.status ?? "prospect",
      contact_id: opportunity?.contact_id ?? null,
      organization_id: opportunity?.organization_id ?? null,
      gig_date: opportunity?.gig_date ?? null,
      city: opportunity?.city ?? "",
      venue: opportunity?.venue ?? "",
      fee: opportunity?.fee ?? ("" as number | string),
      notes: opportunity?.notes ?? "",
    },
    validate: {
      title: (v) => (v.trim() ? null : "Ce champ est requis."),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    setServerError(null);
    const input: OpportunityInput = {
      title: values.title,
      status: values.status,
      contact_id: values.contact_id,
      organization_id: values.organization_id,
      gig_date: values.gig_date,
      city: values.city,
      venue: values.venue,
      fee: typeof values.fee === "number" ? values.fee : null,
      notes: values.notes,
    };
    const result = opportunity
      ? await updateOpportunity(opportunity.id, input)
      : await createOpportunity(input);
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
      title={opportunity ? "Modifier l'opportunité" : "Nouvelle opportunité"}
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
            label="Titre"
            placeholder="Concert au Bikini — automne 2026"
            required
            key={form.key("title")}
            {...form.getInputProps("title")}
          />

          <Group grow>
            <Select
              label="Statut"
              data={STATUS_SELECT_OPTIONS}
              allowDeselect={false}
              key={form.key("status")}
              {...form.getInputProps("status")}
            />
            <DateInput
              label="Date du gig"
              placeholder="Choisir une date…"
              valueFormat="D MMMM YYYY"
              clearable
              key={form.key("gig_date")}
              {...form.getInputProps("gig_date")}
            />
          </Group>

          <Group grow>
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
            <Select
              label="Organisation"
              placeholder="Aucune"
              data={organizationOptions}
              searchable
              clearable
              nothingFoundMessage="Aucune organisation"
              key={form.key("organization_id")}
              {...form.getInputProps("organization_id")}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Ville"
              placeholder="Toulouse"
              key={form.key("city")}
              {...form.getInputProps("city")}
            />
            <TextInput
              label="Salle / venue"
              placeholder="Le Bikini"
              key={form.key("venue")}
              {...form.getInputProps("venue")}
            />
          </Group>

          <NumberInput
            label="Cachet (€)"
            placeholder="1200"
            min={0}
            allowNegative={false}
            thousandSeparator=" "
            hideControls
            key={form.key("fee")}
            {...form.getInputProps("fee")}
          />

          <Textarea
            label="Notes"
            placeholder="Contexte, conditions, contacts sur place…"
            autosize
            minRows={2}
            key={form.key("notes")}
            {...form.getInputProps("notes")}
          />

          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={loading}>
              {opportunity ? "Enregistrer" : "Créer l'opportunité"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
