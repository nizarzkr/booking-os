"use client";

import { useState } from "react";

import { createContact, updateContact } from "@/app/(app)/contacts/actions";
import {
  EMAIL_RE,
  type ContactInput,
} from "@/components/contacts/contact-input";
import { ROLE_SELECT_OPTIONS, type Contact } from "@/components/contacts/roles";
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
  contact: Contact | null; // null = création
};

const ROLE_OPTIONS = [{ value: "", label: "Aucun rôle" }, ...ROLE_SELECT_OPTIONS];

/**
 * Monté uniquement quand le formulaire est ouvert (voir ContactsView), et
 * remonté via `key` selon la cible → valeurs initiales fraîches.
 */
export function ContactFormModal({ onClose, onSaved, contact }: Props) {
  const [firstName, setFirstName] = useState(contact?.first_name ?? "");
  const [lastName, setLastName] = useState(contact?.last_name ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [role, setRole] = useState<string>(contact?.role ?? "");
  const [notes, setNotes] = useState(contact?.notes ?? "");

  const [errors, setErrors] = useState<{ first_name?: string; email?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function validate() {
    const next: { first_name?: string; email?: string } = {};
    if (!firstName.trim()) next.first_name = "Ce champ est requis.";
    if (email && !EMAIL_RE.test(email)) next.email = "Email invalide.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError(null);
    const input: ContactInput = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      role: role || null,
      notes,
    };
    const result = contact
      ? await updateContact(contact.id, input)
      : await createContact(input);
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
            {contact ? "Modifier le contact" : "Nouveau contact"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Prénom / nom"
              htmlFor="first_name"
              required
              error={errors.first_name}
            >
              <Input
                id="first_name"
                placeholder="Camille Durand"
                value={firstName}
                onChange={(e) => setFirstName(e.currentTarget.value)}
              />
            </Field>
            <Field label="Nom (optionnel)" htmlFor="last_name">
              <Input
                id="last_name"
                placeholder="Durand"
                value={lastName}
                onChange={(e) => setLastName(e.currentTarget.value)}
              />
            </Field>
          </div>

          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              placeholder="camille@salle.fr"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone" htmlFor="phone">
              <Input
                id="phone"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.currentTarget.value)}
              />
            </Field>
            <Field label="Rôle">
              <Select
                value={role}
                onValueChange={(v) => setRole(String(v ?? ""))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir…" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Notes" htmlFor="notes">
            <Textarea
              id="notes"
              placeholder="Contexte, historique, préférences…"
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
                : contact
                  ? "Enregistrer"
                  : "Créer le contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
