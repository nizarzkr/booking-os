"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import {
  deleteOpportunity,
  updateOpportunity,
  type OpportunityInput,
} from "@/app/(app)/opportunities/actions";
import {
  OpportunityFormModal,
  type ContactOption,
  type OrganizationOption,
} from "@/components/opportunities/opportunity-form-modal";
import {
  formatFee,
  formatGigDate,
  STATUS_META,
  STATUS_SELECT_OPTIONS,
  type Opportunity,
} from "@/components/opportunities/opportunity-types";
import { TaskSection } from "@/components/tasks/task-section";
import { type Task } from "@/components/tasks/task-types";

type LinkedRef = { id: string; name: string } | null;

type Props = {
  opportunity: Opportunity;
  contact: LinkedRef;
  organization: LinkedRef;
  contactOptions: ContactOption[];
  organizationOptions: OrganizationOption[];
  tasks: Task[];
};

export function OpportunityDetail({
  opportunity,
  contact,
  organization,
  contactOptions,
  organizationOptions,
  tasks,
}: Props) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const [isStatusPending, startStatus] = useTransition();

  const meta = STATUS_META[opportunity.status];

  function handleStatusChange(next: string | null) {
    if (!next || next === opportunity.status) return;
    startStatus(async () => {
      const input: OpportunityInput = {
        title: opportunity.title,
        status: next,
        contact_id: opportunity.contact_id,
        organization_id: opportunity.organization_id,
        gig_date: opportunity.gig_date,
        city: opportunity.city ?? "",
        venue: opportunity.venue ?? "",
        fee: opportunity.fee,
        notes: opportunity.notes ?? "",
      };
      const res = await updateOpportunity(opportunity.id, input);
      if ("error" in res) {
        notifications.show({ color: "red", message: res.error });
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startDelete(async () => {
      const res = await deleteOpportunity(opportunity.id);
      if ("error" in res) {
        notifications.show({ color: "red", message: res.error });
        return;
      }
      router.push("/opportunities");
    });
  }

  return (
    <Stack gap="lg">
      <Anchor component={Link} href="/opportunities" size="sm" c="dimmed">
        ← Opportunités
      </Anchor>

      <Group justify="space-between" align="flex-start">
        <Group gap="sm" align="center">
          <Title order={1}>{opportunity.title}</Title>
          <Badge color={meta.color} variant="light">
            {meta.label}
          </Badge>
        </Group>
        <Group>
          <Button variant="default" onClick={() => setEditOpen(true)}>
            Modifier
          </Button>
          <Button
            variant="subtle"
            color="red"
            onClick={() => setConfirmDelete(true)}
          >
            Supprimer
          </Button>
        </Group>
      </Group>

      {/* Infos */}
      <Card withBorder padding="lg">
        <Stack gap="sm">
          <Text fw={700} size="sm">
            Informations
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <InfoRow label="Statut">
              <Select
                data={STATUS_SELECT_OPTIONS}
                value={opportunity.status}
                onChange={handleStatusChange}
                allowDeselect={false}
                disabled={isStatusPending}
                w={200}
              />
            </InfoRow>
            <InfoRow label="Date du gig">
              <Text size="sm">{formatGigDate(opportunity.gig_date)}</Text>
            </InfoRow>
            <InfoRow label="Contact">
              {contact ? (
                <Anchor
                  component={Link}
                  href={`/contacts/${contact.id}`}
                  size="sm"
                  fw={500}
                >
                  {contact.name}
                </Anchor>
              ) : (
                <Dash />
              )}
            </InfoRow>
            <InfoRow label="Organisation">
              {organization ? (
                <Anchor
                  component={Link}
                  href={`/organizations/${organization.id}`}
                  size="sm"
                  fw={500}
                >
                  {organization.name}
                </Anchor>
              ) : (
                <Dash />
              )}
            </InfoRow>
            <InfoRow label="Ville">
              <Value>{opportunity.city}</Value>
            </InfoRow>
            <InfoRow label="Salle / venue">
              <Value>{opportunity.venue}</Value>
            </InfoRow>
            <InfoRow label="Cachet">
              <Text size="sm" ff="monospace">
                {formatFee(opportunity.fee)}
              </Text>
            </InfoRow>
          </SimpleGrid>
          {opportunity.notes && (
            <>
              <Divider />
              <InfoRow label="Notes">
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {opportunity.notes}
                </Text>
              </InfoRow>
            </>
          )}
        </Stack>
      </Card>

      {/* Tâches liées à cette opportunité */}
      <TaskSection tasks={tasks} presetOpportunityId={opportunity.id} />

      {/* À venir */}
      <SoonCard title="Historique des emails" step="étape 5.x" />

      {editOpen && (
        <OpportunityFormModal
          key={opportunity.id}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            router.refresh();
          }}
          opportunity={opportunity}
          contactOptions={contactOptions}
          organizationOptions={organizationOptions}
        />
      )}

      <Modal
        opened={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Supprimer l'opportunité"
        centered
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDelete();
          }}
        >
          <Stack gap="md">
            <Text size="sm">
              Supprimer <b>{opportunity.title}</b> ? Cette action est
              irréversible.
            </Text>
            <Group justify="flex-end">
              <Button
                type="button"
                variant="subtle"
                color="gray"
                onClick={() => setConfirmDelete(false)}
              >
                Annuler
              </Button>
              <Button type="submit" color="red" loading={isDeleting}>
                Supprimer
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap={2}>
      <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
        {label}
      </Text>
      {children}
    </Stack>
  );
}

function Value({ children }: { children: string | null }) {
  return children ? <Text size="sm">{children}</Text> : <Dash />;
}

function Dash() {
  return (
    <Text c="dimmed" size="sm">
      —
    </Text>
  );
}

function SoonCard({ title, step }: { title: string; step: string }) {
  return (
    <Card withBorder padding="lg">
      <Stack gap={4}>
        <Text fw={700} size="sm">
          {title}
        </Text>
        <Text c="dimmed" size="xs">
          À venir — {step}
        </Text>
      </Stack>
    </Card>
  );
}
