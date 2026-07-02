"use client";

import dayjs from "dayjs";
import "dayjs/locale/fr";
import { Badge, Card, Group, Stack, Text } from "@mantine/core";

import type { Database } from "@/types/database.types";

export type EmailLog = Pick<
  Database["public"]["Tables"]["email_logs"]["Row"],
  "id" | "subject" | "body" | "direction" | "sent_at" | "read"
>;

function formatSentAt(iso: string): string {
  return dayjs(iso).locale("fr").format("D MMM YYYY à HH:mm");
}

/** Historique des emails (envoyés/reçus) d'un contact ou d'une opportunité. */
export function EmailHistory({ logs }: { logs: EmailLog[] }) {
  return (
    <Card withBorder radius="lg" padding="lg">
      <Stack gap="sm">
        <Text fw={600}>Historique des emails</Text>

        {logs.length === 0 ? (
          <Text c="dimmed" size="sm">
            {"Aucun email pour l'instant."}
          </Text>
        ) : (
          <Stack gap="xs">
            {logs.map((log) => {
              const outbound = log.direction === "outbound";
              return (
                <Group
                  key={log.id}
                  justify="space-between"
                  align="flex-start"
                  wrap="nowrap"
                >
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Group gap="xs">
                      <Badge
                        color={outbound ? "violet" : "green"}
                        variant="light"
                        size="sm"
                      >
                        {outbound ? "Envoyé" : "Reçu"}
                      </Badge>
                      <Text fw={500} size="sm" truncate>
                        {log.subject ?? "(sans objet)"}
                      </Text>
                    </Group>
                    {log.body && (
                      <Text c="dimmed" size="xs" lineClamp={1}>
                        {log.body}
                      </Text>
                    )}
                  </Stack>
                  <Text c="dimmed" size="xs" style={{ whiteSpace: "nowrap" }}>
                    {formatSentAt(log.sent_at)}
                  </Text>
                </Group>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
