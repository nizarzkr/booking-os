"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Info } from "lucide-react";

import {
  connectEmailAccount,
  type ConnectEmailInput,
} from "@/app/(app)/settings/email-actions";
import { PROVIDER_PRESETS, getPreset } from "@/lib/email/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EmailConnectModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [providerId, setProviderId] = useState("gmail");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState<number>(465);
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState<number>(993);
  const [imapSecure, setImapSecure] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preset = useMemo(() => getPreset(providerId), [providerId]);
  const isOther = preset ? !preset.known : false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const input: ConnectEmailInput = {
      providerId,
      email,
      username,
      password,
      ...(isOther
        ? {
            smtp_host: smtpHost,
            smtp_port: smtpPort,
            smtp_secure: smtpSecure,
            imap_host: imapHost,
            imap_port: imapPort,
            imap_secure: imapSecure,
          }
        : {}),
    };
    const res = await connectEmailAccount(input);
    setPending(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    toast.success("Adresse connectée.");
    onClose();
    router.refresh();
  }

  return (
    <Dialog
      open={opened}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connecter une adresse email</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Fournisseur">
            <Select
              value={providerId}
              onValueChange={(v) => v && setProviderId(String(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Tutoriel — instructions du fournisseur sélectionné */}
          {preset && (
            <div className="flex flex-col gap-2 rounded-md bg-muted px-3 py-3">
              <p className="text-sm font-semibold">
                Comment obtenir tes identifiants
              </p>
              <ol className="list-decimal flex-col gap-1 pl-5 text-sm text-muted-foreground">
                {preset.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Utilise un <strong>mot de passe d&apos;application</strong>,
                  jamais ton mot de passe habituel. Il est chiffré et n&apos;est
                  utilisé que pour envoyer et relever tes emails.
                </p>
              </div>
            </div>
          )}

          <Field label="Adresse email" htmlFor="ec_email" required>
            <Input
              id="ec_email"
              type="email"
              placeholder="toi@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
          </Field>

          <Field label="Mot de passe d'application" htmlFor="ec_pw" required>
            <Input
              id="ec_pw"
              type="password"
              placeholder="Le mot de passe généré ci-dessus"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
          </Field>

          {isOther && (
            <>
              <Field
                label="Nom d'utilisateur"
                htmlFor="ec_user"
                hint="Souvent identique à ton adresse email — laisse vide si c'est le cas."
              >
                <Input
                  id="ec_user"
                  placeholder="toi@exemple.com"
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <Field label="Serveur SMTP (envoi)" htmlFor="ec_smtp" required>
                  <Input
                    id="ec_smtp"
                    placeholder="smtp.exemple.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.currentTarget.value)}
                  />
                </Field>
                <Field label="Port SMTP" htmlFor="ec_smtp_port">
                  <Input
                    id="ec_smtp_port"
                    type="number"
                    className="w-24"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.currentTarget.value) || 465)}
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={smtpSecure} onCheckedChange={setSmtpSecure} />
                SMTP en SSL (port 465). Décoche pour STARTTLS (port 587).
              </label>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <Field label="Serveur IMAP (réception)" htmlFor="ec_imap" required>
                  <Input
                    id="ec_imap"
                    placeholder="imap.exemple.com"
                    value={imapHost}
                    onChange={(e) => setImapHost(e.currentTarget.value)}
                  />
                </Field>
                <Field label="Port IMAP" htmlFor="ec_imap_port">
                  <Input
                    id="ec_imap_port"
                    type="number"
                    className="w-24"
                    value={imapPort}
                    onChange={(e) => setImapPort(Number(e.currentTarget.value) || 993)}
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={imapSecure} onCheckedChange={setImapSecure} />
                IMAP en SSL (port 993).
              </label>
            </>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Test…" : "Tester et connecter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
