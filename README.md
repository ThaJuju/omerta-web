# Omerta FA — site officiel

Reconstruction du site `omerta-rp.fr` : vitrine, recrutement staff et dashboard
de gestion des candidatures.

**Stack** — Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma · Zod

## Design

Direction **noir cinematographique** : fond quasi noir, bleu acier comme unique
accent, typographie condensee en capitales, angles vifs (pas de coins arrondis).

| Token | Valeur | Usage |
|---|---|---|
| `void` / `bg` / `surface` | `#06070a` / `#0a0b0f` / `#101218` | Fonds, du plus profond au plus eleve |
| `accent` / `accent-soft` | `#5b9dd9` / `#8ec5f0` | Accent unique : liens actifs, CTA, chiffres |
| `ink` / `ink-soft` / `ink-faint` | `#f1f3f7` / `#959ba6` / `#7e848f` | Texte principal, secondaire, tertiaire |

Polices : **Barlow Condensed** (titres), **Barlow** (texte), **JetBrains Mono**
(chiffres et sur-titres). Auto-hebergees via `next/font`, aucun CDN.

Classes utilitaires dans `globals.css` : `.display` (titre condense capitales),
`.kicker` (sur-titre mono colore), `.tabular` (chiffres a chasse fixe),
`.rule-accent` (filet bleu).

Toutes les paires texte/fond depassent 4.5:1 (WCAG AA). Le `prefers-reduced-motion`
est respecte et les anneaux de focus sont visibles au clavier sur tous les
elements interactifs.

## Demarrage

```bash
npm install
cp .env.example .env      # puis renseigner les valeurs (voir plus bas)
npm run db:push           # cree le schema de la base
node prisma/seed.mjs <identifiant>   # premier compte admin, mot de passe genere
npm run dev               # http://localhost:3100 (Turbopack)
```

## Variables d'environnement

| Variable | Obligatoire | Role |
|---|---|---|
| `DATABASE_URL` | oui | `file:./dev.db` en dev, `postgresql://...` en prod |
| `SESSION_SECRET` | oui | Signature des sessions staff. `openssl rand -base64 32` |
| `DISCORD_WEBHOOK_URL` | non | Notification du salon staff a chaque candidature |
| `FIVEM_SERVER_URL` | non | Serveur de jeu interroge pour le compteur de joueurs |
| `NEXT_PUBLIC_DISCORD_INVITE` | non | Lien d'invitation Discord |
| `NEXT_PUBLIC_SHOP_URL` | non | Lien boutique |
| `NEXT_PUBLIC_RULES_URL` | non | Lien reglement GitBook |
| `NEXT_PUBLIC_SITE_URL` | non | URL publique, utilisee par le sitemap et les metadonnees |

Seules les variables prefixees `NEXT_PUBLIC_` arrivent dans le navigateur.
Le webhook Discord, l'adresse du serveur FiveM et le secret de session restent
cote serveur.

## Structure

```
src/
  app/
    page.tsx                    Accueil
    candidature/                Formulaire de recrutement (3 etapes, 1 seule page)
    discord/                    Page d'invitation Discord
    staff/                      Dashboard (protege)
    staff/login/                Connexion / inscription staff
    api/
      candidatures/             POST public (soumission), GET + PATCH staff
      auth/                     login · register · logout
      server-status/            Proxy vers le serveur FiveM
  components/                   Navbar, PageShell, formulaires, icones
  lib/
    site.ts                     Textes et navigation — source unique
    postes.ts                   Postes ouverts au recrutement (Staff, Animateur)
    questions.ts                Les 15 questions du recrutement
    validation.ts               Schemas Zod partages client/serveur
    session.ts                  Sessions JWT en cookie HttpOnly
    discord.ts                  Envoi du webhook
    rateLimit.ts                Limitation de debit
prisma/schema.prisma            Modeles StaffUser et Candidature
```

## Deploiement (pm2)

Le site tourne sous pm2 sous le nom `omerta-web`, sur le port **3100**, en build
de production — meme convention que les autres applications de la machine.

```bash
npm run build                  # obligatoire avant chaque (re)demarrage
pm2 restart omerta-web         # appliquer une nouvelle version
pm2 logs omerta-web            # consulter les logs
pm2 stop omerta-web            # arreter
```

Premier lancement, si l'application n'existe pas encore dans pm2 :

```bash
pm2 start ./node_modules/next/dist/bin/next --name omerta-web \
  --cwd /home/web/omerta-web -- start -p 3100
pm2 save
```

Un changement de code n'est **pas** pris en compte a chaud : il faut
`npm run build` puis `pm2 restart omerta-web`. Pour developper, utiliser
`npm run dev` sur un autre port pendant que la version pm2 continue de tourner.

## Points d'attention

- **Comptes staff** : une inscription cree un compte *non approuve*. Un
  administrateur doit passer `approved` a `true` en base avant la premiere
  connexion. Le premier admin se cree avec `prisma/seed.mjs`, qui genere et
  affiche un mot de passe aleatoire (passer le mot de passe en argument reste
  possible, mais il finit dans l'historique du shell).
- **`.env`** : le `SESSION_SECRET` present est une valeur de developpement.
  En regenerer une pour la production (`openssl rand -base64 32`).
- **Anciennes URLs** : `/index`, `/pages/formulaire`, `/pages/discord`,
  `/pages/login.php` et `/pages/admin.php` redirigent en 308 vers les nouvelles.
  Les liens deja partages sur Discord continuent de fonctionner.
- **Limitation de debit** : en memoire, donc valable pour une instance unique.
  Passer a Redis en cas de deploiement multi-instances.
- **Passage a PostgreSQL** : changer `provider` dans `prisma/schema.prisma` et
  `DATABASE_URL`, puis `npm run db:push`. Aucun autre changement de code.

## Recrutement

Un seul formulaire couvre deux equipes : **Staff** (moderation) et **Animateur**
(evenements). Le poste est choisi a l'etape 1 et stocke dans `Candidature.poste`.

Pour ouvrir un troisieme poste, ajouter une entree dans `src/lib/postes.ts` et
la valeur correspondante dans l'enum `poste` de `src/lib/validation.ts` — le
formulaire, le webhook Discord et les filtres du dashboard suivent
automatiquement.

## Ce qui reste a faire

- Connexion staff via Discord OAuth (l'ancien site l'annoncait ;
  les variables `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` sont prevues).
- Interface d'administration des comptes staff (approbation depuis le dashboard
  plutot qu'en base).
- Notification du candidat lors du passage en `ACCEPTEE` / `REFUSEE`.
