# Deploiement en production

Procedure destinee a une VM de production Debian/Ubuntu, executable telle
quelle par un agent ou a la main. Chaque etape se termine par une verification :
si elle echoue, **ne pas passer a la suivante**.

Le site est une application Next.js 15 avec base de donnees. Elle doit tourner
en permanence derriere un reverse proxy — ce n'est pas un site statique.

---

## 0. Prerequis

| Element | Version | Verification |
|---|---|---|
| Node.js | 20 LTS ou plus | `node -v` |
| npm | fourni avec Node | `npm -v` |
| pm2 | 5 ou plus | `pm2 -v` |
| nginx | quelconque | `nginx -v` |
| git | quelconque | `git --version` |

```bash
node -v && npm -v && pm2 -v && nginx -v && git --version
```

Si pm2 manque : `npm install -g pm2`

---

## 1. Recuperer le code

```bash
sudo mkdir -p /var/www && cd /var/www
git clone git@github.com:ThaJuju/omerta-web.git omerta-web
cd /var/www/omerta-web
```

Depot **prive** : le clone exige une cle SSH autorisee sur le compte GitHub, ou
`gh auth login` puis `gh repo clone ThaJuju/omerta-web omerta-web`.

Verification : `ls package.json prisma/schema.prisma` doit lister les deux fichiers.

---

## 2. Installer les dependances

```bash
cd /var/www/omerta-web
npm ci
```

`npm ci` et non `npm install` : la production doit installer exactement les
versions du `package-lock.json`.

Verification : `ls node_modules/next/package.json`

---

## 3. Configurer l'environnement

```bash
cd /var/www/omerta-web
cp .env.example .env
```

Editer `.env`. Valeurs **obligatoires** :

```bash
# Secret de session — en generer un neuf, ne jamais reprendre celui de dev
SESSION_SECRET="$(openssl rand -base64 32)"

# Base de donnees
DATABASE_URL="postgresql://omerta:MOTDEPASSE@localhost:5432/omerta"

# URL publique du site
NEXT_PUBLIC_SITE_URL="https://omerta-rp.fr"
```

Valeurs **optionnelles** mais recommandees :

```bash
DISCORD_WEBHOOK_STAFF=""          # salon des candidatures staff
DISCORD_WEBHOOK_ANIMATEUR=""      # salon des candidatures animateur
DISCORD_ROLE_STAFF=""             # role notifie (id numerique, vide = aucune notif)
DISCORD_ROLE_ANIMATEUR=""         # role notifie pour les candidatures animateur
FIVEM_SERVER_URL="https://c90l6t8d.gen.addveo.com:443"
NEXT_PUBLIC_JOIN_URL="https://cfx.re/join/gad36ex"
NEXT_PUBLIC_DISCORD_INVITE="https://discord.gg/omertarp"
NEXT_PUBLIC_SHOP_URL="https://boutique.omerta-rp.fr/"
NEXT_PUBLIC_RULES_URL="https://reglement.omerta-rp.fr/"
```

Restreindre les droits, le fichier contient des secrets :

```bash
chmod 600 /var/www/omerta-web/.env
```

> Les variables `NEXT_PUBLIC_*` sont inscrites dans le bundle envoye au
> navigateur. **N'y mettre aucun secret.** Elles sont figees au build : toute
> modification impose un `npm run build`.

Verification : `grep -c SESSION_SECRET .env` doit renvoyer `1`, et la valeur
doit faire 32 caracteres minimum, sinon l'application refuse de demarrer.

---

## 4. Base de donnees

Le projet utilise **PostgreSQL**, en production comme en developpement. Le
provider est fixe dans `prisma/schema.prisma` : aucune bascule a faire, et
`prisma/schema.prisma` ne doit jamais etre modifie sur le serveur.

### Creer le role et la base

```bash
sudo -u postgres psql -c "CREATE ROLE omerta_web_user LOGIN PASSWORD 'MOTDEPASSE';"
sudo -u postgres createdb -O omerta_web_user omerta_web
sudo -u postgres psql -d omerta_web -c "GRANT ALL ON SCHEMA public TO omerta_web_user;"
```

Reporter les memes valeurs dans `DATABASE_URL` (etape 3) :

```
postgresql://omerta_web_user:MOTDEPASSE@127.0.0.1:5432/omerta_web?schema=public
```

### Creer le schema

```bash
cd /var/www/omerta-web
npx prisma generate
npx prisma db push
```

Le projet n'a pas d'historique de migrations : `prisma db push` applique le
schema directement. C'est aussi la commande a rejouer apres chaque mise a jour
qui touche `prisma/schema.prisma`.

Verification :

```bash
psql "$DATABASE_URL" -c "\dt"
```

Doit lister les tables `StaffUser` et `Candidature`.

---

## 5. Compiler

```bash
cd /var/www/omerta-web
npm run build
```

Doit afficher `✓ Compiled successfully` puis le tableau des routes. En cas
d'echec, corriger avant de continuer : un build rate laisse l'ancienne version
en place.

---

## 6. Premier compte administrateur

```bash
cd /var/www/omerta-web
node prisma/seed.mjs <identifiant>
```

Le mot de passe est genere et affiche **une seule fois** : le noter
immediatement. Ne pas le passer en argument, il resterait dans l'historique du
shell.

Verification : se connecter sur `/staff/login` apres l'etape 7.

---

## 7. Lancer sous pm2

```bash
cd /var/www/omerta-web
pm2 start ./node_modules/next/dist/bin/next \
  --name omerta-web \
  --cwd /var/www/omerta-web \
  -- start -p 3100
pm2 save
```

Pour que le service revienne apres un redemarrage de la VM :

```bash
pm2 startup    # executer la commande qu'il affiche
pm2 save
```

Verifications :

```bash
pm2 describe omerta-web | grep -E "status|restarts"   # status online, restarts 0
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/        # 200
curl -s http://localhost:3100/api/server-status                        # JSON du serveur FiveM
```

---

## 8. Reverse proxy nginx + HTTPS

`/etc/nginx/sites-available/omerta-web` :

```nginx
server {
    listen 80;
    server_name omerta-rp.fr www.omerta-rp.fr;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        'upgrade';
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass                 $http_upgrade;
    }
}
```

`X-Forwarded-For` est **indispensable** : la limitation de debit s'appuie
dessus. Sans cet en-tete, toutes les requetes paraissent venir de la meme IP et
un seul visiteur peut bloquer le formulaire pour tout le monde.

```bash
sudo ln -s /etc/nginx/sites-available/omerta-web /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d omerta-rp.fr -d www.omerta-rp.fr
```

Verification : `curl -sI https://omerta-rp.fr | head -1` doit renvoyer `200`.

---

## 9. Verification finale

```bash
BASE=https://omerta-rp.fr
for p in / /candidature /discord /staff/login; do
  printf "%-16s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' $BASE$p)"
done
curl -s $BASE/api/server-status
curl -sI $BASE/api/server-status | grep -i cache-control   # doit contenir no-store
```

Attendu : quatre `200`, un JSON avec `"online":true`, et `no-store` present.
Le dashboard `/staff` doit rediriger vers `/staff/login` sans session.

---

## Mettre a jour le site

Le code n'est **pas** recharge a chaud. Apres chaque `git pull` :

```bash
cd /var/www/omerta-web
git pull
npm ci                      # seulement si package-lock.json a change
npx prisma generate         # seulement si schema.prisma a change
npx prisma db push          # seulement si schema.prisma a change
npm run build
pm2 restart omerta-web
```

Verifier ensuite : `pm2 logs omerta-web --lines 20 --nostream`

---

## Sauvegardes

A sauvegarder regulierement :

- La base de donnees : `pg_dump omerta_web > sauvegarde.sql`
- Le fichier `.env`, absent du depot et impossible a regenerer a l'identique

Perdre `SESSION_SECRET` deconnecte tout le staff mais ne detruit aucune donnee.
Perdre la base detruit les candidatures et les comptes.

---

## Depannage

| Symptome | Cause probable | Action |
|---|---|---|
| `SESSION_SECRET manquant ou trop court` au demarrage | `.env` absent ou secret < 32 caracteres | Regenerer avec `openssl rand -base64 32` |
| Compteur de joueurs bloque sur `?` | `FIVEM_SERVER_URL` faux ou serveur de jeu injoignable | `curl $FIVEM_SERVER_URL/dynamic.json` |
| Compteur fige a une ancienne valeur | Cache d'un CDN place devant | Verifier que `no-store` traverse le proxy |
| `429` sur le formulaire | Limitation de debit declenchee | Verifier que nginx transmet `X-Forwarded-For` |
| Les liens externes pointent au mauvais endroit | Variables `NEXT_PUBLIC_*` modifiees sans rebuild | `npm run build` puis `pm2 restart` |
| pm2 vide apres un reboot | `pm2 startup` non configure | Rejouer l'etape 7 |
