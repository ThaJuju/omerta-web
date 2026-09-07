import type { Poste } from "./postes";

export type Question = {
  nom: string;
  label: string;
  placeholder: string;
  type: "text" | "number" | "textarea";
  aide?: string;
};

export type Etape = { titre: string; questions: Question[] };

/* Les deux equipes ne posent pas les memes questions. Le parcours est donc
   construit a partir du poste choisi, et non partage. */

/// Recrutement staff : moderation, tickets, application du reglement.
const STAFF: Etape[] = [
  {
    titre: "Informations IRL",
    questions: [
      { nom: "discordTag", label: "Votre identifiant Discord", placeholder: "Ex: riko739", type: "text" },
      { nom: "prenom", label: "Quel est votre prenom ?", placeholder: "Ex: Alex", type: "text" },
      { nom: "dateNaissance", label: "Date de naissance", placeholder: "JJ/MM/AAAA", type: "text" },
      { nom: "age", label: "Age", placeholder: "18", type: "number" },
      {
        nom: "disponibilite",
        label: "Disponibilite",
        placeholder: "Ex: tous les soirs, week-ends et vacances en journee",
        type: "textarea",
      },
    ],
  },
  {
    titre: "Informations RolePlay",
    questions: [
      { nom: "heuresFiveM", label: "Heures de jeu sur FiveM", placeholder: "Ex: 600", type: "text" },
      {
        nom: "serveursJoues",
        label: "Experience RolePlay",
        placeholder: "Ex: Unity Legacy, Flashback, Omerta FA",
        type: "text",
      },
      {
        nom: "experienceStaff",
        label: "Experience staff",
        placeholder: "Ex: Non, mais je suis tres motive",
        type: "textarea",
      },
      {
        nom: "ancienneteOmerta",
        label: "Anciennete sur Omerta",
        placeholder: "Ex: Depuis environ 2 mois",
        type: "text",
      },
      {
        nom: "activiteServeur",
        label: "Que fais-tu sur le serveur, ou que comptes-tu faire ?",
        placeholder: "Ex: Je compte rejoindre le SASP",
        type: "textarea",
      },
      {
        nom: "historiqueSanction",
        label: "Sanctions deja recues",
        placeholder: "Ex: Non / Oui, expliquez brievement",
        type: "textarea",
      },
      {
        nom: "motivation",
        label: "Motivations",
        placeholder: "Ex: Ameliorer l'experience des joueurs et rendre le serveur plus agreable",
        type: "textarea",
      },
    ],
  },
  {
    titre: "Informations complementaires",
    questions: [
      {
        nom: "decouverteServeur",
        label: "Comment as-tu connu le serveur Omerta FA ?",
        placeholder: "Stream, influenceur, Discord, bouche a oreille...",
        type: "text",
      },
      {
        nom: "pourquoiToi",
        label: "Pourquoi toi et pas un autre ?",
        placeholder: "Ex: Mon serieux, ma maturite et mon activite sur le serveur",
        type: "textarea",
      },
      {
        nom: "pubOuLive",
        label: "As-tu l'intention de faire de la pub ou du live sur le serveur ?",
        placeholder: "Oui / Non, et explications",
        type: "textarea",
      },
    ],
  },
];

/// Recrutement animation : evenements, scenarios, animation de la ville.
const ANIMATEUR: Etape[] = [
  {
    titre: "Presentation",
    questions: [
      { nom: "discordTag", label: "Votre identifiant Discord", placeholder: "Ex: reda_18", type: "text" },
      { nom: "prenom", label: "Quel est votre prenom ?", placeholder: "Ex: Reda", type: "text" },
      {
        nom: "presentationIRL",
        label: "Presentation IRL",
        placeholder: "Ex: Je m'appelle Reda, j'ai 18 ans, je suis franco-algerien",
        type: "textarea",
      },
      { nom: "age", label: "Age", placeholder: "18", type: "number" },
      {
        nom: "ancienneteOmerta",
        label: "Depuis combien de temps joues-tu sur Omerta FA ?",
        placeholder: "Ex: Un peu plus d'une semaine",
        type: "text",
      },
    ],
  },
  {
    titre: "Experience en animation",
    questions: [
      {
        nom: "experienceAnimation",
        label: "As-tu deja ete animateur sur un autre serveur ?",
        placeholder: "Ex: Oui, sur Alya RP, Unity Legacy, Unity RP et White FA",
        type: "textarea",
      },
      {
        nom: "exemplesEvenements",
        label: "Quels evenements proposerais-tu ?",
        placeholder:
          "Ex: 1.2.3 soleil, cache-cache, Pit or Die, course de karting, Murder, trames RP longues...",
        type: "textarea",
        aide: "Citez plusieurs formats, y compris des trames RP qui durent dans le temps.",
      },
    ],
  },
  {
    titre: "Motivation",
    questions: [
      {
        nom: "motivation",
        label: "Pourquoi souhaites-tu rejoindre l'equipe d'animation ?",
        placeholder:
          "Ex: Faire vivre le serveur et montrer aux joueurs qu'on est aussi la pour s'amuser",
        type: "textarea",
      },
      {
        nom: "plaisirAnimation",
        label: "Qu'est-ce qui te plait le plus dans l'animation d'evenements ?",
        placeholder: "Ex: Voir que les joueurs prennent du plaisir, c'est le signe que c'est reussi",
        type: "textarea",
      },
    ],
  },
];

const PARCOURS: Record<Poste, Etape[]> = { STAFF, ANIMATEUR };

/// Etapes du formulaire pour un poste donne, choix du poste exclu.
export function etapesPour(poste: Poste): Etape[] {
  return PARCOURS[poste];
}

/// Toutes les questions d'un poste, a plat — utilise par le dashboard pour
/// afficher une candidature avec les libelles qui lui correspondent.
export function questionsPour(poste: string): Question[] {
  const parcours = PARCOURS[poste as Poste];
  return parcours ? parcours.flatMap((etape) => etape.questions) : [];
}
