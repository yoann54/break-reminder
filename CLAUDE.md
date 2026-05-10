# CLAUDE.md — Break Reminder

Notes de contexte pour reprendre le travail sur la soumission Chrome Web Store
de cette extension.

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

### ❌ Reste à faire (par ordre de priorité)

1. **Capturer 1 à 5 screenshots 1280×800** depuis Chrome :
   - Charger l'extension non empaquetée (`chrome://extensions` → mode dev → "Charger l'extension non empaquetée")
   - Vues à capturer :
     - Overlay de pause en action (avec un GIF + citation)
     - Page d'options : timing + plages horaires
     - Page d'options : bibliothèque d'images
     - Popup avec compte à rebours
     - Stats / 7 derniers jours
   - Les déposer dans `store/screenshots/` (à créer, restera hors zip)

2. **Créer le compte développeur Chrome Web Store** (frais unique 5 USD)
   → https://chrome.google.com/webstore/devconsole

3. **Construire le zip de soumission** (exclure dossier `store/`, `_config.yml`, `index.md`, `privacy.md`, `.git/`) :
   ```bash
   zip -r break-reminder-1.1.0.zip . \
     -x "store/*" "icons/icon.svg" "privacy.md" "index.md" "_config.yml" \
        ".git/*" ".gitignore" "CLAUDE.md" "*.md"
   ```

4. **Tester le zip une dernière fois** : décompresser dans un dossier temporaire et le charger via `chrome://extensions` pour vérifier qu'il marche tel quel.

5. **Soumettre** sur le Developer Console :
   - Upload du zip
   - Recopier les textes depuis [store/STORE_LISTING.md](store/STORE_LISTING.md)
   - URL privacy : `https://yoann54.github.io/break-reminder/privacy.html`
   - Catégorie : Productivité
   - Upload des screenshots et du promo tile

## Audit identifié mais non corrigé

Petit point fonctionnel non bloquant relevé dans [background.js:251-256](background.js#L251-L256) :
quand un test forcé depuis le popup échoue (overlay non affiché), l'utilisateur
n'a pas de feedback. À voir éventuellement après publication.

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

# Construire le zip de soumission
zip -r break-reminder-1.1.0.zip . \
  -x "store/*" "icons/icon.svg" "privacy.md" "index.md" \
     "_config.yml" ".git/*" ".gitignore" "CLAUDE.md" "*.md"
```

## Carte des fichiers

```
Break-Reminder/
├── manifest.json            # MV3 manifest (v1.1.0, icons déclarées)
├── background.js            # Service worker (alarmes, idle, badge)
├── content.js / content.css # Overlay de pause
├── popup.html/.js/.css      # Popup toolbar
├── options.html/.js/.css    # Page d'options complète
├── i18n.js                  # Traductions FR/EN inline
├── icons/                   # PNG 16/32/48/128 + SVG source
├── privacy.md               # Privacy policy (sert via GH Pages)
├── index.md                 # Page d'accueil GH Pages
├── _config.yml              # Config Jekyll
├── store/                   # ⚠️ HORS ZIP : artefacts de soumission
│   ├── STORE_LISTING.md     # Textes formulaire Chrome Web Store
│   └── promo-440x280.png    # Small promo tile
└── CLAUDE.md                # Ce fichier
```
