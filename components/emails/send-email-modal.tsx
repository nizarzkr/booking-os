"use client";

import { useState } from "react";
import { toast } from "sonner";

import { sendEmail } from "@/app/(app)/emails/actions";
import {
  renderTemplate,
  type EmailTemplate,
  type TemplateVars,
} from "@/components/templates/template-types";
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
  onSent: () => void;
  defaultTo: string;
  templates: EmailTemplate[];
  vars: Partial<TemplateVars>;
  contactId: string | null;
  opportunityId: string | null;
};

/**
 * Monté uniquement à l'ouverture (état frais). Choisir un template pré-remplit
 * objet + corps avec les variables résolues ; tout reste éditable avant envoi.
 */
export function SendEmailModal({
  onClose,
  onSent,
  defaultTo,
  templates,
  vars,
  contactId,
  opportunityId,
}: Props) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyTemplate(id: string) {
    setTemplateId(id);
    if (!id) return;
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setSubject(renderTemplate(tpl.subject, vars));
    setBody(renderTemplate(tpl.body, vars));
  }

  async function handleSend() {
    setLoading(true);
    setError(null);
    const result = await sendEmail({
      to,
      subject,
      body,
      contactId,
      opportunityId,
    });
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    toast.success("Email envoyé.");
    onSent();
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
          <DialogTitle>Envoyer un email</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {templates.length > 0 && (
            <Field label="Template">
              <Select
                value={templateId}
                onValueChange={(v) => applyTemplate(String(v ?? ""))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Partir d'un template (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun template</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <Field label="Destinataire" htmlFor="to" required>
            <Input
              id="to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.currentTarget.value)}
            />
          </Field>
          <Field label="Objet" htmlFor="subject" required>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.currentTarget.value)}
            />
          </Field>
          <Field label="Message" htmlFor="body" required>
            <Textarea
              id="body"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.currentTarget.value)}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSend} disabled={loading}>
            {loading ? "Envoi…" : "Envoyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
