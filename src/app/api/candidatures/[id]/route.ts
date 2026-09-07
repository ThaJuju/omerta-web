import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const majSchema = z.object({
  status: z.enum(["EN_ATTENTE", "ACCEPTEE", "REFUSEE"]),
  noteStaff: z.string().trim().max(2000).optional(),
});

/// Traitement d'une candidature par un membre du staff.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Non autorise." }, { status: 401 });
  }

  const resultat = majSchema.safeParse(await request.json().catch(() => null));
  if (!resultat.success) {
    return NextResponse.json({ message: "Statut invalide." }, { status: 400 });
  }

  const { id } = await params;

  try {
    const candidature = await prisma.candidature.update({
      where: { id },
      data: {
        status: resultat.data.status,
        noteStaff: resultat.data.noteStaff,
        reviewedAt: new Date(),
        reviewedById: session.userId,
      },
    });
    return NextResponse.json({ candidature });
  } catch {
    return NextResponse.json({ message: "Candidature introuvable." }, { status: 404 });
  }
}
