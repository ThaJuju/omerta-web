import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getStaffCourant } from "@/lib/session";
import { majStaffSchema } from "@/lib/validation";
import { CHAMPS_STAFF, COUT_BCRYPT } from "@/lib/staff";

/// Modification d'un compte : activation, role, mot de passe.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const courant = await getStaffCourant();
  if (courant?.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorise." }, { status: 403 });
  }

  const resultat = majStaffSchema.safeParse(await request.json().catch(() => null));
  if (!resultat.success) {
    const erreurs: Record<string, string> = {};
    for (const probleme of resultat.error.issues) {
      const champ = String(probleme.path[0]);
      if (!erreurs[champ]) erreurs[champ] = probleme.message;
    }
    return NextResponse.json({ message: "Modification invalide.", erreurs }, { status: 422 });
  }

  const { id } = await params;
  const { approved, role, password } = resultat.data;

  // Se retirer soi-meme le role ou l'acces fermerait la porte de l'interieur,
  // sans personne pour rouvrir. Changer son propre mot de passe reste permis.
  if (id === courant.id && (approved === false || (role && role !== courant.role))) {
    return NextResponse.json(
      { message: "Vous ne pouvez pas retirer vos propres droits d'administrateur." },
      { status: 409 },
    );
  }

  try {
    const utilisateur = await prisma.staffUser.update({
      where: { id },
      data: {
        ...(approved === undefined ? {} : { approved }),
        ...(role ? { role } : {}),
        ...(password ? { passwordHash: await bcrypt.hash(password, COUT_BCRYPT) } : {}),
      },
      select: CHAMPS_STAFF,
    });
    return NextResponse.json({ utilisateur });
  } catch {
    return NextResponse.json({ message: "Compte introuvable." }, { status: 404 });
  }
}

/// Suppression definitive d'un compte staff.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const courant = await getStaffCourant();
  if (courant?.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorise." }, { status: 403 });
  }

  const { id } = await params;

  if (id === courant.id) {
    return NextResponse.json(
      { message: "Vous ne pouvez pas supprimer votre propre compte." },
      { status: 409 },
    );
  }

  try {
    // Les candidatures traitees et les articles rediges par ce compte sont
    // conserves : le schema met la relation a null plutot que de les effacer.
    await prisma.staffUser.delete({ where: { id } });
    return NextResponse.json({ supprime: true });
  } catch {
    return NextResponse.json({ message: "Compte introuvable." }, { status: 404 });
  }
}
