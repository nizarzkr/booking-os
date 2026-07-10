"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
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
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-semibold">Aujourd&apos;hui</h1>
        <p className="text-sm capitalize text-muted-foreground">{todayLabel}</p>
      </div>

      {/* Démarrage (masqué une fois les 3 étapes faites) */}
      <GettingStarted setup={setup} />

      {/* Nouvelles réponses entrantes */}
      {counts.unreadInbox > 0 && (
        <Link
          href="/outreach?tab=inbox"
          className="interactive-card block rounded-xl"
        >
          <Card className="ring-primary/40">
            <CardContent className="flex items-center gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">
                {counts.unreadInbox}
              </span>
              <span className="text-sm font-medium">
                {counts.unreadInbox > 1
                  ? "nouvelles réponses à lire"
                  : "nouvelle réponse à lire"}
              </span>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Compteurs rapides */}
      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      {/* À relancer aujourd'hui */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>À relancer aujourd&apos;hui</CardTitle>
            <Link
              href="/tasks"
              className="text-sm text-primary hover:underline"
            >
              Toutes les tâches
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {relance.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Rien à relancer aujourd&apos;hui. 🎉
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {relance.map((t) => {
                const meta = dueMeta({ due_date: t.due_date, done: false });
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {t.title}
                      </span>
                      {meta && (
                        <StatusBadge color={meta.color}>
                          {meta.label}
                        </StatusBadge>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {t.href && t.linkLabel && (
                        <Link
                          href={t.href}
                          className="text-sm text-primary hover:underline"
                        >
                          {t.linkLabel}
                        </Link>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatDueDate(t.due_date)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Prochaines dates confirmées */}
        <Card>
          <CardHeader>
            <CardTitle>Prochaines dates confirmées</CardTitle>
            <p className="text-xs text-muted-foreground">
              Dans les 30 prochains jours
            </p>
          </CardHeader>
          <CardContent>
            {confirmed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune date confirmée à venir.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {confirmed.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <Link
                      href={`/opportunities/${o.id}`}
                      className="truncate text-sm font-medium text-primary hover:underline"
                    >
                      {o.title}
                    </Link>
                    <div className="flex shrink-0 items-center gap-3">
                      {o.fee !== null && (
                        <span className="font-mono text-sm tabular-nums">
                          {formatFee(o.fee)}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatGigDate(o.gig_date)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Options en cours */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Options en cours</CardTitle>
              <StatusBadge color={STATUS_META.option.color}>
                {STATUS_META.option.label}
              </StatusBadge>
            </div>
          </CardHeader>
          <CardContent>
            {options.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune option en attente.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {options.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <Link
                      href={`/opportunities/${o.id}`}
                      className="truncate text-sm font-medium text-primary hover:underline"
                    >
                      {o.title}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {formatGigDate(o.gig_date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
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
    <Link href={href} className="interactive-card block rounded-xl">
      <Card>
        <CardContent className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "font-mono text-3xl font-semibold leading-tight tabular-nums",
              alert && "text-destructive",
            )}
          >
            {value}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
