"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Group, Modal, Select, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { enrollContacts } from "@/app/(app)/sequences/actions";
import { type Sequence } from "@/components/sequences/sequence-types";

type Props = {
  contactId: string;
  sequences: Sequence[];
  onClose: () => void;
};

export function EnrollToSequenceModal({
  contactId,
  sequences,
  onClose,
}: Props) {
  const router = useRouter();
  const [sequenceId, setSequenceId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleEnroll() {
    if (!sequenceId) return;
    setPending(true);
    const res = await enrollContacts(sequenceId, [contactId]);
    setPending(false);
    if ("error" in res) {
      notifications.show({ color: "red", message: res.error });
      return;
    }
    notifications.show({ color: "green", message: "Contact enrôlé." });
    onClose();
    router.refresh();
  }

  return (
    <Modal opened onClose={onClose} title="Ajouter à une séquence" centered>
      <Stack gap="md">
        {sequences.length === 0 ? (
          <Text c="dimmed" size="sm">
            Aucune séquence disponible. Crée-en une dans Prospection →
            Séquences.
          </Text>
        ) : (
          <Select
            label="Séquence"
            placeholder="Choisir une séquence"
            data={sequences.map((s) => ({ value: s.id, label: s.name }))}
            value={sequenceId}
            onChange={setSequenceId}
            searchable
            data-autofocus
          />
        )}
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleEnroll}
            loading={pending}
            disabled={!sequenceId}
          >
            Enrôler
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
