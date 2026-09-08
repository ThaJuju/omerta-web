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

Le projet utilise **PostgreSQL en developpement comme en production** : meme
provider partout, aucune bascule a faire au deploiement.

### 1. Une base PostgreSQL locale

PostgreSQL 14 ou plus suffit. S'il n'est pas installe :

```bash
sudo apt install postgresql
```

Creer le role et la base de developpement :

```bash
sudo -u postgres psql -c "CREATE ROLE omerta_web_user LOGIN PASSWORD 'motdepasse';"
sudo -u postgres createdb -O omerta_web_user omerta_web
sudo -u postgres psql -d omerta_web -c "GRANT ALL ON SCHEMA public TO omerta_web_user;"
```

Verification :

```bash
psql "postgresql://omerta_web_user:motdepasse@127.0.0.1:5432/omerta_web" -c "SELECT 1;"
```

### 2. Lancer le projet

```bash
npm install
cp .env.example .env      # renseigner DATABASE_URL et SESSION_SECRET
npm run db:push           # cree le schema dans la base
node prisma/seed.mjs <identifiant>   # premier compte admin, mot de passe genere
npm run dev               # http://localhost:3100 (Turbopack)
```

## Variables d'environnement

| Variable | Obligatoire | Role |
|---|---|---|
| `DATABASE_URL` | oui | URL PostgreSQL, ex. `postgresql://omerta_web_user:...@127.0.0.1:5432/omerta_web?schema=public` |
| `SESSION_SECRET` | oui | Signature des sessions staff. `openssl rand -base64 32` |
| `DISCORD_WEBHOOK_STAFF` | non | Salon recevant les candidatures **staff** |
| `DISCORD_WEBHOOK_ANIMATEUR` | non | Salon recevant les candidatures **animateur** |
| `DISCORD_WEBHOOK_URL` | non | Repli commun si l'un des deux ci-dessus manque |
| `DISCORD_ROLE_STAFF` | non | Role notifie a l'arrivee d'une candidature staff |
| `DISCORD_ROLE_ANIMATEUR` | non | Role notifie a l'arrivee d'une candidature animateur |
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
    questions.ts                Un parcours de questions par poste
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
- **Compatibilite des anciens liens** : 24 URLs de l'ancien site et leurs
  variantes redirigent en 308 vers les pages actuelles, pour que les liens deja
  partages sur Discord continuent de fonctionner.

  | Destination | Alias acceptes |
  |---|---|
  | `/candidature` | `/formulaire`, `/formulaire2`, `/formulaire3`, `/formulaire.html`, `/recrutement`, et les memes sous `/pages/` |
  | `/discord` | `/pages/discord`, `/pages/discord.html` |
  | `/staff/login` | `/login`, `/connexion`, `/pages/login`, `/pages/login.php` |
  | `/staff` | `/admin`, `/pages/admin`, `/pages/admin.php` |
  | `/` | `/index`, `/index.html`, `/index.php`, `/accueil` |

  La liste est declaree dans `next.config.mjs`. Ajouter un alias : une entree
  dans l'objet `alias`. Chaque page garde **une seule URL canonique**, les
  alias redirigent plutot que de servir un duplicata.
- **Limitation de debit** : en memoire, donc valable pour une instance unique.
  Passer a Redis en cas de deploiement multi-instances.
- **Migrations** : le projet utilise `prisma db push`, sans historique de
  migrations. Apres toute modification de `prisma/schema.prisma`, jouer
  `npx prisma generate && npx prisma db push`.

## Recrutement

Un seul formulaire couvre deux equipes, avec **des questions differentes** :

| Poste | Etapes | Questions |
|---|---|---|
| Staff | Informations IRL · RolePlay · Complementaires | 15 |
| Animateur | Presentation · Experience · Motivation | 9 |

Le poste est choisi a l'etape 1 ; le parcours affiche ensuite depend de ce
choix. La validation est une **union discriminee** Zod : une candidature
animateur n'est jamais jugee sur les champs du parcours staff, et inversement.
En base, les champs propres a un poste sont donc optionnels.

### Age

Seule la **date de naissance** est demandee ; l'age s'en deduit
(`src/lib/age.ts`). Le stocker en plus ouvrirait la porte a deux reponses
contradictoires, et la valeur deviendrait fausse des l'anniversaire suivant.
Le calcul se fait en heure locale, pas en UTC.

`AGE_ATTENDU` vaut **18 ans** (`src/lib/validation.ts`) et n'est **pas
bloquant** : c'est l'equipe qui tranche, pas le formulaire.

- Le champ affiche l'attente, et un avertissement apparait sous les 18 ans —
  sans empecher de continuer.
- La candidature est enregistree et transmise normalement.
- Elle arrive **signalee** : embed Discord en orange avec la mention
  `MINEUR (17 ans)` en pied, et badge `Mineur` sur la fiche du dashboard.

### Identifiant Discord

Le formulaire demande l'**identifiant numerique** (ex. `812331705548406785`),
pas le pseudo. Il permet d'ouvrir directement le profil du candidat : mention
cliquable dans l'embed Discord, et bouton vers `discord.com/users/<id>` sur la
fiche du dashboard. Un pseudo reste accepte, mais s'affiche alors en texte
simple, sans lien.

### Notifications

`DISCORD_ROLE_STAFF` et `DISCORD_ROLE_ANIMATEUR` prennent l'identifiant
numerique d'un role. Renseignes, ce role est mentionne dans le message et
**recoit une notification** a chaque nouvelle candidature du poste
correspondant. Vides, aucune notification n'est envoyee.

La mention du role est placee dans le contenu du message, pas dans l'embed :
une mention dans un embed s'affiche mais ne notifie personne.

> Si le message affiche **`@role inconnu`**, l'identifiant ne correspond a
> aucun role du serveur ou poste le webhook. Le recuperer dans Discord :
> Parametres du serveur > Roles > clic droit sur le role > Copier l'identifiant
> — en verifiant qu'il s'agit bien du serveur du webhook.

`allowed_mentions` n'autorise que ce role, en liste blanche. Le champ Discord
du candidat est saisi librement et ne doit jamais pouvoir declencher de
notification de masse : sa mention reste cliquable pour ouvrir son profil, mais
ne notifie pas.

Seul un plancher technique de 13 ans (minimum impose par Discord) ecarte les
saisies absurdes.

Pour ouvrir un troisieme poste :

1. Une entree dans `src/lib/postes.ts`
2. Le parcours de questions dans `src/lib/questions.ts`
3. Un schema et une branche de l'union dans `src/lib/validation.ts`
4. Les champs correspondants (optionnels) dans `prisma/schema.prisma`

Le formulaire, l'embed Discord et le dashboard se derivent automatiquement des
questions du poste — aucun de ces trois fichiers n'est a modifier.

## Ce qui reste a faire

- Connexion staff via Discord OAuth (l'ancien site l'annoncait ;
  les variables `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` sont prevues).
- Interface d'administration des comptes staff (approbation depuis le dashboard
  plutot qu'en base).
- Notification du candidat lors du passage en `ACCEPTEE` / `REFUSEE`.
