import { Badge, Center, Stack, Text, Title } from "@mantine/core";

export default function HomePage() {
  return (
    <Center mih="100dvh" p="md">
      <Stack align="center" gap="md">
        <Badge variant="light" color="violet" size="lg">
          MVP en construction
        </Badge>
        <Title order={1} fz={{ base: 44, sm: 60 }} fw={700} ta="center">
          Booking OS
        </Title>
        <Text c="dimmed" fz="lg" ta="center" maw={440}>
          Coming soon — le booking simplifié pour les artistes indépendants.
        </Text>
      </Stack>
    </Center>
  );
}
