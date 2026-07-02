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

import { deleteOrganization } from "@/app/(app)/organizations/actions";
import { OrganizationFormModal } from "@/components/organizations/organization-form-modal";
import {
  ORG_TYPE_FILTER_OPTIONS,
  ORG_TYPE_META,
  type Organization,
} from "@/components/organizations/org-types";

export function OrganizationsView({
  organizations,
}: {
  organizations: Organization[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);

  const [deleting, setDeleting] = useState<Organization | null>(null);
  const [isDeletePending, startDelete] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return organizations.filter((o) => {
      if (type && o.type !== type) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        (o.city ?? "").toLowerCase().includes(q)
      );
    });
  }, [organizations, search, type]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(organization: Organization) {
    setEditing(organization);
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
      await deleteOrganization(deleting.id);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <>
      <Group justify="space-between" align="center" mb="lg">
        <Text c="dimmed" size="sm">
          {organizations.length} organisation
          {organizations.length > 1 ? "s" : ""}
        </Text>
        <Button onClick={openCreate}>Ajouter une organisation</Button>
      </Group>

      {organizations.length === 0 ? (
        <Stack align="center" gap="xs" py={64}>
          <Text fw={700}>Aucune organisation pour l&apos;instant</Text>
          <Text c="dimmed" size="sm" ta="center" maw={380}>
            Ajoute les salles, festivals, agences et labels avec qui tu veux
            jouer.
          </Text>
          <Button onClick={openCreate} mt="sm">
            Ajouter une organisation
          </Button>
        </Stack>
      ) : (
        <Stack gap="md">
          <Group>
            <TextInput
              placeholder="Rechercher un nom ou une ville…"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              flex={1}
            />
            <Select
              data={ORG_TYPE_FILTER_OPTIONS}
              value={type}
              onChange={(v) => setType(v ?? "")}
              allowDeselect={false}
              w={200}
            />
          </Group>

          {filtered.length === 0 ? (
            <Text c="dimmed" size="sm" py="xl" ta="center">
              Aucune organisation ne correspond à ta recherche.
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={640}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nom</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Ville</Table.Th>
                    <Table.Th>Site web</Table.Th>
                    <Table.Th w={48} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((o) => {
                    const meta = o.type ? ORG_TYPE_META[o.type] : null;
                    return (
                      <Table.Tr key={o.id}>
                        <Table.Td>
                          <Anchor
                            component={Link}
                            href={`/organizations/${o.id}`}
                            fw={500}
                          >
                            {o.name}
                          </Anchor>
                        </Table.Td>
                        <Table.Td>
                          {meta ? (
                            <Badge
                              color={meta.color}
                              variant="light"
                              size="sm"
                            >
                              {meta.label}
                            </Badge>
                          ) : (
                            <Text c="dimmed" size="sm">
                              —
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>{o.city ?? "—"}</Table.Td>
                        <Table.Td>
                          {o.website ? (
                            <Anchor
                              href={o.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="sm"
                            >
                              {o.website.replace(/^https?:\/\//, "")}
                            </Anchor>
                          ) : (
                            "—"
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
            {filtered.length !== organizations.length
              ? ` sur ${organizations.length}`
              : ""}
          </Text>
        </Stack>
      )}

      {formOpen && (
        <OrganizationFormModal
          key={editing?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
          organization={editing}
        />
      )}

      <Modal
        opened={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Supprimer l'organisation"
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
              Supprimer <b>{deleting?.name}</b> ? Cette action est irréversible.
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
