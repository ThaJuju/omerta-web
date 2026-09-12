/// Source unique du blog : statuts, pagination et calculs derives du contenu.
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
