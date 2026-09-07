import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { candidatureSchema } from "@/lib/validation";
import { notifierCandidature } from "@/lib/discord";
import { ipDepuis, limiter } from "@/lib/rateLimit";
import { getSession } from "@/lib/session";

/// Soumission d'une candidature. Toute la validation est ici : contrairement a
/// l'ancien site, le client ne peut rien contourner en editant le localStorage.
export async function POST(request: Request) {
  const ip = ipDepuis(request);
  if (!limiter(`candidature:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      { message: "Trop de candidatures envoyees. Reessayez dans une heure." },
      { status: 429 },
    );
  }

  let corps: unknown;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ message: "Requete invalide." }, { status: 400 });
  }

  const resultat = candidatureSchema.safeParse(corps);
  if (!resultat.success) {
    const erreurs: Record<string, string> = {};
    for (const probleme of resultat.error.issues) {
      const champ = String(probleme.path[0]);
      if (!erreurs[champ]) erreurs[champ] = probleme.message;
    }
    return NextResponse.json(
      { message: "Certaines reponses sont incompletes.", erreurs },
      { status: 422 },
    );
  }

  const donnees = resultat.data;

  // Une seule candidature en attente par identifiant Discord.
  const enCours = await prisma.candidature.findFirst({
    where: { discordTag: donnees.discordTag, status: "EN_ATTENTE" },
    select: { id: true },
  });

  if (enCours) {
    return NextResponse.json(
      { message: "Une candidature est deja en cours d'examen pour ce compte Discord." },
      { status: 409 },
    );
  }

  const candidature = await prisma.candidature.create({ data: donnees });

  await notifierCandidature({ ...donnees, id: candidature.id });

  return NextResponse.json({ id: candidature.id }, { status: 201 });
}

/// Liste des candidatures, reservee au staff approuve.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Non autorise." }, { status: 401 });
  }

  const candidatures = await prisma.candidature.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { reviewedBy: { select: { username: true } } },
  });

  return NextResponse.json({ candidatures });
}
