# Chrome Web Store Listing — Break Reminder

> Last Updated: 2026-11-05

Source unique pour tout ce qui se remplit dans le Developer Dashboard. Ce fichier
n'est pas inclus dans le zip (la commande de build utilise une liste d'inclusion
explicite) ni publié sur GitHub Pages (exclu dans `_config.yml`).

## Store Listing

**Extension Name**
`Break Reminder` (identique au `name` du manifest)

**Short Description** (132 caractères max — 127 actuellement)
> Rappels de pause personnalisables avec galerie d'images, plages horaires, citations et stats. 100 % local, sans tracking.

Note : la description du manifest (`__MSG_appDescription__`, `_locales/*/messages.json`)
est distincte de ce texte ; le store affiche celle saisie dans le dashboard.

**Detailed Description**

```
Break Reminder t'aide à prendre des pauses régulières en affichant, au bon moment, un écran de pause personnalisable sur l'onglet que tu consultes. Tu choisis quand, combien de temps et avec quelles images.

FONCTIONNALITÉS
• Rappels paramétrables : intervalle de travail et durée de pause à la minute près
• Écran de pause plein écran avec compte à rebours, image et citation motivante
• Bibliothèque d'images personnelle (GIF ou photos) ajoutées depuis ton ordinateur
• Images classées matin / après-midi / soir : l'image change selon l'heure
• Plages horaires actives et choix des jours (week-end exclu si tu veux)
• Pas de rappel si tu es déjà loin de ton clavier
• Pas d'interruption quand tu regardes une vidéo ou une présentation en plein écran
• Report rapide de la pause, durée configurable
• Signal sonore optionnel au début et à la fin de la pause
• Citations personnalisables par thème (hydratation, yeux, étirements, respiration)
• Statistiques : pauses prises, reportées, sautées, série en cours
• Export et import de tes réglages en fichier JSON
• Raccourci clavier Alt+Shift+B pour activer ou désactiver les rappels
• Disponible en français, anglais, allemand, espagnol, italien, polonais, portugais et russe

COMMENT L'UTILISER
1. Clique sur l'icône Break Reminder dans la barre d'outils pour voir le temps restant avant la prochaine pause.
2. Ouvre les options pour régler l'intervalle, la durée, les plages horaires et ajouter tes images.
3. Utilise « Tester la pause » pour voir le rendu tout de suite.
4. À l'heure de la pause, l'écran s'affiche sur l'onglet actif : profite-en, ou reporte-la de quelques minutes.

100 % LOCAL ET PRIVÉ
• Tes réglages, images, citations et statistiques restent sur ton appareil
• Aucune donnée envoyée sur internet, aucun compte, aucun tracker, aucune publicité
• L'extension affiche l'écran de pause sur la page visitée mais ne lit pas son contenu

POUR QUI ?
Développeurs, designers, rédacteurs, étudiants : tous ceux qui passent des heures devant un écran et veulent une approche type Pomodoro plus visuelle et plus douce qu'un minuteur classique.

Une question ou un souci ? Écris à yoanncooljazz@gmail.com.
```

**Category**
Productivity (Productivité)

**Single Purpose**
> Rappeler à l'utilisateur de prendre des pauses régulières en affichant sur l'onglet actif un écran de pause configurable (durée, image, message), selon les intervalles et plages horaires qu'il a définis.

**Primary Language**
Français

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Screenshot 1 | 1280×800 | ✅ Ready | `store/screenshots/01-overlay.png` |
| Screenshot 2 | 1280×800 | ⬜ Not created | (popup) |
| Screenshot 3 | 1280×800 | ⬜ Not created | (options : réglages) |
| Screenshot 4 | 1280×800 | ⬜ Not created | (options : galerie d'images) |
| Screenshot 5 | 1280×800 | ⬜ Not created | (statistiques) |
| Small Promo Tile | 440×280 | ✅ Ready | `store/promo-440x280.png` |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | (optionnel) |

### Screenshot Notes

1. **Overlay** : l'écran de pause sur un site réel, avec compte à rebours, image et citation.
2. **Popup** : temps restant avant la prochaine pause, bouton activer/désactiver, « Tester la pause ».
3. **Réglages** : intervalle, durée, plages horaires, jours actifs.
4. **Galerie** : images classées matin / après-midi / soir.
5. **Stats** : pauses prises / reportées / sautées et série en cours.

## Permissions Justification

Un champ par permission dans l'onglet **Confidentialité** du dashboard. Aucun changement
de permissions depuis la 1.1.1.

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Sauvegarder localement les préférences de l'utilisateur (intervalles, plages horaires, langue), sa bibliothèque d'images personnelles, ses citations et ses statistiques de pauses. Aucune donnée n'est envoyée hors de l'appareil. |
| `alarms` | permissions | Déclencher le rappel de pause à l'intervalle choisi par l'utilisateur (par exemple toutes les 25 minutes), y compris lorsque le service worker de l'extension a été suspendu par le navigateur. |
| `scripting` | permissions | Afficher l'écran de pause sur l'onglet actif lorsque celui-ci était déjà ouvert avant l'installation ou la mise à jour de l'extension, et n'a donc pas encore reçu le script de l'overlay. |
| `idle` | permissions | Savoir si l'utilisateur est inactif (clavier/souris) au moment du rappel, pour ne pas afficher de pause lorsqu'il est déjà loin de son ordinateur. |
| `offscreen` | permissions | Jouer le signal sonore optionnel (désactivé par défaut) au début et à la fin d'une pause. Le son est généré localement, sans fichier ni ressource externe, et le document se ferme après lecture. |
| `unlimitedStorage` | permissions | Permettre à l'utilisateur de stocker localement plusieurs images personnelles (GIF / photos) sans être bloqué par la limite de 10 Mo du stockage local. Rien n'est synchronisé ni transmis. |
| `<all_urls>` | host_permissions | Afficher l'écran de pause sur l'onglet actif, quel que soit le site visité. L'extension y ajoute uniquement un overlay visuel : elle ne lit pas, n'analyse pas et ne transmet pas le contenu des pages. L'extension ne lit pas l'URL des onglets. |
| `content_scripts` sur `<all_urls>` | content_scripts | Même usage que ci-dessus : le script ne fait qu'attendre l'ordre d'afficher l'overlay de pause. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

Toutes les données (réglages, images, citations, statistiques) restent dans le stockage
local de l'extension. Le code ne fait aucune requête réseau (pas de `fetch`, XHR,
WebSocket ni beacon).

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | — | No |
| Health info | No | No | — | No |
| Financial info | No | No | — | No |
| Authentication info | No | No | — | No |
| Personal communications | No | No | — | No |
| Location | No | No | — | No |
| Web history | No | No | — | No |
| User activity | No (stats locales uniquement) | No | — | No |
| Website content | No | No | — | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL**
https://yoann54.github.io/break-reminder/privacy.html

Source : [privacy.md](privacy.md). Le tableau des permissions qu'elle contient doit
rester identique à celui ci-dessus ; la pousser **avant** de soumettre une version qui
change les permissions.

## Distribution

**Visibility**: Public
**Regions**: All regions

## Developer Info

**Publisher Name**
yoann piconcely

**Contact Email**
yoanncooljazz@gmail.com

**Support URL / Email**
yoanncooljazz@gmail.com

**Homepage URL**
https://yoann54.github.io/break-reminder/

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.1.3 | — | Stats plus justes : les pauses de test ne comptent plus, une pause écourtée avant la moitié compte comme sautée, les absences et heures hors plage ne comptent plus comme sautées ; le son ne laisse plus de document ouvert ; déposer une image sur la galerie l'ajoute ; popup plus rapide avec une grande galerie ; message clair sur les pages où la pause ne peut pas s'afficher ; Chrome 116 minimum. Pas de changement de permissions. | Draft |
| 1.1.2 | 2026-10 | Overlay isolé des styles de la page, accessible au clavier (focus piégé puis restauré) ; compte à rebours exact même onglet en arrière-plan ; prochaine pause comptée depuis la fin de la pause ; changer l'intervalle ou les plages horaires conserve le temps écoulé ; avertissement si « Tester la pause » échoue ; nom et description traduits dans 8 langues. | Published |
| 1.1.1 | 2026-10 | Permission `tabs` retirée, `offscreen` ajoutée (son de début/fin) ; une pause reportée n'est plus comptée comme prise ; overlay stylé sur les onglets ouverts avant l'installation ; badge allégé ; import JSON validé. | Published |
| 1.1.0 | 2026-05-12 | Première publication. | Published |

## Review Notes

### Known Issues / Limitations
- L'overlay ne peut pas s'afficher sur les pages internes du navigateur (`chrome://`,
  Chrome Web Store, nouvel onglet) : c'est une restriction de Chrome. Depuis la 1.1.2,
  « Tester la pause » prévient l'utilisateur dans ce cas.
- `<all_urls>` est large mais nécessaire : la pause doit apparaître sur n'importe quel
  site. La justification insiste sur l'absence de lecture du contenu.

### Rejection History
Aucun rejet à ce jour.

## Pre-Publish Checklist

- [ ] `version` du manifest strictement supérieure à la version en ligne
- [ ] Zip construit avec la commande de [CLAUDE.md](CLAUDE.md) (exclut `store/`, `.git/`, ce fichier)
- [ ] Zip décompressé et chargé dans `chrome://extensions` : popup, options, overlay, son, stats OK
- [ ] Justifications de permissions recopiées si elles ont changé
- [ ] Privacy policy en ligne (HTTP 200) et cohérente avec ce fichier
- [ ] Au moins 1 screenshot 1280×800
