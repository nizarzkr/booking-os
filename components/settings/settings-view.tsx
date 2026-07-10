"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  updateWorkspace,
  deleteAccount,
  type WorkspaceInput,
} from "@/app/(app)/settings/actions";
import { disconnectGmail } from "@/app/(app)/settings/gmail-actions";
import { disconnectEmailAccount } from "@/app/(app)/settings/email-actions";
import { EmailConnectModal } from "@/components/settings/email-connect-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GmailState = { configured: boolean; email: string | null };
type EmailAccountState = { configured: boolean; email: string | null };

type Props = {
  workspace: {
    name: string;
    city: string | null;
    email_signature: string | null;
    reply_to: string | null;
  };
  accountEmail: string;
  gmail: GmailState;
  emailAccount: EmailAccountState;
  gmailFlash: string | null;
};

/** Messages de retour du flow OAuth (query `?gmail=...`). */
const GMAIL_FLASH: Record<
  string,
  { type: "success" | "warning" | "error"; message: string }
> = {
  connected: { type: "success", message: "Gmail connecté." },
  denied: { type: "warning", message: "Connexion Gmail annulée." },
  norefresh: {
    type: "error",
    message:
      "Google n'a pas renvoyé d'autorisation durable. Révoque l'accès dans ton compte Google puis réessaie.",
  },
  notconfigured: {
    type: "error",
    message: "Intégration Gmail non configurée côté serveur.",
  },
  error: { type: "error", message: "La connexion Gmail a échoué. Réessaie." },
};

export function SettingsView({
  workspace,
  accountEmail,
  gmail,
  emailAccount,
  gmailFlash,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(workspace.name ?? "");
  const [city, setCity] = useState(workspace.city ?? "");
  const [replyTo, setReplyTo] = useState(workspace.reply_to ?? "");
  const [signature, setSignature] = useState(workspace.email_signature ?? "");
  const [errors, setErrors] = useState<{ name?: string; reply_to?: string }>({});

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Notification de retour OAuth, une seule fois.
  const flashed = useRef(false);
  useEffect(() => {
    if (flashed.current || !gmailFlash) return;
    flashed.current = true;
    const flash = GMAIL_FLASH[gmailFlash];
    if (flash) toast[flash.type](flash.message);
    window.history.replaceState(null, "", window.location.pathname);
  }, [gmailFlash]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: { name?: string; reply_to?: string } = {};
    if (!name.trim()) next.name = "Ce champ est requis.";
    if (replyTo.trim() && !/^\S+@\S+\.\S+$/.test(replyTo.trim()))
      next.reply_to = "Adresse email invalide.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setServerError(null);
    const input: WorkspaceInput = {
      name,
      city,
      email_signature: signature,
      reply_to: replyTo,
    };
    const result = await updateWorkspace(input);
    setLoading(false);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    toast.success("Espace mis à jour.");
  }

  const handleDisconnect = async () => {
    setGmailLoading(true);
    const result = await disconnectGmail();
    setGmailLoading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Gmail déconnecté.");
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    const result = await deleteAccount(deleteConfirm);
    if ("error" in result) {
      setDeleteLoading(false);
      toast.error(result.error);
      return;
    }
    toast.success("Compte supprimé.");
    router.replace("/");
  };

  const handleDisconnectEmail = async () => {
    setEmailLoading(true);
    const result = await disconnectEmailAccount();
    setEmailLoading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Adresse déconnectée.");
    router.refresh();
  };

  const isConnected = gmail.email !== null;
  const isEmailConnected = emailAccount.email !== null;
  const canDelete = deleteConfirm.trim() === workspace.name.trim();

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold">Réglages</h1>

      {/* Espace de travail */}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="font-medium">Espace de travail</p>
              <p className="text-sm text-muted-foreground">
                Le nom affiché dans la navigation et sur tes envois.
              </p>
            </div>

            {serverError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <Field label="Nom d'artiste ou de projet" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                placeholder="Ton nom de scène, ton groupe…"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </Field>
            <Field label="Ville / région" htmlFor="city">
              <Input
                id="city"
                placeholder="Optionnel"
                value={city}
                onChange={(e) => setCity(e.currentTarget.value)}
              />
            </Field>
            <Field
              label="Adresse de réponse (reply-to)"
              htmlFor="reply_to"
              hint="Si renseigné, les réponses arriveront à cette adresse plutôt qu'à ta boîte Gmail d'envoi."
              error={errors.reply_to}
            >
              <Input
                id="reply_to"
                placeholder="Optionnel — où recevoir les réponses"
                value={replyTo}
                onChange={(e) => setReplyTo(e.currentTarget.value)}
              />
            </Field>
            <Field label="Signature" htmlFor="signature">
              <Textarea
                id="signature"
                placeholder={"Optionnel — ajoutée en bas de tes emails\nEx. : Nom, téléphone, liens…"}
                rows={3}
                value={signature}
                onChange={(e) => setSignature(e.currentTarget.value)}
              />
            </Field>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Compte */}
      <Card>
        <CardContent className="flex flex-col gap-0.5">
          <p className="font-medium">Compte</p>
          <p className="text-sm text-muted-foreground">
            Connecté en tant que{" "}
            <span className="text-foreground">{accountEmail}</span>
          </p>
        </CardContent>
      </Card>

      {/* Intégrations — Google */}
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="font-medium">Intégrations</p>
            <p className="text-sm text-muted-foreground">
              Connecte ton compte Google pour envoyer et suivre tes emails
              (Gmail) et synchroniser tes dates dans ton agenda (Calendar).
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Google</span>
              {isConnected ? (
                <StatusBadge color="green">{gmail.email}</StatusBadge>
              ) : (
                <Badge variant="secondary">Non connecté</Badge>
              )}
            </div>

            {isConnected ? (
              <div className="flex gap-2">
                <Button variant="secondary" render={<a href="/api/gmail/connect" />}>
                  Reconnecter
                </Button>
                <Button
                  variant="outline"
                  disabled={gmailLoading}
                  onClick={handleDisconnect}
                >
                  {gmailLoading ? "…" : "Déconnecter"}
                </Button>
              </div>
            ) : gmail.configured ? (
              <Button render={<a href="/api/gmail/connect" />}>
                Connecter Google
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Non configuré
              </Button>
            )}
          </div>

          {isConnected && (
            <p className="text-xs text-muted-foreground">
              Gmail + Agenda utilisent cette connexion. Connecté avant l&apos;ajout
              de l&apos;agenda ? Clique <strong>Reconnecter</strong> pour
              autoriser Google&nbsp;Calendar.
            </p>
          )}

          {!gmail.configured && !isConnected && (
            <p className="text-xs text-muted-foreground">
              Ajoute <code>GOOGLE_CLIENT_ID</code>,{" "}
              <code>GOOGLE_CLIENT_SECRET</code>, <code>GOOGLE_REDIRECT_URI</code>{" "}
              et <code>SUPABASE_SERVICE_ROLE_KEY</code> dans{" "}
              <code>.env.local</code> pour activer la connexion.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Intégrations — Autre adresse (IMAP/SMTP) */}
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="font-medium">Autre adresse (Outlook, Yahoo, iCloud…)</p>
            <p className="text-sm text-muted-foreground">
              Pas de compte Google ? Connecte n&apos;importe quelle boîte via
              IMAP/SMTP avec un mot de passe d&apos;application.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Adresse email</span>
              {isEmailConnected ? (
                <StatusBadge color="green">{emailAccount.email}</StatusBadge>
              ) : (
                <Badge variant="secondary">Non connectée</Badge>
              )}
            </div>

            {isEmailConnected ? (
              <Button
                variant="outline"
                disabled={emailLoading}
                onClick={handleDisconnectEmail}
              >
                {emailLoading ? "…" : "Déconnecter"}
              </Button>
            ) : isConnected ? (
              <Button variant="outline" disabled>
                Google déjà connecté
              </Button>
            ) : emailAccount.configured ? (
              <Button onClick={() => setEmailModalOpen(true)}>
                Connecter une adresse
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Non configuré
              </Button>
            )}
          </div>

          {isConnected && !isEmailConnected && (
            <p className="text-xs text-muted-foreground">
              Une seule méthode d&apos;envoi à la fois. Déconnecte Google
              ci-dessus pour utiliser une autre adresse.
            </p>
          )}

          {!emailAccount.configured && !isEmailConnected && !isConnected && (
            <p className="text-xs text-muted-foreground">
              Ajoute <code>EMAIL_ENCRYPTION_KEY</code> dans{" "}
              <code>.env.local</code> pour activer la connexion IMAP/SMTP.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Zone de danger */}
      <Card className="ring-destructive/40">
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-destructive">Supprimer le compte</p>
            <p className="text-sm text-muted-foreground">
              Efface définitivement ton espace et toutes tes données (contacts,
              opportunités, tâches, emails). Irréversible.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            Supprimer
          </Button>
        </CardContent>
      </Card>

      <EmailConnectModal
        opened={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteOpen(false);
            setDeleteConfirm("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer définitivement le compte</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Cette action est <strong>irréversible</strong>. Toutes tes données
              seront effacées et ne pourront pas être récupérées.
            </div>
            <Field
              label={`Tape le nom de ton espace pour confirmer : « ${workspace.name} »`}
              htmlFor="delete_confirm"
            >
              <Input
                id="delete_confirm"
                placeholder={workspace.name}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.currentTarget.value)}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteConfirm("");
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={!canDelete || deleteLoading}
              onClick={handleDeleteAccount}
            >
              {deleteLoading ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
