/// Les postes ouverts au recrutement. Source unique : formulaire, validation,
/// webhook Discord et dashboard s'y referent.
export const postes = [
  {
    valeur: "STAFF",
    label: "Staff",
    resume: "Moderation, tickets, application du reglement.",
    detail:
      "Vous encadrez la communaute au quotidien : traitement des signalements, sanctions, support aux joueurs.",
  },
  {
    valeur: "ANIMATEUR",
    label: "Animateur",
    resume: "Evenements, scenarios, animation de la ville.",
    detail:
      "Vous faites vivre le serveur : organisation d'evenements, ecriture de scenarios, animation des temps forts RP.",
  },
] as const;

export type Poste = (typeof postes)[number]["valeur"];

export const posteLabel = (valeur: string): string =>
  postes.find((poste) => poste.valeur === valeur)?.label ?? valeur;
