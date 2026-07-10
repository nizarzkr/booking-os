"use client";

import { useMemo, useState } from "react";

import {
  formatFee,
  formatGigDate,
} from "@/components/opportunities/opportunity-types";
import {
  renderTemplate,
  type EmailTemplate,
  type TemplateVars,
} from "@/components/templates/template-types";
import { Field } from "@/components/ui/field";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PreviewContact = { id: string; name: string };
export type PreviewOpportunity = {
  id: string;
  title: string;
  venue: string | null;
  gig_date: string | null;
  fee: number | null;
  city: string | null;
};

type Props = {
  template: EmailTemplate;
  contacts: PreviewContact[];
  opportunities: PreviewOpportunity[];
  artistName: string;
  onClose: () => void;
};

export function TemplatePreviewModal({
  template,
  contacts,
  opportunities,
  artistName,
  onClose,
}: Props) {
  const [contactId, setContactId] = useState<string>(contacts[0]?.id ?? "");
  const [opportunityId, setOpportunityId] = useState<string>(
    opportunities[0]?.id ?? "",
  );

  const vars = useMemo<Partial<TemplateVars>>(() => {
    const contact = contacts.find((c) => c.id === contactId);
    const opp = opportunities.find((o) => o.id === opportunityId);
    return {
      contact_name: contact?.name ?? "",
      artist_name: artistName,
      venue: opp?.venue ?? "",
      gig_date: opp?.gig_date ? formatGigDate(opp.gig_date) : "",
      fee: opp?.fee !== null && opp?.fee !== undefined ? formatFee(opp.fee) : "",
      city: opp?.city ?? "",
    };
  }, [contactId, opportunityId, contacts, opportunities, artistName]);

  const subject = renderTemplate(template.subject, vars);
  const body = renderTemplate(template.body, vars);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Aperçu — {template.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact (aperçu)">
              <Select
                value={contactId}
                onValueChange={(v) => setContactId(String(v ?? ""))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Aucun contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun contact</SelectItem>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Opportunité (aperçu)">
              <Select
                value={opportunityId}
                onValueChange={(v) => setOpportunityId(String(v ?? ""))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Aucune opportunité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune opportunité</SelectItem>
                  {opportunities.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Objet
            </span>
            <p className="text-sm font-semibold">{subject || "—"}</p>
            <div className="my-1 border-t" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Message
            </span>
            <p className="whitespace-pre-wrap text-sm">{body || "—"}</p>
          </div>

          <p className="text-xs text-muted-foreground">
            Les variables sans donnée (ex. pas d&apos;opportunité sélectionnée)
            restent affichées entre accolades.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
