"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";

import {
  importContacts,
  type ImportReport,
} from "@/app/(app)/contacts/import/actions";
import { EMAIL_RE, type ContactInput } from "@/components/contacts/contact-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setParsed(null);
    setMapping(EMPTY_MAPPING);
    setParseError(null);
    setReport(null);
    if (fileRef.current) fileRef.current.value = "";
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

  const missingName = rows.filter((r) => !r.first_name.trim()).length;
  const invalidEmail = rows.filter(
    (r) => r.email.trim() && !EMAIL_RE.test(r.email.trim()),
  ).length;

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
    <div className="flex max-w-3xl flex-col gap-6">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => handleFile(e.currentTarget.files?.[0] ?? null)}
      />

      <Link
        href="/contacts"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Contacts
      </Link>
      <h1 className="text-2xl font-semibold">Importer des contacts</h1>

      {parseError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {parseError}
        </div>
      )}

      {report ? (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
              {report.inserted} contact{report.inserted > 1 ? "s" : ""} importé
              {report.inserted > 1 ? "s" : ""}.
            </div>

            {report.skipped.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                  {report.skipped.length} ligne
                  {report.skipped.length > 1 ? "s" : ""} ignorée
                  {report.skipped.length > 1 ? "s" : ""} :
                </p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {report.skipped.slice(0, 20).map((s) => (
                    <li key={s.line}>
                      Ligne {s.line} — {s.reason}
                    </li>
                  ))}
                </ul>
                {report.skipped.length > 20 && (
                  <p className="text-xs text-muted-foreground">
                    … et {report.skipped.length - 20} autre(s).
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button render={<Link href="/contacts" />}>
                Voir les contacts
              </Button>
              <Button variant="outline" onClick={reset}>
                Importer un autre fichier
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Étape 1 — upload */}
          <Card>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <p className="font-medium">Fichier CSV</p>
                <p className="text-sm text-muted-foreground">
                  Première ligne = en-têtes de colonnes. Max {MAX_ROWS} lignes.
                </p>
              </div>
              <Button
                variant={parsed ? "outline" : "default"}
                onClick={() => fileRef.current?.click()}
              >
                {parsed ? "Changer de fichier" : "Choisir un fichier"}
              </Button>
            </CardContent>
          </Card>

          {parsed && (
            <>
              {/* Étape 2 — mapping */}
              <Card>
                <CardHeader>
                  <CardTitle>Correspondance des colonnes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {TARGET_FIELDS.map((f) => (
                      <Field
                        key={f.key}
                        label={f.required ? `${f.label} (requis)` : f.label}
                        error={
                          f.required && !mapping[f.key]
                            ? "Colonne requise"
                            : undefined
                        }
                      >
                        <Select
                          value={mapping[f.key] ?? ""}
                          onValueChange={(v) =>
                            setMapping((m) => ({
                              ...m,
                              [f.key]: v ? String(v) : null,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="— Ignorer —" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">— Ignorer —</SelectItem>
                            {parsed.columns.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Étape 3 — aperçu */}
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>Aperçu</CardTitle>
                    <Badge variant="secondary">
                      {rows.length} ligne{rows.length > 1 ? "s" : ""}
                    </Badge>
                    {missingName > 0 && (
                      <StatusBadge color="red">
                        {missingName} sans prénom/nom
                      </StatusBadge>
                    )}
                    {invalidEmail > 0 && (
                      <StatusBadge color="yellow">
                        {invalidEmail} email(s) invalide(s)
                      </StatusBadge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prénom / Nom</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Téléphone</TableHead>
                          <TableHead>Rôle</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.slice(0, PREVIEW_LIMIT).map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{r.first_name || "—"}</TableCell>
                            <TableCell>{r.last_name || "—"}</TableCell>
                            <TableCell>{r.email || "—"}</TableCell>
                            <TableCell>{r.phone || "—"}</TableCell>
                            <TableCell>{r.role || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {rows.length > PREVIEW_LIMIT && (
                    <p className="text-xs text-muted-foreground">
                      … et {rows.length - PREVIEW_LIMIT} autre(s) ligne(s).
                    </p>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={handleImport}
                      disabled={loading || !mapping.first_name}
                    >
                      {loading
                        ? "Import…"
                        : `Importer ${rows.length} contact${rows.length > 1 ? "s" : ""}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
