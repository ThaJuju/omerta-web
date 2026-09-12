import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { CarteArticle } from "@/components/CarteArticle";
import { Icon } from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { PAR_PAGE } from "@/lib/blog";
import { site } from "@/lib/site";

type Recherche = Promise<{ page?: string }>;

/// Chaque page de pagination se declare canonique d'elle-meme : sans cela,
/// `/blog?page=2` et `/blog` passent pour deux versions du meme contenu.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Recherche;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const numero = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const url = numero > 1 ? `${site.url}/blog?page=${numero}` : `${site.url}/blog`;

  return {
    title: numero > 1 ? `Blog — page ${numero}` : "Blog",
    description: `Actualites, mises a jour et evenements du serveur ${site.name}.`,
    alternates: { canonical: url },
    openGraph: {
      title: "Blog",
      description: `Actualites, mises a jour et evenements du serveur ${site.name}.`,
      type: "website",
      url,
      siteName: site.name,
      locale: "fr_FR",
      images: [`${site.url}/assets/logo.png`],
    },
  };
}

/// Les articles changent depuis le dashboard sans redeploiement : la page est
/// rendue a la demande plutot que figee au build.
export const dynamic = "force-dynamic";

export default async function PageBlog({
  searchParams,
}: {
  searchParams: Recherche;
}) {
  const { page } = await searchParams;

  const numero = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  const where = { statut: "PUBLIE" };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: [{ epingle: "desc" }, { publieLe: "desc" }],
      skip: (numero - 1) * PAR_PAGE,
      take: PAR_PAGE,
    }),
    prisma.article.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const lien = (cible: number) => (cible > 1 ? `/blog?page=${cible}` : "/blog");

  return (
    <PageShell>
      <div className="py-4">
        <p className="kicker">Le journal</p>
        <h1 className="display mt-5 text-[clamp(3rem,8vw,6.5rem)]">
          Blog
          <br />
          <span className="display-outline">Omerta FA</span>
        </h1>
        <div className="rule-accent mt-8 max-w-xl" />
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Annonces, mises a jour, evenements et coulisses. Tout ce qui bouge en
          ville est ecrit ici.
        </p>

        {articles.length === 0 ? (
          <p className="panel mt-10 p-12 text-center text-ink-soft">
            Aucun article publie pour le moment. Revenez bientot.
          </p>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <CarteArticle
                key={article.id}
                article={{
                  slug: article.slug,
                  titre: article.titre,
                  extrait: article.extrait,
                  couverture: article.couverture,
                  epingle: article.epingle,
                  contenu: article.contenu,
                  publieLe: (article.publieLe ?? article.createdAt).toISOString(),
                }}
              />
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-12 flex items-center justify-between gap-4"
          >
            {numero > 1 ? (
              <Link
                href={lien(numero - 1)}
                className="button-secondary min-h-11 px-4 text-[0.7rem]"
              >
                <Icon name="arrowLeft" className="h-4 w-4" /> Precedent
              </Link>
            ) : (
              <span />
            )}

            <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
              Page {numero} / {pages}
            </p>

            {numero < pages ? (
              <Link
                href={lien(numero + 1)}
                className="button-secondary min-h-11 px-4 text-[0.7rem]"
              >
                Suivant <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </PageShell>
  );
}
