# Contrat d'API — DZ PIERCING

Ce document décrit ce que le front-end (`front-end/src/api/index.js`) attend du backend.
Stack conseillée : **Laravel 12 + Sanctum** (jetons API), MySQL/PostgreSQL, stockage des images
sur le disque `public` (ou S3).

Le front passe en mode API dès que `apiUrl` est renseigné dans `front-end/src/config.js`
(ou via `VITE_API_URL` dans `front-end/.env` pour le développement local — voir `.env.example`).
Toutes les URL ci-dessous sont relatives à `apiUrl` (ex. `https://api.dzpiercing.fr/api`).

## Généralités

- Format : JSON (`Content-Type: application/json`), sauf l'upload (multipart).
- Réponses : l'objet/tableau **brut** OU enveloppé `{ "data": ... }` (API Resources Laravel) — les deux sont acceptés.
- Erreurs : code HTTP ≥ 400 avec `{ "message": "Texte lisible en français" }`.
  Le message est affiché tel quel à l'utilisateur (les erreurs 422 Laravel conviennent).
- Auth admin : en-tête `Authorization: Bearer <token>`. Un **401** déconnecte l'admin côté front.
- `DELETE` peut répondre `204 No Content`.
- **CORS** : autoriser l'origine du front (GitHub Pages / domaine final) et l'en-tête `Authorization`
  (`config/cors.php`).
- Les noms de champs sont en français et doivent être **identiques** (camelCase).
- Les `id` peuvent être des nombres ou des chaînes.

## Authentification

| Méthode | URL | Accès | Corps | Réponse |
|---|---|---|---|---|
| POST | `/auth/login` | public | `{ "password": "..." }` | `{ "token": "..." }` |

Un seul compte admin (la propriétaire). Mot de passe hashé côté serveur, jamais dans le front.
Prévoir un rate-limit (ex. `throttle:5,1`).

## Piercings — `/piercings`

```json
{
  "id": 1,
  "nom": "Hélix",
  "categorie": "Oreille",          // "Oreille" | "Visage" | "Bouche" | "Corps" (texte libre accepté)
  "prix": 35,                       // nombre, en euros
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
  "telephone": "06 11 22 33 44",
  "message": "",
  "statut": "pending",               // "pending" | "accepted" | "refused"
  "creeLe": "2026-11-20T10:12:00Z"   // ISO 8601
}
```

| Méthode | URL | Accès | Détails |
|---|---|---|---|
| GET | `/rendezvous/creneaux-pris?date=AAAA-MM-JJ` | **public** | tableau d'heures déjà prises, ex. `["11:00","14:30"]` (statut ≠ refused). **Ne pas exposer les noms/téléphones.** |
| POST | `/rendezvous` | **public** | corps : `piercingId, piercingNom, date, heure, nom, telephone, message`. Le serveur fixe `reference`, `statut="pending"`, `creeLe`. Répond l'objet complet (201). |
| GET | `/rendezvous` | admin | tous les rendez-vous |
| PATCH | `/rendezvous/{id}` | admin | `{ "statut": "accepted" }` → renvoie l'objet |
| DELETE | `/rendezvous/{id}` | admin | |

Validations serveur attendues (POST) :
- `piercingId` existe ; `piercingNom` peut être recalculé depuis la base.
- date ≥ aujourd'hui (≤ +90 jours), jour ouvert et heure dans les horaires (voir `horaires` et
  `dureeCreneau` dans `front-end/src/config.js` — à dupliquer côté serveur ou à exposer via un
  endpoint de configuration).
- **Créneau libre** (aucun RDV non refusé à la même date/heure) → sinon **409** avec
  `{ "message": "Ce créneau vient d'être pris, choisis-en un autre." }`. Contrainte unique ou verrou transactionnel conseillé.
- `telephone` : au moins 10 chiffres. Rate-limit anti-spam (ex. `throttle:10,1`).

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
  "telephone": "07 55 66 77 88",
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

## Idées pour la suite (optionnel)

- Notification à la propriétaire à chaque nouveau RDV/commande (e-mail, ou WhatsApp Business API).
- SMS de confirmation au client quand le RDV passe en `accepted`.
- Endpoint `GET /config` (horaires, contacts) pour que la propriétaire les modifie depuis l'admin.

## Exemple de routes Laravel

```php
// routes/api.php
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::get('/piercings', [PiercingController::class, 'index']);
Route::get('/bracelets', [BraceletController::class, 'index']);
Route::get('/galerie',   [GaleriePhotoController::class, 'index']);
Route::get('/rendezvous/creneaux-pris', [RendezVousController::class, 'creneauxPris']);
Route::post('/rendezvous', [RendezVousController::class, 'store'])->middleware('throttle:10,1');
Route::post('/commandes',  [CommandeController::class, 'store'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('piercings', PiercingController::class)->except(['index', 'show']);
    Route::apiResource('bracelets', BraceletController::class)->except(['index', 'show']);
    Route::apiResource('galerie', GaleriePhotoController::class)->only(['store', 'update', 'destroy']);
    Route::post('/uploads', UploadController::class);
    Route::get('/rendezvous', [RendezVousController::class, 'index']);
    Route::patch('/rendezvous/{rendezVous}', [RendezVousController::class, 'updateStatut']);
    Route::delete('/rendezvous/{rendezVous}', [RendezVousController::class, 'destroy']);
    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::patch('/commandes/{commande}', [CommandeController::class, 'updateStatut']);
    Route::delete('/commandes/{commande}', [CommandeController::class, 'destroy']);
});
```
