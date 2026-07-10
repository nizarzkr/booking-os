"use client";

import { useState } from "react";

import {
  createTask,
  updateTask,
  type TaskInput,
} from "@/app/(app)/tasks/actions";
import { type Task } from "@/components/tasks/task-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export type LinkOption = { value: string; label: string };

type Props = {
  onClose: () => void;
  onSaved: () => void;
  task: Task | null; // null = création
  opportunityOptions: LinkOption[];
  contactOptions: LinkOption[];
  presetOpportunityId?: string | null;
  presetContactId?: string | null;
  lockLinks?: boolean;
};

export function TaskFormModal({
  onClose,
  onSaved,
  task,
  opportunityOptions,
  contactOptions,
  presetOpportunityId = null,
  presetContactId = null,
  lockLinks = false,
}: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [dueDate, setDueDate] = useState<string | null>(task?.due_date ?? null);
  const [opportunityId, setOpportunityId] = useState<string>(
    task?.opportunity_id ?? presetOpportunityId ?? "",
  );
  const [contactId, setContactId] = useState<string>(
    task?.contact_id ?? presetContactId ?? "",
  );

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

    const input: TaskInput = {
      title,
      due_date: dueDate,
      opportunity_id: opportunityId || null,
      contact_id: contactId || null,
    };
    const result = task
      ? await updateTask(task.id, input)
      : await createTask(input);
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
            {task ? "Modifier la tâche" : "Nouvelle tâche"}
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
              placeholder="Relancer pour la date d'automne"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />
          </Field>

          <Field label="Échéance" htmlFor="due_date">
            <DatePicker id="due_date" value={dueDate} onChange={setDueDate} />
          </Field>

          {!lockLinks && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Opportunité">
                <Select
                  value={opportunityId}
                  onValueChange={(v) => setOpportunityId(String(v ?? ""))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucune</SelectItem>
                    {opportunityOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
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
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Enregistrement…"
                : task
                  ? "Enregistrer"
                  : "Créer la tâche"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
