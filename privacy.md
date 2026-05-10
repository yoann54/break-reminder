---
layout: default
title: Politique de confidentialité
---

# Politique de confidentialité — Break Reminder

_Dernière mise à jour : 10 mai 2026_

Break Reminder (« l'extension ») est une extension de navigateur conçue pour rappeler à
l'utilisateur de faire des pauses régulières. Cette politique décrit les données
manipulées par l'extension.

## Collecte de données — aucune

Break Reminder **ne collecte, ne transmet, ne vend et ne partage aucune donnée
personnelle**. Aucune information n'est envoyée à un serveur distant, à un service
d'analytics, à un réseau publicitaire ou à un tiers.

## Stockage local

Toutes les préférences et données utilisateur sont stockées **uniquement sur l'appareil
de l'utilisateur** via l'API `chrome.storage.local` :

- Préférences de timing (intervalle de travail, durée de pause, plages horaires)
- Bibliothèque d'images personnelles (GIFs) ajoutées par l'utilisateur, encodées
  localement en `data:` URL
- Liste de citations / messages personnalisés
- Statistiques d'utilisation locales (nombre de pauses, série en cours)
- Préférences d'interface (langue)

Ces données restent sur la machine de l'utilisateur. Elles ne sont jamais transmises
hors de l'appareil. Désinstaller l'extension les supprime.

## Permissions et leur utilisation

| Permission | Utilisation |
|---|---|
| `storage` | Sauvegarder localement les préférences et la bibliothèque |
| `alarms` | Déclencher le rappel de pause à intervalle régulier |
| `scripting` | Injecter le script de l'overlay de pause si nécessaire |
| `tabs` | Identifier l'onglet actif où afficher l'overlay |
| `idle` | Ne pas afficher de pause si l'utilisateur est déjà inactif |
| `unlimitedStorage` | Permettre de stocker plusieurs images personnelles |
| `host_permissions: <all_urls>` | Afficher l'overlay de pause sur l'onglet actif, quel que soit le site |

L'extension **ne lit pas, n'analyse pas et ne transmet pas le contenu des pages
web visitées**. L'accès `<all_urls>` sert uniquement à pouvoir injecter l'overlay
visuel sur n'importe quel onglet actif au moment du rappel.

## Cookies, trackers, analytics

Aucun. L'extension ne fait aucune requête réseau sortante.

## Modifications de cette politique

Toute modification sera publiée à cette même URL avec une nouvelle date de mise à
jour. Les changements substantiels seront signalés dans les notes de version.

## Contact

Pour toute question relative à cette politique :
[yoanncooljazz@gmail.com](mailto:yoanncooljazz@gmail.com)
