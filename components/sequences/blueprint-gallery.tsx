"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createSequenceFromBlueprint } from "@/app/(app)/sequences/actions";
import { SEQUENCE_BLUEPRINTS } from "@/components/sequences/sequence-blueprints";
import { formatDelay } from "@/components/sequences/sequence-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function BlueprintGallery({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function applyBlueprint(id: string) {
    setPendingId(id);
    const res = await createSequenceFromBlueprint(id);
    setPendingId(null);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success(
      "Séquence créée à partir du modèle. À toi de la personnaliser !",
    );
    onClose();
    router.push(`/sequences/${res.id}`);
  }

  return (
    <Dialog
      open={opened}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Partir d&apos;un modèle</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          <p className="text-sm text-muted-foreground">
            Des séquences prêtes à l&apos;emploi pour les situations de booking
            les plus courantes. Choisis-en une : elle est copiée dans tes
            séquences, tu la personnalises ensuite (les crochets [ … ] sont à
            remplir).
          </p>

          {SEQUENCE_BLUEPRINTS.map((bp) => (
            <Card key={bp.id}>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{bp.name}</p>
                  <Badge variant="secondary" className="shrink-0">
                    {bp.audience}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">{bp.description}</p>

                <div className="mt-1 flex flex-col gap-1">
                  {bp.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <StatusBadge color="blue" className="shrink-0">
                        {formatDelay(step.delay_days)}
                      </StatusBadge>
                      <span className="truncate text-sm text-muted-foreground">
                        {step.subject}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-1 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => applyBlueprint(bp.id)}
                    disabled={pendingId !== null}
                  >
                    {pendingId === bp.id ? "Création…" : "Utiliser ce modèle"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
