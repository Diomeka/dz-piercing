import CONFIG from "../config.js";

const JOURS_SCHEMA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Fiche « commerce local » lisible par Google (schema.org, JSON-LD).
 * Construite à partir de config.js : rien à maintenir à la main.
 */
export function ficheCommerce() {
  const horaires = Object.entries(CONFIG.horaires)
    .filter(([, h]) => h)
    .map(([j, [ouvre, ferme]]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: JOURS_SCHEMA[Number(j)],
      opens: ouvre,
      closes: ferme,
    }));
  const site = window.location.href.split("#")[0];
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: CONFIG.nomBoutique,
    description: CONFIG.slogan,
    url: site,
    image: new URL("og-image.png", site).href,
    telephone: CONFIG.telephone,
    address: { "@type": "PostalAddress", streetAddress: CONFIG.adresse, addressCountry: "FR" },
    openingHoursSpecification: horaires,
    sameAs: [CONFIG.instagram, CONFIG.tiktok].filter(Boolean),
    priceRange: "€€",
  };
}

export function injecterFicheCommerce() {
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(ficheCommerce());
  document.head.appendChild(s);
}
