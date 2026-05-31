# 🧰 Web Toolkit

Une suite de **29 outils web utiles**, rapides et **100 % côté navigateur** (aucune donnée envoyée à un serveur, sauf l'outil « Mon IP » qui interroge une fonction edge Cloudflare). Pensée comme un couteau suisse pour développeurs et créateurs.

🔗 **Démo en ligne :** déployée sur Cloudflare Pages — voir la section [Déploiement](#-déploiement).

![Web Toolkit](https://img.shields.io/badge/React-18-61dafb) ![Vite](https://img.shields.io/badge/Vite-5-646cff) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8) ![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-f38020)

---

## ✨ Les outils

| Catégorie | Outil | Description |
|-----------|-------|-------------|
| **Données** | JSON Formatter | Formater, valider et minifier du JSON |
| | JWT Decoder | Décoder header & payload d'un JWT (sans vérif. de signature) |
| | Timestamp | Conversion epoch ⇄ date (locale / UTC / ISO) |
| | Cron Explainer | Expliquer une expression cron en clair |
| **Encodage** | Base64 | Encoder / décoder (UTF-8 safe) |
| | URL Encoder | Encoder / décoder des composants d'URL |
| | Bases numériques | Binaire / Octal / Décimal / Hexadécimal synchronisés |
| **Crypto** | Hash (SHA) | SHA-1 / 256 / 384 / 512 via Web Crypto |
| **Génération** | UUID | UUID v4 (Web Crypto) |
| | Mot de passe | Mots de passe forts configurables (CSPRNG) |
| | QR Code | Générer un QR code téléchargeable (PNG) |
| | Lorem Ipsum | Texte de remplissage |
| **Texte** | Markdown | Aperçu Markdown en direct + export HTML |
| | Regex Tester | Tester des expressions régulières, voir les matchs |
| | Compteur de texte | Mots, caractères, lignes, temps de lecture |
| | Casse | camelCase, snake_case, kebab-case, CONSTANT… |
| | Diff de texte | Comparaison ligne par ligne (LCS) |
| **Design** | Couleurs & contraste | HEX/RGB/HSL + ratio de contraste WCAG (AA/AAA) |
| **Réseau** | Mon IP | IP publique + infos requête (Cloudflare edge) + infos navigateur |
| **Convertir** | Convertisseur d'unités | Longueur, masse, température, données, vitesse, temps |
| **Données** | CSV ⇄ JSON | Conversion bidirectionnelle CSV / JSON |
| **Encodage** | Image → Base64 | Convertir une image en data URI (glisser-déposer) |
| **Génération** | Aléatoire | Nombres, chaînes, dés & pile/face (CSPRNG) |
| **Texte** | Slugify | Texte → slug d'URL |
| **Texte** | Entités HTML | Encoder / décoder les entités HTML |
| **Texte** | Outils de lignes | Trier, dédupliquer, inverser, numéroter… |
| **Design** | Palette de couleurs | Nuances & harmonies depuis une couleur |
| **Design** | Dégradé CSS | Générateur de gradient + code CSS |
| **Design** | Box-shadow | Générateur d'ombre CSS |

> 🔒 **Vie privée :** tout le traitement se fait dans votre navigateur. Seul « Mon IP » fait un appel réseau (vers `/api/ip`, une fonction Cloudflare qui renvoie les en-têtes de votre requête).

---

## 🚀 Démarrage rapide

Prérequis : **Node.js ≥ 18**.

```bash
git clone https://github.com/khalilbenaz/web-toolkit.git
cd web-toolkit
npm install
npm run dev          # http://localhost:5173
```

Scripts disponibles :

| Script | Action |
|--------|--------|
| `npm run dev` | Serveur de développement (Vite, HMR) |
| `npm run build` | Vérification TypeScript + build de production (`dist/`) |
| `npm run preview` | Prévisualiser le build de production |
| `npm run deploy` | Build + déploiement sur Cloudflare Pages |

---

## 🏗️ Architecture

```
web-toolkit/
├── index.html
├── src/
│   ├── main.tsx            # point d'entrée React
│   ├── App.tsx             # shell + registre des outils (barre latérale, recherche)
│   ├── index.css           # Tailwind + classes partagées (.fld .btn .btnp .lbl .card)
│   └── tools/              # un fichier autonome par outil
│       ├── JsonFormatter.tsx
│       ├── HashTool.tsx
│       └── … (19 outils)
├── functions/
│   └── api/
│       └── ip.ts           # Cloudflare Pages Function (infos requête edge)
├── wrangler.toml           # config Cloudflare Pages
├── tailwind.config.js
└── vite.config.ts
```

**Stack :** React 18 · TypeScript · Vite 5 · Tailwind CSS 3. Dépendances runtime minimales : `qrcode` (QR) et `marked` (Markdown). Tout le reste utilise les API natives du navigateur (Web Crypto, Clipboard, `TextEncoder`…).

### Ajouter un outil

1. Créez `src/tools/MonOutil.tsx` exportant `export default function MonOutil() { … }`.
2. Ajoutez une entrée dans le tableau `TOOLS` de `src/App.tsx` (`id`, `name`, `category`, `blurb`, `Component`).
3. Utilisez les classes partagées (`.fld`, `.btn`, `.btnp`, `.lbl`, `.card`) pour rester cohérent.

---

## ☁️ Déploiement

### Cloudflare Pages (CLI)

```bash
npm run build
npx wrangler pages deploy dist --project-name web-toolkit
```

La fonction edge `functions/api/ip.ts` est détectée et déployée automatiquement (route `/api/ip`).

### Cloudflare Pages (Git, recommandé)

Connectez le dépôt GitHub dans le dashboard Cloudflare Pages avec :
- **Build command :** `npm run build`
- **Output directory :** `dist`

Chaque push sur `main` redéploie automatiquement.

---

## 🤝 Contribuer

Les contributions sont les bienvenues : ouvrez une issue ou une pull request. Chaque outil est isolé, donc facile à ajouter ou améliorer sans toucher au reste.

## 📄 Licence

MIT — voir [LICENSE](LICENSE).
