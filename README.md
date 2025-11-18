# CO2M - WebDesign et Communication

Site web professionnel avec système de gestion de contenu (CMS) intégré basé sur SQLite.

## 🚀 Fonctionnalités

### 🎨 Site Web
- Design moderne et responsive
- Sections : Accueil, À propos, Services, Portfolio, Statistiques, Contact
- Animations fluides et effets visuels
- Chargement dynamique depuis base de données SQLite
- Formulaire de contact via FormSubmit (sans backend PHP)

### 🖥️ Mini CMS Admin
Interface d'administration complète accessible via `/admin/index.html`

**Fonctionnalités du CMS :**
- ✅ Gestion des services (création, édition, suppression)
- ✅ Gestion des projets portfolio (CRUD complet)
- ✅ Gestion des statistiques décalées
- ✅ Paramètres du site (contact, réseaux sociaux)
- ✅ Export/Import de la base de données (.sqlite)
- ✅ Réinitialisation de la BDD

### 🗄️ Base de Données
- **SQLite** via sql.js (100% client-side, aucun serveur requis)
- Stockage dans `localStorage` du navigateur
- Exportable en fichier `.sqlite`
- Tables : services, projects, stats, pages, settings

## 📁 Structure du Projet

```
/
├── index.html              # Page d'accueil
├── css/
│   └── style.css          # Styles globaux
├── js/
│   ├── database.js        # Gestion SQLite (sql.js)
│   ├── main.js            # Fonctions communes (nav, scroll, animations)
│   └── index.js           # Chargement dynamique page d'accueil
├── admin/
│   ├── index.html         # Interface CMS
│   ├── admin.css          # Styles admin
│   └── admin.js           # Logique CMS
├── logo.png               # Logo CO2M
└── projects.json          # (Legacy - remplacé par SQLite)
```

## 🛠️ Installation et Utilisation

### Lancement local
1. Ouvrir `index.html` dans un navigateur moderne
2. La base de données SQLite s'initialise automatiquement

### Accès au CMS
1. Ouvrir `/admin/index.html` dans votre navigateur
2. Éditer le contenu (services, projets, stats, paramètres)
3. Les modifications sont sauvegardées automatiquement dans `localStorage`

### Export/Import de la BDD
- **Export** : Dans l'admin, onglet "Base de données" → Télécharger
- **Import** : Charger un fichier `.sqlite` depuis le même onglet

## 📧 Configuration du Formulaire de Contact

Le formulaire utilise **FormSubmit.co** (service gratuit, sans backend).

Par défaut, l'email est configuré depuis les paramètres dans le CMS.
Pour modifier l'email de réception :
1. Aller dans l'admin → Paramètres
2. Modifier le champ "Email"
3. Enregistrer

**Première utilisation :**
FormSubmit enverra un email de confirmation à la première soumission.

## 🎯 Services Inclus

Le projet inclut 7 services pré-configurés :
1. **Développement Web Full-Stack** - Sites et applications web sur-mesure
2. **Applications Mobile Cross-Platform** - Flutter, React Native
3. **Design UI/UX & Identité Visuelle** - Logos, chartes graphiques
4. **SEO & Référencement IA (GEO)** - Optimisation moteurs de recherche
5. **Développement en Marque Blanche** - Partenariat technique
6. **Solutions Métier Sur-Mesure** - Applications personnalisées
7. **Debugging & Évolutions** - Maintenance et améliorations

## 📊 Statistiques Décalées

Des stats fun et originales pour humaniser le site :
- Expressos par jour
- Années d'expérience
- Nuits de debug
- Clients satisfaits
- Projets déployés
- Commits Git
- Bugs corrigés
- Technologies maîtrisées

## 🔧 Technologies Utilisées

- **HTML5** / **CSS3** - Structure et styles
- **JavaScript** (Vanilla) - Logique et interactions
- **sql.js** - SQLite compilé en WebAssembly
- **FormSubmit** - Service d'envoi d'emails
- **LocalStorage** - Persistance des données

## 🌐 Déploiement

### GitHub Pages / Netlify / Vercel
Le site est 100% statique et fonctionne sans serveur :
1. Push le projet sur GitHub
2. Activer GitHub Pages ou connecter à Netlify/Vercel
3. Le site est en ligne !

### Hébergement traditionnel
Simplement uploader tous les fichiers via FTP.

## 🎨 Personnalisation

### Couleurs
Modifier les variables CSS dans `css/style.css` :
```css
:root {
    --primary-color: #3FA9F5;
    --primary-dark: #2B8DD6;
    --bg-dark: #0A0E27;
    /* ... */
}
```

### Contenu
Utiliser le CMS admin pour modifier :
- Services et leurs descriptions
- Projets du portfolio
- Statistiques affichées
- Informations de contact

## 🐛 Debug & Évolutions Possibles

**Évolutions futures envisageables :**
- [ ] Pages multi-pages individuelles pour chaque service
- [ ] Pages de détail pour chaque projet
- [ ] Système de routing côté client
- [ ] Blog / Articles
- [ ] Galerie d'images
- [ ] Multilingue (FR/EN)

## 📝 Licence

Projet personnel - © 2024 CO2M - Maxime METTEY

---

**Développé avec ❤️ et beaucoup de ☕ par CO2M**
