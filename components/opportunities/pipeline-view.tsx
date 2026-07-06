"use client";

import { useState } from "react";
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
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";

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

type Columns = Record<OpportunityStatus, OpportunityListItem[]>;

// Une date de gig passée sur une oppo encore ouverte = alerte.
function isGigOverdue(o: OpportunityListItem): boolean {
  if (!o.gig_date) return false;
  if (o.status === "confirmed" || o.status === "cancelled") return false;
  return o.gig_date < todayISO();
}

function groupByStatus(opportunities: OpportunityListItem[]): Columns {
  const groups: Columns = {
    prospect: [],
    contacted: [],
    negotiation: [],
    option: [],
    confirmed: [],
    cancelled: [],
  };
  for (const o of opportunities) groups[o.status].push(o);
  return groups;
}

function cloneColumns(cols: Columns): Columns {
  const out = {} as Columns;
  for (const s of STATUS_ORDER) out[s] = [...cols[s]];
  return out;
}

export function PipelineView({ opportunities }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [columns, setColumns] = useState<Columns>(() =>
    groupByStatus(opportunities),
  );

  // Re-synchronise l'état local avec la vérité serveur quand les props changent
  // (nouvelle référence après un `router.refresh` des flèches ou d'un drop).
  // Pattern React « ajuster l'état pendant le rendu » : préserve la mise à jour
  // optimiste tant que la prop ne change pas (pas de setState en effet).
  const [prevOpps, setPrevOpps] = useState(opportunities);
  if (opportunities !== prevOpps) {
    setPrevOpps(opportunities);
    setColumns(groupByStatus(opportunities));
  }

  async function persistStatus(
    id: string,
    next: OpportunityStatus,
    revert: Columns,
  ) {
    const res = await setOpportunityStatus(id, next);
    if ("error" in res) {
      setColumns(revert);
      notifications.show({ color: "red", message: res.error });
      return;
    }
    router.refresh();
  }

  // Flèches ◀ ▶ (fallback tactile/clavier) : déplacement ±1 statut.
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

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    // On ne persiste pas l'ordre intra-colonne : seul un changement de colonne
    // (donc de statut) est significatif.
    if (source.droppableId === destination.droppableId) return;

    const from = source.droppableId as OpportunityStatus;
    const to = destination.droppableId as OpportunityStatus;
    const revert = cloneColumns(columns);

    setColumns((cur) => {
      const nextCols = cloneColumns(cur);
      const idx = nextCols[from].findIndex((o) => o.id === draggableId);
      if (idx === -1) return cur;
      const [moved] = nextCols[from].splice(idx, 1);
      nextCols[to].splice(destination.index, 0, { ...moved, status: to });
      return nextCols;
    });

    void persistStatus(draggableId, to, revert);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Group
        align="flex-start"
        gap="md"
        wrap="nowrap"
        style={{ overflowX: "auto" }}
      >
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status];
          const items = columns[status];
          return (
            <Stack key={status} gap="sm" w={260} style={{ flex: "0 0 auto" }}>
              <Group gap="xs" justify="space-between">
                <Badge color={meta.color} variant="light" size="sm">
                  {meta.label}
                </Badge>
                <Text c="dimmed" size="sm" fw={700}>
                  {items.length}
                </Text>
              </Group>

              <Droppable droppableId={status}>
                {(dropProvided, dropSnapshot) => (
                  <div
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                    style={{
                      minHeight: 60,
                      borderRadius: "var(--mantine-radius-md)",
                      background: dropSnapshot.isDraggingOver
                        ? "var(--mantine-color-dark-6)"
                        : "transparent",
                      transition: "background 120ms ease",
                    }}
                  >
                    <Stack gap="sm">
                      {items.length === 0 && !dropSnapshot.isDraggingOver ? (
                        <Text c="dimmed" size="xs" ta="center" py="sm">
                          —
                        </Text>
                      ) : (
                        items.map((o, index) => {
                          const idx = STATUS_ORDER.indexOf(o.status);
                          const overdue = isGigOverdue(o);
                          const who = o.contact_name ?? o.organization_name;
                          return (
                            <Draggable
                              key={o.id}
                              draggableId={o.id}
                              index={index}
                            >
                              {(dragProvided, dragSnapshot) => (
                                <Card
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  withBorder
                                  padding="sm"
                                  radius="md"
                                  style={{
                                    ...dragProvided.draggableProps.style,
                                    cursor: "grab",
                                    borderColor: dragSnapshot.isDragging
                                      ? "var(--mantine-color-gray-5)"
                                      : undefined,
                                  }}
                                >
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
                                        <Text
                                          size="xs"
                                          c={overdue ? "red.5" : "dimmed"}
                                        >
                                          {formatGigDate(o.gig_date)}
                                        </Text>
                                        {overdue && (
                                          <Badge
                                            color="red"
                                            variant="light"
                                            size="xs"
                                          >
                                            Dépassé
                                          </Badge>
                                        )}
                                      </Group>
                                      {o.fee !== null && (
                                        <Text
                                          size="xs"
                                          fw={600}
                                          ff="monospace"
                                        >
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
                                          disabled={
                                            idx === 0 || pendingId === o.id
                                          }
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
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {dropProvided.placeholder}
                    </Stack>
                  </div>
                )}
              </Droppable>
            </Stack>
          );
        })}
      </Group>
    </DragDropContext>
  );
}
