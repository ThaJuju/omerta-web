import { z } from "zod";
import { ageDepuis } from "./age";

const texte = (min: number, max: number, champ: string) =>
  z
    .string({
      required_error: `${champ} : reponse manquante.`,
      invalid_type_error: `${champ} : reponse manquante.`,
    })
    .trim()
    .min(min, `${champ} : ${min} caracteres minimum.`)
    .max(max, `${champ} : ${max} caracteres maximum.`);

/// Age attendu pour rejoindre l'equipe. Volontairement **non bloquant** :
/// l'age est affiche comme une attente, pas comme un filtre. Une candidature
/// plus jeune passe et arrive signalee au staff, qui tranche.
export const AGE_ATTENDU = 18;

/// Plancher technique. Sert seulement a ecarter les saisies absurdes ou les
/// robots ; 13 ans est le minimum impose par les conditions de Discord.
const AGE_PLANCHER = 13;

/// Seule donnee d'age collectee. L'age s'en deduit — le demander en plus
/// ouvrirait la porte a deux reponses contradictoires, et un age stocke
/// deviendrait faux des l'anniversaire suivant.
const dateNaissance = z
  .string({ required_error: "Date de naissance : reponse manquante." })
  .trim()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date attendue au format JJ/MM/AAAA.")
  .refine((valeur) => ageDepuis(valeur) !== null, "Cette date n'existe pas.")
  .refine((valeur) => {
    const age = ageDepuis(valeur);
    return age === null || (age >= AGE_PLANCHER && age <= 80);
  }, "Date de naissance : valeur invalide.");

/// Champs communs aux deux parcours.
const communs = {
  discordTag: texte(2, 64, "Identifiant Discord"),
  dateNaissance,
  prenom: texte(2, 40, "Prenom"),
  ancienneteOmerta: texte(2, 120, "Anciennete sur Omerta"),
  motivation: texte(30, 1500, "Motivation"),
};

const staffSchema = z.object({
  poste: z.literal("STAFF"),
  ...communs,
  disponibilite: texte(10, 600, "Disponibilite"),
  heuresFiveM: texte(1, 40, "Heures de jeu"),
  serveursJoues: texte(2, 300, "Experience RolePlay"),
  experienceStaff: texte(2, 600, "Experience staff"),
  activiteServeur: texte(10, 800, "Activite sur le serveur"),
  historiqueSanction: texte(2, 600, "Sanctions deja recues"),
  decouverteServeur: texte(2, 300, "Decouverte du serveur"),
  pourquoiToi: texte(30, 1500, "Pourquoi toi"),
  pubOuLive: texte(2, 600, "Pub ou live"),
});

const animateurSchema = z.object({
  poste: z.literal("ANIMATEUR"),
  ...communs,
  presentationIRL: texte(20, 800, "Presentation IRL"),
  experienceAnimation: texte(2, 800, "Experience en animation"),
  exemplesEvenements: texte(20, 1200, "Exemples d'evenements"),
  plaisirAnimation: texte(20, 1000, "Ce qui te plait dans l'animation"),
});

/// Validee cote serveur a la soumission — le client ne fait que du confort.
/// L'union discriminee garantit qu'une candidature animateur n'est pas jugee
/// sur les champs du parcours staff, et inversement.
export const candidatureSchema = z.discriminatedUnion("poste", [
  staffSchema,
  animateurSchema,
]);

export type CandidatureInput = z.infer<typeof candidatureSchema>;
export type CandidatureStaff = z.infer<typeof staffSchema>;
export type CandidatureAnimateur = z.infer<typeof animateurSchema>;

export const loginSchema = z.object({
  username: z.string().trim().min(3, "Nom d'utilisateur trop court.").max(32),
  password: z.string().min(1, "Mot de passe requis."),
});

/// ── Comptes staff ─────────────────────────────────────────────────────────
///
/// Il n'y a pas d'inscription libre : les comptes sont crees par un
/// administrateur depuis le dashboard.

const nomUtilisateur = z
  .string()
  .trim()
  .min(3, "3 caracteres minimum.")
  .max(32, "32 caracteres maximum.")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Lettres, chiffres, point, tiret et underscore uniquement.");

const motDePasse = z.string().min(8, "8 caracteres minimum.").max(200);

export const ROLES = ["MODERATEUR", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const nouveauStaffSchema = z.object({
  username: nomUtilisateur,
  password: motDePasse,
  role: z.enum(ROLES),
});

/// Modification d'un compte existant. Tout est optionnel : le dashboard
/// n'envoie que le champ touche (activer, changer de role, reinitialiser).
export const majStaffSchema = z
  .object({
    approved: z.boolean(),
    role: z.enum(ROLES),
    password: motDePasse,
  })
  .partial()
  .refine(
    (donnees) => Object.keys(donnees).length > 0,
    "Aucune modification fournie.",
  );

/// ── Blog ──────────────────────────────────────────────────────────────────

/// Seuls http et https sont acceptes pour une couverture : une URL `javascript:`
/// ou `data:` finirait dans un attribut `src` de la page publique.
const urlImage = z
  .string()
  .trim()
  .max(500, "Adresse d'image trop longue.")
  .url("Adresse d'image invalide.")
  .refine(
    (valeur) => /^https?:\/\//i.test(valeur),
    "L'adresse doit commencer par http:// ou https://.",
  );

/// Le slug est genere depuis le titre cote client, mais reste modifiable : il
/// est donc revalide ici, ou il doit rester compatible avec une URL.
const slug = z
  .string()
  .trim()
  .min(3, "Slug : 3 caracteres minimum.")
  .max(80, "Slug : 80 caracteres maximum.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug : minuscules, chiffres et tirets uniquement.",
  );

export const articleSchema = z.object({
  titre: texte(4, 140, "Titre"),
  slug,
  extrait: texte(20, 320, "Extrait"),
  contenu: texte(50, 40000, "Contenu"),
  /// Champ facultatif : la chaine vide de l'editeur vaut « pas de couverture ».
  couverture: z.union([urlImage, z.literal("")]).optional(),
  epingle: z.boolean().optional(),
  statut: z.enum(["BROUILLON", "PUBLIE"]),
});

/// Toutes les proprietes deviennent optionnelles : le dashboard peut n'envoyer
/// que le statut pour publier ou depublier en un clic.
export const articleMajSchema = articleSchema.partial().refine(
  (donnees) => Object.keys(donnees).length > 0,
  "Aucune modification fournie.",
);

export type ArticleInput = z.infer<typeof articleSchema>;
