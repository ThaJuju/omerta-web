import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { BoutonDeconnexion } from "@/components/BoutonDeconnexion";
import { OngletsDashboard } from "@/components/OngletsDashboard";
import {
  TableauCandidatures,
  type CandidatureRow,
} from "@/components/TableauCandidatures";
import { GestionArticles, type ArticleRow } from "@/components/GestionArticles";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Dashboard Staff", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PageStaff() {
  const session = await getSession();
  if (!session) redirect("/staff/login");

  const [candidatures, articles] = await Promise.all([
    prisma.candidature.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.article.findMany({
      orderBy: [{ epingle: "desc" }, { publieLe: "desc" }, { createdAt: "desc" }],
      take: 200,
      include: { auteur: { select: { username: true } } },
    }),
  ]);

  const lignes: CandidatureRow[] = candidatures.map((candidature) => ({
    ...candidature,
    createdAt: candidature.createdAt.toISOString(),
    reviewedAt: candidature.reviewedAt?.toISOString() ?? null,
  }));

  const lignesArticles: ArticleRow[] = articles.map(({ auteur, ...reste }) => ({
    ...reste,
    publieLe: reste.publieLe?.toISOString() ?? null,
    createdAt: reste.createdAt.toISOString(),
    auteurNom: auteur?.username ?? null,
  }));

  const brouillons = lignesArticles.filter(
    (article) => article.statut === "BROUILLON",
  ).length;

  return (
    <PageShell>
      <div className="py-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="kicker">Espace staff</p>
            <h1 className="display mt-3 text-[clamp(2.25rem,6vw,3.5rem)]">
              Dashboard
            </h1>
            <p className="mt-3 text-sm text-ink-soft">
              Connecte en tant que <strong className="text-ink">{session.username}</strong>
              {" · "}
              {lignes.length} candidature{lignes.length > 1 ? "s" : ""} recue
              {lignes.length > 1 ? "s" : ""}
              {" · "}
              {brouillons} brouillon{brouillons > 1 ? "s" : ""}
            </p>
          </div>
          <BoutonDeconnexion />
        </div>

        <OngletsDashboard
          onglets={[
            {
              cle: "candidatures",
              label: "Candidatures",
              icon: "users",
              compte: lignes.length,
              contenu: <TableauCandidatures initiales={lignes} />,
            },
            {
              cle: "blog",
              label: "Blog",
              icon: "news",
              compte: lignesArticles.length,
              contenu: <GestionArticles initiaux={lignesArticles} />,
            },
          ]}
        />
      </div>
    </PageShell>
  );
}
