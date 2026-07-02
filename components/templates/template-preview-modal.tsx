"use client";

import { useMemo, useState } from "react";
import { Card, Divider, Group, Modal, Select, Stack, Text } from "@mantine/core";

import { formatFee, formatGigDate } from "@/components/opportunities/opportunity-types";
import {
  renderTemplate,
  type EmailTemplate,
  type TemplateVars,
} from "@/components/templates/template-types";

export type PreviewContact = { id: string; name: string };
export type PreviewOpportunity = {
  id: string;
  title: string;
  venue: string | null;
  gig_date: string | null;
  fee: number | null;
  city: string | null;
};

type Props = {
  template: EmailTemplate;
  contacts: PreviewContact[];
  opportunities: PreviewOpportunity[];
  artistName: string;
  onClose: () => void;
};

export function TemplatePreviewModal({
  template,
  contacts,
  opportunities,
  artistName,
  onClose,
}: Props) {
  const [contactId, setContactId] = useState<string | null>(
    contacts[0]?.id ?? null,
  );
  const [opportunityId, setOpportunityId] = useState<string | null>(
    opportunities[0]?.id ?? null,
  );

  const vars = useMemo<Partial<TemplateVars>>(() => {
    const contact = contacts.find((c) => c.id === contactId);
    const opp = opportunities.find((o) => o.id === opportunityId);
    return {
      contact_name: contact?.name ?? "",
      artist_name: artistName,
      venue: opp?.venue ?? "",
      gig_date: opp?.gig_date ? formatGigDate(opp.gig_date) : "",
      fee: opp?.fee !== null && opp?.fee !== undefined ? formatFee(opp.fee) : "",
      city: opp?.city ?? "",
    };
  }, [contactId, opportunityId, contacts, opportunities, artistName]);

  const subject = renderTemplate(template.subject, vars);
  const body = renderTemplate(template.body, vars);

  return (
    <Modal
      opened
      onClose={onClose}
      title={`Aperçu — ${template.name}`}
      centered
      size="lg"
    >
      <Stack gap="md">
        <Group grow>
          <Select
            label="Contact (aperçu)"
            placeholder="Aucun contact"
            data={contacts.map((c) => ({ value: c.id, label: c.name }))}
            value={contactId}
            onChange={setContactId}
            searchable
            clearable
            nothingFoundMessage="Aucun contact"
          />
          <Select
            label="Opportunité (aperçu)"
            placeholder="Aucune opportunité"
            data={opportunities.map((o) => ({ value: o.id, label: o.title }))}
            value={opportunityId}
            onChange={setOpportunityId}
            searchable
            clearable
            nothingFoundMessage="Aucune opportunité"
          />
        </Group>

        <Card withBorder padding="lg">
          <Stack gap="xs">
            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
              Objet
            </Text>
            <Text size="sm" fw={600}>
              {subject || "—"}
            </Text>
            <Divider />
            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
              Message
            </Text>
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {body || "—"}
            </Text>
          </Stack>
        </Card>

        <Text c="dimmed" size="xs">
          Les variables sans donnée (ex. pas d&apos;opportunité sélectionnée)
          restent affichées entre accolades.
        </Text>
      </Stack>
    </Modal>
  );
}
