"use client";

import { useState } from "react";

import {
  createTemplate,
  updateTemplate,
  type TemplateInput,
} from "@/app/(app)/templates/actions";
import {
  TEMPLATE_VARIABLES,
  type EmailTemplate,
} from "@/components/templates/template-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
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
  template: EmailTemplate | null; // null = création
};

export function TemplateFormModal({ onClose, onSaved, template }: Props) {
  const [name, setName] = useState(template?.name ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");

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

    const input: TemplateInput = { name, subject, body };
    const result = template
      ? await updateTemplate(template.id, input)
      : await createTemplate(input);
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
            {template ? "Modifier le modèle" : "Nouveau modèle"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <Field label="Nom du modèle" htmlFor="tpl_name" required error={nameError}>
            <Input
              id="tpl_name"
              placeholder="Prise de contact — première approche"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </Field>

          <Field label="Objet de l'email" htmlFor="tpl_subject">
            <Input
              id="tpl_subject"
              placeholder="Proposition de date — {{artist_name}}"
              value={subject}
              onChange={(e) => setSubject(e.currentTarget.value)}
            />
          </Field>

          <Field label="Corps du message" htmlFor="tpl_body">
            <Textarea
              id="tpl_body"
              placeholder={"Bonjour {{contact_name}},\n\nJe me permets de vous contacter…"}
              rows={6}
              value={body}
              onChange={(e) => setBody(e.currentTarget.value)}
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-muted-foreground">
              Variables disponibles (à copier dans l&apos;objet ou le corps)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_VARIABLES.map((v) => (
                <StatusBadge key={v.key} color="violet">
                  {`{{${v.key}}}`}
                </StatusBadge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Enregistrement…"
                : template
                  ? "Enregistrer"
                  : "Créer le modèle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
