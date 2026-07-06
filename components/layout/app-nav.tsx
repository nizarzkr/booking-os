"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppShell,
  Badge,
  Button,
  Burger,
  Group,
  NavLink,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { logout } from "@/app/(auth)/actions";
import { PageTransition } from "@/components/layout/page-transition";

type NavItem = { label: string; href: string };
type NavSection = { title: string | null; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: null, // page d'action quotidienne, pas de titre de section
    items: [{ label: "Aujourd'hui", href: "/dashboard" }],
  },
  {
    title: "Booking",
    items: [
      { label: "Dates", href: "/opportunities" }, // Kanban / Liste / Calendrier (fusion étape B)
      { label: "Contacts", href: "/contacts" }, // onglets Personnes / Lieux (fusion étape C)
    ],
  },
  {
    title: null, // entrée seule → pas de titre de section (évite le doublon)
    items: [
      // Hub à onglets Séquences / Modèles / Réception (fusion étape D).
      // Porte le badge non-lus (réponses entrantes).
      { label: "Prospection", href: "/outreach" },
    ],
  },
  {
    title: null, // bloc outils, détaché en bas
    items: [
      { label: "Tâches", href: "/tasks" },
      { label: "Réglages", href: "/settings" },
    ],
  },
];

export function AppNav({
  workspaceName,
  unreadInbox = 0,
  children,
}: {
  workspaceName: string;
  unreadInbox?: number;
  children: React.ReactNode;
}) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();

  const surface = "var(--mantine-color-dark-6)";

  return (
    <AppShell
      header={{ height: 52 }}
      navbar={{
        width: 236,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="lg"
    >
      <AppShell.Header bg={surface}>
        <Group h="100%" px="md" gap="sm">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text fw={600} fz="sm" style={{ letterSpacing: "-0.01em" }}>
            Booking OS
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar bg={surface} p="sm">
        <Stack justify="space-between" h="100%">
          <Stack gap={2}>
            <Text
              size="xs"
              c="dimmed"
              fw={600}
              tt="uppercase"
              px="xs"
              mb={4}
              style={{ letterSpacing: "0.04em" }}
            >
              {workspaceName}
            </Text>

            {NAV_SECTIONS.map((section, i) => (
              <Stack key={section.title ?? `section-${i}`} gap={2}>
                {section.title && (
                  <Text
                    size="xs"
                    c="dimmed"
                    fw={600}
                    tt="uppercase"
                    px="xs"
                    mt="sm"
                    mb={2}
                    style={{ letterSpacing: "0.04em" }}
                  >
                    {section.title}
                  </Text>
                )}

                {section.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  const showBadge =
                    item.href === "/outreach" && unreadInbox > 0;
                  return (
                    <NavLink
                      key={item.href}
                      component={Link}
                      href={item.href}
                      label={item.label}
                      onClick={close}
                      active={active}
                      variant="light"
                      rightSection={
                        showBadge ? (
                          <Badge
                            color="green"
                            variant="filled"
                            size="sm"
                            circle
                          >
                            {unreadInbox}
                          </Badge>
                        ) : undefined
                      }
                      styles={{
                        root: { borderRadius: "var(--mantine-radius-md)" },
                      }}
                    />
                  );
                })}
              </Stack>
            ))}
          </Stack>

          <form action={logout}>
            <Button type="submit" variant="subtle" color="gray" fullWidth>
              Se déconnecter
            </Button>
          </form>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <PageTransition>{children}</PageTransition>
      </AppShell.Main>
    </AppShell>
  );
}
