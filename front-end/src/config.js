/* =========================================================================
   DZ PIERCING — RÉGLAGES DU SITE
   👉 C'est le SEUL fichier à modifier pour changer tes infos de contact.
   Remplace simplement le texte entre guillemets "..." puis enregistre.
   ========================================================================= */
const CONFIG = {
  nomBoutique: "DZ PIERCING",
  slogan: "Piercing & bijoux — style, précision, hygiène.",

  // Numéro WhatsApp au format international, SANS le +, les espaces ni les tirets
  // Exemple Haïti : 3712-3456  →  "50937123456"
  whatsapp: "50937000000",

  // Numéro pour le bouton "Appeler"
  telephone: "+509 3700-0000",

  instagram: "https://www.instagram.com/dzpiercing",
  tiktok: "https://www.tiktok.com/@dzpiercing",

  adresse: "12 rue de l'Exemple, Pétion-Ville, Haïti",

  // Code pays (ISO) : "HT" = Haïti. Utilisé pour la fiche Google.
  pays: "HT",

  // Informations légales (affichées sur la page "Mentions légales & confidentialité")
  responsable: "Prénom NOM",            // ton nom (ou le nom de ton entreprise)
  nif: "000-000-000-0",                 // ton NIF (Numéro d'Identification Fiscale, DGI)
  emailContact: "contact@exemple.ht",   // e-mail de contact (questions sur les données)

  // Horaires d'ouverture (0 = dimanche, 1 = lundi, ... 6 = samedi)
  // null = fermé ce jour-là
  horaires: {
    0: null,
    1: null,
    2: ["10:00", "19:00"],
    3: ["10:00", "19:00"],
    4: ["10:00", "19:00"],
    5: ["10:00", "20:00"],
    6: ["10:00", "20:00"],
  },

  // Durée d'un créneau de rendez-vous (en minutes)
  dureeCreneau: 30,

  // Devise par défaut : "USD" (dollar américain) ou "HTG" (gourde haïtienne).
  // Modifiable ensuite par l'admin dans l'onglet « Réglages ».
  devise: "USD",

  // Photo de la page d'accueil (mets ta photo dans le dossier public, ex. "ma-photo.jpg")
  photoAccueil: "hero.svg",

  /* ----------------------------------------------------------------------
     PARTIE TECHNIQUE (pour le développeur backend)
     - apiUrl vide ""  → MODE DÉMO : les données sont enregistrées dans le
       navigateur (pratique pour tester, mais PAS partagées entre téléphones).
     - apiUrl rempli    → le site parle au vrai serveur (voir BACKEND.md).
     ---------------------------------------------------------------------- */
  // Peut aussi être fourni par la variable d'environnement VITE_API_URL
  // (fichier front-end/.env, voir .env.example) sans modifier ce fichier.
  apiUrl: import.meta.env?.VITE_API_URL || "",

  // Compte admin du MODE DÉMO uniquement. En production, les comptes sont
  // gérés et vérifiés par le serveur (voir BACKEND.md).
  // 🔒 Le mot de passe n'est PAS écrit ici : seulement son empreinte (impossible
  // à inverser). Pour en changer : `npm run mot-de-passe-admin` (dossier front-end).
  adminDemo: {
    email: "admin@dzpiercing.ht",
    sel: "2a9ec4a8ce577def083c392d8e1e8592",
    empreinte: "75fbe9b91542ad69d4bf8bfea595744e5f9b031118fcba25ca4d3d8f19955c34",
  },
};
export default CONFIG;
