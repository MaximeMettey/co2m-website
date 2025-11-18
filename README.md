# CO2M - WebDesign et Communication

Site web professionnel full-stack avec système de gestion de contenu (CMS) sécurisé.

## ⚡ Architecture

**Frontend** : Vanilla JavaScript (rapide et léger)  
**Backend** : Node.js + Express + SQLite  
**Auth** : JWT + bcrypt + hCaptcha + Rate Limiting  
**Déploiement** : VPS avec PM2 + Nginx

## 🚀 Fonctionnalités

### 🎨 Site Web (Public)
- Design moderne et responsive
- Sections dynamiques : Hero, À propos, Services, Portfolio, Stats, Contact
- Chargement depuis API REST
- Animations fluides
- Formulaire de contact (FormSubmit)

### 🔐 Admin Sécurisé (`/admin`)
**Authentification :**
- Login avec JWT
- Protection brute force (5 tentatives / 15 min)
- hCaptcha obligatoire
- Rate limiting sur toutes les opérations

**Gestion du contenu :**
- ✅ Services (CRUD complet)
- ✅ Projets portfolio (CRUD complet)
- ✅ Statistiques (CRUD complet)
- ✅ Sections de contenu (Hero, About)
- ✅ Paramètres globaux
- ✅ Changement de mot de passe

### 🗄️ Base de Données
- **SQLite** côté serveur (better-sqlite3)
- Tables : users, services, projects, stats, content_sections, settings, login_attempts
- Backup facile (simple copie du fichier .db)
- Performances excellentes

### 🛡️ Sécurité
- Authentification JWT avec expiration
- Mots de passe hashés (bcrypt)
- Protection anti-brute force
- hCaptcha sur le login
- Rate limiting sur toutes les routes
- Headers de sécurité (Helmet)
- Logs des tentatives de connexion

## 📁 Structure du Projet

```
/
├── server/                    # Backend Node.js
│   ├── routes/               # Routes API
│   ├── middleware/           # Middlewares
│   ├── database/             # Base de données SQLite
│   ├── init-db.js           # Script d'initialisation BDD
│   └── index.js             # Serveur Express
├── admin/                    # Frontend admin
├── css/                      # Styles frontend
├── js/                       # Scripts frontend
├── index.html               # Page d'accueil
├── package.json
├── .env                      # Configuration (NE PAS COMMIT)
├── README.md                # Ce fichier
└── DEPLOY.md                # Guide de déploiement
```

## 🛠️ Installation Locale

### 1. Cloner le projet

```bash
git clone https://github.com/MaximeMettey/co2m-website.git
cd co2m-website
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

```bash
cp .env.example .env
nano .env
```

### 4. Initialiser la base de données

```bash
npm run init-db
```

**Credentials admin par défaut :**
- Username: `admin`
- Password: `Admin@CO2M2024`

**⚠️ CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT !**

### 5. Lancer le serveur

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 🔐 Accès Admin

**URL** : `http://localhost:3000/admin`

**Première connexion :**
1. Username: `admin`
2. Password: `Admin@CO2M2024`
3. **CHANGER LE MOT DE PASSE** dans Paramètres

## 🌐 Déploiement VPS

Voir le guide complet : **[DEPLOY.md](DEPLOY.md)**

## 🔧 Technologies

**Backend :**
- Node.js 18+
- Express 4
- better-sqlite3
- JWT + bcrypt
- hCaptcha

**Frontend :**
- HTML5 / CSS3
- JavaScript Vanilla

## 📝 Licence

© 2024 CO2M - Maxime METTEY. Tous droits réservés.

---

**Développé avec ❤️ et beaucoup de ☕ par CO2M**
