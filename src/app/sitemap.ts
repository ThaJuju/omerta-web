import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://omerta-rp.fr";
  const maintenant = new Date();

  return ["", "/candidature", "/discord"].map((chemin) => ({
    url: `${base}${chemin}`,
    lastModified: maintenant,
    changeFrequency: "weekly" as const,
    priority: chemin === "" ? 1 : 0.8,
  }));
}
