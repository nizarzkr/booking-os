"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { toast } from "sonner";

import { syncInbox, markAllInboundRead } from "@/app/(app)/inbox/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export type InboxItem = {
  id: string;
  subject: string | null;
  body: string | null;
  sent_at: string;
  read: boolean;
  href: string | null;
  from: string;
};

function formatSentAt(iso: string): string {
  return dayjs(iso).locale("fr").format("D MMM YYYY à HH:mm");
}

export function InboxView({ items }: { items: InboxItem[] }) {
  const router = useRouter();
  const [syncing, startSync] = useTransition();
  const [markingRead, setMarkingRead] = useState(false);
  const autoSynced = useRef(false);

  const unreadCount = items.filter((i) => !i.read).length;

  function runSync(showToast: boolean) {
    startSync(async () => {
      const result = await syncInbox();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      if (result.inserted > 0) {
        toast.success(
          `${result.inserted} nouvelle${result.inserted > 1 ? "s" : ""} réponse${result.inserted > 1 ? "s" : ""}.`,
        );
        router.refresh();
      } else if (showToast) {
        toast("Aucune nouvelle réponse.");
      }
    });
  }

  // Sync automatique à l'ouverture de la boîte (une seule fois par montage).
  useEffect(() => {
    if (autoSynced.current) return;
    autoSynced.current = true;
    runSync(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMarkAllRead() {
    setMarkingRead(true);
    await markAllInboundRead();
    setMarkingRead(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Réponses</h2>
            {unreadCount > 0 && (
              <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Les réponses à tes emails, centralisées.
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllRead}
              disabled={markingRead}
            >
              Tout marquer comme lu
            </Button>
          )}
          <Button onClick={() => runSync(true)} disabled={syncing}>
            {syncing ? "Sync…" : "Rafraîchir"}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-1 py-8 text-center">
            <p className="font-semibold">Aucune réponse pour l&apos;instant</p>
            <p className="text-sm text-muted-foreground">
              Les réponses à tes emails envoyés depuis l&apos;app apparaîtront
              ici automatiquement.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "interactive-card",
                !item.read && "ring-primary/40",
              )}
            >
              <CardContent className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {!item.read && (
                      <StatusBadge color="green">Nouveau</StatusBadge>
                    )}
                    <span className="truncate text-sm font-semibold">
                      {item.subject ?? "(sans objet)"}
                    </span>
                  </div>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-xs text-primary hover:underline"
                    >
                      {item.from}
                    </Link>
                  ) : (
                    <p className="text-xs text-muted-foreground">{item.from}</p>
                  )}
                  {item.body && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {item.body}
                    </p>
                  )}
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatSentAt(item.sent_at)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
