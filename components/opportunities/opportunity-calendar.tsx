"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";

import {
  formatFee,
  formatGigDate,
  STATUS_META,
} from "@/components/opportunities/opportunity-types";
import { type OpportunityListItem } from "@/components/opportunities/opportunities-view";
import { todayISO } from "@/lib/utils/date";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

type Props = {
  opportunities: OpportunityListItem[];
};

const DOT_COLOR: Record<string, string> = {
  gray: "#8a857a",
  blue: "#3e6dae",
  yellow: "#c08a2e",
  violet: "#6d5ac0",
  green: "#1e8a5f",
  red: "#c15a54",
};

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
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
  const selectedDate = isoToDate(selected);

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <Card className="w-fit p-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          onSelect={(d) => {
            if (d) setSelected(dayjs(d).format("YYYY-MM-DD"));
          }}
          classNames={{ day: "h-11 w-9 p-0 text-center text-sm" }}
          components={{
            DayButton: ({ day, modifiers, ...props }) => {
              const key = dayjs(day.date).format("YYYY-MM-DD");
              const gigs = byDay.get(key) ?? [];
              return (
                <button
                  {...props}
                  className={cn(
                    "flex h-11 w-9 flex-col items-center justify-center gap-1 rounded-md font-normal transition-colors hover:bg-accent hover:text-foreground",
                    modifiers.today &&
                      !modifiers.selected &&
                      "font-semibold text-primary",
                    modifiers.selected &&
                      "bg-primary text-primary-foreground hover:bg-primary",
                    modifiers.outside && "text-muted-foreground/50",
                  )}
                >
                  <span>{day.date.getDate()}</span>
                  {gigs.length > 0 && (
                    <span className="flex gap-0.5">
                      {gigs.slice(0, 3).map((g) => (
                        <span
                          key={g.id}
                          className={cn(
                            "size-1.5 rounded-full",
                            modifiers.selected && "outline outline-1 outline-white",
                          )}
                          style={{
                            backgroundColor:
                              DOT_COLOR[STATUS_META[g.status].color] ??
                              DOT_COLOR.gray,
                          }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            },
          }}
        />
      </Card>

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold capitalize">{formatGigDate(selected)}</h3>
        {selectedGigs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune date ce jour-là.</p>
        ) : (
          selectedGigs.map((o) => {
            const meta = STATUS_META[o.status];
            const place = [o.venue, o.city].filter(Boolean).join(" · ");
            return (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/opportunities/${o.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {o.title}
                  </Link>
                  <StatusBadge color={meta.color}>{meta.label}</StatusBadge>
                  {place && (
                    <span className="text-sm text-muted-foreground">{place}</span>
                  )}
                </div>
                {o.fee !== null && (
                  <span className="font-mono text-sm tabular-nums">
                    {formatFee(o.fee)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
