import { Group, Skeleton, SimpleGrid, Stack } from "@mantine/core";

/**
 * Squelette de chargement pour les fiches détail (contact / opportunité /
 * organisation) : en-tête titre + actions, grille d'infos, sections.
 * Cohérent avec la mise en page réelle des fiches.
 */
export function DetailSkeleton() {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <Skeleton height={30} width={240} radius="md" />
        <Group gap="sm">
          <Skeleton height={34} width={90} radius="md" />
          <Skeleton height={34} width={90} radius="md" />
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={44} radius="md" />
        ))}
      </SimpleGrid>

      <Skeleton height={140} radius="lg" />
      <Skeleton height={140} radius="lg" />
    </Stack>
  );
}
