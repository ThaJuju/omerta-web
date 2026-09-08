/// Une seule source de verite pour l'age : la date de naissance. L'age n'est
/// jamais stocke — il serait faux des l'anniversaire suivant — mais recalcule
/// a chaque affichage.

/// Convertit une date "JJ/MM/AAAA" en Date, ou null si elle n'existe pas
/// (le 31 fevrier passe la regex mais n'est pas une vraie date).
export function parseDateNaissance(valeur: string): Date | null {
  const correspondance = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valeur.trim());
  if (!correspondance) return null;

  const [, jour, mois, annee] = correspondance.map(Number) as unknown as number[];
  // Date locale, pas UTC : l'age doit changer a minuit pour le candidat,
  // pas deux heures plus tard.
  const date = new Date(annee, mois - 1, jour);

  const reelle =
    date.getFullYear() === annee &&
    date.getMonth() === mois - 1 &&
    date.getDate() === jour;

  return reelle ? date : null;
}

/// Age en annees revolues, ou null si la date est invalide.
export function ageDepuis(dateNaissance: string | null | undefined): number | null {
  if (!dateNaissance) return null;

  const naissance = parseDateNaissance(dateNaissance);
  if (!naissance) return null;

  const maintenant = new Date();
  let age = maintenant.getFullYear() - naissance.getFullYear();

  const anniversairePasse =
    maintenant.getMonth() > naissance.getMonth() ||
    (maintenant.getMonth() === naissance.getMonth() &&
      maintenant.getDate() >= naissance.getDate());

  if (!anniversairePasse) age -= 1;
  return age;
}
