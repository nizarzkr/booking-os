import { redirect } from "next/navigation";

/**
 * Les modèles d'email ont fusionné dans la rubrique « Prospection » (étape D) :
 * ils sont désormais l'onglet « Modèles » de /outreach. On garde cette route en
 * redirection pour ne casser aucun lien / bookmark.
 */
export default function TemplatesPage() {
  redirect("/outreach?tab=templates");
}
