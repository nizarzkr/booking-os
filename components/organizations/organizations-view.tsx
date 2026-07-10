"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import { deleteOrganization } from "@/app/(app)/organizations/actions";
import { OrganizationFormModal } from "@/components/organizations/organization-form-modal";
import {
  ORG_TYPE_FILTER_OPTIONS,
  ORG_TYPE_META,
  type Organization,
} from "@/components/organizations/org-types";
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
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {organizations.length} organisation
          {organizations.length > 1 ? "s" : ""}
        </p>
        <Button onClick={openCreate}>Ajouter une organisation</Button>
      </div>

      {organizations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="font-semibold">Aucune organisation pour l&apos;instant</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Ajoute les salles, festivals, agences et labels avec qui tu veux
            jouer.
          </p>
          <Button onClick={openCreate} className="mt-2">
            Ajouter une organisation
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Rechercher un nom ou une ville…"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              className="sm:flex-1"
            />
            <Select
              value={type || "all"}
              onValueChange={(v) =>
                setType(String(v) === "all" ? "" : String(v ?? ""))
              }
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORG_TYPE_FILTER_OPTIONS.map((o) => {
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
              Aucune organisation ne correspond à ta recherche.
            </p>
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Site web</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => {
                    const meta = o.type ? ORG_TYPE_META[o.type] : null;
                    return (
                      <TableRow key={o.id}>
                        <TableCell>
                          <Link
                            href={`/organizations/${o.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {o.name}
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
                          {o.city ?? "—"}
                        </TableCell>
                        <TableCell>
                          {o.website ? (
                            <a
                              href={o.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {o.website.replace(/^https?:\/\//, "")}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
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
                              <DropdownMenuItem onClick={() => openEdit(o)}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleting(o)}
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
            {filtered.length} affichée{filtered.length > 1 ? "s" : ""}
            {filtered.length !== organizations.length
              ? ` sur ${organizations.length}`
              : ""}
          </p>
        </div>
      )}

      {formOpen && (
        <OrganizationFormModal
          key={editing?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
          organization={editing}
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
            <DialogTitle>Supprimer l&apos;organisation</DialogTitle>
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
