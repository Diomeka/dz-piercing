import CONFIG from "../config.js";
import { placeholder } from "./placeholder.js";
import { getSite } from "./site.js";

/* ----- Devise : choisie par l'admin (onglet Réglages), USD par défaut ----- */
export const DEVISES = {
  USD: { label: "Dollar américain", symbole: "$ US" },
  HTG: { label: "Gourde haïtienne", symbole: "HTG" },
};
let devise = DEVISES[CONFIG.devise] ? CONFIG.devise : "USD";
export const getDevise = () => devise;
export function setDevise(code) {
  if (DEVISES[code]) devise = code;
}
export const symboleDevise = () => DEVISES[devise].symbole;

/** 35 → "35 $US" ou "35 HTG" ; 12.5 → "12,50 $US" */
export const formatPrix = (n) =>
  Number(n).toLocaleString("fr-FR", {
    style: "currency",
    currency: devise,
    minimumFractionDigits: Number(n) % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });

/**
 * Sécurité : n'accepte que les images de sources sûres — photo téléversée
 * (data:image/… ou blob:), lien https://, ou fichier du site (ex. "hero.svg").
 * Tout le reste (javascript:, http:, texte bizarre) est ignoré → "".
 */
export function imageSure(url) {
  const u = String(url || "").trim();
  if (/^data:image\/(png|jpe?g|webp|gif|avif);base64,[a-z0-9+/=\s]+$/i.test(u)) return u;
  if (/^blob:https?:\/\//i.test(u)) return u;
  if (/^https:\/\/[^\s"'()<>\\]+$/i.test(u)) return u;
  if (/^[\w-]+(\/[\w-]+)*\.(svg|png|jpe?g|webp|gif|avif)$/i.test(u)) return u;
  return "";
}

export const imageDe = (item, type) => imageSure(item.image) || placeholder(item.nom || item.legende || "DZ", type);

/** "2026-12-02" → "mercredi 2 décembre 2026" */
export function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** Date du jour au format "AAAA-MM-JJ" (heure locale, pas UTC) */
export function aujourdhui(offsetJours = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetJours);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** Liste des créneaux d'une journée selon les horaires (null si fermé) */
export function creneauxDuJour(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const jour = new Date(y, m - 1, d).getDay();
  const h = getSite().horaires[jour];
  if (!h) return null;
  const slots = [];
  for (let t = toMin(h[0]); t + CONFIG.dureeCreneau <= toMin(h[1]); t += CONFIG.dureeCreneau) slots.push(toHHMM(t));
  if (iso === aujourdhui()) {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes() + 60; // au moins 1 h à l'avance
    return slots.filter((s) => toMin(s) >= minutes);
  }
  return slots;
}

export const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

/** Haïti : 8 chiffres (ex. 3712-3456) ; accepte aussi +509 et les numéros étrangers */
export const telValide = (t) => (t.match(/\d/g) || []).length >= 8;

/** "3712-3456" → "50937123456" ; "+1 305 555 0100" → "13055550100" (format wa.me) */
export function versWhatsApp(tel) {
  let n = String(tel).replace(/\D/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  if (n.length === 8) n = "509" + n;
  return n;
}

export const emailValide = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e).trim());

export const lienWhatsApp = (texte) =>
  `https://wa.me/${versWhatsApp(getSite().contact.whatsapp)}${texte ? `?text=${encodeURIComponent(texte)}` : ""}`;

export const lienTel = () => `tel:${String(getSite().contact.telephone).replace(/[^\d+]/g, "")}`;

export const STATUTS = {
  pending: { label: "En attente", cls: "badge-pending" },
  accepted: { label: "Accepté", cls: "badge-accepted" },
  refused: { label: "Refusé", cls: "badge-refused" },
};

export const COULEURS = {
  "doré": "#d4af37", "or": "#d4af37", "argent": "#c9c9c9", "noir": "#111111", "blanc": "#ffffff",
  "or rose": "#c98f86", "rose": "#e7a1b0", "rouge": "#c0392b", "bleu": "#2e5fb8", "vert": "#2f8f5b",
  "multicolore": "conic-gradient(#e53935, #fb8c00, #fdd835, #43a047, #1e88e5, #8e24aa, #e53935)",
  "marron": "#7a4b2a", "violet": "#7b4bb3", "beige": "#d9c4a3", "gris": "#777777",
};
export const couleurHex = (nom) => COULEURS[String(nom).trim().toLowerCase()] || "#555555";
