import CONFIG from "../config.js";
import { placeholder } from "./placeholder.js";

export const formatPrix = (n) =>
  Number(n).toLocaleString("fr-FR", { minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2 }) +
  " " + CONFIG.devise;

export const imageDe = (item, type) => item.image || placeholder(item.nom || item.legende || "DZ", type);

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
  const h = CONFIG.horaires[jour];
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

export const telValide = (t) => (t.match(/\d/g) || []).length >= 10;

export const lienWhatsApp = (texte) =>
  `https://wa.me/${CONFIG.whatsapp}${texte ? `?text=${encodeURIComponent(texte)}` : ""}`;

export const lienTel = () => `tel:${CONFIG.telephone.replace(/\s/g, "")}`;

export const STATUTS = {
  pending: { label: "En attente", cls: "badge-pending" },
  accepted: { label: "Accepté", cls: "badge-accepted" },
  refused: { label: "Refusé", cls: "badge-refused" },
};

export const COULEURS = {
  "doré": "#d4af37", "or": "#d4af37", "argent": "#c9c9c9", "noir": "#111111", "blanc": "#ffffff",
  "or rose": "#c98f86", "rose": "#e7a1b0", "rouge": "#c0392b", "bleu": "#2e5fb8", "vert": "#2f8f5b",
  "marron": "#7a4b2a", "violet": "#7b4bb3", "beige": "#d9c4a3", "gris": "#777777",
};
export const couleurHex = (nom) => COULEURS[String(nom).trim().toLowerCase()] || "#555555";
