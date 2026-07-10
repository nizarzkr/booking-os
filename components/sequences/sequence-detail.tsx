"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";

import {
  deleteSequence,
  deleteStep,
  enrollContacts,
  moveStep,
  renameSequence,
  stopEnrollment,
} from "@/app/(app)/sequences/actions";
import { StepFormModal } from "@/components/sequences/step-form-modal";
import {
  ENROLLMENT_STATUS_META,
  STOP_REASON_LABEL,
  formatDelay,
  formatNextSend,
  type EnrollmentRow,
  type Sequence,
  type SequenceStep,
} from "@/components/sequences/sequence-types";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
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

type ContactOption = { id: string; name: string };

type Props = {
  sequence: Sequence;
  steps: SequenceStep[];
  enrollments: EnrollmentRow[];
  enrollableContacts: ContactOption[];
};

export function SequenceDetail({
  sequence,
  steps,
  enrollments,
  enrollableContacts,
}: Props) {
  const router = useRouter();

  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<SequenceStep | null>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState(sequence.name);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const [pending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function openAddStep() {
    setEditingStep(null);
    setStepModalOpen(true);
  }
  function openEditStep(step: SequenceStep) {
    setEditingStep(step);
    setStepModalOpen(true);
  }

  function handleMoveStep(step: SequenceStep, dir: "up" | "down") {
    startTransition(async () => {
      const res = await moveStep(step.id, sequence.id, dir);
      if ("error" in res) toast.error(res.error);
      else refresh();
    });
  }

  function handleDeleteStep(step: SequenceStep) {
    startTransition(async () => {
      const res = await deleteStep(step.id, sequence.id);
      if ("error" in res) toast.error(res.error);
      else refresh();
    });
  }

  function handleRename(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await renameSequence(sequence.id, name);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      setRenameOpen(false);
      refresh();
    });
  }

  function handleDeleteSequence() {
    startTransition(async () => {
      const res = await deleteSequence(sequence.id);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      router.push("/outreach?tab=sequences");
    });
  }

  function handleStop(enrollmentId: string) {
    startTransition(async () => {
      const res = await stopEnrollment(enrollmentId, sequence.id);
      if ("error" in res) toast.error(res.error);
      else refresh();
    });
  }

  function toggleContact(id: string) {
    setSelectedContacts((cur) =>
      cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id],
    );
  }

  function handleEnroll() {
    if (selectedContacts.length === 0) return;
    startTransition(async () => {
      const res = await enrollContacts(sequence.id, selectedContacts);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Contacts enrôlés.");
      setEnrollOpen(false);
      setSelectedContacts([]);
      refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/outreach?tab=sequences"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Prospection
      </Link>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{sequence.name}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Options
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                setName(sequence.name);
                setRenameOpen(true);
              }}
            >
              Renommer
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Étapes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Étapes</CardTitle>
            <Button size="sm" onClick={openAddStep}>
              Ajouter une étape
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune étape. Ajoute un premier email pour démarrer la séquence.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {steps.map((step, i) => (
                <div
                  key={step.id}
                  className="flex items-start justify-between gap-3 rounded-xl border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex gap-1.5">
                      <StatusBadge color="violet">Étape {i + 1}</StatusBadge>
                      <StatusBadge color="gray">
                        {formatDelay(step.delay_days)}
                      </StatusBadge>
                    </div>
                    <p className="text-sm font-semibold">
                      {step.subject || "(sans objet)"}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <button
                      type="button"
                      aria-label="Monter"
                      disabled={i === 0 || pending}
                      onClick={() => handleMoveStep(step, "up")}
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Descendre"
                      disabled={i === steps.length - 1 || pending}
                      onClick={() => handleMoveStep(step, "down")}
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronDown className="size-4" />
                    </button>
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
                        <DropdownMenuItem onClick={() => openEditStep(step)}>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteStep(step)}
                        >
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacts enrôlés */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contacts enrôlés</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEnrollOpen(true)}
              disabled={steps.length === 0}
            >
              Enrôler des contacts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {steps.length === 0 && (
            <p className="mb-2 text-xs text-muted-foreground">
              Ajoute au moins une étape avant d&apos;enrôler des contacts.
            </p>
          )}

          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun contact enrôlé pour l&apos;instant.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {enrollments.map((e) => {
                const meta = ENROLLMENT_STATUS_META[e.status];
                return (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/contacts/${e.contact_id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {e.contact_name}
                      </Link>
                      <StatusBadge color={meta.color}>
                        {meta.label}
                        {e.status === "stopped" && e.stop_reason
                          ? ` · ${STOP_REASON_LABEL[e.stop_reason] ?? e.stop_reason}`
                          : ""}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center gap-3">
                      {e.status === "active" && (
                        <span className="text-xs text-muted-foreground">
                          prochaine : {formatNextSend(e.next_send_at)}
                        </span>
                      )}
                      {e.status === "active" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStop(e.id)}
                          disabled={pending}
                        >
                          Arrêter
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {stepModalOpen && (
        <StepFormModal
          key={editingStep?.id ?? "new"}
          sequenceId={sequence.id}
          step={editingStep}
          onClose={() => setStepModalOpen(false)}
          onSaved={() => {
            setStepModalOpen(false);
            refresh();
          }}
        />
      )}

      {/* Renommer */}
      <Dialog
        open={renameOpen}
        onOpenChange={(open) => {
          if (!open) setRenameOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer la séquence</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="flex flex-col gap-4">
            <Field label="Nom" htmlFor="rename" required>
              <Input
                id="rename"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRenameOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "…" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Supprimer la séquence */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la séquence</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Supprimer <b className="text-foreground">{sequence.name}</b> ? Les
            étapes et enrôlements liés seront supprimés. Cette action est
            irréversible.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSequence}
              disabled={pending}
            >
              {pending ? "…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enrôler des contacts */}
      <Dialog
        open={enrollOpen}
        onOpenChange={(open) => {
          if (!open) setEnrollOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enrôler des contacts</DialogTitle>
          </DialogHeader>
          {enrollableContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tous tes contacts sont déjà enrôlés (ou tu n&apos;as pas encore de
              contact).
            </p>
          ) : (
            <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
              {enrollableContacts.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-sm hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedContacts.includes(c.id)}
                    onCheckedChange={() => toggleContact(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEnrollOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleEnroll}
              disabled={selectedContacts.length === 0 || pending}
            >
              {pending
                ? "…"
                : `Enrôler${selectedContacts.length > 0 ? ` (${selectedContacts.length})` : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
