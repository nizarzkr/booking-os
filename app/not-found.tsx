import { Button, Center, Stack, Text, Title } from "@mantine/core";

/** 404 racine (URLs non reconnues hors shell applicatif). */
export default function NotFound() {
  return (
    <Center mih="100dvh" p="md">
      <Stack align="center" gap="xs">
        <Title order={2} fw={600}>
          Page introuvable
        </Title>
        <Text c="dimmed" size="sm" ta="center" maw={420}>
          {"Cette page n'existe pas."}
        </Text>
        <Button component="a" href="/dashboard" mt="sm">
          {"Retour à l'accueil"}
        </Button>
      </Stack>
    </Center>
  );
}
