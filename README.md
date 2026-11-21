# DZ PIERCING — Site / application web

Site mobile pour **DZ PIERCING** : piercings, boutique de bracelets, prise de rendez-vous,
galerie, conseils de soins, contact, et un espace admin protégé par mot de passe.

| Dossier | Contenu | Responsable |
|---|---|---|
| `front-end/` | Le site (React + Vite) | Front-end |
| `backend/` | L'API et la base de données (Laravel conseillé) — **à créer** | Backend |
| `BACKEND.md` | Le **contrat d'API** que le backend doit respecter | Les deux |

---

## 🟡 Pour la propriétaire du salon (sans coder)

### Lancer le site sur ton ordinateur
1. Installe **Node.js** (version LTS) : https://nodejs.org → « Télécharger » → suivant, suivant, terminer.
2. Ouvre le dossier `front-end`, clique dans la barre d'adresse de l'explorateur Windows, tape `cmd` puis Entrée.
3. Dans la fenêtre noire, tape (une seule fois) :
   ```
   npm install
   ```
4. Puis, à chaque fois que tu veux voir le site :
   ```
   npm run dev
   ```
5. Ouvre l'adresse affichée `http://localhost:5173` dans ton navigateur.

### Tester sur ton téléphone
- Ton téléphone et ton ordinateur doivent être sur **le même Wi-Fi**.
- Après `npm run dev`, regarde la ligne **`Network: http://192.168.x.x:5173`** et tape cette adresse dans le navigateur du téléphone.
- Si rien ne s'affiche, Windows te demande peut-être d'autoriser Node.js dans le pare-feu : clique **Autoriser**.
- Pour l'avoir comme une appli : menu du navigateur → **« Ajouter à l'écran d'accueil »**.

### Modifier tes infos (téléphone, WhatsApp, adresse, horaires)
Ouvre `front-end/src/config.js` avec le Bloc-notes, change le texte entre guillemets, enregistre.

### Espace admin
- Accès : en bas de page → **Espace admin** (ou menu « Plus » sur téléphone).
- Mot de passe de démo : `dz2026` (modifiable dans `config.js`).
- Tu peux : ajouter/modifier/supprimer piercings et bracelets (avec photo), accepter/refuser
  rendez-vous et commandes (puis prévenir le client sur WhatsApp en un clic), gérer la galerie.

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

## 🔵 Pour les développeurs

```bash
cd front-end
npm install
npm run dev      # serveur de dev (accessible sur le réseau local)
npm run build    # version de production dans front-end/dist
```

**Stack** : React 19, React Router 7 (HashRouter, pour fonctionner sur n'importe quel hébergement
statique sans réécriture d'URL), Vite 8, CSS pur (`src/styles.css`, variables dans `:root`).

```
front-end/src/
├── config.js           ← infos du salon + apiUrl (vide = mode démo)
├── api/index.js        ← TOUTE la communication données (démo localStorage OU API REST)
├── data/seed.js        ← données d'exemple (prix fictifs)
├── lib/                ← formatage, créneaux horaires, images d'attente
├── components/         ← Layout (nav), Modal, Toast, Icon, useData
└── pages/              ← Accueil, Piercings, Bracelets, RendezVous, Galerie, Soins, Contact
    └── admin/          ← Connexion, Demandes (RDV/commandes), Catalogue, GalerieAdmin
```

**Brancher le backend** : remplir `apiUrl` dans `front-end/src/config.js`
(ex. `"https://api.dzpiercing.fr/api"`). Aucune page n'est à modifier : `api/index.js` bascule
automatiquement en mode REST. Le format exact des requêtes/réponses est dans **[BACKEND.md](BACKEND.md)**.
