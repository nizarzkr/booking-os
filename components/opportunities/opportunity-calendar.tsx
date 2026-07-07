"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  Anchor,
  Badge,
  Box,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { Calendar } from "@mantine/dates";

import {
  formatFee,
  formatGigDate,
  STATUS_META,
} from "@/components/opportunities/opportunity-types";
import { type OpportunityListItem } from "@/components/opportunities/opportunities-view";
import { todayISO } from "@/lib/utils/date";

type Props = {
  opportunities: OpportunityListItem[];
};

// Petite pastille colorée (couleur du statut) affichée dans une case de jour.
function StatusDot({ color }: { color: string }) {
  return (
    <Box
      w={6}
      h={6}
      style={{
        borderRadius: "50%",
        backgroundColor: `var(--mantine-color-${color}-6)`,
      }}
    />
  );
}

export function OpportunityCalendar({ opportunities }: Props) {
  const [selected, setSelected] = useState<string>(todayISO());

  // Index des dates par jour (YYYY-MM-DD) pour un accès O(1) au rendu.
  const byDay = useMemo(() => {
    const map = new Map<string, OpportunityListItem[]>();
    for (const o of opportunities) {
      if (!o.gig_date) continue;
      const key = dayjs(o.gig_date).format("YYYY-MM-DD");
      const list = map.get(key);
      if (list) list.push(o);
      else map.set(key, [o]);
    }
    return map;
  }, [opportunities]);

  const selectedGigs = byDay.get(selected) ?? [];

  return (
    <Stack gap="lg" align="flex-start">
      <Card withBorder padding="md" radius="lg">
        <Calendar
          defaultDate={selected}
          highlightToday
          getDayProps={(dateStr) => ({
            selected: dateStr === selected,
            onClick: () => setSelected(dateStr),
          })}
          renderDay={(dateStr) => {
            const gigs = byDay.get(dateStr) ?? [];
            const dayNumber = dayjs(dateStr).date();
            return (
              <Stack gap={2} align="center" justify="center">
                <Text size="sm" lh={1}>
                  {dayNumber}
                </Text>
                {gigs.length > 0 && (
                  <Tooltip
                    label={gigs.map((g) => g.title).join(" · ")}
                    withArrow
                    position="bottom"
                  >
                    <Group gap={2} wrap="nowrap" justify="center">
                      {gigs.slice(0, 3).map((g) => (
                        <StatusDot
                          key={g.id}
                          color={STATUS_META[g.status].color}
                        />
                      ))}
                    </Group>
                  </Tooltip>
                )}
              </Stack>
            );
          }}
        />
      </Card>

      <Stack gap="xs" style={{ alignSelf: "stretch" }}>
        <Text fw={700}>{formatGigDate(selected)}</Text>
        {selectedGigs.length === 0 ? (
          <Text c="dimmed" size="sm">
            Aucune date ce jour-là.
          </Text>
        ) : (
          selectedGigs.map((o) => {
            const meta = STATUS_META[o.status];
            const place = [o.venue, o.city].filter(Boolean).join(" · ");
            return (
              <Group key={o.id} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Anchor
                    component={Link}
                    href={`/opportunities/${o.id}`}
                    fw={500}
                    size="sm"
                  >
                    {o.title}
                  </Anchor>
                  <Badge color={meta.color} variant="light" size="sm">
                    {meta.label}
                  </Badge>
                  {place && (
                    <Text c="dimmed" size="sm">
                      {place}
                    </Text>
                  )}
                </Group>
                {o.fee !== null && (
                  <Text size="sm" ff="monospace">
                    {formatFee(o.fee)}
                  </Text>
                )}
              </Group>
            );
          })
        )}
      </Stack>
    </Stack>
  );
}
