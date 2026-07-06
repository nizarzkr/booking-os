import { Badge, Box, Button, Group, Stack, Text, Title } from "@mantine/core";

export default function HomePage() {
  return (
    <Box mih="100dvh" style={{ display: "flex", flexDirection: "column" }}>
      {/* Header : marque à gauche, accès connexion / inscription à droite */}
      <Group component="header" p="md" justify="space-between" wrap="nowrap">
        <Text fw={600} fz="sm" style={{ letterSpacing: "-0.01em" }}>
          Booking OS
        </Text>
        <Group gap="sm">
          <Button component="a" href="/login" variant="default" size="sm">
            Se connecter
          </Button>
          <Button component="a" href="/register" size="sm">
            Créer un compte
          </Button>
        </Group>
      </Group>

      {/* Hero */}
      <Stack align="center" justify="center" gap="lg" p="md" style={{ flex: 1 }}>
        <Badge variant="light" color="violet" size="lg">
          Pour les artistes indépendants
        </Badge>
        <Title
          order={1}
          fz={{ base: 44, sm: 64 }}
          fw={700}
          ta="center"
          style={{ letterSpacing: "-0.02em" }}
        >
          Le booking, simplifié.
        </Title>
        <Text c="dimmed" fz="lg" ta="center" maw={500}>
          Sache exactement qui contacter ou relancer aujourd&apos;hui pour
          décrocher plus de dates. Contacts, opportunités, emails et agenda —
          au même endroit.
        </Text>
        <Button component="a" href="/register" size="md" mt="xs">
          Commencer gratuitement
        </Button>
      </Stack>
    </Box>
  );
}
