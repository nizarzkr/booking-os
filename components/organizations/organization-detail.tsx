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
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { deleteOrganization } from "@/app/(app)/organizations/actions";
import { OrganizationFormModal } from "@/components/organizations/organization-form-modal";
import {
  ORG_TYPE_META,
  type Organization,
} from "@/components/organizations/org-types";
import { fullName, ROLE_META, type Contact } from "@/components/contacts/roles";

type Props = {
  organization: Organization;
  linkedContacts: Contact[];
};

export function OrganizationDetail({ organization, linkedContacts }: Props) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const meta = organization.type ? ORG_TYPE_META[organization.type] : null;

  function handleDelete() {
    startDelete(async () => {
      const res = await deleteOrganization(organization.id);
      if ("error" in res) {
        notifications.show({ color: "red", message: res.error });
        return;
      }
      router.push("/contacts?tab=places");
    });
  }

  return (
    <Stack gap="lg">
      <Anchor component={Link} href="/contacts?tab=places" size="sm" c="dimmed">
        ← Lieux &amp; structures
      </Anchor>

      <Group justify="space-between" align="flex-start">
        <Group gap="sm" align="center">
          <Title order={1}>{organization.name}</Title>
          {meta && (
            <Badge color={meta.color} variant="light">
              {meta.label}
            </Badge>
          )}
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
            <InfoRow label="Ville">
              <Value>{organization.city}</Value>
            </InfoRow>
            <InfoRow label="Pays">
              <Value>{organization.country}</Value>
            </InfoRow>
            <InfoRow label="Site web">
              {organization.website ? (
                <Anchor
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                >
                  {organization.website.replace(/^https?:\/\//, "")}
                </Anchor>
              ) : (
                <Dash />
              )}
            </InfoRow>
          </SimpleGrid>
          {organization.notes && (
            <>
              <Divider />
              <InfoRow label="Notes">
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {organization.notes}
                </Text>
              </InfoRow>
            </>
          )}
        </Stack>
      </Card>

      {/* Contacts liés (lecture — liaison gérée depuis la fiche contact) */}
      <Card withBorder padding="lg">
        <Stack gap="sm">
          <Text fw={700} size="sm">
            Contacts liés
          </Text>
          {linkedContacts.length === 0 ? (
            <Text c="dimmed" size="sm">
              Aucun contact lié. Lie un contact depuis sa fiche.
            </Text>
          ) : (
            <Stack gap="xs">
              {linkedContacts.map((c) => {
                const cm = c.role ? ROLE_META[c.role] : null;
                return (
                  <Group key={c.id} gap="sm">
                    <Anchor
                      component={Link}
                      href={`/contacts/${c.id}`}
                      size="sm"
                      fw={500}
                    >
                      {fullName(c)}
                    </Anchor>
                    {cm && (
                      <Badge
                        color={cm.color}
                        variant="light"
                        size="sm"
                      >
                        {cm.label}
                      </Badge>
                    )}
                  </Group>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* À venir */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <SoonCard title="Opportunités" step="étape 3.x" />
        <SoonCard title="Historique" step="étape 5.x" />
      </SimpleGrid>

      {editOpen && (
        <OrganizationFormModal
          key={organization.id}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            router.refresh();
          }}
          organization={organization}
        />
      )}

      <Modal
        opened={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Supprimer l'organisation"
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
              Supprimer <b>{organization.name}</b> ? Cette action est
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
