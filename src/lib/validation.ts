import { z } from "zod";

const texte = (min: number, max: number, champ: string) =>
  z
    .string({ required_error: `${champ} : reponse manquante.`, invalid_type_error: `${champ} : reponse manquante.` })
    .trim()
    .min(min, `${champ} : ${min} caracteres minimum.`)
    .max(max, `${champ} : ${max} caracteres maximum.`);

/// Validee cote serveur a la soumission — le client ne fait que du confort.
export const candidatureSchema = z.object({
  poste: z.enum(["STAFF", "ANIMATEUR"], {
    required_error: "Choisissez le poste vise.",
    invalid_type_error: "Choisissez le poste vise.",
  }),

  // Etape 1
  discordTag: texte(2, 64, "Identifiant Discord"),
  prenom: texte(2, 40, "Prenom"),
  dateNaissance: z
    .string({ required_error: "Date de naissance : reponse manquante." })
    .regex(/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/, "Date attendue au format JJ/MM/AAAA."),
  age: z.coerce
    .number({ required_error: "Age : reponse manquante.", invalid_type_error: "Age : indiquez un nombre." })
    .int()
    .min(18, "Le staff est reserve aux 18 ans et plus.").max(80),
  disponibilite: texte(10, 600, "Disponibilite"),

  // Etape 2
  heuresFiveM: texte(1, 40, "Heures de jeu"),
  serveursJoues: texte(2, 300, "Experience RolePlay"),
  experienceStaff: texte(2, 600, "Experience staff"),
  ancienneteOmerta: texte(2, 120, "Anciennete sur Omerta"),
  activiteServeur: texte(10, 800, "Activite sur le serveur"),
  historiqueSanction: texte(2, 600, "Historique de sanctions"),
  motivation: texte(30, 1500, "Motivation"),

  // Etape 3
  decouverteServeur: texte(2, 300, "Decouverte du serveur"),
  pourquoiToi: texte(30, 1500, "Pourquoi toi"),
  pubOuLive: texte(2, 600, "Pub ou live"),
});

export type CandidatureInput = z.infer<typeof candidatureSchema>;

/// Champs regroupes par etape, utilise par le formulaire pour ne valider
/// que l'etape courante avant de laisser passer a la suivante.
export const etapes = [
  {
    titre: "Poste vise",
    champs: ["poste"],
  },
  {
    titre: "Informations IRL",
    champs: ["discordTag", "prenom", "dateNaissance", "age", "disponibilite"],
  },
  {
    titre: "Experience",
    champs: [
      "heuresFiveM",
      "serveursJoues",
      "experienceStaff",
      "ancienneteOmerta",
      "activiteServeur",
      "historiqueSanction",
      "motivation",
    ],
  },
  {
    titre: "Motivation",
    champs: ["decouverteServeur", "pourquoiToi", "pubOuLive"],
  },
] as const satisfies ReadonlyArray<{
  titre: string;
  champs: ReadonlyArray<keyof CandidatureInput>;
}>;

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
