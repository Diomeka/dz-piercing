# DZ PIERCING — Site / application web

Site mobile pour **DZ PIERCING** : piercings, braces de mode (pose sur rendez-vous), prise de rendez-vous,
galerie, conseils de soins, contact, et un espace admin protégé par mot de passe.

| Dossier | Contenu | Responsable |
|---|---|---|
| `front-end/` | Le site (React + Vite) | Front-end |
| `backend/` | L'API et la base de données (Laravel conseillé) — **à créer** | Backend |
| `BACKEND.md` | Le **contrat d'API** que le backend doit respecter | Les deux |

---

## 🟡 Pour la propriétaire du salon (sans coder)

### Lancer le site sur ton ordinateur (Windows)
**Double-clique sur `Lancer le site.bat`** (à la racine du projet). C'est tout :
- s'il manque **Node.js**, la page de téléchargement s'ouvre (choisis « LTS », installe, relance le fichier) ;
- sinon il installe / met à jour tout seul ce dont le site a besoin, puis ouvre le site dans ton navigateur.
- Pour arrêter le site : ferme la fenêtre noire.

### Tester sur ton téléphone
- Ton téléphone et ton ordinateur doivent être sur **le même Wi-Fi**.
- Dans la fenêtre noire, regarde la ligne **`Network: http://192.168.x.x:5173`** et tape cette adresse dans le navigateur du téléphone.
- Si rien ne s'affiche, Windows te demande peut-être d'autoriser Node.js dans le pare-feu : clique **Autoriser**.
- Pour l'avoir comme une appli : menu du navigateur → **« Ajouter à l'écran d'accueil »**.

### Interface admin (séparée du site)
- Sur le site, appuie sur **Connexion** (en haut à droite, ou menu « Plus » sur téléphone) et connecte-toi
  avec l'**e-mail admin**. Tu arrives directement dans l'interface admin.
  - Mode démo : e-mail `admin@dzpiercing.ht`. Le mot de passe n'est écrit **nulle part** dans le code
    (seulement son empreinte) : la propriétaire l'a reçu en privé. Pour le changer :
    `npm run mot-de-passe-admin` dans le dossier `front-end`.
- Dans l'admin : bouton **« Voir le site »** pour revenir au site, **« Déconnexion »** pour sortir.
- Onglets : **RDV** (piercings et poses de braces : accepter / refuser, prévenir le client sur WhatsApp),
  **Piercings**, **Braces** (ajouter / modifier / supprimer avec photo, nom, prix, couleurs), **Galerie**, et
  **Site** : tout ce qui se modifie **sans toucher au code** :
  page d'accueil (photo, phrase, points forts), menus (afficher / masquer / renommer), contact,
  horaires, réseaux sociaux, moyens de paiement (MonCash, NatCash, virement + logos), devise
  (dollar ou gourde), informations légales (nom, NIF).

### Comptes clients
- Les clients peuvent **créer un compte** (nom, e-mail, téléphone, mot de passe) et se connecter.
- Dans **« Mon compte »** ils voient **uniquement** leurs rendez-vous (piercings et braces), avec le statut.
- On peut toujours réserver **sans compte**.
- Les braces se **posent au salon sur rendez-vous** : pas de commande en ligne.

> ⚠️ **Mode démo** : tant que le backend n'est pas branché, les données sont enregistrées
> **uniquement dans le navigateur** de l'appareil utilisé. Un rendez-vous pris sur le téléphone
> d'un client n'apparaîtra donc pas encore dans ton admin. Ce sera le cas dès que le backend sera
> en ligne (voir `BACKEND.md`).

### Publier le site gratuitement (GitHub Pages)
Le dépôt contient déjà une publication automatique (`.github/workflows/deploy.yml`).
1. Sur GitHub, ouvre le dépôt → **Settings** → **Pages**.
2. Dans « Source », choisis **GitHub Actions**.
3. À chaque modification envoyée sur la branche `main`, le site se met à jour tout seul
   (onglet **Actions** pour suivre). L'adresse sera du type
   `https://TON-PSEUDO.github.io/NOM-DU-DEPOT/`.

---

## 🔒 Sécurité (front-end)

- **Aucun mot de passe en clair** dans le code : le compte admin de démo est vérifié par une empreinte
  SHA-256 salée et répétée 20 000 fois (`src/lib/motdepasse.js`) ; les comptes clients de démo aussi.
- **Blocage** 1 minute après 5 erreurs de connexion ; mots de passe : 8 caractères min., lettres + chiffres.
- **CSP** (politique de sécurité du contenu) dans la version publiée : seuls les scripts du site s'exécutent.
- **Anti-clickjacking** : le site refuse de s'afficher dans le cadre d'un autre site.
- **Liens et images filtrés** (pas de `javascript:`, pas d'images de sources non sûres), redirection
  après connexion limitée à une liste de pages, pas de code source (sourcemaps) publié.
- Tests automatiques dédiés : `src/securite.test.js`. Dépendances surveillées par Dependabot + `npm audit`.
- ⚠️ Limite honnête : tant qu'il n'y a pas de serveur (mode démo), tout se passe dans le navigateur,
  donc rien n'y est vraiment secret ni protégé. **La vraie sécurité est côté serveur** (voir `BACKEND.md`).

## 🔵 Pour les développeurs

```bash
cd front-end
npm install
npm run dev      # serveur de dev (accessible sur le réseau local)
npm run build    # version de production dans front-end/dist
npm run lint     # qualité du code (ESLint + règles React Hooks)
npm test         # tests automatiques (Vitest + jsdom)
npm run check    # lint + tests + build : à lancer avant chaque push
```

**Intégration continue** : `.github/workflows/ci.yml` lance `lint`, `test` et `build` sur chaque
pull request ; `deploy.yml` les relance avant de publier sur GitHub Pages (pas de publication si
un test échoue).

**Tests** : `src/lib/format.test.js` (prix, dates, créneaux), `src/api/api.test.js` (mode démo :
RDV piercing et braces, comptes, admin), `src/App.test.jsx` (chaque page s'affiche sans planter — `scrollTo` est
simulé comme dans les Chrome récents, qui renvoient une Promise).

**Stack** : React 19, React Router 7 (HashRouter, pour fonctionner sur n'importe quel hébergement
statique sans réécriture d'URL), Vite 8, CSS pur (`src/styles.css`, variables dans `:root`).

```
front-end/src/
├── config.js           ← valeurs de DÉPART (contact, horaires…) + apiUrl (vide = mode démo)
├── api/index.js        ← TOUTE la communication données (démo localStorage OU API REST)
├── data/seed.js        ← données d'exemple (prix fictifs)
├── lib/                ← formatage, créneaux horaires, images d'attente
├── components/         ← Layout (nav), Modal, Toast, Icon, useData
├── lib/site.js         ← contenu modifiable depuis l'admin (onglet Site) + hook useSite()
└── pages/              ← Accueil, Piercings, Braces, RendezVous, Galerie, Soins, Contact
    ├── compte/         ← Connexion (admin + client), Inscription, Mon compte
    └── admin/          ← interface admin SÉPARÉE : Demandes, Catalogue, GalerieAdmin, Reglages (Site)
```

**Brancher le backend** : remplir `apiUrl` dans `front-end/src/config.js`
(ex. `"https://api.dzpiercing.fr/api"`), ou, pour tester en local sans toucher au code, copier
`front-end/.env.example` en `front-end/.env` avec `VITE_API_URL=http://127.0.0.1:8000/api`. Aucune page n'est à modifier : `api/index.js` bascule
automatiquement en mode REST. Le format exact des requêtes/réponses est dans **[BACKEND.md](BACKEND.md)**.
