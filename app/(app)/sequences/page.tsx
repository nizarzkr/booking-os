import { redirect } from "next/navigation";

/**
 * La liste des séquences vit dans le hub Prospection (onglet Séquences).
 * Cette route sert de filet pour les liens directs vers /sequences.
 */
export default function SequencesPage() {
  redirect("/outreach?tab=sequences");
}
