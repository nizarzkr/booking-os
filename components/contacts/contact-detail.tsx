"use client";

import { useMemo, useState, useTransition } from "react";
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

import { deleteContact } from "@/app/(app)/contacts/actions";
import {
  linkOrganization,
  unlinkOrganization,
} from "@/app/(app)/contacts/[id]/actions";
import { ContactFormModal } from "@/components/contacts/contact-form-modal";
import { SendEmailModal } from "@/components/emails/send-email-modal";
import { type EmailTemplate } from "@/components/templates/template-types";
import { fullName, ROLE_META, type Contact } from "@/components/contacts/roles";
import { ORG_TYPE_META, type Organization } from "@/components/organizations/org-types";
import { TaskSection } from "@/components/tasks/task-section";
import { type Task } from "@/components/tasks/task-types";

function notifyError(message: string) {
  notifications.show({ color: "red", message });
}

type Props = {
  contact: Contact;
  linkedOrgs: Organization[];
  allOrgs: Organization[];
  tasks: Task[];
  templates: EmailTemplate[];
  artistName: string;
};

export function ContactDetail({
  contact,
  linkedOrgs,
  allOrgs,
  tasks,
  templates,
  artistName,
}: Props) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const [orgToLink, setOrgToLink] = useState<string | null>(null);
  const [isLinking, startLink] = useTransition();

  const meta = contact.role ? ROLE_META[contact.role] : null;

  // Organisations non encore liées, pour le sélecteur.
  const linkableOptions = useMemo(() => {
    const linkedIds = new Set(linkedOrgs.map((o) => o.id));
    return allOrgs
      .filter((o) => !linkedIds.has(o.id))
      .map((o) => ({ value: o.id, label: o.name }));
  }, [allOrgs, linkedOrgs]);

  function handleLink() {
    if (!orgToLink) return;
    startLink(async () => {
      const res = await linkOrganization(contact.id, orgToLink);
      if ("error" in res) return notifyError(res.error);
      setOrgToLink(null);
      router.refresh();
    });
  }

  function handleUnlink(orgId: string) {
    startLink(async () => {
      const res = await unlinkOrganization(contact.id, orgId);
      if ("error" in res) return notifyError(res.error);
      router.refresh();
    });
  }

  function handleDelete() {
    startDelete(async () => {
      const res = await deleteContact(contact.id);
      if ("error" in res) return notifyError(res.error);
      router.push("/contacts");
    });
  }

  return (
    <Stack gap="lg">
      <Anchor component={Link} href="/contacts" size="sm" c="dimmed">
        ← Contacts
      </Anchor>

      <Group justify="space-between" align="flex-start">
        <Group gap="sm" align="center">
          <Title order={1}>{fullName(contact)}</Title>
          {meta && (
            <Badge color={meta.color} variant="light">
              {meta.label}
            </Badge>
          )}
        </Group>
        <Group>
          {contact.email && (
            <Button onClick={() => setEmailOpen(true)}>Envoyer un email</Button>
          )}
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

      {/* Coordonnées */}
      <Card withBorder padding="lg">
        <Stack gap="sm">
          <Text fw={700} size="sm">
            Coordonnées
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <InfoRow label="Email">
              {contact.email ? (
                <Anchor href={`mailto:${contact.email}`} size="sm">
                  {contact.email}
                </Anchor>
              ) : (
                <Dash />
              )}
            </InfoRow>
            <InfoRow label="Téléphone">
              {contact.phone ? (
                <Text size="sm">{contact.phone}</Text>
              ) : (
                <Dash />
              )}
            </InfoRow>
          </SimpleGrid>
          {contact.notes && (
            <>
              <Divider />
              <InfoRow label="Notes">
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {contact.notes}
                </Text>
              </InfoRow>
            </>
          )}
        </Stack>
      </Card>

      {/* Organisations liées */}
      <Card withBorder padding="lg">
        <Stack gap="sm">
          <Text fw={700} size="sm">
            Organisations
          </Text>

          {linkedOrgs.length === 0 ? (
            <Text c="dimmed" size="sm">
              Aucune organisation liée.
            </Text>
          ) : (
            <Stack gap="xs">
              {linkedOrgs.map((o) => {
                const om = o.type ? ORG_TYPE_META[o.type] : null;
                return (
                  <Group key={o.id} justify="space-between">
                    <Group gap="sm">
                      <Anchor
                        component={Link}
                        href="/organizations"
                        size="sm"
                        fw={500}
                      >
                        {o.name}
                      </Anchor>
                      {om && (
                        <Badge
                          color={om.color}
                          variant="light"
                          size="sm"
                        >
                          {om.label}
                        </Badge>
                      )}
                      {o.city && (
                        <Text c="dimmed" size="sm">
                          {o.city}
                        </Text>
                      )}
                    </Group>
                    <Button
                      variant="subtle"
                      color="gray"
                      size="compact-sm"
                      onClick={() => handleUnlink(o.id)}
                      disabled={isLinking}
                    >
                      Délier
                    </Button>
                  </Group>
                );
              })}
            </Stack>
          )}

          {linkableOptions.length > 0 && (
            <>
              <Divider />
              <Group align="flex-end">
                <Select
                  label="Lier une organisation"
                  placeholder="Choisir…"
                  data={linkableOptions}
                  value={orgToLink}
                  onChange={setOrgToLink}
                  searchable
                  flex={1}
                />
                <Button onClick={handleLink} loading={isLinking} disabled={!orgToLink}>
                  Lier
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Card>

      {/* Tâches liées à ce contact */}
      <TaskSection tasks={tasks} presetContactId={contact.id} />

      {/* Sections à venir */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <SoonCard title="Opportunités" step="étape 3.x" />
        <SoonCard title="Historique emails" step="étape 5.4" />
      </SimpleGrid>

      {editOpen && (
        <ContactFormModal
          key={contact.id}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            router.refresh();
          }}
          contact={contact}
        />
      )}

      {emailOpen && contact.email && (
        <SendEmailModal
          onClose={() => setEmailOpen(false)}
          onSent={() => {
            setEmailOpen(false);
            router.refresh();
          }}
          defaultTo={contact.email}
          templates={templates}
          vars={{ contact_name: fullName(contact), artist_name: artistName }}
          contactId={contact.id}
          opportunityId={null}
        />
      )}

      <Modal
        opened={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Supprimer le contact"
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
              Supprimer <b>{fullName(contact)}</b> ? Cette action est
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
