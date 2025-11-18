# Configuration Google Analytics

## Obtenir votre ID de mesure GA4

1. Allez sur [Google Analytics](https://analytics.google.com/)
2. Créez une propriété GA4 (ou utilisez une existante)
3. Dans **Administration** > **Flux de données** > Cliquez sur votre site web
4. Copiez votre **ID de mesure** (format : `G-XXXXXXXXXX`)

## Configuration

### 1. Ajouter l'ID dans le fichier .env

Dans votre fichier `.env` à la racine du projet, ajoutez :

```bash
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Remplacez `G-XXXXXXXXXX` par votre véritable ID de mesure.

### 2. Redémarrer le serveur

```bash
npm run dev
```

C'est tout ! Google Analytics est maintenant actif sur votre site.

## Vérification

1. Ouvrez votre site dans un navigateur
2. Ouvrez la console développeur (F12)
3. Vous devriez voir : `📊 Loading Google Analytics...` puis `✅ Google Analytics loaded`
4. Dans Google Analytics, allez dans **Temps réel** pour voir vos visites en direct

## Conformité RGPD

L'intégration est automatiquement conforme RGPD :
- ✅ **Anonymisation des IP** activée (`anonymize_ip: true`)
- ✅ **Cookies sécurisés** (`SameSite=None;Secure`)
- ✅ **Durée de conservation** : 2 ans
- ✅ **Mention dans la politique de confidentialité**

## Désactivation

Pour désactiver Google Analytics :
1. Supprimez ou laissez vide la variable `GA_MEASUREMENT_ID` dans `.env`
2. Redémarrez le serveur
3. Le script ne se chargera plus

## Données collectées

Google Analytics collecte de manière anonymisée :
- Pages visitées et temps passé
- Parcours de navigation
- Type d'appareil et navigateur
- Localisation géographique (pays/ville)
- Source de trafic

**Aucune donnée personnelle identifiable n'est collectée.**

## Support

En cas de problème, vérifiez :
1. Que l'ID de mesure est correct (format `G-XXXXXXXXXX`)
2. Que le serveur a bien été redémarré après modification du `.env`
3. La console développeur pour d'éventuelles erreurs
