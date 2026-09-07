import type { CandidatureInput } from "./validation";

export type Question = {
  nom: keyof CandidatureInput;
  label: string;
  placeholder: string;
  type: "text" | "number" | "textarea";
  aide?: string;
};

/// Les 15 questions du recrutement, reprises du formulaire d'origine.
/// Une seule liste : le formulaire, la validation et le dashboard s'y referent.
export const questions: Question[][] = [
  [], // etape 0 : choix du poste, rendu par un selecteur dedie
  [
    {
      nom: "discordTag",
      label: "Votre identifiant Discord",
      placeholder: "Ex: pseudo_2024",
      type: "text",
    },
    { nom: "prenom", label: "Quel est votre prenom ?", placeholder: "Ex: Jean", type: "text" },
    {
      nom: "dateNaissance",
      label: "Date de naissance",
      placeholder: "JJ/MM/AAAA",
      type: "text",
    },
    {
      nom: "age",
      label: "Age",
      placeholder: "18",
      type: "number",
      aide: "Le staff est reserve aux 18 ans et plus.",
    },
    {
      nom: "disponibilite",
      label: "Disponibilite",
      placeholder: "Ex: en semaine apres 19h, week-end toute la journee",
      type: "textarea",
    },
  ],
  [
    {
      nom: "heuresFiveM",
      label: "Heures de jeu sur FiveM",
      placeholder: "Ex: 4 725",
      type: "text",
    },
    {
      nom: "serveursJoues",
      label: "Experience RolePlay",
      placeholder: "Ex: GLife, LSConfidential, Flashback",
      type: "text",
    },
    {
      nom: "experienceStaff",
      label: "As-tu deja tenu un role de staff ou d'animateur ?",
      placeholder: "Ex: Moderateur sur tel serveur / Non, mais motive",
      type: "textarea",
    },
    {
      nom: "ancienneteOmerta",
      label: "Depuis combien de temps fais-tu partie de la communaute Omerta ?",
      placeholder: "Ex: Depuis 2 mois",
      type: "text",
    },
    {
      nom: "activiteServeur",
      label: "Que fais-tu sur le serveur, ou que comptes-tu faire ?",
      placeholder: "Ex: Developper mon personnage et aider la communaute",
      type: "textarea",
    },
    {
      nom: "historiqueSanction",
      label: "As-tu deja eu des sanctions sur le serveur ?",
      placeholder: "Ex: Non / Oui, expliquez brievement",
      type: "textarea",
    },
    {
      nom: "motivation",
      label: "Pourquoi souhaites-tu rejoindre l'equipe d'Omerta ?",
      placeholder: "Ex: Aider la communaute, encadrer les joueurs, animer la ville",
      type: "textarea",
    },
  ],
  [
    {
      nom: "decouverteServeur",
      label: "Comment as-tu connu le serveur Omerta FA ?",
      placeholder: "Stream, influenceur, Discord, bouche a oreille...",
      type: "text",
    },
    {
      nom: "pourquoiToi",
      label: "Pourquoi toi et pas un autre ?",
      placeholder: "Expliquez ce qui vous distingue des autres candidats...",
      type: "textarea",
    },
    {
      nom: "pubOuLive",
      label: "As-tu l'intention de faire de la pub ou du live sur le serveur ?",
      placeholder: "Oui / Non, et explications",
      type: "textarea",
    },
  ],
];
