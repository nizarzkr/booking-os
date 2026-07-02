"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { deleteTask, setTaskDone } from "@/app/(app)/tasks/actions";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { dueMeta, formatDueDate, type Task } from "@/components/tasks/task-types";

type Props = {
  tasks: Task[];
  // La tâche créée depuis cette fiche est pré-liée à l'entité (l'un des deux).
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
        notifications.show({ color: "red", message: res.error });
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
        notifications.show({ color: "red", message: res.error });
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card withBorder padding="lg">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text fw={700} size="sm">
            Tâches
          </Text>
          <Button size="compact-sm" onClick={() => setFormOpen(true)}>
            Ajouter une tâche
          </Button>
        </Group>

        {tasks.length === 0 ? (
          <Text c="dimmed" size="sm">
            Aucune tâche. Ajoute une relance ou un rappel.
          </Text>
        ) : (
          <Stack gap="xs">
            {tasks.map((t) => {
              const meta = dueMeta(t);
              return (
                <Group key={t.id} justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <Checkbox
                      checked={t.done}
                      onChange={() => toggleDone(t)}
                      disabled={togglingId === t.id}
                      aria-label="Marquer comme fait"
                    />
                    <Text
                      size="sm"
                      fw={500}
                      td={t.done ? "line-through" : undefined}
                      c={t.done ? "dimmed" : undefined}
                    >
                      {t.title}
                    </Text>
                    <Text c="dimmed" size="sm">
                      {formatDueDate(t.due_date)}
                    </Text>
                    {meta && (
                      <Badge
                        color={meta.color}
                        variant="light"
                        size="sm"
                      >
                        {meta.label}
                      </Badge>
                    )}
                  </Group>
                  <Button
                    variant="subtle"
                    color="gray"
                    size="compact-sm"
                    onClick={() => remove(t)}
                    disabled={deletingId === t.id}
                  >
                    Supprimer
                  </Button>
                </Group>
              );
            })}
          </Stack>
        )}
      </Stack>

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
