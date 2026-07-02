"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppShell,
  Button,
  Burger,
  Group,
  NavLink,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { logout } from "@/app/(auth)/actions";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pipeline", href: "/pipeline" },
  { label: "Contacts", href: "/contacts" },
  { label: "Organisations", href: "/organizations" },
  { label: "Opportunités", href: "/opportunities" },
  { label: "Tâches", href: "/tasks" },
  { label: "Templates", href: "/templates" },
];

export function AppNav({
  workspaceName,
  children,
}: {
  workspaceName: string;
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

            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  onClick={close}
                  active={active}
                  variant="light"
                  styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
                />
              );
            })}
          </Stack>

          <form action={logout}>
            <Button type="submit" variant="subtle" color="gray" fullWidth>
              Se déconnecter
            </Button>
          </form>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
