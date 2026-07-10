"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { enrollContacts } from "@/app/(app)/sequences/actions";
import { type Sequence } from "@/components/sequences/sequence-types";
import { Button } from "@/components/ui/button";
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
  contactId: string;
  sequences: Sequence[];
  onClose: () => void;
};

export function EnrollToSequenceModal({ contactId, sequences, onClose }: Props) {
  const router = useRouter();
  const [sequenceId, setSequenceId] = useState<string>("");
  const [pending, setPending] = useState(false);

  async function handleEnroll() {
    if (!sequenceId) return;
    setPending(true);
    const res = await enrollContacts(sequenceId, [contactId]);
    setPending(false);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success("Contact enrôlé.");
    onClose();
    router.refresh();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter à une séquence</DialogTitle>
        </DialogHeader>

        {sequences.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune séquence disponible. Crée-en une dans Prospection →
            Séquences.
          </p>
        ) : (
          <Field label="Séquence">
            <Select
              value={sequenceId}
              onValueChange={(v) => setSequenceId(String(v ?? ""))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir une séquence" />
              </SelectTrigger>
              <SelectContent>
                {sequences.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleEnroll}
            disabled={!sequenceId || pending}
          >
            {pending ? "Enrôlement…" : "Enrôler"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
