import { redirect } from "next/navigation";

/**
 * La boîte de réception a fusionné dans la rubrique « Prospection » (étape D) :
 * elle est désormais l'onglet « Réception » de /outreach. On garde cette route
 * en redirection pour ne casser aucun lien / bookmark (dashboard, badge nav).
 */
export default function InboxPage() {
  redirect("/outreach?tab=inbox");
}
