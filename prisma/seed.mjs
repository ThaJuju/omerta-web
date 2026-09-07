/// Cree le premier compte administrateur (deja approuve).
///
///   node prisma/seed.mjs <identifiant>              -> mot de passe genere, affiche une fois
///   node prisma/seed.mjs <identifiant> <motdepasse> -> mot de passe choisi
///
/// Sans argument de mot de passe, un mot de passe aleatoire est genere : rien
/// n'est invente en silence, et il ne reste pas dans l'historique du shell.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();
const [username, motDePasseFourni] = process.argv.slice(2);

if (!username) {
  console.error("Usage: node prisma/seed.mjs <identifiant> [motdepasse]");
  process.exit(1);
}

if (motDePasseFourni && motDePasseFourni.length < 8) {
  console.error("Le mot de passe doit faire au moins 8 caracteres.");
  process.exit(1);
}

const genere = !motDePasseFourni;
const motDePasse = motDePasseFourni ?? randomBytes(12).toString("base64url");

const utilisateur = await prisma.staffUser.upsert({
  where: { username },
  update: { passwordHash: await bcrypt.hash(motDePasse, 12), role: "ADMIN", approved: true },
  create: {
    username,
    passwordHash: await bcrypt.hash(motDePasse, 12),
    role: "ADMIN",
    approved: true,
  },
});

console.log(`\nAdministrateur pret : ${utilisateur.username}`);
if (genere) {
  console.log(`Mot de passe        : ${motDePasse}`);
  console.log("\nNotez-le maintenant : il n'est stocke nulle part en clair.\n");
}

await prisma.$disconnect();
