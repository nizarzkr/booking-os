"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Modal,
  MultiSelect,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

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
      if ("error" in res) notifications.show({ color: "red", message: res.error });
      else refresh();
    });
  }

  function handleDeleteStep(step: SequenceStep) {
    startTransition(async () => {
      const res = await deleteStep(step.id, sequence.id);
      if ("error" in res) notifications.show({ color: "red", message: res.error });
      else refresh();
    });
  }

  function handleRename() {
    startTransition(async () => {
      const res = await renameSequence(sequence.id, name);
      if ("error" in res) {
        notifications.show({ color: "red", message: res.error });
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
        notifications.show({ color: "red", message: res.error });
        return;
      }
      router.push("/outreach?tab=sequences");
    });
  }

  function handleStop(enrollmentId: string) {
    startTransition(async () => {
      const res = await stopEnrollment(enrollmentId, sequence.id);
      if ("error" in res) notifications.show({ color: "red", message: res.error });
      else refresh();
    });
  }

  function handleEnroll() {
    if (selectedContacts.length === 0) return;
    startTransition(async () => {
      const res = await enrollContacts(sequence.id, selectedContacts);
      if ("error" in res) {
        notifications.show({ color: "red", message: res.error });
        return;
      }
      notifications.show({ color: "green", message: "Contacts enrôlés." });
      setEnrollOpen(false);
      setSelectedContacts([]);
      refresh();
    });
  }

  return (
    <Stack gap="lg">
      <Anchor component={Link} href="/outreach?tab=sequences" size="sm" c="dimmed">
        ← Prospection
      </Anchor>

      <Group justify="space-between" align="center">
        <Title order={1}>{sequence.name}</Title>
        <Menu position="bottom-end" withArrow>
          <Menu.Target>
            <Button variant="default">Options</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => { setName(sequence.name); setRenameOpen(true); }}>
              Renommer
            </Menu.Item>
            <Menu.Item color="red" onClick={() => setDeleteOpen(true)}>
              Supprimer
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Étapes ------------------------------------------------------------ */}
      <Card withBorder padding="lg">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={700}>Étapes</Text>
            <Button size="xs" onClick={openAddStep}>
              Ajouter une étape
            </Button>
          </Group>

          {steps.length === 0 ? (
            <Text c="dimmed" size="sm">
              Aucune étape. Ajoute un premier email pour démarrer la séquence.
            </Text>
          ) : (
            <Stack gap="sm">
              {steps.map((step, i) => (
                <Card key={step.id} withBorder padding="sm" radius="md">
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="xs">
                        <Badge variant="light" color="violet">
                          Étape {i + 1}
                        </Badge>
                        <Badge variant="light" color="gray">
                          {formatDelay(step.delay_days)}
                        </Badge>
                      </Group>
                      <Text fw={600} size="sm">
                        {step.subject || "(sans objet)"}
                      </Text>
                      <Text c="dimmed" size="xs" lineClamp={2}>
                        {step.body}
                      </Text>
                    </Stack>
                    <Group gap={2} wrap="nowrap">
                      <Tooltip label="Monter" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          aria-label="Monter"
                          disabled={i === 0 || pending}
                          onClick={() => handleMoveStep(step, "up")}
                        >
                          ▲
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Descendre" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          aria-label="Descendre"
                          disabled={i === steps.length - 1 || pending}
                          onClick={() => handleMoveStep(step, "down")}
                        >
                          ▼
                        </ActionIcon>
                      </Tooltip>
                      <Menu position="bottom-end" withArrow>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Actions">
                            ⋯
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item onClick={() => openEditStep(step)}>
                            Modifier
                          </Menu.Item>
                          <Menu.Item color="red" onClick={() => handleDeleteStep(step)}>
                            Supprimer
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Contacts enrôlés -------------------------------------------------- */}
      <Card withBorder padding="lg">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={700}>Contacts enrôlés</Text>
            <Button
              size="xs"
              variant="default"
              onClick={() => setEnrollOpen(true)}
              disabled={steps.length === 0}
            >
              Enrôler des contacts
            </Button>
          </Group>

          {steps.length === 0 && (
            <Text c="dimmed" size="xs">
              Ajoute au moins une étape avant d&apos;enrôler des contacts.
            </Text>
          )}

          {enrollments.length === 0 ? (
            <Text c="dimmed" size="sm">
              Aucun contact enrôlé pour l&apos;instant.
            </Text>
          ) : (
            <Stack gap="xs">
              {enrollments.map((e) => {
                const meta = ENROLLMENT_STATUS_META[e.status];
                return (
                  <Group key={e.id} justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Anchor
                        component={Link}
                        href={`/contacts/${e.contact_id}`}
                        size="sm"
                        fw={500}
                      >
                        {e.contact_name}
                      </Anchor>
                      <Badge color={meta.color} variant="light" size="sm">
                        {meta.label}
                        {e.status === "stopped" && e.stop_reason
                          ? ` · ${STOP_REASON_LABEL[e.stop_reason] ?? e.stop_reason}`
                          : ""}
                      </Badge>
                    </Group>
                    <Group gap="md" wrap="nowrap">
                      {e.status === "active" && (
                        <Text c="dimmed" size="xs">
                          prochaine : {formatNextSend(e.next_send_at)}
                        </Text>
                      )}
                      {e.status === "active" && (
                        <Button
                          size="compact-xs"
                          variant="subtle"
                          color="gray"
                          onClick={() => handleStop(e.id)}
                          disabled={pending}
                        >
                          Arrêter
                        </Button>
                      )}
                    </Group>
                  </Group>
                );
              })}
            </Stack>
          )}
        </Stack>
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
      <Modal opened={renameOpen} onClose={() => setRenameOpen(false)} title="Renommer la séquence" centered>
        <form onSubmit={(e) => { e.preventDefault(); handleRename(); }}>
          <Stack gap="md">
            <TextInput
              label="Nom"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              data-autofocus
              required
            />
            <Group justify="flex-end">
              <Button type="button" variant="subtle" color="gray" onClick={() => setRenameOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" loading={pending}>Enregistrer</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Supprimer la séquence */}
      <Modal opened={deleteOpen} onClose={() => setDeleteOpen(false)} title="Supprimer la séquence" centered>
        <Stack gap="md">
          <Text size="sm">
            Supprimer <b>{sequence.name}</b> ? Les étapes et enrôlements liés
            seront supprimés. Cette action est irréversible.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={() => setDeleteOpen(false)}>
              Annuler
            </Button>
            <Button color="red" onClick={handleDeleteSequence} loading={pending}>
              Supprimer
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Enrôler des contacts */}
      <Modal opened={enrollOpen} onClose={() => setEnrollOpen(false)} title="Enrôler des contacts" centered>
        <Stack gap="md">
          {enrollableContacts.length === 0 ? (
            <Text c="dimmed" size="sm">
              Tous tes contacts sont déjà enrôlés (ou tu n&apos;as pas encore de
              contact).
            </Text>
          ) : (
            <MultiSelect
              label="Contacts"
              placeholder="Choisir des contacts"
              data={enrollableContacts.map((c) => ({ value: c.id, label: c.name }))}
              value={selectedContacts}
              onChange={setSelectedContacts}
              searchable
              data-autofocus
            />
          )}
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={() => setEnrollOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEnroll} loading={pending} disabled={selectedContacts.length === 0}>
              Enrôler
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
