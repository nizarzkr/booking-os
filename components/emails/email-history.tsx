"use client";

import dayjs from "dayjs";
import "dayjs/locale/fr";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Database } from "@/types/database.types";

export type EmailLog = Pick<
  Database["public"]["Tables"]["email_logs"]["Row"],
  "id" | "subject" | "body" | "direction" | "sent_at" | "read"
>;

function formatSentAt(iso: string): string {
  return dayjs(iso).locale("fr").format("D MMM YYYY à HH:mm");
}

/** Historique des emails (envoyés/reçus) d'un contact ou d'une opportunité. */
export function EmailHistory({ logs }: { logs: EmailLog[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des emails</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {"Aucun email pour l'instant."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {logs.map((log) => {
              const outbound = log.direction === "outbound";
              return (
                <li
                  key={log.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge color={outbound ? "violet" : "green"}>
                        {outbound ? "Envoyé" : "Reçu"}
                      </StatusBadge>
                      <span className="truncate text-sm font-medium">
                        {log.subject ?? "(sans objet)"}
                      </span>
                    </div>
                    {log.body && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {log.body}
                      </p>
                    )}
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatSentAt(log.sent_at)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
