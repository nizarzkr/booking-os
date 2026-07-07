// Contenu de l'aide contextuelle, par page. Statique et curé (pas d'IA) :
// instantané, fiable, hors-ligne. Rendu par le HelpDrawer (bouton « ? » du
// header), qui choisit l'entrée selon la route courante.

export type HelpContent = {
  title: string;
  intro: string; // à quoi sert la page
  howTo: string[]; // comment faire (étapes concrètes)
  tips: string[]; // conseils pour aller plus loin
};

// Chaque entrée : préfixe de route → contenu. Ordonné du plus spécifique au
// plus général (le premier préfixe qui matche gagne).
const HELP_ENTRIES: { prefix: string; content: HelpContent }[] = [
  {
    prefix: "/contacts/import",
    content: {
      title: "Importer des contacts (CSV)",
      intro:
        "Ajoute des dizaines ou des centaines de contacts d'un coup, à partir d'un fichier CSV (export d'un tableur ou d'un autre outil).",
      howTo: [
        "Prépare un fichier CSV avec une ligne d'en-tête (ex. Prénom, Nom, Email, Téléphone, Rôle).",
        "Charge le fichier, puis fais correspondre chaque colonne du fichier au bon champ (le mapping).",
        "Vérifie l'aperçu, puis lance l'import : tu obtiens un rapport (importés / ignorés).",
      ],
      tips: [
        "Depuis Excel ou Google Sheets : « Enregistrer sous » / « Télécharger » au format CSV (.csv).",
        "Une colonne Email valide est le minimum utile : c'est ce qui permet d'envoyer des mails et des séquences.",
        "Nettoie les doublons dans ton tableur avant l'import, c'est plus simple qu'après.",
        "Jusqu'à 1000 lignes par import.",
      ],
    },
  },
  {
    prefix: "/contacts",
    content: {
      title: "Contacts",
      intro:
        "Ton carnet d'adresses booking : les Personnes (programmateurs, agents, presse…) et les Lieux (salles, festivals, agences).",
      howTo: [
        "Bascule entre les onglets Personnes et Lieux en haut. Recherche par nom ou email, filtre par rôle.",
        "Clique un nom pour ouvrir sa fiche : coordonnées, organisations liées, dates, tâches et historique d'emails.",
        "Relie une personne à un lieu depuis sa fiche pour garder le contexte (ex. ce booker travaille pour cette salle).",
      ],
      tips: [
        "Renseigne le rôle (booker, agent, presse…) : ça rend tes recherches et tes séquences bien plus efficaces.",
        "Tu as déjà une liste de contacts ? Importe-la en masse via « Importer un CSV ».",
      ],
    },
  },
  {
    prefix: "/opportunities",
    content: {
      title: "Dates",
      intro:
        "Toutes tes opportunités de concert au même endroit, du premier contact à la date confirmée. Trois vues : Kanban, Liste, Calendrier.",
      howTo: [
        "Kanban : glisse une carte d'une colonne à l'autre pour faire avancer son statut (À contacter → Contacté → En discussion → Pré-réservé → Confirmé).",
        "Liste : pratique pour trier et rechercher. Calendrier : pour visualiser tes dates dans le temps.",
        "Clique une date pour ouvrir sa fiche : contact et lieu liés, cachet, notes, tâches et emails.",
      ],
      tips: [
        "Tiens le statut à jour : c'est lui qui alimente ton tableau « Aujourd'hui » et t'évite d'oublier une relance.",
        "Une date en « Confirmé » ou « Pré-réservé » se synchronise automatiquement avec ton Google Agenda.",
        "Renseigne le cachet et le lieu dès que tu les connais : tu auras un historique précieux pour négocier ensuite.",
      ],
    },
  },
  {
    prefix: "/sequences",
    content: {
      title: "Séquences",
      intro:
        "Une séquence envoie une série d'emails espacés dans le temps, et s'arrête automatiquement dès que le contact répond. Idéal pour relancer sans y penser.",
      howTo: [
        "« Partir d'un modèle » : choisis une séquence prête (démarcher une salle, candidater à un festival…) et personnalise-la.",
        "Ou crée la tienne : ajoute des étapes, chacune avec un délai (en jours) et son message.",
        "Enrôle des contacts depuis une fiche, la liste ou la séquence. La 1re étape à délai 0 part immédiatement.",
      ],
      tips: [
        "Une bonne séquence = 2 à 3 messages. 1er : ta proposition. 2e (J+4) : relance douce. 3e (J+7 à J+9) : dernier message, porte ouverte.",
        "Reste court et humain à chaque étape — une relance n'est pas un rappel automatique froid.",
        "Laisse la coupure sur réponse travailler : dès qu'on te répond, la séquence s'arrête et tu reprends la main toi-même.",
        "Remplis bien les [crochets] des modèles (nom du lieu, liens, dates) avant d'enrôler.",
      ],
    },
  },
  {
    prefix: "/outreach",
    content: {
      title: "Prospection",
      intro:
        "Ton centre de démarchage : Séquences (relances automatiques), Modèles (emails réutilisables) et Réception (les réponses).",
      howTo: [
        "Séquences : crée des suites de mails qui partent tout seuls et s'arrêtent dès qu'on te répond.",
        "Modèles : rédige une fois tes emails types (avec variables), et réutilise-les à l'envoi.",
        "Réception : retrouve ici les réponses entrantes (le badge signale les non-lues).",
      ],
      tips: [
        "La règle d'or du démarchage : un message court, personnel, avec UNE seule demande claire.",
        "Personnalise avec les variables {{contact_name}} et {{artist_name}}, remplacées automatiquement à l'envoi.",
        "Mieux vaut 20 emails ciblés et personnalisés que 200 génériques : les programmateurs reconnaissent un copier-coller.",
      ],
    },
  },
  {
    prefix: "/tasks",
    content: {
      title: "Tâches",
      intro:
        "Ta liste de relances et de choses à faire, avec échéances. Le moteur de ton suivi quotidien.",
      howTo: [
        "Filtre par à faire / en retard / cette semaine / terminées.",
        "Coche une tâche pour la marquer faite. Relie-la à une date ou un contact pour garder le contexte.",
        "Les tâches en retard remontent automatiquement sur ton tableau « Aujourd'hui ».",
      ],
      tips: [
        "Après chaque email envoyé, crée une tâche « relancer dans X jours » : tu n'oublieras jamais un suivi.",
        "Une tâche = une action concrète (« appeler la salle », « envoyer le dossier »), pas une note vague.",
      ],
    },
  },
  {
    prefix: "/settings",
    content: {
      title: "Réglages",
      intro:
        "Configure ton espace : profil artiste, connexion à ta boîte mail et ton agenda, signature d'email.",
      howTo: [
        "Nom d'artiste et ville : utilisés dans tes emails (variable {{artist_name}}) et dans l'app.",
        "Connexion mail : soit ton compte Google (Gmail + Agenda), soit n'importe quelle autre adresse (Outlook, Yahoo, iCloud, domaine pro) via IMAP/SMTP.",
        "Signature et adresse de réponse : appliquées automatiquement à tes envois.",
      ],
      tips: [
        "Connecte ta boîte mail dès le départ : sans elle, ni l'envoi d'emails ni les séquences ne fonctionnent.",
        "Pas de Gmail ? Utilise « Autre adresse » : il te faudra un mot de passe d'application (le tutoriel te guide selon ton fournisseur).",
        "Soigne ta signature (nom, liens d'écoute, réseaux) : elle part sur chaque message.",
      ],
    },
  },
  {
    prefix: "/dashboard",
    content: {
      title: "Aujourd'hui",
      intro:
        "Ta page d'action quotidienne : elle te dit qui relancer et quelles dates arrivent, sans avoir à chercher.",
      howTo: [
        "Les compteurs en haut (contacts, dates actives, tâches en retard) sont cliquables : ils t'emmènent droit à la liste concernée.",
        "« À relancer aujourd'hui » liste les tâches dont l'échéance est arrivée. Clique une ligne pour ouvrir la fiche et agir.",
        "« Prochaines dates » et « Options en cours » te donnent l'horizon des 30 jours.",
      ],
      tips: [
        "Commence ta journée ici : traite d'abord « À relancer aujourd'hui », c'est là qu'on gagne des dates.",
        "Si la page est vide, c'est le signe qu'il faut créer des tâches de relance depuis tes fiches contacts et dates.",
      ],
    },
  },
];

// Aide générique (fallback) — ne devrait quasiment jamais s'afficher.
const DEFAULT_HELP: HelpContent = {
  title: "Aide",
  intro:
    "Booking OS t'aide à décrocher plus de dates : centralise tes contacts, suis tes opportunités, et automatise tes relances.",
  howTo: [
    "Navigue via le menu de gauche : Aujourd'hui, Dates, Contacts, Prospection, Tâches.",
    "Ouvre l'aide « ? » sur chaque page pour des conseils adaptés.",
  ],
  tips: [
    "Connecte ta boîte mail dans Réglages pour activer l'envoi et les séquences.",
  ],
};

export function getHelpForPath(pathname: string): HelpContent {
  const entry = HELP_ENTRIES.find((e) => pathname.startsWith(e.prefix));
  return entry?.content ?? DEFAULT_HELP;
}
