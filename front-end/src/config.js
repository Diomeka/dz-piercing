/* =========================================================================
   DZ PIERCING — RÉGLAGES DU SITE
   👉 C'est le SEUL fichier à modifier pour changer tes infos de contact.
   Remplace simplement le texte entre guillemets "..." puis enregistre.
   ========================================================================= */
const CONFIG = {
  nomBoutique: "DZ PIERCING",
  slogan: "Piercing & bijoux — style, précision, hygiène.",

  // Numéro WhatsApp au format international, SANS le + ni les espaces
  // Exemple pour la France : 06 12 34 56 78  →  "33612345678"
  whatsapp: "33600000000",

  // Numéro pour le bouton "Appeler"
  telephone: "+33 6 00 00 00 00",

  instagram: "https://www.instagram.com/dzpiercing",
  tiktok: "https://www.tiktok.com/@dzpiercing",

  adresse: "12 rue de l'Exemple, 75000 Paris",

  // Informations légales (obligatoires en France, affichées sur la page
  // "Mentions légales & confidentialité")
  responsable: "Prénom NOM",            // ton nom (ou le nom de ta société)
  siret: "000 000 000 00000",           // ton numéro SIRET
  emailContact: "contact@exemple.fr",   // e-mail pour les demandes RGPD

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

  devise: "€",

  // Photo de la page d'accueil (remplace par "ma-photo.jpg" (placée dans le dossier public))
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

  // Mot de passe admin du MODE DÉMO uniquement.
  // En production, le mot de passe est vérifié par le serveur.
  motDePasseDemo: "dz2026",
};
export default CONFIG;
