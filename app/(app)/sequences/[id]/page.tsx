import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/components/contacts/roles";
import { SequenceDetail } from "@/components/sequences/sequence-detail";
import {
  type EnrollmentRow,
  type EnrollmentStatus,
  type SequenceStep,
} from "@/components/sequences/sequence-types";

export default async function SequencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: sequence } = await supabase
    .from("sequences")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!sequence) notFound();

  const [{ data: stepRows }, { data: enrollRows }, { data: contacts }] =
    await Promise.all([
      supabase
        .from("sequence_steps")
        .select("id, step_order, delay_days, subject, body")
        .eq("sequence_id", id)
        .order("step_order", { ascending: true }),
      supabase
        .from("sequence_enrollments")
        .select(
          "id, contact_id, status, current_step, next_send_at, stop_reason, contacts(first_name, last_name)",
        )
        .eq("sequence_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("contacts")
        .select("id, first_name, last_name")
        .order("first_name", { ascending: true }),
    ]);

  const steps: SequenceStep[] = stepRows ?? [];

  const enrollments: EnrollmentRow[] = (enrollRows ?? []).map((e) => ({
    id: e.id,
    contact_id: e.contact_id,
    contact_name: e.contacts ? fullName(e.contacts) : "Contact",
    status: e.status as EnrollmentStatus,
    current_step: e.current_step,
    next_send_at: e.next_send_at,
    stop_reason: e.stop_reason,
  }));

  const enrolledIds = new Set(enrollments.map((e) => e.contact_id));
  const enrollableContacts = (contacts ?? [])
    .filter((c) => !enrolledIds.has(c.id))
    .map((c) => ({ id: c.id, name: fullName(c) }));

  return (
    <SequenceDetail
      sequence={sequence}
      steps={steps}
      enrollments={enrollments}
      enrollableContacts={enrollableContacts}
    />
  );
}
