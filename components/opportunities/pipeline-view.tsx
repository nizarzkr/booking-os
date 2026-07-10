"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

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
  // (pattern React « ajuster l'état pendant le rendu »).
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
      toast.error(res.error);
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
      toast.error(res.error);
      return;
    }
    router.refresh();
  }

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
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
      <div className="flex items-start gap-4 overflow-x-auto pb-2">
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status];
          const items = columns[status];
          return (
            <div key={status} className="flex w-64 flex-none flex-col gap-2.5">
              <div className="flex items-center justify-between px-0.5">
                <StatusBadge color={meta.color}>{meta.label}</StatusBadge>
                <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                  {items.length}
                </span>
              </div>

              <Droppable droppableId={status}>
                {(dropProvided, dropSnapshot) => (
                  <div
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                    className={cn(
                      "flex min-h-[40px] flex-col gap-2.5 rounded-lg p-0.5 transition-colors",
                      dropSnapshot.isDraggingOver && "bg-muted",
                    )}
                  >
                    {items.length === 0 && !dropSnapshot.isDraggingOver ? (
                      <p className="py-2 text-center text-xs text-muted-foreground">
                        —
                      </p>
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
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                style={dragProvided.draggableProps.style}
                                className={cn(
                                  "flex cursor-grab flex-col gap-1.5 rounded-xl border bg-card p-3 shadow-[0_1px_2px_rgba(34,32,28,0.05)]",
                                  dragSnapshot.isDragging &&
                                    "shadow-[0_8px_24px_rgba(34,32,28,0.12)]",
                                )}
                              >
                                <Link
                                  href={`/opportunities/${o.id}`}
                                  className="text-sm font-semibold text-primary hover:underline"
                                >
                                  {o.title}
                                </Link>

                                {who && (
                                  <span className="text-xs text-muted-foreground">
                                    {who}
                                  </span>
                                )}

                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={cn(
                                        "text-xs text-muted-foreground",
                                        overdue && "text-destructive",
                                      )}
                                    >
                                      {formatGigDate(o.gig_date)}
                                    </span>
                                    {overdue && (
                                      <StatusBadge color="red">Dépassé</StatusBadge>
                                    )}
                                  </div>
                                  {o.fee !== null && (
                                    <span className="font-mono text-xs font-semibold tabular-nums">
                                      {formatFee(o.fee)}
                                    </span>
                                  )}
                                </div>

                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    aria-label="Statut précédent"
                                    disabled={idx === 0 || pendingId === o.id}
                                    onClick={() => move(o, -1)}
                                    className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
                                  >
                                    <ChevronLeft className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label="Statut suivant"
                                    disabled={
                                      idx === STATUS_ORDER.length - 1 ||
                                      pendingId === o.id
                                    }
                                    onClick={() => move(o, 1)}
                                    className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
                                  >
                                    <ChevronRight className="size-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {dropProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
