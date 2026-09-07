import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { ipDepuis, limiter } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip = ipDepuis(request);
  if (!limiter(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { message: "Trop de creations de compte. Reessayez plus tard." },
      { status: 429 },
    );
  }

  const resultat = registerSchema.safeParse(await request.json().catch(() => null));
  if (!resultat.success) {
    const erreurs: Record<string, string> = {};
    for (const probleme of resultat.error.issues) {
      const champ = String(probleme.path[0]);
      if (!erreurs[champ]) erreurs[champ] = probleme.message;
    }
    return NextResponse.json({ message: "Formulaire incomplet.", erreurs }, { status: 422 });
  }

  const { username, password } = resultat.data;

  const existant = await prisma.staffUser.findUnique({
    where: { username },
    select: { id: true },
  });

  if (existant) {
    return NextResponse.json(
      { message: "Ce nom d'utilisateur est deja pris." },
      { status: 409 },
    );
  }

  // Le compte est cree non approuve : un administrateur doit l'activer.
  await prisma.staffUser.create({
    data: { username, passwordHash: await bcrypt.hash(password, 12) },
  });

  return NextResponse.json({
    ok: true,
    message: "Compte cree. Un administrateur doit l'approuver avant la premiere connexion.",
  });
}
