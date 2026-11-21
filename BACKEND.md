# Contrat d'API — DZ PIERCING

Ce document décrit ce que le front-end (`front-end/src/api/index.js`) attend du backend.
Stack conseillée : **Laravel 12 + Sanctum** (jetons API), MySQL/PostgreSQL, stockage des images
sur le disque `public` (ou S3).

Le front passe en mode API dès que `apiUrl` est renseigné dans `front-end/src/config.js`
(ou via `VITE_API_URL` dans `front-end/.env` pour le développement local — voir `.env.example`).
Toutes les URL ci-dessous sont relatives à `apiUrl` (ex. `https://api.dzpiercing.ht/api`).

> Pour voir le comportement attendu sans serveur : le **mode démo** du front
> (`front-end/src/api/index.js`, objet `demoApi`) simule exactement ce contrat dans le navigateur.

## Généralités

- Format : JSON (`Content-Type: application/json`), sauf l'upload (multipart).
- Réponses : l'objet/tableau **brut** OU enveloppé `{ "data": ... }` (API Resources Laravel) — les deux sont acceptés.
- Erreurs : code HTTP ≥ 400 avec `{ "message": "Texte lisible en français" }`.
  Le message est affiché tel quel à l'utilisateur (les erreurs 422 Laravel conviennent).
- Auth : en-tête `Authorization: Bearer <token>` (admin **ou** client). Un **401** déconnecte côté front.
  Les routes « admin » doivent renvoyer **403** à un client connecté.
- `DELETE` peut répondre `204 No Content`.
- **CORS** : autoriser l'origine du front (GitHub Pages / domaine final) et l'en-tête `Authorization`
  (`config/cors.php`).
- Les noms de champs sont en français et doivent être **identiques** (camelCase).
- Les `id` peuvent être des nombres ou des chaînes.

## Comptes et authentification

Une seule page de connexion pour tout le monde (e-mail + mot de passe). Le **rôle** renvoyé
décide de la suite côté front : `admin` → interface admin, `client` → « Mon compte ».

Objet `user` (jamais de mot de passe dedans) :

```json
{ "id": 7, "nom": "Inès Client", "email": "ines@mail.ht", "telephone": "3712-3456", "role": "client" }
```

| Méthode | URL | Accès | Corps | Réponse |
|---|---|---|---|---|
| POST | `/auth/login` | public | `{ "email": "...", "password": "..." }` | `{ "token": "...", "user": { … } }` |
| POST | `/auth/register` | public | `{ "nom", "email", "telephone", "password" }` | `{ "token": "...", "user": { … "role": "client" } }` (201) |

- Table `users` avec une colonne `role` (`admin` | `client`). Le compte admin (la propriétaire) est
  créé par un seeder — **jamais** via `/auth/register`, qui crée toujours un `client`.
- E-mail normalisé en minuscules, unique (sinon 422 « Un compte existe déjà avec cet e-mail. Connecte-toi. »).
- Mot de passe : 8 caractères minimum, hashé (bcrypt, `Hash::make`). Message d'erreur de connexion
  volontairement vague : « E-mail ou mot de passe incorrect. »
- Rate-limit sur les deux routes (ex. `throttle:5,1`).
- Mot de passe oublié : pour l'instant le front renvoie vers WhatsApp. Un vrai parcours par e-mail
  pourra être ajouté plus tard (nécessite l'envoi d'e-mails côté serveur).

### Espace client — `/moi`

| Méthode | URL | Accès | Réponse |
|---|---|---|---|
| GET | `/moi/rendezvous` | client | uniquement les rendez-vous dont `clientId` = l'utilisateur connecté |
| GET | `/moi/commandes` | client | uniquement ses commandes |

## Piercings — `/piercings`

```json
{
  "id": 1,
  "nom": "Hélix",
  "categorie": "Oreille",          // "Oreille" | "Visage" | "Bouche" | "Corps" (texte libre accepté)
  "prix": 35,                       // nombre, dans la devise choisie (voir /reglages)
  "duree": 20,                      // minutes, nullable
  "cicatrisation": "3 à 6 mois",    // texte, nullable
  "description": "…",
  "image": "https://…/helix.jpg"    // URL absolue ou "" (le front affiche alors une image d'attente)
}
```

| Méthode | URL | Accès |
|---|---|---|
| GET | `/piercings` | public — tableau |
| POST | `/piercings` | admin — renvoie l'objet créé |
| PUT | `/piercings/{id}` | admin — renvoie l'objet modifié |
| DELETE | `/piercings/{id}` | admin |

## Bracelets — `/bracelets`

```json
{
  "id": 1,
  "nom": "Chaîne Cubaine",
  "prix": 29,
  "couleurs": ["Doré", "Argent", "Noir"],   // tableau de textes (colonne JSON)
  "disponible": true,                        // false = affiché "Épuisé", commande bloquée
  "description": "…",
  "image": ""
}
```
Mêmes routes que les piercings (`GET` public, `POST/PUT/DELETE` admin).

## Galerie — `/galerie`

```json
{ "id": 1, "legende": "Septum anneau doré", "image": "https://…" }
```
`GET` public, `POST` et `DELETE` admin (`PUT` possible mais pas utilisé).

## Upload d'image

| Méthode | URL | Accès | Corps | Réponse |
|---|---|---|---|---|
| POST | `/uploads` | admin | multipart, champ **`image`** (jpg/png/webp/heic, ≤ 15 Mo) | `{ "url": "https://…/photo.jpg" }` |

L'URL renvoyée est ensuite placée dans le champ `image` d'un piercing/bracelet/photo.
Conseil : redimensionner à ~1200 px côté serveur (Intervention Image).

## Rendez-vous — `/rendezvous`

```json
{
  "id": 1,
  "reference": "DZ-A7K2P",           // générée par le serveur
  "piercingId": 2,
  "piercingNom": "Hélix",            // copie du nom au moment de la réservation
  "date": "2026-12-02",              // AAAA-MM-JJ
  "heure": "14:30",                  // HH:MM
  "nom": "Sarah B.",
  "telephone": "3711-2233",
  "message": "",
  "statut": "pending",               // "pending" | "accepted" | "refused"
  "creeLe": "2026-11-20T10:12:00Z",  // ISO 8601
  "clientId": 7                      // id du compte client si connecté au moment de la demande, sinon null
}
```

`POST /rendezvous` et `POST /commandes` restent **publics** (on peut réserver sans compte).
Si un jeton **client** est envoyé, le serveur remplit `clientId` avec cet utilisateur (ne jamais le
prendre dans le corps de la requête).

| Méthode | URL | Accès | Détails |
|---|---|---|---|
| GET | `/rendezvous/creneaux-pris?date=AAAA-MM-JJ` | **public** | tableau d'heures déjà prises, ex. `["11:00","14:30"]` (statut ≠ refused). **Ne pas exposer les noms/téléphones.** |
| POST | `/rendezvous` | **public** | corps : `piercingId, piercingNom, date, heure, nom, telephone, message`. Le serveur fixe `reference`, `statut="pending"`, `creeLe`. Répond l'objet complet (201). |
| GET | `/rendezvous` | admin | tous les rendez-vous |
| PATCH | `/rendezvous/{id}` | admin | `{ "statut": "accepted" }` → renvoie l'objet |
| DELETE | `/rendezvous/{id}` | admin | |

Validations serveur attendues (POST) :
- `piercingId` existe ; `piercingNom` peut être recalculé depuis la base.
- date ≥ aujourd'hui (≤ +90 jours), jour ouvert et heure dans les horaires (bloc `horaires` de
  `/reglages`, créneaux de 30 min — `dureeCreneau` dans `front-end/src/config.js`).
- **Créneau libre** (aucun RDV non refusé à la même date/heure) → sinon **409** avec
  `{ "message": "Ce créneau vient d'être pris, choisis-en un autre." }`. Contrainte unique ou verrou transactionnel conseillé.
- `telephone` : au moins 8 chiffres (Haïti : 8 chiffres, ex. 3712-3456 ; +509 accepté). Rate-limit anti-spam (ex. `throttle:10,1`).

## Commandes — `/commandes`

```json
{
  "id": 1,
  "reference": "DZ-Q9M4T",
  "braceletId": 1,
  "braceletNom": "Chaîne Cubaine",   // calculé par le serveur
  "couleur": "Doré",
  "quantite": 2,
  "prixUnitaire": 29,                // calculé par le serveur (ne jamais faire confiance au front)
  "total": 58,                       // calculé par le serveur
  "nom": "Yanis K.",
  "telephone": "4855-6677",
  "message": "",
  "statut": "pending",
  "creeLe": "2026-11-19T18:40:00Z"
}
```

| Méthode | URL | Accès | Détails |
|---|---|---|---|
| POST | `/commandes` | **public** | corps : `braceletId, couleur, quantite (1–20), nom, telephone, message`. Refuser si bracelet indisponible ou couleur absente de `couleurs`. Répond l'objet complet (201). |
| GET | `/commandes` | admin | |
| PATCH | `/commandes/{id}` | admin | `{ "statut": "accepted" \| "refused" \| "pending" }` |
| DELETE | `/commandes/{id}` | admin | |

## Réglages du site — `/reglages`

Un seul objet (pas une liste) : tout ce que la propriétaire modifie dans l'onglet admin **« Site »**
sans toucher au code. Le front le lit au démarrage et l'applique partout.

```json
{
  "devise": "USD",                                   // "USD" | "HTG"
  "accueil": {
    "slogan": "Piercing & bijoux — style, précision, hygiène.",
    "photo": "https://…/accueil.jpg",                // URL renvoyée par /uploads (ou "hero.svg" = image par défaut)
    "atouts": [ { "titre": "Matériel stérile", "texte": "Usage unique" }, … ],   // 3 éléments
    "afficherPiercings": true,
    "afficherBracelets": true
  },
  "contact": { "whatsapp": "3712-3456", "telephone": "+509 3712-3456", "adresse": "…", "emailContact": "…" },
  "horaires": { "0": null, "1": null, "2": ["10:00", "19:00"], …, "6": ["10:00", "20:00"] },  // 0 = dimanche
  "reseaux": { "instagram": "https://…", "tiktok": "", "facebook": "", "snapchat": "", "x": "" },
  "menus": { "piercings": { "visible": true, "label": "Piercings" }, "galerie": { "visible": false, "label": "Galerie" }, … },
  "paiements": { "moncash": { "actif": true, "logo": "https://…" }, "natcash": { … }, "virement": { … } },
  "legal": { "responsable": "…", "nif": "…" }
}
```

| Méthode | URL | Accès | Détails |
|---|---|---|---|
| GET | `/reglages` | **public** | renvoie l'objet enregistré (même partiel : le front complète avec ses valeurs par défaut). `{}` si rien n'est enregistré. |
| PUT | `/reglages` | admin | corps = **un ou plusieurs blocs** (ex. `{ "contact": { … } }`). Fusionner au niveau des blocs (remplacer le bloc reçu, garder les autres) et renvoyer l'objet complet. |

Conseil : une table `reglages` avec une colonne JSON suffit. Valider `devise` ∈ {USD, HTG} et les
URL (`reseaux`, `photo`, `logo`). Les **horaires** servent aussi à valider les créneaux de `POST /rendezvous`.

Les montants (`prix`, `total`, `prixUnitaire`) restent de simples nombres : **aucune conversion**
n'est faite quand la devise change (la propriétaire ressaisit ses prix).

## Sécurité attendue côté serveur (indispensable)

Le front applique déjà ses protections (CSP, filtrage des liens/images, blocage après 5 essais,
aucun mot de passe dans le code). Mais **tout ce qui est dans le navigateur peut être contourné** :
la vraie protection doit être faite par le serveur.

- **Mots de passe** : `Hash::make` (bcrypt/argon2), jamais renvoyés ni journalisés. Compte admin
  créé par seeder avec un mot de passe fort fourni par variable d'environnement (`.env`, jamais commité).
- **Rôles** : middleware `admin` sur toutes les routes admin (403 sinon) ; `/moi/*` ne renvoie que
  les données de l'utilisateur connecté ; `clientId` toujours pris dans le jeton, jamais dans le corps.
- **Jetons Sanctum** avec expiration (ex. 7 jours admin, 30 jours client) et révocation à la déconnexion
  (prévoir `POST /auth/logout`). Alternative plus sûre : cookies HttpOnly (Sanctum « SPA »).
- **Rate-limit** : `/auth/*` (5/min), `POST /rendezvous` et `/commandes` (10/min).
- **Validation stricte** de chaque champ (types, longueurs, formats) ; prix et totaux recalculés côté
  serveur ; `devise` ∈ {USD, HTG} ; URL en `https://` uniquement.
- **Upload** : vérifier le vrai type du fichier (`mimes:jpg,jpeg,png,webp`), taille max, renommer
  le fichier (nom aléatoire), le stocker hors du code, refuser le SVG.
- **CORS** limité à l'adresse du site (pas `*`), **HTTPS** obligatoire, `APP_DEBUG=false` en production.
- **En-têtes HTTP** : `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`.
- **Base de données** : requêtes via Eloquent / paramètres liés (pas de SQL concaténé), sauvegardes.
- Ne jamais commiter `.env`, clés ou mots de passe (le `.gitignore` du front les exclut déjà).

## Idées pour la suite (optionnel)

- Notification à la propriétaire à chaque nouveau RDV/commande (e-mail, ou WhatsApp Business API).
- SMS de confirmation au client quand le RDV passe en `accepted`.
- Mot de passe oublié par e-mail.

## Exemple de routes Laravel

```php
// routes/api.php
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');

Route::get('/piercings', [PiercingController::class, 'index']);
Route::get('/bracelets', [BraceletController::class, 'index']);
Route::get('/galerie',   [GaleriePhotoController::class, 'index']);
Route::get('/reglages',  [ReglagesController::class, 'show']);
Route::get('/rendezvous/creneaux-pris', [RendezVousController::class, 'creneauxPris']);
Route::post('/rendezvous', [RendezVousController::class, 'store'])->middleware('throttle:10,1');
Route::post('/commandes',  [CommandeController::class, 'store'])->middleware('throttle:10,1');

// Client connecté : son espace
Route::middleware('auth:sanctum')->prefix('moi')->group(function () {
    Route::get('/rendezvous', [MoiController::class, 'rendezvous']);
    Route::get('/commandes',  [MoiController::class, 'commandes']);
});

// Admin seulement (middleware à créer : vérifie role === 'admin', sinon 403)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('piercings', PiercingController::class)->except(['index', 'show']);
    Route::apiResource('bracelets', BraceletController::class)->except(['index', 'show']);
    Route::apiResource('galerie', GaleriePhotoController::class)->only(['store', 'update', 'destroy']);
    Route::post('/uploads', UploadController::class);
    Route::put('/reglages', [ReglagesController::class, 'update']);
    Route::get('/rendezvous', [RendezVousController::class, 'index']);
    Route::patch('/rendezvous/{rendezVous}', [RendezVousController::class, 'updateStatut']);
    Route::delete('/rendezvous/{rendezVous}', [RendezVousController::class, 'destroy']);
    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::patch('/commandes/{commande}', [CommandeController::class, 'updateStatut']);
    Route::delete('/commandes/{commande}', [CommandeController::class, 'destroy']);
});
```
