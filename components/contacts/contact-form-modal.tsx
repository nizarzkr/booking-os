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

import { createContact, updateContact } from "@/app/(app)/contacts/actions";
import { type ContactInput } from "@/components/contacts/contact-input";
import { ROLE_SELECT_OPTIONS, type Contact } from "@/components/contacts/roles";

type Props = {
  onClose: () => void;
  onSaved: () => void;
  contact: Contact | null; // null = création
};

/**
 * Monté uniquement quand le formulaire est ouvert (voir ContactsView), et
 * remonté via `key` selon la cible → initialValues frais, aucun useEffect.
 */
export function ContactFormModal({ onClose, onSaved, contact }: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      first_name: contact?.first_name ?? "",
      last_name: contact?.last_name ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      role: contact?.role ?? null,
      notes: contact?.notes ?? "",
    },
    validate: {
      first_name: (v) => (v.trim() ? null : "Ce champ est requis."),
      email: (v) => (!v || /^\S+@\S+\.\S+$/.test(v) ? null : "Email invalide."),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    setServerError(null);
    const input: ContactInput = values;
    const result = contact
      ? await updateContact(contact.id, input)
      : await createContact(input);
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
      title={contact ? "Modifier le contact" : "Nouveau contact"}
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
              label="Prénom / nom"
              placeholder="Camille Durand"
              required
              key={form.key("first_name")}
              {...form.getInputProps("first_name")}
            />
            <TextInput
              label="Nom (optionnel)"
              placeholder="Durand"
              key={form.key("last_name")}
              {...form.getInputProps("last_name")}
            />
          </Group>

          <TextInput
            label="Email"
            placeholder="camille@salle.fr"
            key={form.key("email")}
            {...form.getInputProps("email")}
          />

          <Group grow>
            <TextInput
              label="Téléphone"
              placeholder="06 12 34 56 78"
              key={form.key("phone")}
              {...form.getInputProps("phone")}
            />
            <Select
              label="Rôle"
              placeholder="Choisir…"
              data={ROLE_SELECT_OPTIONS}
              clearable
              key={form.key("role")}
              {...form.getInputProps("role")}
            />
          </Group>

          <Textarea
            label="Notes"
            placeholder="Contexte, historique, préférences…"
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
              {contact ? "Enregistrer" : "Créer le contact"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
