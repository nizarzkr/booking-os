import { Group, Skeleton, Stack } from "@mantine/core";

/**
 * UI de chargement affichée pendant la navigation serveur (App Router).
 * Squelette générique cohérent avec la mise en page des vues liste.
 */
export default function Loading() {
  return (
    <Stack gap="lg">
      <Skeleton height={32} width={220} radius="md" />
      <Group>
        <Skeleton height={36} radius="md" style={{ flex: 1 }} />
        <Skeleton height={36} width={200} radius="md" />
      </Group>
      <Stack gap="sm">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={56} radius="md" />
        ))}
      </Stack>
    </Stack>
  );
}
