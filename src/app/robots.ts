import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/staff/", "/api/"] },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://omerta-rp.fr"}/sitemap.xml`,
  };
}
