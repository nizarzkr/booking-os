"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, Group, Stack, Text, Title } from "@mantine/core";

/**
 * Frontière d'erreur des routes applicatives (App Router).
 * Remplace l'écran blanc / l'overlay dev par une UI de récupération.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log serveur/console ; Sentry prendra le relais quand branché.
    console.error(error);
  }, [error]);

  return (
    <Stack align="center" gap="xs" py={64}>
      <Title order={2} fw={600}>
        Une erreur est survenue
      </Title>
      <Text c="dimmed" size="sm" ta="center" maw={420}>
        {"Quelque chose s'est mal passé de notre côté. Réessaie, ou reviens au dashboard."}
      </Text>
      <Group mt="sm">
        <Button onClick={reset}>Réessayer</Button>
        <Button variant="default" component={Link} href="/dashboard">
          Retour au dashboard
        </Button>
      </Group>
    </Stack>
  );
}
