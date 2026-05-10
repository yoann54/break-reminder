# Chrome Web Store — fiche de soumission

Document de référence à recopier dans le formulaire du Chrome Web Store
(Developer Dashboard). Tous les textes sont en français — à dupliquer en
anglais si tu actives une 2e langue plus tard.

---

## 1. Métadonnées

- **Nom** : `Break Reminder`
- **Catégorie** : Productivité
- **Langue principale** : Français

## 2. Description courte _(132 caractères max)_

> Rappels de pause personnalisables avec galerie d'images, plages horaires, citations et stats. 100 % local, sans tracking.

_(127 caractères, OK)_

## 3. Description longue

```
🟣 Break Reminder — Des pauses qui font du bien

Break Reminder t'aide à prendre des pauses régulières avec un overlay personnalisable
qui s'affiche au moment où tu en as besoin. Tu choisis quand, combien de temps, et
avec quelles images.

✦ FONCTIONNALITÉS
• Rappels paramétrables : intervalle de travail et durée de pause à la minute près
• Overlay plein écran avec compte à rebours, image et citation motivante
• Bibliothèque d'images personnelle (GIFs / photos) chargées localement
• Catégorisation matin / après-midi / soir : l'image change selon l'heure
• Plages horaires actives + sélection des jours (week-end exclu si tu veux)
• Détection d'inactivité : pas de rappel si tu es déjà AFK
• Skip automatique si tu es en plein écran (vidéo, présentation)
• Report rapide (snooze) configurable
• Citations personnalisables par catégorie (hydratation, yeux, étirements, respiration)
• Statistiques locales : pauses prises, reportées, sautées, série en cours
• Export / import de tes données en JSON
• Raccourci clavier global : Alt+Shift+B pour activer/désactiver
• Multilingue (français, anglais, et plus)

✦ 100 % LOCAL & PRIVÉ
• Aucune donnée envoyée sur internet — toutes tes préférences et tes images
  restent sur ton appareil
• Aucun tracker, aucun analytics, aucun compte utilisateur
• Aucune connexion réseau sortante

✦ POUR QUI ?
• Développeurs, designers, rédacteurs, étudiants — tous ceux qui passent des
  heures devant un écran
• Tous ceux qui veulent une approche Pomodoro plus visuelle et plus douce que
  les minuteurs classiques

Installe Break Reminder, configure ton intervalle, ajoute quelques images qui
te font sourire, et laisse l'extension t'inviter à respirer.
```

## 4. Single purpose statement _(obligatoire MV3)_

> Break Reminder a un objectif unique : rappeler à l'utilisateur de prendre des pauses régulières en affichant, sur l'onglet actif, un overlay configurable (durée, image, message) selon des intervalles et plages horaires définis par l'utilisateur.

## 5. Justifications de permissions

À recopier dans le formulaire « Permission justification » (un champ par permission).

### `storage`
> Sauvegarder localement les préférences de l'utilisateur (intervalles, plages horaires, langue), sa bibliothèque d'images personnelles, ses citations et ses statistiques d'usage. Aucune donnée n'est envoyée hors de l'appareil.

### `alarms`
> Déclencher le rappel de pause à intervalle régulier (par exemple toutes les 25 minutes) sans maintenir un timer JavaScript actif, conformément au modèle service worker MV3 qui peut être suspendu.

### `scripting`
> Injecter le content script de l'overlay sur l'onglet actif au moment du rappel, lorsque l'injection automatique via `content_scripts` n'a pas eu lieu (cas où l'onglet existait avant l'installation/activation).

### `tabs`
> Identifier l'onglet actif (`chrome.tabs.query({active: true})`) afin d'y envoyer le message qui déclenche l'affichage de l'overlay. L'extension ne lit pas l'URL, le titre ni le contenu des autres onglets.

### `idle`
> Détecter si l'utilisateur est inactif (clavier/souris) au moment du rappel pour ne pas afficher de pause inutile lorsqu'il est déjà loin de son ordinateur. Améliore la pertinence des rappels et la précision des statistiques.

### `unlimitedStorage`
> Permettre à l'utilisateur de stocker localement plusieurs images personnelles (GIFs / photos) encodées en data URL dans `chrome.storage.local`, sans être limité à 5 Mo. Tout est local, rien n'est synchronisé.

### `host_permissions: <all_urls>`
> Afficher l'overlay de pause sur l'onglet actuellement actif, quel que soit le site visité. L'extension n'accède qu'à l'onglet actif au moment du rappel et n'y injecte qu'un overlay visuel : elle ne lit pas, n'analyse pas et ne transmet pas le contenu des pages web.

## 6. Privacy practices form

Cocher pour chaque catégorie de données :

- [x] Aucune donnée d'authentification collectée
- [x] Aucune information personnelle collectée
- [x] Aucune information financière / paiement collectée
- [x] Aucune information de santé collectée
- [x] Aucune communication personnelle collectée
- [x] Aucune information de localisation collectée
- [x] Aucune historique de navigation collecté
- [x] Aucune activité utilisateur transmise
- [x] Aucun contenu de site web transmis

Déclarations à cocher :
- [x] Je ne vends pas et ne transfère pas les données utilisateur à des tiers (hors usages prévus)
- [x] Je n'utilise pas ni ne transfère les données utilisateur à des fins non liées à la fonction principale de l'extension
- [x] Je n'utilise pas ni ne transfère les données utilisateur pour déterminer la solvabilité ou pour du prêt

## 7. URLs

- **Privacy policy URL** : _(à héberger — ex: GitHub Pages, Notion public, page perso)_
- **Support URL** : _(optionnel — issues GitHub recommandé)_
- **Homepage URL** : _(optionnel)_

## 8. Checklist finale avant upload

- [ ] Le `.zip` ne contient PAS le dossier `store/` (artefacts de soumission uniquement)
- [ ] Le `.zip` ne contient PAS l'icône SVG source (`icons/icon.svg`) — toléré mais inutile
- [ ] Tester l'extension via "Charger l'extension non empaquetée" dans `chrome://extensions`
- [ ] Vérifier que toutes les fonctions marchent (popup, options, overlay, stats)
- [ ] Privacy policy hébergée à une URL publique stable
- [ ] Compte développeur Chrome créé (frais 5 USD)
- [ ] 1 à 5 screenshots 1280×800 prêts
- [ ] (optionnel) Promo tile 440×280 prêt
