# CLAUDE.md — Break Reminder

Notes de contexte pour maintenir cette extension, publiée sur le Chrome Web
Store (1.1.0 publiée le 12 mai 2026).

## Le projet en 1 phrase

Extension Chrome MV3 de rappels de pause personnalisables, avec galerie
d'images locale, plages horaires, citations et stats. 100 % local, aucune
donnée envoyée sur internet.

## Branding

- Couleur principale : **violet `#7a4dff`** (gradient `#a585ff` → `#5a2fd1`)
- Icône choisie : **variante 2** — pause `‖` blanche dans badge violet arrondi
- Icônes générées : [icons/icon-16.png](icons/icon-16.png), [icons/icon-32.png](icons/icon-32.png), [icons/icon-48.png](icons/icon-48.png), [icons/icon-128.png](icons/icon-128.png)
- Source SVG : [icons/icon.svg](icons/icon.svg)
- Script de génération (Cairo) : `/tmp/gen_icons.py` (à recréer si nécessaire — voir l'historique de la conversation)

## Avancement

### ✅ Terminé

- Code MV3 propre, audité (background.js, content.js, options, popup, i18n)
- Suppression des 5 GIFs résiduels de dev (~21 Mo libérés)
- Icônes 16/32/48/128 + `icons` + `default_icon` dans le manifest
- Privacy policy rédigée et hébergée publiquement
  → https://yoann54.github.io/break-reminder/privacy.html
- Page d'accueil GitHub Pages avec lien vers la privacy
  → https://yoann54.github.io/break-reminder/
- Documentation de soumission complète : [store/STORE_LISTING.md](store/STORE_LISTING.md)
  (description courte/longue, single purpose, 7 justifications de permissions, privacy practices form, checklist finale)
- Promo tile small 440×280 : [store/promo-440x280.png](store/promo-440x280.png)
- Email de contact dans la privacy : `yoanncooljazz@gmail.com`

### 🚀 Publier une mise à jour

La version du `manifest.json` doit être **strictement supérieure** à celle en
ligne, sinon le store refuse le package.

1. Incrémenter `version` dans [manifest.json](manifest.json).
2. Construire le zip (liste d'inclusion explicite, nom tiré du manifest) :
   ```bash
   V=$(python3 -c "import json;print(json.load(open('manifest.json'))['version'])")
   rm -f "break-reminder-$V.zip" && zip "break-reminder-$V.zip" \
     manifest.json background.js content.js content.css i18n.js \
     popup.html popup.js popup.css options.html options.js options.css \
     offscreen.html offscreen.js \
     icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png
   ```
3. Tester le zip : le décompresser dans un dossier temporaire, le charger via
   `chrome://extensions` (version de dev désactivée) et vérifier qu'il marche tel quel.
4. Developer Console → Break Reminder → **Package** → importer le nouveau zip.
5. Si les permissions changent : mettre à jour l'onglet **Confidentialité**
   (justifications depuis [store/STORE_LISTING.md](store/STORE_LISTING.md)) et
   pousser [privacy.md](privacy.md) **avant** de soumettre.

### 📦 1.1.1 (en préparation)

- Permission `tabs` retirée, `offscreen` ajoutée (son de début/fin de pause)
  → sur la console : supprimer la justification `tabs`, ajouter `offscreen`
- Stats : une pause reportée n'est plus aussi comptée comme prise
- Overlay stylé même sur les onglets ouverts avant l'installation
- Badge allégé, import JSON validé
- Screenshots : `store/screenshots/01-overlay.png` (4 autres possibles)

## Audit identifié mais non corrigé

- Pas de feedback dans le popup quand « Tester la pause » échoue
  (`triggerBreak` pourrait renvoyer `shown`).
- Overlay inséré dans le DOM de la page : le CSS du site peut l'altérer et la
  page peut lire l'image → iframe d'extension ou shadow DOM fermé.
- Compte à rebours en `setInterval`, ralenti dans un onglet en arrière-plan.
- Le délai suivant part du début de la pause ; modifier une plage horaire
  remet le compte à rebours à zéro.
- Manifest non localisé (pas de `_locales/`), overlay sans `role="dialog"`
  ni gestion du focus.

## Site GitHub Pages

- Configuration : [_config.yml](_config.yml) (thème Cayman, exclude liste explicite — pas de wildcards, ils ont cassé le premier build)
- Sources Pages : [index.md](index.md), [privacy.md](privacy.md)
- Activé sur : Settings → Pages → `main` / `/ (root)`
- Build automatique à chaque push, ~30 s à 2 min

## Commandes utiles

```bash
# Régénérer les icônes (si besoin) — nécessite python3-cairo
# Le script source vit dans /tmp/gen_icons.py côté machine d'origine.

# Tester l'extension localement
# chrome://extensions → Mode développeur → "Charger l'extension non empaquetée"

# Vérifier le build Pages
curl -s -o /dev/null -w "%{http_code}\n" https://yoann54.github.io/break-reminder/privacy.html

# Construire le zip de soumission (version lue dans le manifest)
V=$(python3 -c "import json;print(json.load(open('manifest.json'))['version'])")
rm -f "break-reminder-$V.zip" && zip "break-reminder-$V.zip" \
  manifest.json background.js content.js content.css i18n.js \
  popup.html popup.js popup.css options.html options.js options.css \
  offscreen.html offscreen.js \
  icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png
```

## Carte des fichiers

```
Break-Reminder/
├── manifest.json            # MV3 manifest (version, permissions, icônes)
├── background.js            # Service worker (alarmes, idle, badge)
├── content.js / content.css # Overlay de pause
├── popup.html/.js/.css      # Popup toolbar
├── options.html/.js/.css    # Page d'options complète
├── i18n.js                  # Traductions FR/EN inline
├── offscreen.html/.js       # Lecture du son (document offscreen MV3)
├── icons/                   # PNG 16/32/48/128 + SVG source
├── privacy.md               # Privacy policy (sert via GH Pages)
├── index.md                 # Page d'accueil GH Pages
├── _config.yml              # Config Jekyll
├── store/                   # ⚠️ HORS ZIP : artefacts de soumission
│   ├── STORE_LISTING.md     # Textes formulaire Chrome Web Store
│   └── promo-440x280.png    # Small promo tile
└── CLAUDE.md                # Ce fichier
```
