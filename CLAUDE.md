# Omerta FA — contexte projet

Site du serveur GTA V roleplay **Omerta FA** : vitrine, recrutement
(staff et animateurs) et dashboard de traitement des candidatures.

**Stack** — Next.js 15 App Router · TypeScript · Tailwind CSS v4 · Prisma · Zod

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
- **Ne jamais committer `.env` ni `prisma/*.db`.** Ils sont dans `.gitignore`.
- **Toute donnee entrante est validee cote serveur** avec les schemas Zod de
  `src/lib/validation.ts`. La validation cliente n'est qu'un confort.
- **Les variables `NEXT_PUBLIC_*` sont figees au build.** Les modifier impose un
  `npm run build`, un `pm2 restart` seul ne suffit pas.
- **Contraste minimum 4.5:1** pour tout texte. La palette actuelle respecte
  WCAG AA ; verifier avant d'introduire une couleur.

## Sources uniques

Modifier ces fichiers plutot que de dupliquer la valeur ailleurs :

| Fichier | Contenu |
|---|---|
| `src/lib/site.ts` | Textes editoriaux, liens externes, navigation |
| `src/lib/postes.ts` | Postes ouverts au recrutement |
| `src/lib/questions.ts` | Les 15 questions du formulaire |
| `src/lib/validation.ts` | Schemas Zod, decoupage en etapes |
| `src/app/globals.css` | Tokens de design (couleurs, polices, utilitaires) |

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
