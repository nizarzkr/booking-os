"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";

import { deleteTemplate } from "@/app/(app)/templates/actions";
import { TemplateFormModal } from "@/components/templates/template-form-modal";
import {
  TemplatePreviewModal,
  type PreviewContact,
  type PreviewOpportunity,
} from "@/components/templates/template-preview-modal";
import { type EmailTemplate } from "@/components/templates/template-types";

type Props = {
  templates: EmailTemplate[];
  contacts: PreviewContact[];
  opportunities: PreviewOpportunity[];
  artistName: string;
};

export function TemplatesView({
  templates,
  contacts,
  opportunities,
  artistName,
}: Props) {
  const router = useRouter();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [previewing, setPreviewing] = useState<EmailTemplate | null>(null);
  const [deleting, setDeleting] = useState<EmailTemplate | null>(null);
  const [isDeletePending, startDelete] = useTransition();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(template: EmailTemplate) {
    setEditing(template);
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
      await deleteTemplate(deleting.id);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <>
      <Group justify="space-between" align="center" mb="lg">
        <Text c="dimmed" size="sm">
          {templates.length} template{templates.length > 1 ? "s" : ""}
        </Text>
        <Button onClick={openCreate}>Ajouter un template</Button>
      </Group>

      {templates.length === 0 ? (
        <Stack align="center" gap="xs" py={64}>
          <Text fw={700}>Aucun template pour l&apos;instant</Text>
          <Text c="dimmed" size="sm" ta="center" maw={400}>
            Crée des modèles d&apos;email réutilisables (prise de contact,
            relance, confirmation) avec des variables comme{" "}
            <b>{"{{contact_name}}"}</b> ou <b>{"{{gig_date}}"}</b>.
          </Text>
          <Button onClick={openCreate} mt="sm">
            Ajouter un template
          </Button>
        </Stack>
      ) : (
        <Stack gap="sm">
          {templates.map((t) => (
            <Card key={t.id} withBorder padding="lg">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2}>
                  <Text fw={700}>{t.name}</Text>
                  <Text c="dimmed" size="sm">
                    {t.subject || "Sans objet"}
                  </Text>
                </Stack>
                <Group gap="xs" wrap="nowrap">
                  <Button
                    variant="default"
                    size="compact-sm"
                    onClick={() => setPreviewing(t)}
                  >
                    Aperçu
                  </Button>
                  <Button
                    variant="default"
                    size="compact-sm"
                    onClick={() => openEdit(t)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="subtle"
                    color="red"
                    size="compact-sm"
                    onClick={() => setDeleting(t)}
                  >
                    Supprimer
                  </Button>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      {formOpen && (
        <TemplateFormModal
          key={editing?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
          template={editing}
        />
      )}

      {previewing && (
        <TemplatePreviewModal
          key={previewing.id}
          template={previewing}
          contacts={contacts}
          opportunities={opportunities}
          artistName={artistName}
          onClose={() => setPreviewing(null)}
        />
      )}

      <Modal
        opened={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Supprimer le template"
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
