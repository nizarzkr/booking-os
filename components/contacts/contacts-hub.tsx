"use client";

import { useState } from "react";
import { Tabs } from "@mantine/core";

import { ContactsView } from "@/components/contacts/contacts-view";
import { type Contact } from "@/components/contacts/roles";
import { OrganizationsView } from "@/components/organizations/organizations-view";
import { type Organization } from "@/components/organizations/org-types";
import { type Sequence } from "@/components/sequences/sequence-types";

export type ContactsTab = "people" | "places";

type Props = {
  contacts: Contact[];
  organizations: Organization[];
  sequences: Sequence[];
  initialTab?: ContactsTab;
};

export function ContactsHub({
  contacts,
  organizations,
  sequences,
  initialTab = "people",
}: Props) {
  const [tab, setTab] = useState<ContactsTab>(initialTab);

  // Sync de l'onglet dans l'URL (?tab=…) sans refetch : l'état local reste la
  // source de vérité, mais l'onglet courant devient partageable / persistant.
  function changeTab(next: string | null) {
    if (next !== "people" && next !== "places") return;
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
        <Tabs.Tab value="people">Personnes</Tabs.Tab>
        <Tabs.Tab value="places">Lieux &amp; structures</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="people">
        <ContactsView contacts={contacts} sequences={sequences} />
      </Tabs.Panel>

      <Tabs.Panel value="places">
        <OrganizationsView organizations={organizations} />
      </Tabs.Panel>
    </Tabs>
  );
}
