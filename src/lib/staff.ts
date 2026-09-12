/// Constantes partagees par les routes de gestion des comptes staff.

/// Cout du hachage bcrypt, identique partout : un compte cree par un
/// administrateur ne doit pas etre protege plus faiblement qu'un autre.
export const COUT_BCRYPT = 12;

/// Champs renvoyes au dashboard. `passwordHash` n'en fait evidemment pas
/// partie : il ne doit jamais quitter le serveur.
export const CHAMPS_STAFF = {
  id: true,
  username: true,
  role: true,
  approved: true,
  createdAt: true,
  lastLoginAt: true,
} as const;

export const roleLabel = (valeur: string): string =>
  valeur === "ADMIN" ? "Administrateur" : "Moderateur";
