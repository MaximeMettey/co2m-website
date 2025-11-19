# Guide de déploiement - CO2M Website

## 🚀 Déploiement sur VPS

### Prérequis

- Node.js 18+ installé
- Nginx (recommandé) ou Apache
- PM2 pour la gestion du processus
- Certificat SSL (Let's Encrypt recommandé)

### 1. Configuration initiale

#### A. Cloner le projet

```bash
cd /var/www
git clone https://github.com/MaximeMettey/co2m-website.git
cd co2m-website
```

#### B. Installer les dépendances

```bash
npm install
```

#### C. Configurer les variables d'environnement

```bash
cp .env.example .env
nano .env
```

**Modifier ces variables OBLIGATOIREMENT :**

```env
# JWT Secret - Générer une clé aléatoire forte
JWT_SECRET=CHANGE_THIS_TO_VERY_SECURE_RANDOM_STRING_64_CHARS_MIN

# Admin credentials
ADMIN_USERNAME=admin
# Le mot de passe sera défini via l'init-db (Admin@CO2M2024 par défaut)
# Changez-le immédiatement après la première connexion !

# hCaptcha (voir section suivante)
HCAPTCHA_SECRET=your_secret_key
HCAPTCHA_SITEKEY=your_site_key

# Production
NODE_ENV=production
PORT=3000
```

#### D. Initialiser la base de données

```bash
npm run init-db
```

**Important :** Le mot de passe admin par défaut est `Admin@CO2M2024`
**Changez-le IMMÉDIATEMENT après la première connexion !**

### 2. Configuration hCaptcha

hCaptcha protège votre formulaire de connexion contre les attaques par brute force.

#### A. Créer un compte hCaptcha

1. Aller sur [https://www.hcaptcha.com/](https://www.hcaptcha.com/)
2. S'inscrire gratuitement
3. Créer un nouveau site

#### B. Récupérer les clés

Dans le dashboard hCaptcha :
- **Sitekey** : Clé publique à utiliser dans le frontend
- **Secret** : Clé secrète à mettre dans `.env`

#### C. Configurer dans `.env`

```env
HCAPTCHA_SECRET=0x0000000000000000000000000000000000000000  # Remplacer
HCAPTCHA_SITEKEY=10000000-ffff-ffff-ffff-000000000001      # Remplacer
```

#### D. Mode développement

Pour le développement local, hCaptcha propose des clés de test :

```env
# Test keys (always pass)
HCAPTCHA_SECRET=0x0000000000000000000000000000000000000000
HCAPTCHA_SITEKEY=10000000-ffff-ffff-ffff-000000000001
```

### 3. Démarrage avec PM2

PM2 garde votre application en ligne 24/7 et la redémarre automatiquement en cas de crash.

#### A. Installer PM2 globalement

```bash
npm install -g pm2
```

#### B. Démarrer l'application

```bash
pm2 start server/index.js --name co2m-website
pm2 save
pm2 startup
```

#### C. Commandes utiles PM2

```bash
pm2 list                  # Voir les processus
pm2 logs co2m-website    # Voir les logs
pm2 restart co2m-website # Redémarrer
pm2 stop co2m-website    # Arrêter
pm2 delete co2m-website  # Supprimer
```

### 4. Configuration Nginx

#### A. Créer le fichier de configuration

```bash
sudo nano /etc/nginx/sites-available/co2m.net
```

#### B. Configuration Nginx

```nginx
server {
    listen 80;
    server_name co2m.net www.co2m.net;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name co2m.net www.co2m.net;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/co2m.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/co2m.net/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### C. Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/co2m.net /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL avec Let's Encrypt

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d co2m.net -d www.co2m.net
```

Renouvellement automatique :
```bash
sudo crontab -e
# Ajouter :
0 3 * * * certbot renew --quiet
```

## 🔐 Sécurité

### Changer le mot de passe admin

1. Se connecter à l'admin avec les credentials par défaut
2. Aller dans Paramètres → Changer le mot de passe
3. **OU** utiliser l'API :

```bash
curl -X POST https://co2m.net/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Admin@CO2M2024",
    "newPassword": "VotreNouveauMotDePasseSecurise123!"
  }'
```

### Générer un nouveau JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copier le résultat dans `.env` → `JWT_SECRET`

### Limites de taux (Rate Limiting)

Le système inclut une protection anti-brute force :

- **Login** : 5 tentatives max / 15 minutes
- **API générale** : 100 requêtes / minute
- **API admin** : 30 requêtes / minute

Les tentatives échouées sont loggées dans la table `login_attempts`.

## 📊 Base de données

### Backup

```bash
# Backup manuel
cp server/database/co2m.db server/database/backup-$(date +%Y%m%d).db

# Backup automatique quotidien (cron)
0 2 * * * cp /var/www/co2m-website/server/database/co2m.db /var/backups/co2m-$(date +\%Y\%m\%d).db
```

### Restauration

```bash
cp server/database/backup-YYYYMMDD.db server/database/co2m.db
pm2 restart co2m-website
```

## 🔧 Maintenance

### Mise à jour du code

```bash
cd /var/www/co2m-website
git pull origin main
npm install  # Si nouvelles dépendances
pm2 restart co2m-website
```

### Voir les logs

```bash
pm2 logs co2m-website
# ou
pm2 logs co2m-website --lines 200
```

### Monitoring

```bash
pm2 monit
```

## 📝 Utilisation de l'admin

### Accès

**URL** : `https://co2m.net/admin`

**Credentials par défaut :**
- Username: `admin`
- Password: `Admin@CO2M2024` (**À CHANGER !**)

### Fonctionnalités

- ✅ Gestion des services
- ✅ Gestion du portfolio
- ✅ Gestion des statistiques
- ✅ Modification du contenu (Hero, About)
- ✅ Paramètres du site
- ✅ Changement de mot de passe

## 🚨 Troubleshooting

### L'application ne démarre pas

```bash
pm2 logs co2m-website --err
```

### Erreur "Database locked"

```bash
pm2 restart co2m-website
```

### hCaptcha ne fonctionne pas

Vérifier dans `.env` que les clés sont correctes :
```bash
cat .env | grep HCAPTCHA
```

### Port 3000 déjà utilisé

Changer le port dans `.env` :
```env
PORT=3001
```

Puis redémarrer :
```bash
pm2 restart co2m-website
```

## 📞 Support

En cas de problème, vérifier :
1. Les logs PM2 : `pm2 logs`
2. Les logs Nginx : `sudo tail -f /var/log/nginx/error.log`
3. Le statut de la BDD : `ls -lah server/database/`

---

**Développé avec ❤️ par CO2M**
