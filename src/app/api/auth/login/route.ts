import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { createSession } from "@/lib/session";
import { ipDepuis, limiter } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip = ipDepuis(request);
  if (!limiter(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { message: "Trop de tentatives. Reessayez dans quinze minutes." },
      { status: 429 },
    );
  }

  const resultat = loginSchema.safeParse(await request.json().catch(() => null));
  if (!resultat.success) {
    return NextResponse.json({ message: "Identifiants invalides." }, { status: 400 });
  }

  const { username, password } = resultat.data;
  const utilisateur = await prisma.staffUser.findUnique({ where: { username } });

  // Comparaison systematique meme si le compte n'existe pas : sans cela, le
  // temps de reponse revele quels noms d'utilisateur sont valides.
  const empreinteFactice = "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva";
  const valide = await bcrypt.compare(
    password,
    utilisateur?.passwordHash ?? empreinteFactice,
  );

  if (!utilisateur || !utilisateur.passwordHash || !valide) {
    return NextResponse.json(
      { message: "Nom d'utilisateur ou mot de passe incorrect." },
      { status: 401 },
    );
  }

  if (!utilisateur.approved) {
    return NextResponse.json(
      { message: "Votre compte est en attente d'approbation par un administrateur." },
      { status: 403 },
    );
  }

  await prisma.staffUser.update({
    where: { id: utilisateur.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    userId: utilisateur.id,
    username: utilisateur.username,
    role: utilisateur.role,
  });

  return NextResponse.json({ ok: true });
}
