import { redirect } from "next/navigation";

/**
 * La liste des organisations a fusionné dans la rubrique « Contacts » (étape C) :
 * elle est désormais l'onglet « Lieux » de /contacts. On garde cette route en
 * redirection pour ne casser aucun lien / bookmark. Les fiches
 * /organizations/[id] restent servies normalement.
 */
export default function OrganizationsPage() {
  redirect("/contacts?tab=places");
}
