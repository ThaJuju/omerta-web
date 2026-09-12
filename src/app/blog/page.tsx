import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { CarteArticle } from "@/components/CarteArticle";
import { Icon } from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { categories, categorieLabel, PAR_PAGE } from "@/lib/blog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `Actualites, mises a jour et evenements du serveur ${site.name}.`,
};

/// Les articles changent depuis le dashboard sans redeploiement : la page est
/// rendue a la demande plutot que figee au build.
export const dynamic = "force-dynamic";

type Recherche = Promise<{ categorie?: string; page?: string }>;

export default async function PageBlog({
  searchParams,
}: {
  searchParams: Recherche;
}) {
  const { categorie, page } = await searchParams;

  const filtre = categories.some((c) => c.valeur === categorie) ? categorie : undefined;
  const numero = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  const where = {
    statut: "PUBLIE",
    ...(filtre ? { categorie: filtre } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: [{ epingle: "desc" }, { publieLe: "desc" }],
      skip: (numero - 1) * PAR_PAGE,
      take: PAR_PAGE,
      include: { auteur: { select: { username: true } } },
    }),
    prisma.article.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const lien = (valeurs: { categorie?: string; page?: number }) => {
    const params = new URLSearchParams();
    if (valeurs.categorie) params.set("categorie", valeurs.categorie);
    if (valeurs.page && valeurs.page > 1) params.set("page", String(valeurs.page));
    const chaine = params.toString();
    return chaine ? `/blog?${chaine}` : "/blog";
  };

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

        <nav
          aria-label="Filtrer par categorie"
          className="mt-10 flex flex-wrap gap-2"
        >
          <Link
            href={lien({})}
            className={`border px-3.5 py-2 text-sm font-semibold transition-colors ${
              filtre
                ? "border-line text-ink-soft hover:text-ink"
                : "border-accent bg-accent/15 text-accent"
            }`}
          >
            Tout
          </Link>
          {categories.map((categorieItem) => (
            <Link
              key={categorieItem.valeur}
              href={lien({ categorie: categorieItem.valeur })}
              className={`border px-3.5 py-2 text-sm font-semibold transition-colors ${
                filtre === categorieItem.valeur
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-line text-ink-soft hover:text-ink"
              }`}
            >
              {categorieItem.label}
            </Link>
          ))}
        </nav>

        {articles.length === 0 ? (
          <p className="panel mt-10 p-12 text-center text-ink-soft">
            {filtre
              ? `Aucun article publie dans la categorie « ${categorieLabel(filtre)} » pour le moment.`
              : "Aucun article publie pour le moment. Revenez bientot."}
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
                  categorie: article.categorie,
                  couverture: article.couverture,
                  epingle: article.epingle,
                  contenu: article.contenu,
                  publieLe: (article.publieLe ?? article.createdAt).toISOString(),
                  auteur: article.auteur?.username ?? null,
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
                href={lien({ categorie: filtre, page: numero - 1 })}
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
                href={lien({ categorie: filtre, page: numero + 1 })}
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
