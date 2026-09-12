/// Toutes les valeurs editoriales du site, en un seul endroit.
export const site = {
  name: "Omerta FA",
  /// Origine publique du site. Sert aux URL canoniques, au sitemap et aux
  /// metadonnees sociales, qui exigent toutes des adresses absolues.
  /// Figee au build : la changer impose un `npm run build`.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://omerta-rp.fr",
  tagline: "OMERTA FA ROLEPLAY",
  title: "Serveur Ouvert",
  description:
    "Omerta FA — Serveur GTA V roleplay francophone en acces libre. Recrutement staff et animateurs.",
  slogans: [
    "Rejoignez-nous dans un monde qui est le votre.",
    "Vivez dans un monde parallele.",
    "Un monde ou vous pouvez etre ce que vous voulez etre.",
    "Devenez qui vous souhaitez etre.",
  ],
  links: {
    discord: process.env.NEXT_PUBLIC_DISCORD_INVITE || "https://discord.gg/omertarp",
    shop: process.env.NEXT_PUBLIC_SHOP_URL || "https://boutique.omerta-rp.fr/",
    rules: process.env.NEXT_PUBLIC_RULES_URL || "https://reglement.omerta-rp.fr/",
    /// Lien de connexion directe au serveur de jeu (ouvre FiveM).
    jouer: process.env.NEXT_PUBLIC_JOIN_URL || "https://cfx.re/join/gad36ex",
  },
} as const;

/// Source unique de la navigation — plus de navbar copiee-collee par page.
export const navigation = [
  { label: "Accueil", href: "/", icon: "home" as const },
  { label: "Reglement", href: site.links.rules, icon: "book" as const, external: true },
  { label: "Blog", href: "/blog", icon: "news" as const },
  { label: "Recrutement", href: "/candidature", icon: "users" as const },
  { label: "Boutique", href: site.links.shop, icon: "cart" as const, external: true },
  { label: "Discord", href: "/discord", icon: "discord" as const },
];
