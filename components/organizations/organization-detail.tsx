"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteOrganization } from "@/app/(app)/organizations/actions";
import { OrganizationFormModal } from "@/components/organizations/organization-form-modal";
import {
  ORG_TYPE_META,
  type Organization,
} from "@/components/organizations/org-types";
import { fullName, ROLE_META, type Contact } from "@/components/contacts/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
        toast.error(res.error);
        return;
      }
      router.push("/contacts?tab=places");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/contacts?tab=places"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Lieux &amp; structures
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{organization.name}</h1>
          {meta && <Badge variant="secondary">{meta.label}</Badge>}
        </div>
        <div className="flex gap-2">
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

      {/* Infos */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Ville">
              <Value>{organization.city}</Value>
            </InfoRow>
            <InfoRow label="Pays">
              <Value>{organization.country}</Value>
            </InfoRow>
            <InfoRow label="Site web">
              {organization.website ? (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {organization.website.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                <Dash />
              )}
            </InfoRow>
          </div>
          {organization.notes && (
            <div className="border-t pt-4">
              <InfoRow label="Notes">
                <p className="whitespace-pre-wrap text-sm">
                  {organization.notes}
                </p>
              </InfoRow>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacts liés (lecture — liaison gérée depuis la fiche contact) */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts liés</CardTitle>
        </CardHeader>
        <CardContent>
          {linkedContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun contact lié. Lie un contact depuis sa fiche.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {linkedContacts.map((c) => {
                const cm = c.role ? ROLE_META[c.role] : null;
                return (
                  <li key={c.id} className="flex items-center gap-2">
                    <Link
                      href={`/contacts/${c.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {fullName(c)}
                    </Link>
                    {cm && <Badge variant="secondary">{cm.label}</Badge>}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

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

      <Dialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;organisation</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Supprimer <b className="text-foreground">{organization.name}</b> ?
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

function Value({ children }: { children: string | null }) {
  return children ? <span className="text-sm">{children}</span> : <Dash />;
}

function Dash() {
  return <span className="text-sm text-muted-foreground">—</span>;
}
