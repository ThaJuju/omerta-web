import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { candidatureSchema } from "@/lib/validation";
import { notifierCandidature } from "@/lib/discord";
import { ipDepuis, limiter } from "@/lib/rateLimit";
import { getStaffCourant } from "@/lib/session";

/// Delai avant de pouvoir repostuler avec le meme compte Discord.
const CARENCE_JOURS = 30;

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

  // Anti-doublon. Il reposait sur le statut « en attente », mais le site ne
  // traite plus les candidatures — la decision se prend en reagissant au
  // message Discord, et le statut ne bouge donc jamais. Tel quel, le garde
  // aurait interdit a vie toute nouvelle candidature. Il devient une periode
  // de carence : un refuse peut repostuler passe ce delai.
  const depuis = new Date(Date.now() - CARENCE_JOURS * 24 * 60 * 60 * 1000);
  const recente = await prisma.candidature.findFirst({
    where: { discordTag: donnees.discordTag, createdAt: { gte: depuis } },
    select: { id: true },
  });

  if (recente) {
    return NextResponse.json(
      {
        message: `Une candidature a deja ete envoyee pour ce compte Discord. Vous pourrez repostuler ${CARENCE_JOURS} jours apres votre derniere demande.`,
      },
      { status: 409 },
    );
  }

  const candidature = await prisma.candidature.create({ data: donnees });

  await notifierCandidature({ ...donnees, id: candidature.id });

  return NextResponse.json({ id: candidature.id }, { status: 201 });
}

/// Liste des candidatures, reservee au staff approuve.
export async function GET() {
  const moi = await getStaffCourant();
  if (!moi) {
    return NextResponse.json({ message: "Non autorise." }, { status: 401 });
  }

  const candidatures = await prisma.candidature.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ candidatures });
}
