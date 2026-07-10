"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteTask, setTaskDone } from "@/app/(app)/tasks/actions";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { dueMeta, formatDueDate, type Task } from "@/components/tasks/task-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

type Props = {
  tasks: Task[];
  presetOpportunityId?: string | null;
  presetContactId?: string | null;
};

/** Section « Tâches » embarquée dans une fiche (oppo/contact) : liste liée +
 *  ajout rapide pré-lié. Édition d'une tâche existante = via la vue /tasks. */
export function TaskSection({
  tasks,
  presetOpportunityId = null,
  presetContactId = null,
}: Props) {
  const router = useRouter();

  const [formOpen, setFormOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startToggle] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startDelete] = useTransition();

  function toggleDone(task: Task) {
    setTogglingId(task.id);
    startToggle(async () => {
      const res = await setTaskDone(task.id, !task.done);
      setTogglingId(null);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  function remove(task: Task) {
    setDeletingId(task.id);
    startDelete(async () => {
      const res = await deleteTask(task.id);
      setDeletingId(null);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tâches</CardTitle>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            Ajouter une tâche
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune tâche. Ajoute une relance ou un rappel.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => {
              const meta = dueMeta(t);
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Checkbox
                      checked={t.done}
                      onCheckedChange={() => toggleDone(t)}
                      disabled={togglingId === t.id}
                      aria-label="Marquer comme fait"
                    />
                    <span
                      className={cn(
                        "truncate text-sm font-medium",
                        t.done && "text-muted-foreground line-through",
                      )}
                    >
                      {t.title}
                    </span>
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDueDate(t.due_date)}
                    </span>
                    {meta && (
                      <StatusBadge color={meta.color}>{meta.label}</StatusBadge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(t)}
                    disabled={deletingId === t.id}
                  >
                    Supprimer
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      {formOpen && (
        <TaskFormModal
          key="new"
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            router.refresh();
          }}
          task={null}
          opportunityOptions={[]}
          contactOptions={[]}
          presetOpportunityId={presetOpportunityId}
          presetContactId={presetContactId}
          lockLinks
        />
      )}
    </Card>
  );
}
