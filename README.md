# CO2M - WebDesign et Communication

Site one-page moderne pour CO2M, agence web freelance de Maxime METTEY.

## 🚀 Démarrage rapide

Ouvrez simplement le fichier `index.html` dans votre navigateur préféré !

## 📁 Structure du projet

```
co2m-website/
├── index.html          # Site complet (HTML/CSS/JS)
├── projects.json       # Fichier de configuration des projets portfolio
├── logo.png           # Logo CO2M
└── README.md          # Ce fichier
```

## ✏️ Personnaliser le portfolio

### Ajouter/Modifier des projets

Éditez le fichier `projects.json` pour ajouter vos projets :

```json
{
  "projects": [
    {
      "title": "Nom du projet",
      "description": "Description courte du projet",
      "icon": "🚀",
      "image": "",
      "tags": ["Tag1", "Tag2", "Tag3"]
    }
  ]
}
```

**Champs disponibles :**
- `title` : Titre du projet
- `description` : Description courte (2-3 phrases max)
- `icon` : Emoji affiché si pas d'image (optionnel)
- `image` : Chemin vers l'image du projet (ex: "./images/projet1.jpg") - laissez vide pour afficher l'icône
- `tags` : Liste des technologies/compétences utilisées

### Ajouter des images aux projets

1. Créez un dossier `images/` à la racine
2. Ajoutez vos captures d'écran (format recommandé : 800x600px)
3. Dans `projects.json`, indiquez le chemin : `"image": "./images/mon-projet.jpg"`

## 🎨 Personnalisation du design

### Modifier les couleurs

Dans `index.html`, cherchez la section `:root` (ligne ~40) et modifiez les variables CSS :

```css
:root {
    --primary-color: #3FA9F5;      /* Couleur principale */
    --primary-dark: #2B8DD6;       /* Couleur foncée */
    --bg-dark: #0A0E27;            /* Fond principal */
    --bg-card: #151B3D;            /* Fond des cartes */
}
```

### Modifier les statistiques décalées

Recherchez la section "STATS SECTION" dans le HTML (ligne ~600) et modifiez :
- `data-target` : La valeur cible du compteur
- `stat-label` : Le texte explicatif
- `stat-icon` : L'emoji affiché

## 📱 Réseaux sociaux

Dans la section Contact, remplacez les `#` par vos vrais liens :

```html
<a href="https://linkedin.com/in/votre-profil" class="social-link">
```

## 📧 Formulaire de contact

Le formulaire affiche actuellement une alerte. Pour le connecter à un vrai système :

1. **Avec un service tiers** (recommandé) :
   - [Formspree](https://formspree.io/)
   - [Netlify Forms](https://www.netlify.com/products/forms/)
   - [EmailJS](https://www.emailjs.com/)

2. **Avec votre propre backend** :
   - Modifiez la fonction dans la section JavaScript (ligne ~850)
   - Configurez votre endpoint API

## 🌐 Déploiement

### GitHub Pages
1. Poussez le code sur GitHub
2. Activez GitHub Pages dans les paramètres du repo
3. Votre site sera accessible à `https://votre-username.github.io/co2m-website`

### Netlify (recommandé)
1. Connectez votre repo GitHub à Netlify
2. Déploiement automatique à chaque push
3. Support du formulaire de contact intégré

### Hébergement classique
Uploadez tous les fichiers via FTP sur votre hébergeur web.

## ✅ Optimisations incluses

- ✅ **SEO optimisé** : Balises meta, structure sémantique
- ✅ **Responsive** : Adapté mobile, tablette, desktop
- ✅ **Performance** : CSS/JS optimisés, animations fluides
- ✅ **Accessibilité** : Navigation au clavier, labels ARIA
- ✅ **Modern design** : Dark theme, animations, effets modernes

## 🛠️ Technologies utilisées

- HTML5 sémantique
- CSS3 (Grid, Flexbox, Animations, Variables)
- JavaScript Vanilla (ES6+)
- JSON pour la gestion des données

## 📝 Licence

© 2024 CO2M - Maxime METTEY. Tous droits réservés.