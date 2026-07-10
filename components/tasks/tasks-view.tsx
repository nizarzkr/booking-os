"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";

import { deleteTask, setTaskDone } from "@/app/(app)/tasks/actions";
import {
  TaskFormModal,
  type LinkOption,
} from "@/components/tasks/task-form-modal";
import {
  dueMeta,
  formatDueDate,
  matchesFilter,
  TASK_FILTER_OPTIONS,
  type Task,
  type TaskFilter,
} from "@/components/tasks/task-types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";

export type TaskListItem = Task & {
  opportunity_title: string | null;
  contact_name: string | null;
};

type Props = {
  tasks: TaskListItem[];
  opportunityOptions: LinkOption[];
  contactOptions: LinkOption[];
};

export function TasksView({
  tasks,
  opportunityOptions,
  contactOptions,
}: Props) {
  const router = useRouter();

  const [filter, setFilter] = useState<TaskFilter>("todo");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startToggle] = useTransition();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const [deleting, setDeleting] = useState<TaskListItem | null>(null);
  const [isDeletePending, startDelete] = useTransition();

  const filtered = useMemo(
    () => tasks.filter((t) => matchesFilter(t, filter)),
    [tasks, filter],
  );

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

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  function handleSaved() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  function confirmDelete() {
    if (!deleting) return;
    startDelete(async () => {
      await deleteTask(deleting.id);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {tasks.length} tâche{tasks.length > 1 ? "s" : ""}
        </p>
        <Button onClick={openCreate}>Ajouter une tâche</Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="font-semibold">Aucune tâche pour l&apos;instant</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Crée une relance ou un rappel, lié à un contact ou une opportunité,
            pour savoir quoi faire chaque jour.
          </p>
          <Button onClick={openCreate} className="mt-2">
            Ajouter une tâche
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Select
            value={filter}
            onValueChange={(v) => setFilter((String(v) as TaskFilter) || "todo")}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucune tâche dans ce filtre.
            </p>
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Tâche</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Lié à</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => {
                    const meta = dueMeta(t);
                    return (
                      <TableRow key={t.id}>
                        <TableCell>
                          <Checkbox
                            checked={t.done}
                            onCheckedChange={() => toggleDone(t)}
                            disabled={togglingId === t.id}
                            aria-label="Marquer comme fait"
                          />
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              t.done && "text-muted-foreground line-through",
                            )}
                          >
                            {t.title}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {formatDueDate(t.due_date)}
                            </span>
                            {meta && (
                              <StatusBadge color={meta.color}>
                                {meta.label}
                              </StatusBadge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {t.opportunity_id ? (
                            <Link
                              href={`/opportunities/${t.opportunity_id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {t.opportunity_title ?? "Opportunité"}
                            </Link>
                          ) : t.contact_id ? (
                            <Link
                              href={`/contacts/${t.contact_id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {t.contact_name ?? "Contact"}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
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
                              <DropdownMenuItem onClick={() => openEdit(t)}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleting(t)}
                              >
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {filtered.length} affichée{filtered.length > 1 ? "s" : ""}
            {filtered.length !== tasks.length ? ` sur ${tasks.length}` : ""}
          </p>
        </div>
      )}

      {formOpen && (
        <TaskFormModal
          key={editing?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
          task={editing}
          opportunityOptions={opportunityOptions}
          contactOptions={contactOptions}
        />
      )}

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la tâche</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Supprimer <b className="text-foreground">{deleting?.title}</b> ?
            Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleting(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletePending}
              onClick={confirmDelete}
            >
              {isDeletePending ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
