import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { BoutonDeconnexion } from "@/components/BoutonDeconnexion";
import {
  TableauCandidatures,
  type CandidatureRow,
} from "@/components/TableauCandidatures";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Dashboard Staff", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PageStaff() {
  const session = await getSession();
  if (!session) redirect("/staff/login");

  const candidatures = await prisma.candidature.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { reviewedBy: { select: { username: true } } },
  });

  const lignes: CandidatureRow[] = candidatures.map(({ reviewedBy, ...reste }) => ({
    ...reste,
    createdAt: reste.createdAt.toISOString(),
    reviewedAt: reste.reviewedAt?.toISOString() ?? null,
    reviewerNom: reviewedBy?.username ?? null,
  }));

  const enAttente = lignes.filter((ligne) => ligne.status === "EN_ATTENTE").length;

  return (
    <PageShell>
      <div className="py-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="kicker">Espace staff</p>
            <h1 className="display mt-3 text-[clamp(2.25rem,6vw,3.5rem)]">
              Candidatures
            </h1>
            <p className="mt-3 text-sm text-ink-soft">
              Connecte en tant que <strong className="text-ink">{session.username}</strong>
              {" · "}
              {enAttente} en attente de traitement
            </p>
          </div>
          <BoutonDeconnexion />
        </div>

        <TableauCandidatures initiales={lignes} />
      </div>
    </PageShell>
  );
}
