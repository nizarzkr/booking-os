"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import { deleteOpportunity } from "@/app/(app)/opportunities/actions";
import {
  OpportunityFormModal,
  type ContactOption,
  type OrganizationOption,
} from "@/components/opportunities/opportunity-form-modal";
import { PipelineView } from "@/components/opportunities/pipeline-view";
import { OpportunityCalendar } from "@/components/opportunities/opportunity-calendar";
import {
  formatFee,
  formatGigDate,
  STATUS_FILTER_OPTIONS,
  STATUS_META,
  type Opportunity,
} from "@/components/opportunities/opportunity-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Segmented } from "@/components/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type OpportunityListItem = Opportunity & {
  contact_name: string | null;
  organization_name: string | null;
};

export type DatesViewMode = "kanban" | "list" | "calendar";

type Props = {
  opportunities: OpportunityListItem[];
  contactOptions: ContactOption[];
  organizationOptions: OrganizationOption[];
  initialView?: DatesViewMode;
};

export function OpportunitiesView({
  opportunities,
  contactOptions,
  organizationOptions,
  initialView = "kanban",
}: Props) {
  const [view, setView] = useState<DatesViewMode>(initialView);

  // On synchronise l'URL (?view=…) sans refetch : l'état local reste la source
  // de vérité, mais la vue courante devient partageable / persistante au reload.
  function changeView(next: DatesViewMode) {
    setView(next);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?view=${next}`,
    );
  }

  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);

  const [deleting, setDeleting] = useState<OpportunityListItem | null>(null);
  const [isDeletePending, startDelete] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return opportunities.filter((o) => {
      if (status && o.status !== status) return false;
      if (!q) return true;
      return (
        o.title.toLowerCase().includes(q) ||
        (o.city ?? "").toLowerCase().includes(q) ||
        (o.venue ?? "").toLowerCase().includes(q) ||
        (o.contact_name ?? "").toLowerCase().includes(q) ||
        (o.organization_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [opportunities, search, status]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(opportunity: Opportunity) {
    setEditing(opportunity);
    setFormOpen(true);
  }

  function handleSaved() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  function confirmDelete() {
    if (!deleting) return;
    startDelete(async () => {
      await deleteOpportunity(deleting.id);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        {opportunities.length > 0 ? (
          <Segmented
            value={view}
            onChange={changeView}
            options={[
              { label: "Kanban", value: "kanban" },
              { label: "Liste", value: "list" },
              { label: "Calendrier", value: "calendar" },
            ]}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {opportunities.length} date{opportunities.length > 1 ? "s" : ""}
          </p>
        )}
        <Button onClick={openCreate}>Ajouter une date</Button>
      </div>

      {opportunities.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="font-semibold">Aucune date pour l&apos;instant</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Crée ta première date pour suivre une piste de concert, de la prise
            de contact jusqu&apos;au concert confirmé.
          </p>
          <Button onClick={openCreate} className="mt-2">
            Ajouter une date
          </Button>
        </div>
      ) : view === "kanban" ? (
        <PipelineView opportunities={opportunities} />
      ) : view === "calendar" ? (
        <OpportunityCalendar opportunities={opportunities} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Rechercher un titre, une ville, un contact…"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              className="sm:flex-1"
            />
            <Select
              value={status}
              onValueChange={(v) => setStatus(String(v ?? ""))}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucune date ne correspond à ta recherche.
            </p>
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Contact / Organisation</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Cachet</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => {
                    const meta = STATUS_META[o.status];
                    const who = o.contact_name ?? o.organization_name;
                    const place = [o.venue, o.city].filter(Boolean).join(" · ");
                    return (
                      <TableRow key={o.id}>
                        <TableCell>
                          <Link
                            href={`/opportunities/${o.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {o.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusBadge color={meta.color}>
                            {meta.label}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {who ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {place || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatGigDate(o.gig_date)}
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {formatFee(o.fee)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Actions"
                                />
                              }
                            >
                              <MoreHorizontal />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openEdit(o)}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleting(o)}
                              >
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {filtered.length} affichée{filtered.length > 1 ? "s" : ""}
            {filtered.length !== opportunities.length
              ? ` sur ${opportunities.length}`
              : ""}
          </p>
        </div>
      )}

      {formOpen && (
        <OpportunityFormModal
          key={editing?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
          opportunity={editing}
          contactOptions={contactOptions}
          organizationOptions={organizationOptions}
        />
      )}

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la date</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Supprimer <b className="text-foreground">{deleting?.title}</b> ?
            Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleting(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletePending}
              onClick={confirmDelete}
            >
              {isDeletePending ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
