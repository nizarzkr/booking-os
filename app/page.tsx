export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header : marque à gauche, accès connexion / inscription à droite */}
      <header className="flex items-center justify-between p-4">
        <span className="text-sm font-semibold tracking-tight">Booking OS</span>
        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            Se connecter
          </a>
          <a
            href="/register"
            className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Créer un compte
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-5 p-4 text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Pour les artistes indépendants
        </span>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
          Le booking, simplifié.
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Sache exactement qui contacter ou relancer aujourd&apos;hui pour
          décrocher plus de dates. Contacts, opportunités, emails et agenda — au
          même endroit.
        </p>
        <a
          href="/register"
          className="mt-1 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Commencer gratuitement
        </a>
      </main>
    </div>
  );
}
