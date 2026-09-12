import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CarteArticle } from "@/components/CarteArticle";
import { Icon } from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { categorieLabel, dateLisible, tempsLecture } from "@/lib/blog";
import { rendreMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

/// Un brouillon n'est jamais servi publiquement, meme avec l'URL exacte.
const publie = (slug: string) =>
  prisma.article.findFirst({
    where: { slug, statut: "PUBLIE" },
    include: { auteur: { select: { username: true } } },
  });

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await publie(slug);
  if (!article) return { title: "Article introuvable" };

  return {
    title: article.titre,
    description: article.extrait,
    openGraph: {
      title: article.titre,
      description: article.extrait,
      type: "article",
      publishedTime: (article.publieLe ?? article.createdAt).toISOString(),
      ...(article.couverture ? { images: [article.couverture] } : {}),
    },
  };
}

export default async function PageArticle({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await publie(slug);
  if (!article) notFound();

  const date = article.publieLe ?? article.createdAt;

  const similaires = await prisma.article.findMany({
    where: {
      statut: "PUBLIE",
      categorie: article.categorie,
      NOT: { id: article.id },
    },
    orderBy: { publieLe: "desc" },
    take: 3,
    include: { auteur: { select: { username: true } } },
  });

  return (
    <PageShell>
      <article className="py-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint transition-colors hover:text-accent"
        >
          <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Retour au blog
        </Link>

        <header className="mt-8 max-w-4xl">
          <p className="kicker">{categorieLabel(article.categorie)}</p>
          <h1 className="display mt-5 text-[clamp(2.5rem,6.5vw,5rem)]">
            {article.titre}
          </h1>
          <div className="rule-accent mt-7 max-w-md" />
          <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint">
            {dateLisible(date)} · {tempsLecture(article.contenu)} min de lecture
            {article.auteur && ` · par ${article.auteur.username}`}
          </p>
          <p className="mt-6 text-xl leading-relaxed text-ink-soft">
            {article.extrait}
          </p>
        </header>

        {article.couverture && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.couverture}
            alt=""
            className="mt-10 max-h-[520px] w-full border border-line object-cover"
          />
        )}

        <div
          className="prose-omerta mt-12 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: rendreMarkdown(article.contenu) }}
        />
      </article>

      {similaires.length > 0 && (
        <section className="mt-20 border-t border-line pt-12">
          <p className="kicker">A lire aussi</p>
          <h2 className="display mt-4 text-4xl">
            Dans la meme categorie
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similaires.map((autre) => (
              <CarteArticle
                key={autre.id}
                article={{
                  slug: autre.slug,
                  titre: autre.titre,
                  extrait: autre.extrait,
                  categorie: autre.categorie,
                  couverture: autre.couverture,
                  epingle: autre.epingle,
                  contenu: autre.contenu,
                  publieLe: (autre.publieLe ?? autre.createdAt).toISOString(),
                  auteur: autre.auteur?.username ?? null,
                }}
              />
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
