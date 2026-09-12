# Omerta FA — contexte projet

Site du serveur GTA V roleplay **Omerta FA** : vitrine, recrutement
(staff et animateurs) et dashboard de traitement des candidatures.

**Stack** — Next.js 15 App Router · TypeScript · Tailwind CSS v4 · Prisma + PostgreSQL · Zod

## Deploiement

**Lire `DEPLOY.md` avant toute intervention sur une VM de production.**
Il contient la procedure complete, les verifications et le depannage.

Rappel du cycle de mise a jour — le code n'est pas recharge a chaud :

```bash
npm run build && pm2 restart omerta-web
```

## Regles a respecter

- **Aucun secret cote client.** Seules les variables `NEXT_PUBLIC_*` arrivent
  dans le navigateur. Le webhook Discord, l'adresse du serveur FiveM et
  `SESSION_SECRET` restent cote serveur. L'ancien site fuitait son webhook dans
  un fichier public : ne pas refaire cette erreur.
- **Ne jamais committer `.env`.** Il est dans `.gitignore`.
- **PostgreSQL est le seul provider**, en developpement comme en production.
  Ne jamais rebasculer `prisma/schema.prisma` sur SQLite : le serveur de
  production devait autrefois editer ce fichier a la main, ce qui provoquait un
  conflit a chaque `git pull`.
- **Pas de migrations Prisma.** Le projet applique le schema avec
  `npx prisma generate && npx prisma db push`.
- **Toute donnee entrante est validee cote serveur** avec les schemas Zod de
  `src/lib/validation.ts`. La validation cliente n'est qu'un confort.
- **Les variables `NEXT_PUBLIC_*` sont figees au build.** Les modifier impose un
  `npm run build`, un `pm2 restart` seul ne suffit pas.
- **L'age n'est jamais stocke.** Seule `dateNaissance` est collectee ; l'age se
  calcule avec `ageDepuis()` de `src/lib/age.ts`. Ne pas rajouter de colonne
  `age` : elle deviendrait fausse a chaque anniversaire.
- **L'age n'est pas un filtre.** `AGE_ATTENDU` (18 ans) sert a informer et a
  signaler, jamais a rejeter : l'equipe decide elle-meme de chaque dossier. Ne
  pas transformer cette constante en validation bloquante.
- **Le contenu des articles n'est jamais du HTML.** Il est ecrit en Markdown
  restreint et converti par `rendreMarkdown()` de `src/lib/markdown.ts`, qui
  echappe tout avant de transformer. Ne pas y injecter de HTML brut ni brancher
  une bibliotheque Markdown sans assainissement : la sortie va dans un
  `dangerouslySetInnerHTML` sur une page publique.
- **Contraste minimum 4.5:1** pour tout texte. La palette actuelle respecte
  WCAG AA ; verifier avant d'introduire une couleur.

## Sources uniques

Modifier ces fichiers plutot que de dupliquer la valeur ailleurs :

| Fichier | Contenu |
|---|---|
| `src/lib/site.ts` | Textes editoriaux, liens externes, navigation |
| `src/lib/postes.ts` | Postes ouverts au recrutement |
| `src/lib/blog.ts` | Categories du blog, pagination, slug, temps de lecture |
| `src/lib/questions.ts` | Les 15 questions du formulaire |
| `src/lib/validation.ts` | Schemas Zod, decoupage en etapes |
| `src/app/globals.css` | Tokens de design (couleurs, polices, utilitaires) |

Ajouter une categorie de blog : une entree dans `blog.ts` **et** la valeur dans
l'enum `categorie` de `articleSchema` (`validation.ts`). Sans la seconde, l'API
refuse l'article.

Ajouter un poste de recrutement : une entree dans `postes.ts` **et** la valeur
dans l'enum `poste` de `validation.ts`. Le formulaire et les filtres du
dashboard suivent automatiquement. Pour un salon Discord dedie, ajouter aussi
une entree dans `webhookPour()` de `src/lib/discord.ts` et la variable
correspondante dans `.env` ; sinon le poste retombe sur `DISCORD_WEBHOOK_URL`.

## Conventions

- **Code et commentaires en francais**, comme le reste du projet.
- Commentaires reserves au *pourquoi* d'une decision non evidente, jamais a la
  paraphrase du code.
- Pas de coins arrondis : la direction visuelle est anguleuse.
- Icones : SVG inline dans `src/components/Icon.tsx`, aucun CDN, aucun emoji.

## Pieges connus

- Le serveur de dev (Turbopack) et `npm run build` (webpack) partagent `.next`.
  Enchainer les deux provoque `Cannot find module '[turbopack]_runtime.js'` :
  faire `rm -rf .next` entre les deux.
- Le port 3000 est occupe par un autre projet sur la machine de developpement.
  Ce projet utilise **3100**.
- Un compte staff cree via `/staff/login` arrive **non approuve**. Il faut
  passer `approved` a `true` en base avant la premiere connexion.
