"use client";

import Link from "next/link";
import {
  Anchor,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import {
  formatFee,
  formatGigDate,
  STATUS_META,
} from "@/components/opportunities/opportunity-types";
import { dueMeta, formatDueDate } from "@/components/tasks/task-types";
import {
  GettingStarted,
  type SetupState,
} from "@/components/dashboard/getting-started";

export type RelanceItem = {
  id: string;
  title: string;
  due_date: string | null;
  href: string | null;
  linkLabel: string | null;
};
export type ConfirmedItem = {
  id: string;
  title: string;
  gig_date: string | null;
  fee: number | null;
};
export type OptionItem = {
  id: string;
  title: string;
  gig_date: string | null;
};

type Props = {
  todayLabel: string;
  counts: {
    contacts: number;
    activeOpps: number;
    overdue: number;
    unreadInbox: number;
  };
  relance: RelanceItem[];
  confirmed: ConfirmedItem[];
  options: OptionItem[];
  setup: SetupState;
};

export function DashboardView({
  todayLabel,
  counts,
  relance,
  confirmed,
  options,
  setup,
}: Props) {
  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={1}>Aujourd&apos;hui</Title>
        <Text c="dimmed" size="sm" tt="capitalize">
          {todayLabel}
        </Text>
      </Stack>

      {/* Démarrage (masqué une fois les 3 étapes faites) */}
      <GettingStarted setup={setup} />

      {/* Nouvelles réponses entrantes */}
      {counts.unreadInbox > 0 && (
        <Card
          withBorder
          padding="md"
          radius="lg"
          component={Link}
          href="/outreach?tab=inbox"
          className="interactive-card"
          style={{
            textDecoration: "none",
            borderColor: "var(--mantine-color-green-6)",
          }}
        >
          <Group gap="sm" wrap="nowrap">
            <Badge color="green" variant="filled" size="lg">
              {counts.unreadInbox}
            </Badge>
            <Text fw={600} size="sm">
              {counts.unreadInbox > 1
                ? "nouvelles réponses à lire"
                : "nouvelle réponse à lire"}
            </Text>
          </Group>
        </Card>
      )}

      {/* Compteurs rapides */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <StatCard label="Contacts" value={counts.contacts} href="/contacts" />
        <StatCard
          label="Opportunités actives"
          value={counts.activeOpps}
          href="/opportunities"
        />
        <StatCard
          label="Tâches en retard"
          value={counts.overdue}
          href="/tasks"
          alert={counts.overdue > 0}
        />
      </SimpleGrid>

      {/* À relancer aujourd'hui */}
      <Card withBorder padding="lg">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={700}>À relancer aujourd&apos;hui</Text>
            <Anchor component={Link} href="/tasks" size="sm">
              Toutes les tâches
            </Anchor>
          </Group>

          {relance.length === 0 ? (
            <Text c="dimmed" size="sm">
              Rien à relancer aujourd&apos;hui. 🎉
            </Text>
          ) : (
            <Stack gap="xs">
              {relance.map((t) => {
                const meta = dueMeta({ due_date: t.due_date, done: false });
                return (
                  <Group key={t.id} justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Text size="sm" fw={500}>
                        {t.title}
                      </Text>
                      {meta && (
                        <Badge
                          color={meta.color}
                          variant="light"
                          size="sm"
                        >
                          {meta.label}
                        </Badge>
                      )}
                    </Group>
                    <Group gap="sm" wrap="nowrap">
                      {t.href && t.linkLabel && (
                        <Anchor component={Link} href={t.href} size="sm">
                          {t.linkLabel}
                        </Anchor>
                      )}
                      <Text c="dimmed" size="sm">
                        {formatDueDate(t.due_date)}
                      </Text>
                    </Group>
                  </Group>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Card>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Prochaines dates confirmées */}
        <Card withBorder padding="lg">
          <Stack gap="sm">
            <Text fw={700}>Prochaines dates confirmées</Text>
            <Text c="dimmed" size="xs">
              Dans les 30 prochains jours
            </Text>
            {confirmed.length === 0 ? (
              <Text c="dimmed" size="sm">
                Aucune date confirmée à venir.
              </Text>
            ) : (
              <Stack gap="xs">
                {confirmed.map((o) => (
                  <Group key={o.id} justify="space-between" wrap="nowrap">
                    <Anchor
                      component={Link}
                      href={`/opportunities/${o.id}`}
                      size="sm"
                      fw={500}
                    >
                      {o.title}
                    </Anchor>
                    <Group gap="sm" wrap="nowrap">
                      {o.fee !== null && (
                        <Text size="sm" ff="monospace">
                          {formatFee(o.fee)}
                        </Text>
                      )}
                      <Text c="dimmed" size="sm">
                        {formatGigDate(o.gig_date)}
                      </Text>
                    </Group>
                  </Group>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>

        {/* Options en cours */}
        <Card withBorder padding="lg">
          <Stack gap="sm">
            <Group gap="sm">
              <Text fw={700}>Options en cours</Text>
              <Badge
                color={STATUS_META.option.color}
                variant="light"
                size="sm"
              >
                {STATUS_META.option.label}
              </Badge>
            </Group>
            {options.length === 0 ? (
              <Text c="dimmed" size="sm">
                Aucune option en attente.
              </Text>
            ) : (
              <Stack gap="xs">
                {options.map((o) => (
                  <Group key={o.id} justify="space-between" wrap="nowrap">
                    <Anchor
                      component={Link}
                      href={`/opportunities/${o.id}`}
                      size="sm"
                      fw={500}
                    >
                      {o.title}
                    </Anchor>
                    <Text c="dimmed" size="sm">
                      {formatGigDate(o.gig_date)}
                    </Text>
                  </Group>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

function StatCard({
  label,
  value,
  href,
  alert = false,
}: {
  label: string;
  value: number;
  href: string;
  alert?: boolean;
}) {
  return (
    <Card
      withBorder
      padding="lg"
      component={Link}
      href={href}
      className="interactive-card"
      style={{ textDecoration: "none" }}
    >
      <Stack gap={4}>
        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
          {label}
        </Text>
        <Text
          fw={600}
          fz={32}
          ff="monospace"
          c={alert ? "red.5" : undefined}
          style={{ lineHeight: 1.1 }}
        >
          {value}
        </Text>
      </Stack>
    </Card>
  );
}
