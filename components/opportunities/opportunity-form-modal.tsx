"use client";

import { useState } from "react";

import {
  createOpportunity,
  updateOpportunity,
  type OpportunityInput,
} from "@/app/(app)/opportunities/actions";
import {
  STATUS_SELECT_OPTIONS,
  type Opportunity,
  type OpportunityStatus,
} from "@/components/opportunities/opportunity-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { DatePicker } from "@/components/ui/date-picker";
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

export type ContactOption = { value: string; label: string };
export type OrganizationOption = { value: string; label: string };

type Props = {
  onClose: () => void;
  onSaved: () => void;
  opportunity: Opportunity | null; // null = création
  contactOptions: ContactOption[];
  organizationOptions: OrganizationOption[];
};

export function OpportunityFormModal({
  onClose,
  onSaved,
  opportunity,
  contactOptions,
  organizationOptions,
}: Props) {
  const [title, setTitle] = useState(opportunity?.title ?? "");
  const [status, setStatus] = useState<OpportunityStatus>(
    opportunity?.status ?? "prospect",
  );
  const [contactId, setContactId] = useState<string>(
    opportunity?.contact_id ?? "",
  );
  const [organizationId, setOrganizationId] = useState<string>(
    opportunity?.organization_id ?? "",
  );
  const [gigDate, setGigDate] = useState<string | null>(
    opportunity?.gig_date ?? null,
  );
  const [city, setCity] = useState(opportunity?.city ?? "");
  const [venue, setVenue] = useState(opportunity?.venue ?? "");
  const [fee, setFee] = useState<string>(
    opportunity?.fee != null ? String(opportunity.fee) : "",
  );
  const [notes, setNotes] = useState(opportunity?.notes ?? "");

  const [titleError, setTitleError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("Ce champ est requis.");
      return;
    }
    setTitleError(undefined);
    setLoading(true);
    setServerError(null);

    const feeNum = fee.trim() === "" ? null : Number(fee);
    const input: OpportunityInput = {
      title,
      status,
      contact_id: contactId || null,
      organization_id: organizationId || null,
      gig_date: gigDate,
      city,
      venue,
      fee: feeNum != null && !Number.isNaN(feeNum) ? feeNum : null,
      notes,
    };
    const result = opportunity
      ? await updateOpportunity(opportunity.id, input)
      : await createOpportunity(input);
    setLoading(false);

    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    onSaved();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? "Modifier l'opportunité" : "Nouvelle opportunité"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <Field label="Titre" htmlFor="title" required error={titleError}>
            <Input
              id="title"
              placeholder="Concert au Bikini — automne 2026"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Statut">
              <Select
                value={status}
                onValueChange={(v) => setStatus(String(v) as OpportunityStatus)}
              >
                <SelectTrigger className="w-full">
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
            </Field>
            <Field label="Date du gig" htmlFor="gig_date">
              <DatePicker id="gig_date" value={gigDate} onChange={setGigDate} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact">
              <Select
                value={contactId}
                onValueChange={(v) => setContactId(String(v ?? ""))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {contactOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Organisation">
              <Select
                value={organizationId}
                onValueChange={(v) => setOrganizationId(String(v ?? ""))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune</SelectItem>
                  {organizationOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ville" htmlFor="city">
              <Input
                id="city"
                placeholder="Toulouse"
                value={city}
                onChange={(e) => setCity(e.currentTarget.value)}
              />
            </Field>
            <Field label="Salle / venue" htmlFor="venue">
              <Input
                id="venue"
                placeholder="Le Bikini"
                value={venue}
                onChange={(e) => setVenue(e.currentTarget.value)}
              />
            </Field>
          </div>

          <Field label="Cachet (€)" htmlFor="fee">
            <Input
              id="fee"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="1200"
              value={fee}
              onChange={(e) => setFee(e.currentTarget.value)}
            />
          </Field>

          <Field label="Notes" htmlFor="notes">
            <Textarea
              id="notes"
              placeholder="Contexte, conditions, contacts sur place…"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Enregistrement…"
                : opportunity
                  ? "Enregistrer"
                  : "Créer l'opportunité"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
