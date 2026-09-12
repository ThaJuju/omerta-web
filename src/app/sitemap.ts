import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

/// Le sitemap liste les articles publies : il doit donc etre recalcule a
/// chaque requete, sinon un article publie apres le build resterait invisible.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://omerta-rp.fr";
  const maintenant = new Date();

  const fixes = ["", "/candidature", "/discord", "/blog"].map((chemin) => ({
    url: `${base}${chemin}`,
    lastModified: maintenant,
    changeFrequency: "weekly" as const,
    priority: chemin === "" ? 1 : 0.8,
  }));

  // Une base injoignable au moment du crawl ne doit pas casser tout le sitemap.
  const articles = await prisma.article
    .findMany({
      where: { statut: "PUBLIE" },
      select: { slug: true, updatedAt: true },
      orderBy: { publieLe: "desc" },
      take: 500,
    })
    .catch(() => []);

  return [
    ...fixes,
    ...articles.map((article) => ({
      url: `${base}/blog/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
