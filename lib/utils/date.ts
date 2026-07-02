import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/fr";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Fuseau de référence de l'app (MVP français).
 *
 * « Aujourd'hui » DOIT se calculer sur un fuseau fixe, sinon le résultat
 * dépend de l'endroit où tourne le code : un Server Component sur Vercel est
 * en UTC, un navigateur est dans le fuseau du visiteur. Résultat : décalage
 * d'un jour près de minuit (« à relancer aujourd'hui »/« en retard » faux).
 *
 * On fige donc Europe/Paris pour que serveur et client soient toujours
 * d'accord. À rendre configurable par workspace plus tard si besoin.
 */
export const APP_TZ = "Europe/Paris";

/** « Aujourd'hui » (`YYYY-MM-DD`) dans le fuseau de l'app. */
export function todayISO(): string {
  return dayjs().tz(APP_TZ).format("YYYY-MM-DD");
}

/** Date ISO (`YYYY-MM-DD`) décalée de `days` jours vs aujourd'hui (fuseau app). */
export function isoInDays(days: number): string {
  return dayjs().tz(APP_TZ).add(days, "day").format("YYYY-MM-DD");
}

/** Libellé long « lundi 2 juillet 2026 » pour aujourd'hui (fuseau app, fr). */
export function todayLabelFr(): string {
  return dayjs().tz(APP_TZ).locale("fr").format("dddd D MMMM YYYY");
}
