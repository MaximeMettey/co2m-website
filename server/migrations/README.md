# Migrations de base de données

Ce dossier contient les scripts de migration pour mettre à jour la structure de la base de données existante.

## Migration de la colonne gallery (pour projets)

Si vous avez déjà une base de données existante et que vous souhaitez ajouter la fonctionnalité de galerie d'images aux projets, exécutez la commande suivante depuis la racine du projet :

```bash
npm run migrate
```

Cette commande exécute le script `add-gallery-column.js` qui ajoute la colonne `gallery` (JSON array) à la table `projects`.

## Note importante

- **Pour les nouvelles installations** : Aucune migration n'est nécessaire. Exécutez simplement `npm run init-db` pour créer la base de données avec toutes les colonnes nécessaires, y compris `gallery`.

- **Pour les installations existantes** : Utilisez `npm run migrate` pour ajouter uniquement la colonne `gallery` sans perdre vos données.

## Structure attendue après migration

La table `projects` contiendra une colonne `gallery` de type TEXT contenant un JSON array d'URLs d'images :
```json
[
  "/uploads/projects/image1.jpg",
  "/uploads/projects/image2.jpg",
  "/uploads/projects/image3.jpg"
]
```

Par défaut, tous les projets existants auront `gallery = '[]'` (tableau vide).
