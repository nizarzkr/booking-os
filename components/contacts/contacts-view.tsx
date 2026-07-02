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

import { deleteContact } from "@/app/(app)/contacts/actions";
import { ContactFormModal } from "@/components/contacts/contact-form-modal";
import {
  fullName,
  ROLE_FILTER_OPTIONS,
  ROLE_META,
  type Contact,
} from "@/components/contacts/roles";

export function ContactsView({ contacts }: { contacts: Contact[] }) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);

  const [deleting, setDeleting] = useState<Contact | null>(null);
  const [isDeletePending, startDelete] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (role && c.role !== role) return false;
      if (!q) return true;
      return (
        fullName(c).toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [contacts, search, role]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(contact: Contact) {
    setEditing(contact);
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
      await deleteContact(deleting.id);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <>
      <Group justify="space-between" align="center" mb="lg">
        <Text c="dimmed" size="sm">
          {contacts.length} contact{contacts.length > 1 ? "s" : ""}
        </Text>
        <Button onClick={openCreate}>Ajouter un contact</Button>
      </Group>

      {contacts.length === 0 ? (
        <Stack align="center" gap="xs" py={64}>
          <Text fw={700}>Aucun contact pour l&apos;instant</Text>
          <Text c="dimmed" size="sm" ta="center" maw={360}>
            Ajoute tes salles, festivals et programmateurs pour commencer à
            suivre tes opportunités.
          </Text>
          <Button onClick={openCreate} mt="sm">
            Ajouter un contact
          </Button>
        </Stack>
      ) : (
        <Stack gap="md">
          <Group>
            <TextInput
              placeholder="Rechercher un nom ou un email…"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              flex={1}
            />
            <Select
              data={ROLE_FILTER_OPTIONS}
              value={role}
              onChange={(v) => setRole(v ?? "")}
              allowDeselect={false}
              w={200}
            />
          </Group>

          {filtered.length === 0 ? (
            <Text c="dimmed" size="sm" py="xl" ta="center">
              Aucun contact ne correspond à ta recherche.
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={640}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nom</Table.Th>
                    <Table.Th>Rôle</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Téléphone</Table.Th>
                    <Table.Th w={48} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((c) => {
                    const meta = c.role ? ROLE_META[c.role] : null;
                    return (
                      <Table.Tr key={c.id}>
                        <Table.Td>
                          <Anchor
                            component={Link}
                            href={`/contacts/${c.id}`}
                            fw={500}
                          >
                            {fullName(c)}
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
                        <Table.Td>{c.email ?? "—"}</Table.Td>
                        <Table.Td>{c.phone ?? "—"}</Table.Td>
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
                              <Menu.Item onClick={() => openEdit(c)}>
                                Modifier
                              </Menu.Item>
                              <Menu.Item
                                color="red"
                                onClick={() => setDeleting(c)}
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
            {filtered.length} affiché{filtered.length > 1 ? "s" : ""}
            {filtered.length !== contacts.length
              ? ` sur ${contacts.length}`
              : ""}
          </Text>
        </Stack>
      )}

      {formOpen && (
        <ContactFormModal
          key={editing?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
          contact={editing}
        />
      )}

      <Modal
        opened={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Supprimer le contact"
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
              Supprimer <b>{deleting ? fullName(deleting) : ""}</b> ? Cette
              action est irréversible.
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
