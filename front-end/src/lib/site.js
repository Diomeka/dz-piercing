/* =========================================================================
   CONTENU DU SITE MODIFIABLE DEPUIS L'ADMIN (onglet « Site »)
   Accueil, contact, horaires, réseaux sociaux, menus, infos légales, devise.
   config.js ne fournit plus que les valeurs DE DÉPART : dès que l'admin
   enregistre, ce sont ses réglages (api.reglages) qui s'appliquent.
   ========================================================================= */
import { useSyncExternalStore } from "react";
import CONFIG from "../config.js";
import { setDevise } from "./format.js";

/** Pages qui peuvent apparaître dans les menus (l'Accueil est toujours visible). */
export const PAGES_MENU = [
  { id: "piercings", to: "/piercings", label: "Piercings", icon: "needle", principal: true },
  { id: "braces", to: "/braces", label: "Braces", icon: "smile", principal: true },
  { id: "rendez-vous", to: "/rendez-vous", label: "RDV", icon: "calendar", principal: true },
  { id: "galerie", to: "/galerie", label: "Galerie", icon: "image" },
  { id: "soins", to: "/soins", label: "Soins après piercing", icon: "heart" },
  { id: "contact", to: "/contact", label: "Contact", icon: "phone" },
];

/** Réseaux sociaux proposés (pas de YouTube). Lien vide = logo masqué. */
export const RESEAUX = [
  { id: "instagram", label: "Instagram", exemple: "https://www.instagram.com/tonpseudo" },
  { id: "tiktok", label: "TikTok", exemple: "https://www.tiktok.com/@tonpseudo" },
  { id: "facebook", label: "Facebook", exemple: "https://www.facebook.com/tapage" },
  { id: "snapchat", label: "Snapchat", exemple: "https://www.snapchat.com/add/tonpseudo" },
  { id: "x", label: "X (Twitter)", exemple: "https://x.com/tonpseudo" },
];

/** Moyens de paiement affichés en pied de page (logo officiel téléversable dans l'admin). */
export const MOYENS_PAIEMENT = [
  { id: "moncash", label: "MonCash", court: "MonCash" },
  { id: "natcash", label: "NatCash", court: "NatCash" },
  { id: "virement", label: "Virement bancaire", court: "virement bancaire" },
];

export function defauts() {
  return {
    devise: CONFIG.devise,
    accueil: {
      slogan: CONFIG.slogan,
      photo: CONFIG.photoAccueil,
      atouts: [
        { titre: "Matériel stérile", texte: "Usage unique" },
        { titre: "Bijoux de qualité", texte: "Acier & titane" },
        { titre: "Conseils offerts", texte: "Suivi des soins" },
      ],
      afficherPiercings: true,
      afficherBraces: true,
    },
    contact: {
      whatsapp: CONFIG.whatsapp,
      telephone: CONFIG.telephone,
      adresse: CONFIG.adresse,
      emailContact: CONFIG.emailContact,
    },
    horaires: structuredClone(CONFIG.horaires),
    reseaux: { instagram: CONFIG.instagram || "", tiktok: CONFIG.tiktok || "", facebook: CONFIG.facebook || "", snapchat: "", x: "" },
    menus: Object.fromEntries(PAGES_MENU.map((p) => [p.id, { visible: true, label: p.label }])),
    legal: { responsable: CONFIG.responsable, nif: CONFIG.nif },
    paiements: Object.fromEntries(MOYENS_PAIEMENT.map((m) => [m.id, { actif: true, logo: "" }])),
  };
}

/** Réglages enregistrés par-dessus les valeurs de départ (un niveau de profondeur). */
export function fusion(base, r) {
  const out = structuredClone(base);
  if (!r || typeof r !== "object") return out;
  for (const [k, v] of Object.entries(r)) {
    if (v === undefined || v === null) continue;
    if ((k === "menus" || k === "paiements") && typeof v === "object") {
      for (const [id, m] of Object.entries(v)) out[k][id] = { ...(out[k][id] || {}), ...m };
    } else if (k === "horaires" || Array.isArray(v) || typeof v !== "object") {
      out[k] = structuredClone(v);
    } else {
      out[k] = { ...(out[k] || {}), ...structuredClone(v) };
    }
  }
  return out;
}

let site = defauts();
const ecouteurs = new Set();

export const getSite = () => site;
export const onSiteChange = (fn) => { ecouteurs.add(fn); return () => ecouteurs.delete(fn); };

/** Applique les réglages reçus (au démarrage, ou après un enregistrement dans l'admin). */
export function appliquerReglages(r) {
  site = fusion(defauts(), r);
  setDevise(site.devise);
  ecouteurs.forEach((fn) => fn());
}

/** Hook React : le composant se met à jour quand l'admin change un réglage. */
export function useSite() {
  return useSyncExternalStore(onSiteChange, getSite, getSite);
}

/** Lien complet à partir de ce que l'admin a tapé ("instagram.com/dz" → "https://instagram.com/dz") */
export function lienComplet(url) {
  const u = String(url || "").trim();
  if (!u) return "";
  // Sécurité : seulement des liens web (jamais javascript:, data:…)
  const lien = /^https?:\/\//i.test(u) ? u : `https://${u.replace(/^\/+/, "")}`;
  try {
    const p = new URL(lien);
    return p.protocol === "https:" || p.protocol === "http:" ? p.href : "";
  } catch {
    return "";
  }
}
