"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Anchor,
  Badge,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { setOpportunityStatus } from "@/app/(app)/opportunities/actions";
import {
  formatFee,
  formatGigDate,
  STATUS_META,
  STATUS_ORDER,
  type OpportunityStatus,
} from "@/components/opportunities/opportunity-types";
import { type OpportunityListItem } from "@/components/opportunities/opportunities-view";
import { todayISO } from "@/lib/utils/date";

type Props = {
  opportunities: OpportunityListItem[];
};

// Une date de gig passée sur une oppo encore ouverte = alerte.
function isGigOverdue(o: OpportunityListItem): boolean {
  if (!o.gig_date) return false;
  if (o.status === "confirmed" || o.status === "cancelled") return false;
  return o.gig_date < todayISO();
}

export function PipelineView({ opportunities }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const byStatus = useMemo(() => {
    const groups: Record<OpportunityStatus, OpportunityListItem[]> = {
      prospect: [],
      contacted: [],
      negotiation: [],
      option: [],
      confirmed: [],
      cancelled: [],
    };
    for (const o of opportunities) groups[o.status].push(o);
    return groups;
  }, [opportunities]);

  async function move(o: OpportunityListItem, dir: -1 | 1) {
    const idx = STATUS_ORDER.indexOf(o.status);
    const next = STATUS_ORDER[idx + dir];
    if (!next) return;
    setPendingId(o.id);
    const res = await setOpportunityStatus(o.id, next);
    setPendingId(null);
    if ("error" in res) {
      notifications.show({ color: "red", message: res.error });
      return;
    }
    router.refresh();
  }

  return (
    <Group align="flex-start" gap="md" wrap="nowrap" style={{ overflowX: "auto" }}>
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status];
        const items = byStatus[status];
        return (
          <Stack key={status} gap="sm" w={260} style={{ flex: "0 0 auto" }}>
            <Group gap="xs" justify="space-between">
              <Group gap="xs">
                <Badge color={meta.color} variant="light" size="sm">
                  {meta.label}
                </Badge>
              </Group>
              <Text c="dimmed" size="sm" fw={700}>
                {items.length}
              </Text>
            </Group>

            <Stack gap="sm">
              {items.length === 0 ? (
                <Text c="dimmed" size="xs" ta="center" py="sm">
                  —
                </Text>
              ) : (
                items.map((o) => {
                  const idx = STATUS_ORDER.indexOf(o.status);
                  const overdue = isGigOverdue(o);
                  const who = o.contact_name ?? o.organization_name;
                  return (
                    <Card key={o.id} withBorder padding="sm" radius="md">
                      <Stack gap={6}>
                        <Anchor
                          component={Link}
                          href={`/opportunities/${o.id}`}
                          fw={600}
                          size="sm"
                        >
                          {o.title}
                        </Anchor>

                        {who && (
                          <Text c="dimmed" size="xs">
                            {who}
                          </Text>
                        )}

                        <Group gap="xs" justify="space-between">
                          <Group gap="xs">
                            <Text size="xs" c={overdue ? "red.5" : "dimmed"}>
                              {formatGigDate(o.gig_date)}
                            </Text>
                            {overdue && (
                              <Badge color="red" variant="light" size="xs">
                                Dépassé
                              </Badge>
                            )}
                          </Group>
                          {o.fee !== null && (
                            <Text size="xs" fw={600} ff="monospace">
                              {formatFee(o.fee)}
                            </Text>
                          )}
                        </Group>

                        <Group gap={4} justify="flex-end">
                          <Tooltip label="Statut précédent" withArrow>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              aria-label="Statut précédent"
                              disabled={idx === 0 || pendingId === o.id}
                              onClick={() => move(o, -1)}
                            >
                              ◀
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Statut suivant" withArrow>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              aria-label="Statut suivant"
                              disabled={
                                idx === STATUS_ORDER.length - 1 ||
                                pendingId === o.id
                              }
                              onClick={() => move(o, 1)}
                            >
                              ▶
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Stack>
                    </Card>
                  );
                })
              )}
            </Stack>
          </Stack>
        );
      })}
    </Group>
  );
}
