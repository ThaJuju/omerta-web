import { z } from "zod";

const texte = (min: number, max: number, champ: string) =>
  z
    .string({
      required_error: `${champ} : reponse manquante.`,
      invalid_type_error: `${champ} : reponse manquante.`,
    })
    .trim()
    .min(min, `${champ} : ${min} caracteres minimum.`)
    .max(max, `${champ} : ${max} caracteres maximum.`);

const age = (minimum: number) =>
  z.coerce
    .number({
      required_error: "Age : reponse manquante.",
      invalid_type_error: "Age : indiquez un nombre.",
    })
    .int()
    .min(minimum, `Le recrutement est reserve aux ${minimum} ans et plus.`)
    .max(80, "Age : valeur invalide.");

/// Champs communs aux deux parcours.
const communs = {
  discordTag: texte(2, 64, "Identifiant Discord"),
  prenom: texte(2, 40, "Prenom"),
  ancienneteOmerta: texte(2, 120, "Anciennete sur Omerta"),
  motivation: texte(30, 1500, "Motivation"),
};

/// Age minimum accepte, par poste. Modifier ici pour changer la politique.
export const AGE_MINIMUM = { STAFF: 16, ANIMATEUR: 16 } as const;

const staffSchema = z.object({
  poste: z.literal("STAFF"),
  ...communs,
  dateNaissance: z
    .string({ required_error: "Date de naissance : reponse manquante." })
    .regex(
      /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/,
      "Date attendue au format JJ/MM/AAAA.",
    ),
  age: age(AGE_MINIMUM.STAFF),
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
  age: age(AGE_MINIMUM.ANIMATEUR),
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
