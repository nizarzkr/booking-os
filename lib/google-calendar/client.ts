import "server-only";

const CALENDAR_EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

/**
 * Couleurs Google Calendar (colorId) par statut d'opportunité.
 * 5 = « Banana » (jaune) pour les options, 10 = « Basil » (vert) pour confirmé.
 */
export const CALENDAR_COLOR = { option: "5", confirmed: "10" } as const;

export type CalendarEventInput = {
  summary: string;
  description?: string;
  location?: string;
  date: string; // "YYYY-MM-DD" (événement journée entière)
  colorId?: string;
};

/** Fin exclusive d'un événement journée entière : gig_date + 1 jour. */
function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function buildBody(input: CalendarEventInput) {
  return {
    summary: input.summary,
    description: input.description || undefined,
    location: input.location || undefined,
    colorId: input.colorId,
    start: { date: input.date },
    end: { date: nextDay(input.date) },
  };
}

/** Crée un événement ; renvoie son id Google. */
export async function createCalendarEvent(
  accessToken: string,
  input: CalendarEventInput,
): Promise<string> {
  const res = await fetch(CALENDAR_EVENTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildBody(input)),
  });
  if (!res.ok) {
    throw new Error(`Création de l'événement Calendar échouée (${res.status}).`);
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

/**
 * Met à jour un événement existant. Renvoie `false` si l'événement n'existe
 * plus côté Google (404) → l'appelant peut recréer.
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  input: CalendarEventInput,
): Promise<boolean> {
  const res = await fetch(`${CALENDAR_EVENTS_URL}/${eventId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildBody(input)),
  });
  if (res.status === 404 || res.status === 410) return false;
  if (!res.ok) {
    throw new Error(`Mise à jour de l'événement Calendar échouée (${res.status}).`);
  }
  return true;
}

/** Supprime un événement (best-effort ; 404/410 = déjà absent, OK). */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
): Promise<void> {
  const res = await fetch(`${CALENDAR_EVENTS_URL}/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.ok || res.status === 404 || res.status === 410) return;
  throw new Error(`Suppression de l'événement Calendar échouée (${res.status}).`);
}
