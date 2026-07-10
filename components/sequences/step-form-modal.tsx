"use client";

import { useState } from "react";
import { toast } from "sonner";

import { addStep, updateStep } from "@/app/(app)/sequences/actions";
import { TEMPLATE_VARIABLES } from "@/components/templates/template-types";
import { type SequenceStep } from "@/components/sequences/sequence-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  sequenceId: string;
  step: SequenceStep | null;
  onClose: () => void;
  onSaved: () => void;
};

export function StepFormModal({ sequenceId, step, onClose, onSaved }: Props) {
  const [delayDays, setDelayDays] = useState<string>(
    String(step?.delay_days ?? 0),
  );
  const [subject, setSubject] = useState(step?.subject ?? "");
  const [body, setBody] = useState(step?.body ?? "");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const payload = {
      delay_days: Number(delayDays) || 0,
      subject,
      body,
    };
    const res = step
      ? await updateStep(step.id, sequenceId, payload)
      : await addStep(sequenceId, payload);
    setPending(false);
    if ("error" in res) {
      toast.error(res.error);
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
            {step ? "Modifier l'étape" : "Ajouter une étape"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Délai avant envoi (jours)"
            htmlFor="delay"
            hint="0 = envoi immédiat à l'enrôlement (ou juste après l'étape précédente)."
          >
            <Input
              id="delay"
              type="number"
              min={0}
              max={365}
              value={delayDays}
              onChange={(e) => setDelayDays(e.currentTarget.value)}
            />
          </Field>
          <Field label="Objet" htmlFor="step_subject" required>
            <Input
              id="step_subject"
              placeholder="Ex. Une date chez vous ?"
              value={subject}
              onChange={(e) => setSubject(e.currentTarget.value)}
              required
            />
          </Field>
          <Field label="Message" htmlFor="step_body" required>
            <Textarea
              id="step_body"
              placeholder="Bonjour {{contact_name}}, …"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.currentTarget.value)}
              required
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            Variables :{" "}
            {TEMPLATE_VARIABLES.map((v) => `{{${v.key}}}`).join(" · ")}
          </p>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "…" : step ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
