import { redirect } from "next/navigation";

/**
 * Le Kanban a fusionné dans la rubrique « Dates » (étape B) : il est désormais
 * une vue de /opportunities. On garde cette route en redirection pour ne casser
 * aucun lien / bookmark existant.
 */
export default function PipelinePage() {
  redirect("/opportunities?view=kanban");
}
