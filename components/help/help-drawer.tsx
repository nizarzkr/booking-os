"use client";

import { usePathname } from "next/navigation";
import {
  ActionIcon,
  Drawer,
  List,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { getHelpForPath } from "@/components/help/help-content";

export function HelpDrawer() {
  const [opened, { open, close }] = useDisclosure(false);
  const pathname = usePathname();
  const help = getHelpForPath(pathname);

  return (
    <>
      <Tooltip label="Aide sur cette page" position="bottom">
        <ActionIcon
          variant="default"
          radius="xl"
          size="lg"
          onClick={open}
          aria-label="Ouvrir l'aide de la page"
        >
          <Text fw={700} fz="sm">
            ?
          </Text>
        </ActionIcon>
      </Tooltip>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="md"
        title={
          <Text fw={700} fz="sm" tt="uppercase" c="dimmed">
            Aide
          </Text>
        }
      >
        <Stack gap="lg">
          <Stack gap={4}>
            <Title order={2} fz="h3">
              {help.title}
            </Title>
            <Text c="dimmed" size="sm">
              {help.intro}
            </Text>
          </Stack>

          <Stack gap="xs">
            <Text fw={700} size="sm">
              Comment faire
            </Text>
            <List
              spacing="xs"
              size="sm"
              type="ordered"
              styles={{ item: { paddingLeft: 4 } }}
            >
              {help.howTo.map((step, i) => (
                <List.Item key={i}>{step}</List.Item>
              ))}
            </List>
          </Stack>

          <Stack gap="xs">
            <Text fw={700} size="sm">
              Conseils pour aller plus loin
            </Text>
            <List
              spacing="xs"
              size="sm"
              icon={
                <ThemeIcon color="green" size={18} radius="xl">
                  <Text fz={10} fw={700}>
                    ★
                  </Text>
                </ThemeIcon>
              }
            >
              {help.tips.map((tip, i) => (
                <List.Item key={i}>{tip}</List.Item>
              ))}
            </List>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}
