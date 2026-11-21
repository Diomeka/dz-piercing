import CONFIG from "../config.js";
import { getSite, lienComplet } from "./site.js";

const JOURS_SCHEMA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Fiche « commerce local » lisible par Google (schema.org, JSON-LD).
 * Construite à partir de config.js : rien à maintenir à la main.
 */
export function ficheCommerce() {
  const site = getSite();
  const horaires = Object.entries(site.horaires)
    .filter(([, h]) => h)
    .map(([j, [ouvre, ferme]]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: JOURS_SCHEMA[Number(j)],
      opens: ouvre,
      closes: ferme,
    }));
  const adresseSite = window.location.href.split("#")[0];
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: CONFIG.nomBoutique,
    description: site.accueil.slogan,
    url: adresseSite,
    image: new URL("og-image.png", adresseSite).href,
    telephone: site.contact.telephone,
    address: { "@type": "PostalAddress", streetAddress: site.contact.adresse, addressCountry: CONFIG.pays || "HT" },
    openingHoursSpecification: horaires,
    sameAs: Object.values(site.reseaux).map(lienComplet).filter(Boolean),
    priceRange: "$$",
  };
}

export function injecterFicheCommerce() {
  document.getElementById("fiche-commerce")?.remove();
  const s = document.createElement("script");
  s.id = "fiche-commerce";
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(ficheCommerce());
  document.head.appendChild(s);
}
