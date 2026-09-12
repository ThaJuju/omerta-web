import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getStaffCourant } from "@/lib/session";
import { nouveauStaffSchema } from "@/lib/validation";
import { CHAMPS_STAFF, COUT_BCRYPT } from "@/lib/staff";

/// Liste des comptes staff. Reservee aux administrateurs.
export async function GET() {
  const courant = await getStaffCourant();
  if (courant?.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorise." }, { status: 403 });
  }

  const utilisateurs = await prisma.staffUser.findMany({
    orderBy: [{ approved: "desc" }, { createdAt: "asc" }],
    select: CHAMPS_STAFF,
  });

  return NextResponse.json({ utilisateurs });
}

/// Creation d'un compte staff. Il n'y a plus d'inscription libre : c'est le
/// seul chemin pour obtenir un acces au dashboard.
export async function POST(request: Request) {
  const courant = await getStaffCourant();
  if (courant?.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorise." }, { status: 403 });
  }

  const resultat = nouveauStaffSchema.safeParse(await request.json().catch(() => null));
  if (!resultat.success) {
    const erreurs: Record<string, string> = {};
    for (const probleme of resultat.error.issues) {
      const champ = String(probleme.path[0]);
      if (!erreurs[champ]) erreurs[champ] = probleme.message;
    }
    return NextResponse.json({ message: "Formulaire incomplet.", erreurs }, { status: 422 });
  }

  const { username, password, role } = resultat.data;

  try {
    const utilisateur = await prisma.staffUser.create({
      // Cree par un administrateur, donc directement utilisable : l'approbation
      // servait a filtrer les inscriptions libres, qui n'existent plus.
      data: {
        username,
        role,
        approved: true,
        passwordHash: await bcrypt.hash(password, COUT_BCRYPT),
      },
      select: CHAMPS_STAFF,
    });
    return NextResponse.json({ utilisateur }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        message: "Ce nom d'utilisateur est deja pris.",
        erreurs: { username: "Deja pris." },
      },
      { status: 409 },
    );
  }
}
