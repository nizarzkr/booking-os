"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  FileButton,
  Group,
  List,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

import {
  importContacts,
  type ImportReport,
} from "@/app/(app)/settings/import/actions";
import { EMAIL_RE, type ContactInput } from "@/components/contacts/contact-input";

const MAX_ROWS = 1000;
const PREVIEW_LIMIT = 8;

type TargetField = keyof ContactInput;

const TARGET_FIELDS: { key: TargetField; label: string; required: boolean }[] = [
  { key: "first_name", label: "Prénom / Nom", required: true },
  { key: "last_name", label: "Nom de famille", required: false },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Téléphone", required: false },
  { key: "role", label: "Rôle", required: false },
  { key: "notes", label: "Notes", required: false },
];

// Mots-clés d'auto-détection par champ (sur en-tête normalisé sans accents).
const GUESS: Record<TargetField, string[]> = {
  first_name: ["prenom", "first"],
  last_name: ["nom de famille", "last", "surname", "famille", "nom"],
  email: ["email", "mail", "courriel"],
  phone: ["tel", "phone", "portable", "mobile"],
  role: ["role", "fonction", "type"],
  notes: ["note", "remarque", "comment"],
};

type Mapping = Record<TargetField, string | null>;
const EMPTY_MAPPING: Mapping = {
  first_name: null,
  last_name: null,
  email: null,
  phone: null,
  role: null,
  notes: null,
};

function deburr(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Devine le mapping en associant chaque champ à une colonne encore libre. */
function guessMapping(columns: string[]): Mapping {
  const mapping = { ...EMPTY_MAPPING };
  const used = new Set<string>();
  for (const field of TARGET_FIELDS) {
    const match = columns.find(
      (col) =>
        !used.has(col) &&
        GUESS[field.key].some((kw) => deburr(col).includes(kw)),
    );
    if (match) {
      mapping[field.key] = match;
      used.add(match);
    }
  }
  return mapping;
}

type Parsed = { columns: string[]; rows: Record<string, string>[] };

export function ContactImporter() {
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [mapping, setMapping] = useState<Mapping>(EMPTY_MAPPING);
  const [parseError, setParseError] = useState<string | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setParsed(null);
    setMapping(EMPTY_MAPPING);
    setParseError(null);
    setReport(null);
  }

  function handleFile(file: File | null) {
    if (!file) return;
    setParseError(null);
    setReport(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const columns = (res.meta.fields ?? []).filter((c) => c.trim() !== "");
        if (columns.length === 0) {
          setParseError("Fichier CSV vide ou sans ligne d'en-tête.");
          return;
        }
        if (res.data.length === 0) {
          setParseError("Aucune ligne de données dans le fichier.");
          return;
        }
        if (res.data.length > MAX_ROWS) {
          setParseError(`Trop de lignes (max ${MAX_ROWS} par import).`);
          return;
        }
        setParsed({ columns, rows: res.data });
        setMapping(guessMapping(columns));
      },
      error: () => setParseError("Impossible de lire le fichier."),
    });
  }

  // Lignes mappées vers le format ContactInput.
  const rows: ContactInput[] = useMemo(() => {
    if (!parsed) return [];
    const val = (row: Record<string, string>, col: string | null) =>
      col ? (row[col] ?? "") : "";
    return parsed.rows.map((row) => ({
      first_name: val(row, mapping.first_name),
      last_name: val(row, mapping.last_name),
      email: val(row, mapping.email),
      phone: val(row, mapping.phone),
      role: mapping.role ? (row[mapping.role]?.toLowerCase().trim() ?? null) : null,
      notes: val(row, mapping.notes),
    }));
  }, [parsed, mapping]);

  // Estimations client (le rapport serveur fait foi pour les doublons).
  const missingName = rows.filter((r) => !r.first_name.trim()).length;
  const invalidEmail = rows.filter(
    (r) => r.email.trim() && !EMAIL_RE.test(r.email.trim()),
  ).length;

  const columnOptions = parsed
    ? parsed.columns.map((c) => ({ value: c, label: c }))
    : [];

  async function handleImport() {
    setLoading(true);
    const result = await importContacts(rows);
    setLoading(false);
    if ("error" in result) {
      setParseError(result.error);
      return;
    }
    setReport(result);
  }

  return (
    <Stack gap="xl" maw={820}>
      <Group gap="sm">
        <Anchor component={Link} href="/settings" size="sm" c="dimmed">
          ← Réglages
        </Anchor>
      </Group>
      <Title order={2} fw={400}>
        Importer des contacts
      </Title>

      {parseError && (
        <Alert color="red" variant="light" radius="md">
          {parseError}
        </Alert>
      )}

      {/* Rapport final */}
      {report ? (
        <Card withBorder radius="lg" padding="lg">
          <Stack gap="md">
            <Alert color="green" variant="light" radius="md">
              {report.inserted} contact{report.inserted > 1 ? "s" : ""} importé
              {report.inserted > 1 ? "s" : ""}.
            </Alert>

            {report.skipped.length > 0 && (
              <Stack gap="xs">
                <Text fw={500} size="sm">
                  {report.skipped.length} ligne
                  {report.skipped.length > 1 ? "s" : ""} ignorée
                  {report.skipped.length > 1 ? "s" : ""} :
                </Text>
                <List size="sm" c="dimmed">
                  {report.skipped.slice(0, 20).map((s) => (
                    <List.Item key={s.line}>
                      Ligne {s.line} — {s.reason}
                    </List.Item>
                  ))}
                </List>
                {report.skipped.length > 20 && (
                  <Text size="xs" c="dimmed">
                    … et {report.skipped.length - 20} autre(s).
                  </Text>
                )}
              </Stack>
            )}

            <Group>
              <Button component={Link} href="/contacts">
                Voir les contacts
              </Button>
              <Button variant="default" onClick={reset}>
                Importer un autre fichier
              </Button>
            </Group>
          </Stack>
        </Card>
      ) : (
        <>
          {/* Étape 1 — upload */}
          <Card withBorder radius="lg" padding="lg">
            <Group justify="space-between">
              <Stack gap={2}>
                <Text fw={600}>Fichier CSV</Text>
                <Text c="dimmed" size="sm">
                  Première ligne = en-têtes de colonnes. Max {MAX_ROWS} lignes.
                </Text>
              </Stack>
              <FileButton onChange={handleFile} accept=".csv,text/csv">
                {(props) => (
                  <Button {...props} variant={parsed ? "default" : "filled"}>
                    {parsed ? "Changer de fichier" : "Choisir un fichier"}
                  </Button>
                )}
              </FileButton>
            </Group>
          </Card>

          {parsed && (
            <>
              {/* Étape 2 — mapping */}
              <Card withBorder radius="lg" padding="lg">
                <Stack gap="md">
                  <Text fw={600}>Correspondance des colonnes</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    {TARGET_FIELDS.map((f) => (
                      <Select
                        key={f.key}
                        label={
                          f.required ? `${f.label} (requis)` : f.label
                        }
                        placeholder="— Ignorer —"
                        data={columnOptions}
                        value={mapping[f.key]}
                        onChange={(v) =>
                          setMapping((m) => ({ ...m, [f.key]: v }))
                        }
                        clearable
                        error={
                          f.required && !mapping[f.key]
                            ? "Colonne requise"
                            : undefined
                        }
                      />
                    ))}
                  </SimpleGrid>
                </Stack>
              </Card>

              {/* Étape 3 — aperçu */}
              <Card withBorder radius="lg" padding="lg">
                <Stack gap="md">
                  <Group gap="xs">
                    <Text fw={600}>Aperçu</Text>
                    <Badge variant="light" color="gray">
                      {rows.length} ligne{rows.length > 1 ? "s" : ""}
                    </Badge>
                    {missingName > 0 && (
                      <Badge variant="light" color="red">
                        {missingName} sans prénom/nom
                      </Badge>
                    )}
                    {invalidEmail > 0 && (
                      <Badge variant="light" color="yellow">
                        {invalidEmail} email(s) invalide(s)
                      </Badge>
                    )}
                  </Group>

                  <Table.ScrollContainer minWidth={640}>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Prénom / Nom</Table.Th>
                          <Table.Th>Nom</Table.Th>
                          <Table.Th>Email</Table.Th>
                          <Table.Th>Téléphone</Table.Th>
                          <Table.Th>Rôle</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {rows.slice(0, PREVIEW_LIMIT).map((r, i) => (
                          <Table.Tr key={i}>
                            <Table.Td>{r.first_name || "—"}</Table.Td>
                            <Table.Td>{r.last_name || "—"}</Table.Td>
                            <Table.Td>{r.email || "—"}</Table.Td>
                            <Table.Td>{r.phone || "—"}</Table.Td>
                            <Table.Td>{r.role || "—"}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>

                  {rows.length > PREVIEW_LIMIT && (
                    <Text size="xs" c="dimmed">
                      … et {rows.length - PREVIEW_LIMIT} autre(s) ligne(s).
                    </Text>
                  )}

                  <Group justify="flex-end">
                    <Button
                      onClick={handleImport}
                      loading={loading}
                      disabled={!mapping.first_name}
                    >
                      Importer {rows.length} contact
                      {rows.length > 1 ? "s" : ""}
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </>
          )}
        </>
      )}
    </Stack>
  );
}
