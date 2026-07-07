"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { createSequence } from "@/app/(app)/sequences/actions";
import { type SequenceListItem } from "@/components/sequences/sequence-types";
import { BlueprintGallery } from "@/components/sequences/blueprint-gallery";

export function SequencesList({
  sequences,
}: {
  sequences: SequenceListItem[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function submitCreate() {
    startTransition(async () => {
      const res = await createSequence(name);
      if ("error" in res) {
        notifications.show({ color: "red", message: res.error });
        return;
      }
      setCreateOpen(false);
      setName("");
      router.push(`/sequences/${res.id}`);
    });
  }

  return (
    <>
      <Group justify="space-between" align="center" mb="lg">
        <Text c="dimmed" size="sm">
          {sequences.length} séquence{sequences.length > 1 ? "s" : ""}
        </Text>
        <Group gap="xs">
          <Button variant="default" onClick={() => setGalleryOpen(true)}>
            Partir d&apos;un modèle
          </Button>
          <Button onClick={() => setCreateOpen(true)}>Nouvelle séquence</Button>
        </Group>
      </Group>

      {sequences.length === 0 ? (
        <Stack align="center" gap="xs" py={64}>
          <Text fw={700}>Aucune séquence pour l&apos;instant</Text>
          <Text c="dimmed" size="sm" ta="center" maw={420}>
            Crée une séquence de relances, ajoute des étapes avec des délais,
            puis enrôle des contacts : les emails partent tout seuls et
            s&apos;arrêtent dès qu&apos;on te répond.
          </Text>
          <Group gap="xs" mt="sm">
            <Button variant="default" onClick={() => setGalleryOpen(true)}>
              Partir d&apos;un modèle
            </Button>
            <Button onClick={() => setCreateOpen(true)}>Nouvelle séquence</Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="sm">
          {sequences.map((s) => (
            <Card
              key={s.id}
              withBorder
              padding="md"
              radius="md"
              component={Link}
              href={`/sequences/${s.id}`}
              className="interactive-card"
              style={{ textDecoration: "none" }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Anchor component="span" fw={600}>
                  {s.name}
                </Anchor>
                <Group gap="xs" wrap="nowrap">
                  <Badge variant="light" color="gray">
                    {s.stepCount} étape{s.stepCount > 1 ? "s" : ""}
                  </Badge>
                  <Badge variant="light" color="blue">
                    {s.activeCount} actif{s.activeCount > 1 ? "s" : ""}
                  </Badge>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <BlueprintGallery
        opened={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />

      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouvelle séquence"
        centered
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitCreate();
          }}
        >
          <Stack gap="md">
            <TextInput
              label="Nom de la séquence"
              placeholder="Ex. Prospection salles automne"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              data-autofocus
              required
            />
            <Group justify="flex-end">
              <Button
                type="button"
                variant="subtle"
                color="gray"
                onClick={() => setCreateOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" loading={pending}>
                Créer
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
