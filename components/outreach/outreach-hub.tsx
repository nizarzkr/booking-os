"use client";

import { useState } from "react";
import { Tabs } from "@mantine/core";

import { SequencesList } from "@/components/sequences/sequences-list";
import { type SequenceListItem } from "@/components/sequences/sequence-types";
import { TemplatesView } from "@/components/templates/templates-view";
import { type EmailTemplate } from "@/components/templates/template-types";
import {
  type PreviewContact,
  type PreviewOpportunity,
} from "@/components/templates/template-preview-modal";
import { InboxView, type InboxItem } from "@/components/inbox/inbox-view";

export type OutreachTab = "sequences" | "templates" | "inbox";

type Props = {
  sequences: SequenceListItem[];
  templates: EmailTemplate[];
  previewContacts: PreviewContact[];
  previewOpportunities: PreviewOpportunity[];
  artistName: string;
  inboxItems: InboxItem[];
  initialTab?: OutreachTab;
};

export function OutreachHub({
  sequences,
  templates,
  previewContacts,
  previewOpportunities,
  artistName,
  inboxItems,
  initialTab = "inbox",
}: Props) {
  const [tab, setTab] = useState<OutreachTab>(initialTab);

  // Sync de l'onglet dans l'URL (?tab=…) sans refetch : l'état local reste la
  // source de vérité, l'onglet courant devient partageable / persistant.
  function changeTab(next: string | null) {
    if (next !== "sequences" && next !== "templates" && next !== "inbox") return;
    setTab(next);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?tab=${next}`,
    );
  }

  return (
    <Tabs value={tab} onChange={changeTab} keepMounted={false}>
      <Tabs.List mb="lg">
        <Tabs.Tab value="sequences">Séquences</Tabs.Tab>
        <Tabs.Tab value="templates">Modèles</Tabs.Tab>
        <Tabs.Tab value="inbox">Réception</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="sequences">
        <SequencesList sequences={sequences} />
      </Tabs.Panel>

      <Tabs.Panel value="templates">
        <TemplatesView
          templates={templates}
          contacts={previewContacts}
          opportunities={previewOpportunities}
          artistName={artistName}
        />
      </Tabs.Panel>

      <Tabs.Panel value="inbox">
        <InboxView items={inboxItems} />
      </Tabs.Panel>
    </Tabs>
  );
}
