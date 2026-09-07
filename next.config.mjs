/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Masque la pastille Next.js en bas de l'ecran pendant le developpement.
  devIndicators: false,

  // Acces au serveur de dev depuis une autre machine du reseau local.
  // Sans effet en production.
  allowedDevOrigins: ["192.168.10.10"],

  // Compatibilite des anciens liens. Chaque URL du site precedent — et ses
  // variantes plausibles — renvoie vers l'URL actuelle correspondante.
  // Une seule URL canonique par page : les autres redirigent, elles ne
  // servent pas un duplicata (mauvais pour le referencement).
  async redirects() {
    /** Toutes les formes sous lesquelles une page a pu etre partagee. */
    const alias = {
      "/candidature": [
        "/formulaire",
        "/formulaire2",
        "/formulaire3",
        "/formulaire.html",
        "/recrutement",
        "/pages/formulaire",
        "/pages/formulaire2",
        "/pages/formulaire3",
        "/pages/formulaire.html",
        "/pages/formulaire2.html",
        "/pages/formulaire3.html",
      ],
      "/discord": ["/pages/discord", "/pages/discord.html"],
      "/staff/login": ["/login", "/connexion", "/pages/login", "/pages/login.php"],
      "/staff": ["/admin", "/pages/admin", "/pages/admin.php"],
      "/": ["/index", "/index.html", "/index.php", "/accueil"],
    };

    return Object.entries(alias).flatMap(([destination, sources]) =>
      sources.map((source) => ({ source, destination, permanent: true })),
    );
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
