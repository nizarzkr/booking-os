"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createSequence } from "@/app/(app)/sequences/actions";
import { type SequenceListItem } from "@/components/sequences/sequence-types";
import { BlueprintGallery } from "@/components/sequences/blueprint-gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SequencesList({
  sequences,
}: {
  sequences: SequenceListItem[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createSequence(name);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      setCreateOpen(false);
      setName("");
      router.push(`/sequences/${res.id}`);
    });
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {sequences.length} séquence{sequences.length > 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setGalleryOpen(true)}>
            Partir d&apos;un modèle
          </Button>
          <Button onClick={() => setCreateOpen(true)}>Nouvelle séquence</Button>
        </div>
      </div>

      {sequences.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="font-semibold">Aucune séquence pour l&apos;instant</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Crée une séquence de relances, ajoute des étapes avec des délais,
            puis enrôle des contacts : les emails partent tout seuls et
            s&apos;arrêtent dès qu&apos;on te répond.
          </p>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" onClick={() => setGalleryOpen(true)}>
              Partir d&apos;un modèle
            </Button>
            <Button onClick={() => setCreateOpen(true)}>Nouvelle séquence</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sequences.map((s) => (
            <Link
              key={s.id}
              href={`/sequences/${s.id}`}
              className="interactive-card block rounded-xl"
            >
              <Card>
                <CardContent className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{s.name}</span>
                  <div className="flex gap-2">
                    <StatusBadge color="gray">
                      {s.stepCount} étape{s.stepCount > 1 ? "s" : ""}
                    </StatusBadge>
                    <StatusBadge color="blue">
                      {s.activeCount} actif{s.activeCount > 1 ? "s" : ""}
                    </StatusBadge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <BlueprintGallery
        opened={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) setCreateOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle séquence</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCreate} className="flex flex-col gap-4">
            <Field label="Nom de la séquence" htmlFor="seq_name" required>
              <Input
                id="seq_name"
                placeholder="Ex. Prospection salles automne"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Création…" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
