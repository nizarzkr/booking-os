import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getGmailConnection } from "@/lib/gmail/client";
import {
  CALENDAR_COLOR,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  type CalendarEventInput,
} from "@/lib/google-calendar/client";

/**
 * Synchronise une opportunité vers Google Calendar (réutilise la connexion
 * Google du compte Gmail — cf. décision 2026-07-06).
 *
 * Règles (roadmap 6.2) :
 * - statut `option` → événement jaune ; `confirmed` → événement vert.
 * - tout autre statut (ex. `cancelled`) ou date absente → pas d'événement.
 * - un `google_calendar_event_id` déjà posé est mis à jour (upsert), sinon créé.
 *
 * **Best-effort** : ne lève jamais. La mutation métier a déjà réussi ; un échec
 * de sync agenda ne doit pas casser l'action utilisateur (Calendar non connecté,
 * token sans scope, réseau…).
 */

type CalRow = {
  title: string;
  status: string;
  gig_date: string | null;
  city: string | null;
  venue: string | null;
  fee: number | null;
  notes: string | null;
  google_calendar_event_id: string | null;
};

function buildEventInput(row: CalRow): CalendarEventInput {
  const location = [row.venue, row.city].filter(Boolean).join(", ");
  const descriptionParts = [
    row.fee != null ? `Cachet : ${row.fee} €` : null,
    row.notes,
    "— via Booking OS",
  ].filter(Boolean);
  return {
    summary: row.title,
    location: location || undefined,
    description: descriptionParts.join("\n\n"),
    date: row.gig_date!,
    colorId:
      row.status === "confirmed"
        ? CALENDAR_COLOR.confirmed
        : CALENDAR_COLOR.option,
  };
}

export async function syncOpportunityCalendar(
  workspaceId: string,
  opportunityId: string,
): Promise<void> {
  try {
    const connection = await getGmailConnection(workspaceId);
    if (!connection) return; // Calendar/Gmail non connecté → no-op silencieux.

    const admin = createAdminClient();
    const { data: row } = await admin
      .from("opportunities")
      .select(
        "title, status, gig_date, city, venue, fee, notes, google_calendar_event_id",
      )
      .eq("id", opportunityId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (!row) return;

    const shouldHaveEvent =
      (row.status === "option" || row.status === "confirmed") &&
      Boolean(row.gig_date);

    const eventId = row.google_calendar_event_id;

    // Pas d'événement attendu → supprimer l'existant s'il y en a un.
    if (!shouldHaveEvent) {
      if (eventId) {
        await deleteCalendarEvent(connection.accessToken, eventId);
        await admin
          .from("opportunities")
          .update({ google_calendar_event_id: null })
          .eq("id", opportunityId)
          .eq("workspace_id", workspaceId);
      }
      return;
    }

    const input = buildEventInput(row as CalRow);

    // Événement attendu : mise à jour si connu (et encore présent), sinon création.
    if (eventId) {
      const stillExists = await updateCalendarEvent(
        connection.accessToken,
        eventId,
        input,
      );
      if (stillExists) return;
      // Événement supprimé côté Google → on en recrée un.
    }

    const newId = await createCalendarEvent(connection.accessToken, input);
    await admin
      .from("opportunities")
      .update({ google_calendar_event_id: newId })
      .eq("id", opportunityId)
      .eq("workspace_id", workspaceId);
  } catch {
    // best-effort : la sync agenda ne bloque jamais l'action métier.
  }
}

/**
 * Supprime l'événement agenda d'une opportunité en cours de suppression
 * (on a lu l'`event_id` avant de retirer la ligne). Best-effort.
 */
export async function removeOpportunityEvent(
  workspaceId: string,
  eventId: string,
): Promise<void> {
  try {
    const connection = await getGmailConnection(workspaceId);
    if (!connection) return;
    await deleteCalendarEvent(connection.accessToken, eventId);
  } catch {
    // best-effort
  }
}
