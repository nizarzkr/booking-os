"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Checkbox,
  Group,
  Menu,
  Modal,
  Select,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

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
        notifications.show({ color: "red", message: res.error });
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
      <Group justify="space-between" align="center" mb="lg">
        <Text c="dimmed" size="sm">
          {tasks.length} tâche{tasks.length > 1 ? "s" : ""}
        </Text>
        <Button onClick={openCreate}>Ajouter une tâche</Button>
      </Group>

      {tasks.length === 0 ? (
        <Stack align="center" gap="xs" py={64}>
          <Text fw={700}>Aucune tâche pour l&apos;instant</Text>
          <Text c="dimmed" size="sm" ta="center" maw={380}>
            Crée une relance ou un rappel, lié à un contact ou une opportunité,
            pour savoir quoi faire chaque jour.
          </Text>
          <Button onClick={openCreate} mt="sm">
            Ajouter une tâche
          </Button>
        </Stack>
      ) : (
        <Stack gap="md">
          <Group>
            <Select
              data={TASK_FILTER_OPTIONS}
              value={filter}
              onChange={(v) => setFilter((v as TaskFilter) ?? "todo")}
              allowDeselect={false}
              w={220}
            />
          </Group>

          {filtered.length === 0 ? (
            <Text c="dimmed" size="sm" py="xl" ta="center">
              Aucune tâche dans ce filtre.
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={720}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={40} />
                    <Table.Th>Tâche</Table.Th>
                    <Table.Th>Échéance</Table.Th>
                    <Table.Th>Lié à</Table.Th>
                    <Table.Th w={48} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((t) => {
                    const meta = dueMeta(t);
                    return (
                      <Table.Tr key={t.id}>
                        <Table.Td>
                          <Checkbox
                            checked={t.done}
                            onChange={() => toggleDone(t)}
                            disabled={togglingId === t.id}
                            aria-label="Marquer comme fait"
                          />
                        </Table.Td>
                        <Table.Td>
                          <Text
                            size="sm"
                            fw={500}
                            td={t.done ? "line-through" : undefined}
                            c={t.done ? "dimmed" : undefined}
                          >
                            {t.title}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Text size="sm">{formatDueDate(t.due_date)}</Text>
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
                        </Table.Td>
                        <Table.Td>
                          {t.opportunity_id ? (
                            <Anchor
                              component={Link}
                              href={`/opportunities/${t.opportunity_id}`}
                              size="sm"
                            >
                              {t.opportunity_title ?? "Opportunité"}
                            </Anchor>
                          ) : t.contact_id ? (
                            <Anchor
                              component={Link}
                              href={`/contacts/${t.contact_id}`}
                              size="sm"
                            >
                              {t.contact_name ?? "Contact"}
                            </Anchor>
                          ) : (
                            <Text c="dimmed" size="sm">
                              —
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Menu position="bottom-end" withArrow>
                            <Menu.Target>
                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                aria-label="Actions"
                              >
                                ⋯
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item onClick={() => openEdit(t)}>
                                Modifier
                              </Menu.Item>
                              <Menu.Item
                                color="red"
                                onClick={() => setDeleting(t)}
                              >
                                Supprimer
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}

          <Text c="dimmed" size="xs">
            {filtered.length} affichée{filtered.length > 1 ? "s" : ""}
            {filtered.length !== tasks.length ? ` sur ${tasks.length}` : ""}
          </Text>
        </Stack>
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

      <Modal
        opened={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Supprimer la tâche"
        centered
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirmDelete();
          }}
        >
          <Stack gap="md">
            <Text size="sm">
              Supprimer <b>{deleting?.title}</b> ? Cette action est
              irréversible.
            </Text>
            <Group justify="flex-end">
              <Button
                type="button"
                variant="subtle"
                color="gray"
                onClick={() => setDeleting(null)}
              >
                Annuler
              </Button>
              <Button type="submit" color="red" loading={isDeletePending}>
                Supprimer
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
