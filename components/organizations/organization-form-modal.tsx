"use client";

import { useState } from "react";

import {
  createOrganization,
  updateOrganization,
  type OrganizationInput,
} from "@/app/(app)/organizations/actions";
import {
  ORG_TYPE_SELECT_OPTIONS,
  type Organization,
} from "@/components/organizations/org-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  onClose: () => void;
  onSaved: () => void;
  organization: Organization | null; // null = création
};

const TYPE_OPTIONS = [
  { value: "", label: "Aucun type" },
  ...ORG_TYPE_SELECT_OPTIONS,
];

export function OrganizationFormModal({ onClose, onSaved, organization }: Props) {
  const [name, setName] = useState(organization?.name ?? "");
  const [type, setType] = useState<string>(organization?.type ?? "");
  const [city, setCity] = useState(organization?.city ?? "");
  const [country, setCountry] = useState(organization?.country ?? "");
  const [website, setWebsite] = useState(organization?.website ?? "");
  const [notes, setNotes] = useState(organization?.notes ?? "");

  const [nameError, setNameError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Ce champ est requis.");
      return;
    }
    setNameError(undefined);
    setLoading(true);
    setServerError(null);

    const input: OrganizationInput = {
      name,
      type: type || null,
      city,
      country,
      website,
      notes,
    };
    const result = organization
      ? await updateOrganization(organization.id, input)
      : await createOrganization(input);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {organization ? "Modifier l'organisation" : "Nouvelle organisation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom" htmlFor="name" required error={nameError}>
              <Input
                id="name"
                placeholder="La Maroquinerie"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </Field>
            <Field label="Type">
              <Select
                value={type}
                onValueChange={(v) => setType(String(v ?? ""))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir…" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
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
                placeholder="Paris"
                value={city}
                onChange={(e) => setCity(e.currentTarget.value)}
              />
            </Field>
            <Field label="Pays" htmlFor="country">
              <Input
                id="country"
                placeholder="France"
                value={country}
                onChange={(e) => setCountry(e.currentTarget.value)}
              />
            </Field>
          </div>

          <Field label="Site web" htmlFor="website">
            <Input
              id="website"
              placeholder="https://…"
              value={website}
              onChange={(e) => setWebsite(e.currentTarget.value)}
            />
          </Field>

          <Field label="Notes" htmlFor="notes">
            <Textarea
              id="notes"
              placeholder="Jauge, style, contexte…"
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
                : organization
                  ? "Enregistrer"
                  : "Créer l'organisation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
