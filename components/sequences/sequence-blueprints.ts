// Bibliothèque de modèles de séquences de prospection pour artistes.
//
// Modules de DONNÉES pures (ni "use client" ni "use server") : importé à la
// fois par la galerie (client) et par l'action de clonage (serveur).
//
// Contrainte moteur : une séquence est rattachée à un CONTACT, pas à une date.
// Seules les variables {{contact_name}} et {{artist_name}} sont résolues à
// l'envoi (voir lib/sequences/run.ts). Tout le reste est laissé en crochets
// [à remplir] que l'artiste personnalise dans le builder.
//
// `delay_days` = jours d'attente AVANT l'envoi de l'étape (0 = immédiat à
// l'enrôlement ; pour les étapes suivantes, délai après l'étape précédente).

export type BlueprintStep = {
  delay_days: number;
  subject: string;
  body: string;
};

export type SequenceBlueprint = {
  id: string; // slug stable
  name: string; // devient le nom de la séquence clonée
  audience: string; // à qui s'adresse le modèle
  description: string; // une ligne d'accroche dans la galerie
  steps: BlueprintStep[];
};

export const SEQUENCE_BLUEPRINTS: SequenceBlueprint[] = [
  {
    id: "demarcher-salle",
    name: "Démarcher une salle / un club",
    audience: "Salles & clubs",
    description:
      "Trois messages pour proposer une date à un lieu, avec deux relances légères.",
    steps: [
      {
        delay_days: 0,
        subject: "Proposition de date — {{artist_name}} à [nom de la salle] ?",
        body: `Bonjour {{contact_name}},

Je suis {{artist_name}}, [une ligne qui situe le projet : genre + ce qui le rend singulier]. Je monte des dates dans [région/ville] cette saison, et [nom de la salle] est exactement le genre de lieu où j'ai envie de jouer.

Un aperçu en 2 min : [lien d'écoute / live]

Auriez-vous des créneaux autour de [période souhaitée] ? Je peux vous envoyer un dossier complet (fiche technique, presse, dates passées).

Merci pour votre temps,
{{artist_name}}`,
      },
      {
        delay_days: 4,
        subject: "Re: Proposition de date — {{artist_name}}",
        body: `Bonjour {{contact_name}},

Petit rappel, je sais que les boîtes débordent. Ma proposition de jouer à [nom de la salle] tient toujours.

Si le format ne colle pas, dites-le-moi sans souci — je préfère une réponse courte à un silence. Et si vous pensez à un autre lieu où ça aurait du sens, je suis preneur.

Belle journée,
{{artist_name}}`,
      },
      {
        delay_days: 5,
        subject: "Dernier message — {{artist_name}}",
        body: `Bonjour {{contact_name}},

Je ne veux pas encombrer votre boîte, donc ce sera mon dernier message pour cette fois. Si une date se libère à [nom de la salle] dans les prochains mois, gardez {{artist_name}} en tête — je m'adapte à votre programmation.

Merci, et au plaisir,
{{artist_name}}`,
      },
    ],
  },
  {
    id: "candidater-festival",
    name: "Candidater à un festival",
    audience: "Festivals",
    description:
      "Une candidature claire à un programmateur de festival, suivie d'une relance.",
    steps: [
      {
        delay_days: 0,
        subject: "Candidature {{artist_name}} — [nom du festival] [année]",
        body: `Bonjour {{contact_name}},

Je suis {{artist_name}}, [une ligne : genre + un fait marquant : sortie récente, nombre de dates, région]. J'aimerais beaucoup faire partie de la programmation de [nom du festival] pour l'édition [année / saison].

Un aperçu en 2 min : [lien d'écoute / live vidéo]

Est-ce que votre appel à candidatures est encore ouvert ? Je vous envoie avec plaisir un dossier complet (presse, fiche technique, dates passées).

Musicalement,
{{artist_name}}`,
      },
      {
        delay_days: 6,
        subject: "Re: Candidature {{artist_name}} — [nom du festival]",
        body: `Bonjour {{contact_name}},

Je reviens vers vous au sujet de ma candidature pour [nom du festival]. Vous devez recevoir énormément de propositions — je voulais simplement m'assurer que la mienne vous est bien parvenue.

Si vous avez besoin d'éléments supplémentaires (titres, live, disponibilités), dites-le-moi, je vous envoie ça tout de suite.

Merci pour votre écoute,
{{artist_name}}`,
      },
    ],
  },
  {
    id: "reprise-contact-rencontre",
    name: "Reprendre contact après une rencontre",
    audience: "Suite à une rencontre",
    description:
      "Pour transformer un contact rencontré en vrai (concert, événement) en une vraie piste.",
    steps: [
      {
        delay_days: 0,
        subject: "Ravi d'avoir échangé — {{artist_name}}",
        body: `Bonjour {{contact_name}},

C'était un plaisir d'échanger avec vous [à / lors de — précisez : le concert, le festival, l'événement]. Comme promis, je vous laisse de quoi écouter {{artist_name}} : [lien d'écoute]

J'aimerais beaucoup trouver une occasion de jouer [dans votre lieu / avec vous / pour votre événement]. Y aurait-il un créneau qui aurait du sens de votre côté dans les prochains mois ?

Au plaisir de vous relire,
{{artist_name}}`,
      },
      {
        delay_days: 5,
        subject: "Re: Ravi d'avoir échangé — {{artist_name}}",
        body: `Bonjour {{contact_name}},

Petit message pour ne pas laisser notre échange sans suite. Ma proposition de trouver une date ensemble tient toujours, quand le moment sera bon pour vous.

N'hésitez pas si je peux vous envoyer plus d'infos.

Belle journée,
{{artist_name}}`,
      },
    ],
  },
  {
    id: "pitch-presse-radio",
    name: "Pitcher une sortie à la presse / radio",
    audience: "Presse, blogs & radios",
    description:
      "Annoncer un single ou un album à un média et proposer une écoute, avec une relance douce.",
    steps: [
      {
        delay_days: 0,
        subject: "Nouveau titre — {{artist_name}} : [titre du morceau]",
        body: `Bonjour {{contact_name}},

Je suis {{artist_name}}, [genre + repère rapide : « pour les amateurs de … »]. Je sors [single / EP / album] « [titre] » le [date de sortie], et je pense que ça pourrait résonner avec votre [ligne éditoriale / émission / lecteurs].

À écouter ici : [lien privé / streaming]

Seriez-vous ouvert·e à une écoute, voire une chronique ou un passage ? Je vous envoie le communiqué et les visuels si ça vous intéresse.

Merci beaucoup,
{{artist_name}}`,
      },
      {
        delay_days: 3,
        subject: "Re: Nouveau titre — {{artist_name}}",
        body: `Bonjour {{contact_name}},

Je me permets une petite relance autour de « [titre] ». Si le sujet ne colle pas à votre ligne, aucun souci — un simple « non » me va très bien.

Et si ça vous parle, je reste à disposition pour une interview ou tout format qui vous conviendrait.

Merci pour votre temps,
{{artist_name}}`,
      },
    ],
  },
  {
    id: "rechauffer-contact-silencieux",
    name: "Réchauffer un contact silencieux",
    audience: "Relance d'un ancien contact",
    description:
      "Reprendre un fil perdu avec un contact qui n'a jamais répondu, sans être lourd.",
    steps: [
      {
        delay_days: 0,
        subject: "On reprend contact ? — {{artist_name}}",
        body: `Bonjour {{contact_name}},

On avait échangé il y a quelque temps [au sujet de — précisez], et le fil s'est un peu perdu — ça arrive ! Je reviens vers vous car {{artist_name}} a du nouveau : [nouveauté : nouvelles dates, sortie, nouvelle formule live].

Un aperçu à jour : [lien d'écoute]

Est-ce que ça aurait du sens d'en reparler pour [une date / une collaboration] ?

Au plaisir,
{{artist_name}}`,
      },
      {
        delay_days: 7,
        subject: "Re: On reprend contact ? — {{artist_name}}",
        body: `Bonjour {{contact_name}},

Je ne veux pas insister lourdement, juste garder la porte ouverte. Si le timing n'est pas bon en ce moment, faites-moi signe quand ce sera le cas — je serai ravi de reprendre là où on s'était arrêtés.

Merci et à bientôt,
{{artist_name}}`,
      },
    ],
  },
];
