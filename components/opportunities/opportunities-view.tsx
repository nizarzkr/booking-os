"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Group,
  Menu,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";

import { deleteOpportunity } from "@/app/(app)/opportunities/actions";
import {
  OpportunityFormModal,
  type ContactOption,
  type OrganizationOption,
} from "@/components/opportunities/opportunity-form-modal";
import {
  formatFee,
  formatGigDate,
  STATUS_FILTER_OPTIONS,
  STATUS_META,
  type Opportunity,
} from "@/components/opportunities/opportunity-types";

export type OpportunityListItem = Opportunity & {
  contact_name: string | null;
  organization_name: string | null;
};

type Props = {
  opportunities: OpportunityListItem[];
  contactOptions: ContactOption[];
  organizationOptions: OrganizationOption[];
};

export function OpportunitiesView({
  opportunities,
  contactOptions,
  organizationOptions,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);

  const [deleting, setDeleting] = useState<OpportunityListItem | null>(null);
  const [isDeletePending, startDelete] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return opportunities.filter((o) => {
      if (status && o.status !== status) return false;
      if (!q) return true;
      return (
        o.title.toLowerCase().includes(q) ||
        (o.city ?? "").toLowerCase().includes(q) ||
        (o.venue ?? "").toLowerCase().includes(q) ||
        (o.contact_name ?? "").toLowerCase().includes(q) ||
        (o.organization_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [opportunities, search, status]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(opportunity: Opportunity) {
    setEditing(opportunity);
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
      await deleteOpportunity(deleting.id);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <>
      <Group justify="space-between" align="center" mb="lg">
        <Text c="dimmed" size="sm">
          {opportunities.length} opportunité
          {opportunities.length > 1 ? "s" : ""}
        </Text>
        <Button onClick={openCreate}>Ajouter une opportunité</Button>
      </Group>

      {opportunities.length === 0 ? (
        <Stack align="center" gap="xs" py={64}>
          <Text fw={700}>Aucune opportunité pour l&apos;instant</Text>
          <Text c="dimmed" size="sm" ta="center" maw={380}>
            Crée ta première opportunité pour suivre une piste de date, de la
            prise de contact jusqu&apos;au concert confirmé.
          </Text>
          <Button onClick={openCreate} mt="sm">
            Ajouter une opportunité
          </Button>
        </Stack>
      ) : (
        <Stack gap="md">
          <Group>
            <TextInput
              placeholder="Rechercher un titre, une ville, un contact…"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              flex={1}
            />
            <Select
              data={STATUS_FILTER_OPTIONS}
              value={status}
              onChange={(v) => setStatus(v ?? "")}
              allowDeselect={false}
              w={200}
            />
          </Group>

          {filtered.length === 0 ? (
            <Text c="dimmed" size="sm" py="xl" ta="center">
              Aucune opportunité ne correspond à ta recherche.
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={760}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Titre</Table.Th>
                    <Table.Th>Statut</Table.Th>
                    <Table.Th>Contact / Organisation</Table.Th>
                    <Table.Th>Lieu</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Cachet</Table.Th>
                    <Table.Th w={48} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((o) => {
                    const meta = STATUS_META[o.status];
                    const who = o.contact_name ?? o.organization_name;
                    const place = [o.venue, o.city]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <Table.Tr key={o.id}>
                        <Table.Td>
                          <Anchor
                            component={Link}
                            href={`/opportunities/${o.id}`}
                            fw={500}
                          >
                            {o.title}
                          </Anchor>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={meta.color}
                            variant="light"
                            size="sm"
                          >
                            {meta.label}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {who ? (
                            who
                          ) : (
                            <Text c="dimmed" size="sm">
                              —
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {place ? (
                            place
                          ) : (
                            <Text c="dimmed" size="sm">
                              —
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>{formatGigDate(o.gig_date)}</Table.Td>
                        <Table.Td>
                          <Text size="sm" ff="monospace">
                            {formatFee(o.fee)}
                          </Text>
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
                              <Menu.Item onClick={() => openEdit(o)}>
                                Modifier
                              </Menu.Item>
                              <Menu.Item
                                color="red"
                                onClick={() => setDeleting(o)}
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
            {filtered.length !== opportunities.length
              ? ` sur ${opportunities.length}`
              : ""}
          </Text>
        </Stack>
      )}

      {formOpen && (
        <OpportunityFormModal
          key={editing?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
          opportunity={editing}
          contactOptions={contactOptions}
          organizationOptions={organizationOptions}
        />
      )}

      <Modal
        opened={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Supprimer l'opportunité"
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
