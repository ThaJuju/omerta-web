import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CarteArticle } from "@/components/CarteArticle";
import { Icon } from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { dateLisible, tempsLecture } from "@/lib/blog";
import { rendreMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

/// Un brouillon n'est jamais servi publiquement, meme avec l'URL exacte.
const publie = (slug: string) =>
  prisma.article.findFirst({
    where: { slug, statut: "PUBLIE" },
  });

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await publie(slug);
  if (!article) return { title: "Article introuvable" };

  const url = `${site.url}/blog/${article.slug}`;

  return {
    title: article.titre,
    description: article.extrait,
    // Sans canonique, une meme page atteinte par plusieurs chemins compte
    // comme autant de doublons pour un moteur de recherche.
    alternates: { canonical: url },
    openGraph: {
      title: article.titre,
      description: article.extrait,
      type: "article",
      url,
      siteName: site.name,
      locale: "fr_FR",
      publishedTime: (article.publieLe ?? article.createdAt).toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      // Repli sur le logo : une carte sociale sans image passe inapercue.
      images: [article.couverture ?? `${site.url}/assets/logo.png`],
    },
  };
}

export default async function PageArticle({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await publie(slug);
  if (!article) notFound();

  const date = article.publieLe ?? article.createdAt;

  // Faute de categories, la suggestion se fait sur la fraicheur.
  const similaires = await prisma.article.findMany({
    where: { statut: "PUBLIE", NOT: { id: article.id } },
    orderBy: { publieLe: "desc" },
    take: 3,
  });

  const donneesStructurees = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.titre,
    description: article.extrait,
    datePublished: date.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    inLanguage: "fr-FR",
    mainEntityOfPage: `${site.url}/blog/${article.slug}`,
    image: article.couverture ?? `${site.url}/assets/logo.png`,
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: `${site.url}/assets/logo.png` },
    },
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }}
      />
      <article className="py-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint transition-colors hover:text-accent"
        >
          <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Retour au blog
        </Link>

        <header className="mt-8 max-w-4xl">
          <p className="kicker">Le journal</p>
          <h1 className="display mt-5 text-[clamp(2.5rem,6.5vw,5rem)]">
            {article.titre}
          </h1>
          <div className="rule-accent mt-7 max-w-md" />
          <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint">
            {dateLisible(date)} · {tempsLecture(article.contenu)} min de lecture
          </p>
          <p className="mt-6 text-xl leading-relaxed text-ink-soft">
            {article.extrait}
          </p>
        </header>

        {article.couverture && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.couverture}
            alt={article.titre}
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
            Derniers articles
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similaires.map((autre) => (
              <CarteArticle
                key={autre.id}
                article={{
                  slug: autre.slug,
                  titre: autre.titre,
                  extrait: autre.extrait,
                  couverture: autre.couverture,
                  epingle: autre.epingle,
                  contenu: autre.contenu,
                  publieLe: (autre.publieLe ?? autre.createdAt).toISOString(),
                }}
              />
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
