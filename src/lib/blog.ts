/// Source unique du blog : categories, statuts et calculs derives du contenu.
/// Ajouter une categorie ici la rend disponible partout — editeur staff,
/// filtres publics et pastilles — mais il faut aussi l'ajouter a l'enum
/// `categorie` de `validation.ts`, sinon l'API refusera l'article.
export const categories = [
  {
    valeur: "ACTUALITE",
    label: "Actualite",
    resume: "Annonces et vie du serveur.",
  },
  {
    valeur: "MISE_A_JOUR",
    label: "Mise a jour",
    resume: "Nouveautes, correctifs et changements de gameplay.",
  },
  {
    valeur: "EVENEMENT",
    label: "Evenement",
    resume: "Animations, scenarios et temps forts RP.",
  },
  {
    valeur: "REGLEMENT",
    label: "Reglement",
    resume: "Evolutions des regles et decisions de moderation.",
  },
  {
    valeur: "COMMUNAUTE",
    label: "Communaute",
    resume: "Portraits, retours de joueurs et coulisses.",
  },
] as const;

export type Categorie = (typeof categories)[number]["valeur"];

export const categorieLabel = (valeur: string): string =>
  categories.find((categorie) => categorie.valeur === valeur)?.label ?? valeur;

export const STATUTS_ARTICLE = ["BROUILLON", "PUBLIE"] as const;
export type StatutArticle = (typeof STATUTS_ARTICLE)[number];

/// Nombre d'articles par page sur /blog.
export const PAR_PAGE = 9;

/// Transforme un titre en identifiant d'URL. Les accents sont deplies plutot
/// que supprimes pour qu'« evenement » et « événement » donnent le meme slug.
export function slugifier(valeur: string): string {
  return valeur
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/// 200 mots par minute : moyenne de lecture francaise, arrondie au superieur
/// pour ne jamais afficher « 0 min ».
export function tempsLecture(contenu: string): number {
  const mots = contenu.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(mots / 200));
}

/// Date lisible pour l'affichage public.
export function dateLisible(valeur: string | Date): string {
  return new Date(valeur).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
