"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  deleteOpportunity,
  updateOpportunity,
  type OpportunityInput,
} from "@/app/(app)/opportunities/actions";
import {
  OpportunityFormModal,
  type ContactOption,
  type OrganizationOption,
} from "@/components/opportunities/opportunity-form-modal";
import {
  formatFee,
  formatGigDate,
  STATUS_META,
  STATUS_SELECT_OPTIONS,
  type Opportunity,
} from "@/components/opportunities/opportunity-types";
import { TaskSection } from "@/components/tasks/task-section";
import { type Task } from "@/components/tasks/task-types";
import { SendEmailModal } from "@/components/emails/send-email-modal";
import { EmailHistory, type EmailLog } from "@/components/emails/email-history";
import {
  type EmailTemplate,
  type TemplateVars,
} from "@/components/templates/template-types";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LinkedRef = { id: string; name: string } | null;

type Props = {
  opportunity: Opportunity;
  contact: LinkedRef;
  organization: LinkedRef;
  contactOptions: ContactOption[];
  organizationOptions: OrganizationOption[];
  tasks: Task[];
  contactEmail: string | null;
  templates: EmailTemplate[];
  artistName: string;
  emailLogs: EmailLog[];
};

export function OpportunityDetail({
  opportunity,
  contact,
  organization,
  contactOptions,
  organizationOptions,
  tasks,
  contactEmail,
  templates,
  artistName,
  emailLogs,
}: Props) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const emailVars: Partial<TemplateVars> = {
    contact_name: contact?.name || undefined,
    artist_name: artistName || undefined,
    venue: opportunity.venue || undefined,
    city: opportunity.city || undefined,
    gig_date: opportunity.gig_date
      ? formatGigDate(opportunity.gig_date)
      : undefined,
    fee: opportunity.fee != null ? formatFee(opportunity.fee) : undefined,
  };
  const [isDeleting, startDelete] = useTransition();
  const [isStatusPending, startStatus] = useTransition();

  const meta = STATUS_META[opportunity.status];

  function handleStatusChange(next: string) {
    if (!next || next === opportunity.status) return;
    startStatus(async () => {
      const input: OpportunityInput = {
        title: opportunity.title,
        status: next,
        contact_id: opportunity.contact_id,
        organization_id: opportunity.organization_id,
        gig_date: opportunity.gig_date,
        city: opportunity.city ?? "",
        venue: opportunity.venue ?? "",
        fee: opportunity.fee,
        notes: opportunity.notes ?? "",
      };
      const res = await updateOpportunity(opportunity.id, input);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startDelete(async () => {
      const res = await deleteOpportunity(opportunity.id);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      router.push("/opportunities");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/opportunities"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Opportunités
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{opportunity.title}</h1>
          <StatusBadge color={meta.color}>{meta.label}</StatusBadge>
        </div>
        <div className="flex flex-wrap gap-2">
          {contactEmail && (
            <Button onClick={() => setEmailOpen(true)}>Envoyer un email</Button>
          )}
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Modifier
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmDelete(true)}
          >
            Supprimer
          </Button>
        </div>
      </div>

      {/* Infos */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Statut">
              <Select
                value={opportunity.status}
                onValueChange={(v) => handleStatusChange(String(v))}
                disabled={isStatusPending}
              >
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_SELECT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InfoRow>
            <InfoRow label="Date du gig">
              <span className="text-sm">{formatGigDate(opportunity.gig_date)}</span>
            </InfoRow>
            <InfoRow label="Contact">
              {contact ? (
                <Link
                  href={`/contacts/${contact.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {contact.name}
                </Link>
              ) : (
                <Dash />
              )}
            </InfoRow>
            <InfoRow label="Organisation">
              {organization ? (
                <Link
                  href={`/organizations/${organization.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {organization.name}
                </Link>
              ) : (
                <Dash />
              )}
            </InfoRow>
            <InfoRow label="Ville">
              <Value>{opportunity.city}</Value>
            </InfoRow>
            <InfoRow label="Salle / venue">
              <Value>{opportunity.venue}</Value>
            </InfoRow>
            <InfoRow label="Cachet">
              <span className="font-mono text-sm tabular-nums">
                {formatFee(opportunity.fee)}
              </span>
            </InfoRow>
          </div>
          {opportunity.notes && (
            <div className="border-t pt-4">
              <InfoRow label="Notes">
                <p className="whitespace-pre-wrap text-sm">
                  {opportunity.notes}
                </p>
              </InfoRow>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tâches liées à cette opportunité */}
      <TaskSection tasks={tasks} presetOpportunityId={opportunity.id} />

      <EmailHistory logs={emailLogs} />

      {editOpen && (
        <OpportunityFormModal
          key={opportunity.id}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            router.refresh();
          }}
          opportunity={opportunity}
          contactOptions={contactOptions}
          organizationOptions={organizationOptions}
        />
      )}

      {emailOpen && contactEmail && (
        <SendEmailModal
          onClose={() => setEmailOpen(false)}
          onSent={() => {
            setEmailOpen(false);
            router.refresh();
          }}
          defaultTo={contactEmail}
          templates={templates}
          vars={emailVars}
          contactId={opportunity.contact_id}
          opportunityId={opportunity.id}
        />
      )}

      <Dialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;opportunité</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Supprimer <b className="text-foreground">{opportunity.title}</b> ?
            Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function Value({ children }: { children: string | null }) {
  return children ? <span className="text-sm">{children}</span> : <Dash />;
}

function Dash() {
  return <span className="text-sm text-muted-foreground">—</span>;
}
