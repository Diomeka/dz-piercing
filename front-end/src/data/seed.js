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

  // Braces de mode (décoratifs) — posés au salon sur rendez-vous
  braces: [
    { id: "br1", nom: "Braces métal classiques", prix: 40, duree: 45, couleurs: ["Argent"], disponible: true,
      description: "Le look braces original : attaches métal et fil argent. Discret et intemporel.", image: "" },
    { id: "br2", nom: "Braces élastiques couleur", prix: 45, duree: 45, couleurs: ["Noir", "Rouge", "Bleu", "Rose", "Vert", "Violet"], disponible: true,
      description: "Attaches avec élastiques de couleur au choix. Le plus demandé !", image: "" },
    { id: "br3", nom: "Braces arc-en-ciel", prix: 50, duree: 50, couleurs: ["Multicolore"], disponible: true,
      description: "Une couleur différente sur chaque dent. Style street garanti.", image: "" },
    { id: "br4", nom: "Braces dorés", prix: 60, duree: 45, couleurs: ["Doré"], disponible: true,
      description: "Attaches couleur or pour un sourire qui brille.", image: "" },
    { id: "br5", nom: "Braces strass", prix: 70, duree: 60, couleurs: ["Argent", "Doré"], disponible: true,
      description: "Attaches serties de petits strass qui accrochent la lumière.", image: "" },
    { id: "br6", nom: "Braces noirs mat", prix: 45, duree: 45, couleurs: ["Noir"], disponible: false,
      description: "Attaches noires mates, effet mystérieux. Bientôt de retour.", image: "" },
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
    { id: "r1", reference: "DZ-A7K2P", prestationType: "piercing", prestationId: "p2", prestationNom: "Hélix", date: "2026-12-02", heure: "14:30",
      nom: "Sarah B.", telephone: "3711-2233", message: "Premier piercing cartilage 🙂", statut: "pending",
      creeLe: "2026-11-20T10:12:00" },
    { id: "r2", reference: "DZ-K3B8W", prestationType: "braces", prestationId: "br2", prestationNom: "Braces élastiques couleur",
      couleur: "Rose", date: "2026-12-03", heure: "11:00", nom: "Yanis K.", telephone: "4855-6677", message: "",
      statut: "pending", creeLe: "2026-11-19T18:40:00" },
  ],

  // Comptes clients (créés via « Créer un compte »)
  utilisateurs: [],

};
export default SEED;
