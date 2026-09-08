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

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "3 caracteres minimum.")
      .max(32)
      .regex(/^[a-zA-Z0-9_.-]+$/, "Lettres, chiffres, point, tiret et underscore uniquement."),
    password: z.string().min(8, "8 caracteres minimum."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirm"],
  });
