import { Button, Stack, Text, Title } from "@mantine/core";

/**
 * 404 des routes applicatives — rendu dans le shell (sidebar), déclenché par
 * les `notFound()` des fiches (contact / opportunité / organisation absente).
 */
export default function NotFound() {
  return (
    <Stack align="center" gap="xs" py={64}>
      <Title order={2} fw={600}>
        Introuvable
      </Title>
      <Text c="dimmed" size="sm" ta="center" maw={420}>
        {"Cette page ou cette fiche n'existe pas (ou plus)."}
      </Text>
      <Button component="a" href="/dashboard" mt="sm">
        Retour au dashboard
      </Button>
    </Stack>
  );
}
