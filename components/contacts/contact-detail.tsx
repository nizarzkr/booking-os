"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteContact } from "@/app/(app)/contacts/actions";
import {
  linkOrganization,
  unlinkOrganization,
} from "@/app/(app)/contacts/[id]/actions";
import { ContactFormModal } from "@/components/contacts/contact-form-modal";
import { SendEmailModal } from "@/components/emails/send-email-modal";
import { EmailHistory, type EmailLog } from "@/components/emails/email-history";
import { type EmailTemplate } from "@/components/templates/template-types";
import { fullName, ROLE_META, type Contact } from "@/components/contacts/roles";
import {
  ORG_TYPE_META,
  type Organization,
} from "@/components/organizations/org-types";
import { TaskSection } from "@/components/tasks/task-section";
import { type Task } from "@/components/tasks/task-types";
import { EnrollToSequenceModal } from "@/components/sequences/enroll-to-sequence-modal";
import { type Sequence } from "@/components/sequences/sequence-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  contact: Contact;
  linkedOrgs: Organization[];
  allOrgs: Organization[];
  tasks: Task[];
  templates: EmailTemplate[];
  artistName: string;
  emailLogs: EmailLog[];
  sequences: Sequence[];
};

export function ContactDetail({
  contact,
  linkedOrgs,
  allOrgs,
  tasks,
  templates,
  artistName,
  emailLogs,
  sequences,
}: Props) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const [orgToLink, setOrgToLink] = useState<string>("");
  const [isLinking, startLink] = useTransition();

  const meta = contact.role ? ROLE_META[contact.role] : null;

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
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      setOrgToLink("");
      router.refresh();
    });
  }

  function handleUnlink(orgId: string) {
    startLink(async () => {
      const res = await unlinkOrganization(contact.id, orgId);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startDelete(async () => {
      const res = await deleteContact(contact.id);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      router.push("/contacts");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/contacts"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Contacts
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{fullName(contact)}</h1>
          {meta && <Badge variant="secondary">{meta.label}</Badge>}
        </div>
        <div className="flex flex-wrap gap-2">
          {contact.email && (
            <Button onClick={() => setEmailOpen(true)}>Envoyer un email</Button>
          )}
          <Button variant="outline" onClick={() => setEnrollOpen(true)}>
            Ajouter à une séquence
          </Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Modifier
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmDelete(true)}
          >
            Supprimer
          </Button>
        </div>
      </div>

      {/* Coordonnées */}
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Email">
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {contact.email}
                </a>
              ) : (
                <Dash />
              )}
            </InfoRow>
            <InfoRow label="Téléphone">
              {contact.phone ? (
                <span className="text-sm">{contact.phone}</span>
              ) : (
                <Dash />
              )}
            </InfoRow>
          </div>
          {contact.notes && (
            <div className="border-t pt-4">
              <InfoRow label="Notes">
                <p className="whitespace-pre-wrap text-sm">{contact.notes}</p>
              </InfoRow>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organisations liées */}
      <Card>
        <CardHeader>
          <CardTitle>Organisations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {linkedOrgs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune organisation liée.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {linkedOrgs.map((o) => {
                const om = o.type ? ORG_TYPE_META[o.type] : null;
                return (
                  <li key={o.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href="/organizations"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {o.name}
                      </Link>
                      {om && <StatusBadge color={om.color}>{om.label}</StatusBadge>}
                      {o.city && (
                        <span className="text-sm text-muted-foreground">
                          {o.city}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnlink(o.id)}
                      disabled={isLinking}
                    >
                      Délier
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          {linkableOptions.length > 0 && (
            <div className="flex items-end gap-2 border-t pt-4">
              <Field label="Lier une organisation" className="flex-1">
                <Select
                  value={orgToLink}
                  onValueChange={(v) => setOrgToLink(String(v ?? ""))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                  <SelectContent>
                    {linkableOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Button onClick={handleLink} disabled={!orgToLink || isLinking}>
                Lier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tâches liées à ce contact */}
      <TaskSection tasks={tasks} presetContactId={contact.id} />

      <EmailHistory logs={emailLogs} />

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

      {enrollOpen && (
        <EnrollToSequenceModal
          contactId={contact.id}
          sequences={sequences}
          onClose={() => setEnrollOpen(false)}
        />
      )}

      <Dialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le contact</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Supprimer <b className="text-foreground">{fullName(contact)}</b> ?
            Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function Dash() {
  return <span className="text-sm text-muted-foreground">—</span>;
}
