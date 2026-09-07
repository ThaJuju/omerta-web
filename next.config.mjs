/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Masque la pastille Next.js en bas de l'ecran pendant le developpement.
  devIndicators: false,

  // Acces au serveur de dev depuis une autre machine du reseau local.
  // Sans effet en production.
  allowedDevOrigins: ["192.168.10.10"],

  // Les anciennes URLs restent valides : liens Discord, favoris et
  // referencement existants continuent de fonctionner.
  async redirects() {
    return [
      { source: "/index", destination: "/", permanent: true },
      { source: "/pages/formulaire", destination: "/candidature", permanent: true },
      { source: "/pages/formulaire2", destination: "/candidature", permanent: true },
      { source: "/pages/formulaire3", destination: "/candidature", permanent: true },
      { source: "/pages/formulaire2.html", destination: "/candidature", permanent: true },
      { source: "/pages/formulaire3.html", destination: "/candidature", permanent: true },
      { source: "/pages/discord", destination: "/discord", permanent: true },
      { source: "/pages/login.php", destination: "/staff/login", permanent: true },
      { source: "/pages/admin.php", destination: "/staff", permanent: true },
    ];
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
