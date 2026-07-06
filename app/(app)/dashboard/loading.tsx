import { SimpleGrid, Skeleton, Stack } from "@mantine/core";

/** Squelette du dashboard (compteurs + sections), pendant le chargement serveur. */
export default function DashboardLoading() {
  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Skeleton height={34} width={200} radius="md" />
        <Skeleton height={16} width={140} radius="sm" />
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={92} radius="lg" />
        ))}
      </SimpleGrid>

      <Skeleton height={160} radius="lg" />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Skeleton height={160} radius="lg" />
        <Skeleton height={160} radius="lg" />
      </SimpleGrid>
    </Stack>
  );
}
