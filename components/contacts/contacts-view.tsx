"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import { deleteContact } from "@/app/(app)/contacts/actions";
import { ContactFormModal } from "@/components/contacts/contact-form-modal";
import {
  fullName,
  ROLE_FILTER_OPTIONS,
  ROLE_META,
  type Contact,
} from "@/components/contacts/roles";
import { EnrollToSequenceModal } from "@/components/sequences/enroll-to-sequence-modal";
import { type Sequence } from "@/components/sequences/sequence-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ContactsView({
  contacts,
  sequences = [],
}: {
  contacts: Contact[];
  sequences?: Sequence[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);

  const [enrolling, setEnrolling] = useState<Contact | null>(null);
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
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {contacts.length} contact{contacts.length > 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link href="/contacts/import" />}>
            Importer un CSV
          </Button>
          <Button onClick={openCreate}>Ajouter un contact</Button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="font-semibold">Aucun contact pour l&apos;instant</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Ajoute tes salles, festivals et programmateurs pour commencer à
            suivre tes opportunités.
          </p>
          <Button onClick={openCreate} className="mt-2">
            Ajouter un contact
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Rechercher un nom ou un email…"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              className="sm:flex-1"
            />
            <Select
              value={role || "all"}
              onValueChange={(v) =>
                setRole(String(v) === "all" ? "" : String(v ?? ""))
              }
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_FILTER_OPTIONS.map((o) => {
                  const val = o.value === "" ? "all" : o.value;
                  return (
                    <SelectItem key={val} value={val}>
                      {o.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucun contact ne correspond à ta recherche.
            </p>
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const meta = c.role ? ROLE_META[c.role] : null;
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Link
                            href={`/contacts/${c.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {fullName(c)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {meta ? (
                            <Badge variant="secondary">{meta.label}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.email ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.phone ?? "—"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Actions"
                                />
                              }
                            >
                              <MoreHorizontal />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openEdit(c)}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEnrolling(c)}>
                                Ajouter à une séquence
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleting(c)}
                              >
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {filtered.length} affiché{filtered.length > 1 ? "s" : ""}
            {filtered.length !== contacts.length
              ? ` sur ${contacts.length}`
              : ""}
          </p>
        </div>
      )}

      {formOpen && (
        <ContactFormModal
          key={editing?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
          contact={editing}
        />
      )}

      {enrolling && (
        <EnrollToSequenceModal
          contactId={enrolling.id}
          sequences={sequences}
          onClose={() => setEnrolling(null)}
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
            <DialogTitle>Supprimer le contact</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Supprimer <b className="text-foreground">{deleting ? fullName(deleting) : ""}</b> ?
            Cette action est irréversible.
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
