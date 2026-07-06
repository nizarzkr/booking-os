"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { syncInbox, markAllInboundRead } from "@/app/(app)/inbox/actions";

export type InboxItem = {
  id: string;
  subject: string | null;
  body: string | null;
  sent_at: string;
  read: boolean;
  href: string | null;
  from: string;
};

function formatSentAt(iso: string): string {
  return dayjs(iso).locale("fr").format("D MMM YYYY à HH:mm");
}

export function InboxView({ items }: { items: InboxItem[] }) {
  const router = useRouter();
  const [syncing, startSync] = useTransition();
  const [markingRead, setMarkingRead] = useState(false);
  const autoSynced = useRef(false);

  const unreadCount = items.filter((i) => !i.read).length;

  function runSync(showToast: boolean) {
    startSync(async () => {
      const result = await syncInbox();
      if ("error" in result) {
        notifications.show({ color: "red", message: result.error });
        return;
      }
      if (result.inserted > 0) {
        notifications.show({
          color: "green",
          message: `${result.inserted} nouvelle${result.inserted > 1 ? "s" : ""} réponse${result.inserted > 1 ? "s" : ""}.`,
        });
        router.refresh();
      } else if (showToast) {
        notifications.show({ color: "gray", message: "Aucune nouvelle réponse." });
      }
    });
  }

  // Sync automatique à l'ouverture de la boîte (une seule fois par montage).
  useEffect(() => {
    if (autoSynced.current) return;
    autoSynced.current = true;
    runSync(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMarkAllRead() {
    setMarkingRead(true);
    await markAllInboundRead();
    setMarkingRead(false);
    router.refresh();
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Stack gap={2}>
          <Group gap="sm">
            <Title order={1}>Réponses</Title>
            {unreadCount > 0 && (
              <Badge color="green" variant="filled" size="lg">
                {unreadCount}
              </Badge>
            )}
          </Group>
          <Text c="dimmed" size="sm">
            Les réponses à tes emails, centralisées.
          </Text>
        </Stack>
        <Group gap="sm">
          {unreadCount > 0 && (
            <Button
              variant="default"
              color="gray"
              onClick={handleMarkAllRead}
              loading={markingRead}
            >
              Tout marquer comme lu
            </Button>
          )}
          <Button onClick={() => runSync(true)} loading={syncing}>
            Rafraîchir
          </Button>
        </Group>
      </Group>

      {items.length === 0 ? (
        <Card withBorder padding="xl" radius="lg">
          <Stack gap={4} align="center">
            <Text fw={600}>Aucune réponse pour l&apos;instant</Text>
            <Text c="dimmed" size="sm" ta="center">
              Les réponses à tes emails envoyés depuis l&apos;app apparaîtront
              ici automatiquement.
            </Text>
          </Stack>
        </Card>
      ) : (
        <Stack gap="xs">
          {items.map((item) => (
            <Card
              key={item.id}
              withBorder
              radius="lg"
              padding="md"
              className="interactive-card"
              style={
                item.read
                  ? undefined
                  : { borderColor: "var(--mantine-color-green-6)" }
              }
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Group gap="xs" wrap="nowrap">
                    {!item.read && (
                      <Badge color="green" variant="light" size="sm">
                        Nouveau
                      </Badge>
                    )}
                    <Text fw={600} size="sm" truncate>
                      {item.subject ?? "(sans objet)"}
                    </Text>
                  </Group>
                  {item.href ? (
                    <Anchor component={Link} href={item.href} size="xs">
                      {item.from}
                    </Anchor>
                  ) : (
                    <Text c="dimmed" size="xs">
                      {item.from}
                    </Text>
                  )}
                  {item.body && (
                    <Text c="dimmed" size="xs" lineClamp={2}>
                      {item.body}
                    </Text>
                  )}
                </Stack>
                <Text c="dimmed" size="xs" style={{ whiteSpace: "nowrap" }}>
                  {formatSentAt(item.sent_at)}
                </Text>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
