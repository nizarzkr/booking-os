"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteTemplate } from "@/app/(app)/templates/actions";
import { TemplateFormModal } from "@/components/templates/template-form-modal";
import {
  TemplatePreviewModal,
  type PreviewContact,
  type PreviewOpportunity,
} from "@/components/templates/template-preview-modal";
import { type EmailTemplate } from "@/components/templates/template-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {templates.length} modèle{templates.length > 1 ? "s" : ""}
        </p>
        <Button onClick={openCreate}>Ajouter un modèle</Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="font-semibold">Aucun modèle pour l&apos;instant</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Crée des modèles d&apos;email réutilisables (prise de contact,
            relance, confirmation) avec des variables comme{" "}
            <b>{"{{contact_name}}"}</b> ou <b>{"{{gig_date}}"}</b>.
          </p>
          <Button onClick={openCreate} className="mt-2">
            Ajouter un modèle
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.subject || "Sans objet"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreviewing(t)}>
                    Aperçu
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleting(t)}
                  >
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le modèle</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Supprimer <b className="text-foreground">{deleting?.name}</b> ? Cette
            action est irréversible.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleting(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletePending}
              onClick={confirmDelete}
            >
              {isDeletePending ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
