import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffCourant } from "@/lib/session";
import { articleMajSchema } from "@/lib/validation";

/// Modification d'un article. Le dashboard envoie soit le formulaire complet,
/// soit un seul champ (publier, epingler) : le schema est donc partiel.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const moi = await getStaffCourant();
  if (!moi) {
    return NextResponse.json({ message: "Non autorise." }, { status: 401 });
  }

  const resultat = articleMajSchema.safeParse(await request.json().catch(() => null));
  if (!resultat.success) {
    const erreurs: Record<string, string> = {};
    for (const probleme of resultat.error.issues) {
      const champ = String(probleme.path[0]);
      if (!erreurs[champ]) erreurs[champ] = probleme.message;
    }
    return NextResponse.json(
      { message: "Modification invalide.", erreurs },
      { status: 422 },
    );
  }

  const { id } = await params;
  const existant = await prisma.article.findUnique({
    where: { id },
    select: { publieLe: true },
  });
  if (!existant) {
    return NextResponse.json({ message: "Article introuvable." }, { status: 404 });
  }

  const { couverture, statut, ...reste } = resultat.data;

  try {
    const article = await prisma.article.update({
      where: { id },
      data: {
        ...reste,
        ...(statut ? { statut } : {}),
        ...(couverture === undefined ? {} : { couverture: couverture || null }),
        // La date de premiere publication est figee : la reecrire ferait
        // remonter en tete un vieil article simplement corrige.
        ...(statut === "PUBLIE" && !existant.publieLe ? { publieLe: new Date() } : {}),
      },
    });
    return NextResponse.json({ article });
  } catch {
    return NextResponse.json(
      { message: "Ce slug est deja utilise.", erreurs: { slug: "Slug deja pris." } },
      { status: 409 },
    );
  }
}

/// Suppression definitive d'un article.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const moi = await getStaffCourant();
  if (!moi) {
    return NextResponse.json({ message: "Non autorise." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ supprime: true });
  } catch {
    return NextResponse.json({ message: "Article introuvable." }, { status: 404 });
  }
}
