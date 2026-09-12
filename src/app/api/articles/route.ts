import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { articleSchema } from "@/lib/validation";

/// Liste complete des articles, brouillons compris : reservee au staff.
/// Le public passe par les pages /blog, qui ne lisent que les articles publies.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Non autorise." }, { status: 401 });
  }

  const articles = await prisma.article.findMany({
    orderBy: [{ epingle: "desc" }, { publieLe: "desc" }, { createdAt: "desc" }],
    take: 200,
    include: { auteur: { select: { username: true } } },
  });

  return NextResponse.json({ articles });
}

/// Creation d'un article depuis le dashboard.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Non autorise." }, { status: 401 });
  }

  const resultat = articleSchema.safeParse(await request.json().catch(() => null));
  if (!resultat.success) {
    const erreurs: Record<string, string> = {};
    for (const probleme of resultat.error.issues) {
      const champ = String(probleme.path[0]);
      if (!erreurs[champ]) erreurs[champ] = probleme.message;
    }
    return NextResponse.json(
      { message: "Article incomplet.", erreurs },
      { status: 422 },
    );
  }

  const { couverture, epingle, ...reste } = resultat.data;

  try {
    const article = await prisma.article.create({
      data: {
        ...reste,
        couverture: couverture || null,
        epingle: epingle ?? false,
        // La date de publication n'existe qu'a partir de la mise en ligne.
        publieLe: reste.statut === "PUBLIE" ? new Date() : null,
        auteurId: session.userId,
      },
    });
    return NextResponse.json({ article }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Ce slug est deja utilise.", erreurs: { slug: "Slug deja pris." } },
      { status: 409 },
    );
  }
}
