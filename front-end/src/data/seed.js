/* =========================================================================
   DONNÉES D'EXEMPLE (prix fictifs)
   Utilisées uniquement en MODE DÉMO, la première fois que le site s'ouvre.
   Tu pourras tout remplacer depuis l'espace Admin.
   ========================================================================= */
const SEED = {
  piercings: [
    { id: "p1", nom: "Lobe", categorie: "Oreille", prix: 25, duree: 15, cicatrisation: "6 à 8 semaines",
      description: "Le classique indémodable. Idéal pour un premier piercing, rapide et peu douloureux.", image: "" },
    { id: "p2", nom: "Hélix", categorie: "Oreille", prix: 35, duree: 20, cicatrisation: "3 à 6 mois",
      description: "Sur le haut du cartilage. Parfait pour créer une composition d'oreille stylée.", image: "" },
    { id: "p3", nom: "Tragus", categorie: "Oreille", prix: 40, duree: 20, cicatrisation: "3 à 6 mois",
      description: "Petit cartilage devant le conduit de l'oreille. Discret et très élégant.", image: "" },
    { id: "p4", nom: "Industriel", categorie: "Oreille", prix: 55, duree: 30, cicatrisation: "6 à 9 mois",
      description: "Une barre qui relie deux trous dans le cartilage. Effet street garanti.", image: "" },
    { id: "p5", nom: "Narine", categorie: "Visage", prix: 35, duree: 15, cicatrisation: "2 à 4 mois",
      description: "Anneau ou petit brillant sur le côté du nez. Simple et raffiné.", image: "" },
    { id: "p6", nom: "Septum", categorie: "Visage", prix: 45, duree: 20, cicatrisation: "2 à 3 mois",
      description: "Au centre du nez, se cache facilement si besoin. Très tendance.", image: "" },
    { id: "p7", nom: "Sourcil", categorie: "Visage", prix: 40, duree: 20, cicatrisation: "2 à 3 mois",
      description: "Une barre courbée sur l'arcade. Look affirmé et caractère.", image: "" },
    { id: "p8", nom: "Langue", categorie: "Bouche", prix: 50, duree: 20, cicatrisation: "4 à 6 semaines",
      description: "Barre droite au centre de la langue. Cicatrise vite avec de bons soins.", image: "" },
    { id: "p9", nom: "Labret", categorie: "Bouche", prix: 40, duree: 20, cicatrisation: "6 à 8 semaines",
      description: "Sous la lèvre inférieure, avec un bijou plat à l'intérieur pour le confort.", image: "" },
    { id: "p10", nom: "Nombril", categorie: "Corps", prix: 45, duree: 20, cicatrisation: "6 à 12 mois",
      description: "Un incontournable de l'été. Bijou banane avec pierre au choix.", image: "" },
  ],

  bracelets: [
    { id: "b1", nom: "Chaîne Cubaine", prix: 29, couleurs: ["Doré", "Argent", "Noir"], disponible: true,
      description: "Maille cubaine épaisse en acier inoxydable. Ne noircit pas.", image: "" },
    { id: "b2", nom: "Jonc Gravé DZ", prix: 35, couleurs: ["Doré", "Argent"], disponible: true,
      description: "Jonc rigide avec gravure DZ. Ajustable à tous les poignets.", image: "" },
    { id: "b3", nom: "Perles Onyx", prix: 19, couleurs: ["Noir", "Blanc"], disponible: true,
      description: "Pierres naturelles 8 mm sur fil élastique, avec perle dorée.", image: "" },
    { id: "b4", nom: "Tressé Street", prix: 15, couleurs: ["Noir", "Rouge", "Bleu", "Blanc"], disponible: true,
      description: "Cordon tressé à la main avec fermoir réglable. Waterproof.", image: "" },
    { id: "b5", nom: "Chaîne Fine Zircon", prix: 25, couleurs: ["Doré", "Argent", "Or rose"], disponible: true,
      description: "Chaîne fine sertie de petits zircons. Élégance au quotidien.", image: "" },
    { id: "b6", nom: "Manchette Noire", prix: 32, couleurs: ["Noir"], disponible: false,
      description: "Manchette en cuir noir et acier. Bientôt de retour en stock.", image: "" },
  ],

  galerie: [
    { id: "g1", legende: "Composition d'oreille — hélix + lobe", image: "" },
    { id: "g2", legende: "Septum anneau doré", image: "" },
    { id: "g3", legende: "Industriel barre noire", image: "" },
    { id: "g4", legende: "Narine brillant", image: "" },
    { id: "g5", legende: "Nombril pierre blanche", image: "" },
    { id: "g6", legende: "Tragus + conch", image: "" },
    { id: "g7", legende: "Sourcil barre courbée", image: "" },
    { id: "g8", legende: "Double lobe doré", image: "" },
  ],

  rendezvous: [
    { id: "r1", reference: "DZ-A7K2P", piercingId: "p2", piercingNom: "Hélix", date: "2026-12-02", heure: "14:30",
      nom: "Sarah B.", telephone: "3711-2233", message: "Premier piercing cartilage 🙂", statut: "pending",
      creeLe: "2026-11-20T10:12:00" },
  ],

  // Comptes clients (créés via « Créer un compte »)
  utilisateurs: [],

  commandes: [
    { id: "c1", reference: "DZ-Q9M4T", braceletId: "b1", braceletNom: "Chaîne Cubaine", couleur: "Doré", quantite: 2,
      prixUnitaire: 29, total: 58, nom: "Yanis K.", telephone: "4855-6677", message: "", statut: "pending",
      creeLe: "2026-11-19T18:40:00" },
  ],
};
export default SEED;
