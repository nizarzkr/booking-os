"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { createSequenceFromBlueprint } from "@/app/(app)/sequences/actions";
import { SEQUENCE_BLUEPRINTS } from "@/components/sequences/sequence-blueprints";
import { formatDelay } from "@/components/sequences/sequence-types";

export function BlueprintGallery({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function applyBlueprint(id: string) {
    setPendingId(id);
    const res = await createSequenceFromBlueprint(id);
    setPendingId(null);
    if ("error" in res) {
      notifications.show({ color: "red", message: res.error });
      return;
    }
    notifications.show({
      color: "green",
      message: "Séquence créée à partir du modèle. À toi de la personnaliser !",
    });
    onClose();
    router.push(`/sequences/${res.id}`);
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Partir d'un modèle"
      size="lg"
      centered
    >
      <Stack gap="md">
        <Text c="dimmed" size="sm">
          Des séquences prêtes à l&apos;emploi pour les situations de booking
          les plus courantes. Choisis-en une : elle est copiée dans tes
          séquences, tu la personnalises ensuite (les crochets [ … ] sont à
          remplir).
        </Text>

        {SEQUENCE_BLUEPRINTS.map((bp) => (
          <Card key={bp.id} withBorder padding="md" radius="md">
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Text fw={600}>{bp.name}</Text>
                <Badge variant="light" color="gray" style={{ flexShrink: 0 }}>
                  {bp.audience}
                </Badge>
              </Group>

              <Text c="dimmed" size="sm">
                {bp.description}
              </Text>

              <Stack gap={4} mt={4}>
                {bp.steps.map((step, i) => (
                  <Group key={i} gap="xs" wrap="nowrap">
                    <Badge
                      variant="light"
                      color="blue"
                      size="sm"
                      style={{ flexShrink: 0 }}
                    >
                      {formatDelay(step.delay_days)}
                    </Badge>
                    <Text size="sm" c="dimmed" truncate>
                      {step.subject}
                    </Text>
                  </Group>
                ))}
              </Stack>

              <Group justify="flex-end" mt="xs">
                <Button
                  size="sm"
                  onClick={() => applyBlueprint(bp.id)}
                  loading={pendingId === bp.id}
                  disabled={pendingId !== null && pendingId !== bp.id}
                >
                  Utiliser ce modèle
                </Button>
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Modal>
  );
}
