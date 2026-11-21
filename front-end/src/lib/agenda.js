import CONFIG from "../config.js";
import { getSite } from "./site.js";

/** Échappe le texte selon la norme iCalendar (RFC 5545) */
const txt = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
const pad = (n) => String(n).padStart(2, "0");
const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

/**
 * Fichier .ics d'un rendez-vous (heure locale « flottante » : 14:30 reste 14:30
 * dans l'agenda du client). Compatible iPhone, Android/Google Agenda, Outlook.
 */
export function rendezVousIcs(rdv, dureeMinutes = CONFIG.dureeCreneau) {
  const [y, m, d] = rdv.date.split("-").map(Number);
  const [h, min] = rdv.heure.split(":").map(Number);
  const debut = new Date(y, m - 1, d, h, min);
  const fin = new Date(debut.getTime() + (dureeMinutes || CONFIG.dureeCreneau) * 60_000);
  const now = new Date();
  const utc = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DZ PIERCING//Rendez-vous//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${txt(rdv.reference || rdv.id)}@dz-piercing`,
    `DTSTAMP:${utc}`,
    `DTSTART:${stamp(debut)}`,
    `DTEND:${stamp(fin)}`,
    `SUMMARY:${txt(`${rdv.prestationType === "braces" ? rdv.prestationNom : `Piercing ${rdv.prestationNom}`} — ${CONFIG.nomBoutique}`)}`,
    `LOCATION:${txt(getSite().contact.adresse)}`,
    `DESCRIPTION:${txt(`Référence ${rdv.reference}. En attente de confirmation par ${CONFIG.nomBoutique}.\nContact : ${getSite().contact.telephone}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${txt(`Rendez-vous piercing dans 2 h`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Déclenche le téléchargement / l'ouverture du fichier dans l'agenda du téléphone */
export function ajouterAgenda(rdv, dureeMinutes) {
  const blob = new Blob([rendezVousIcs(rdv, dureeMinutes)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rdv-dz-piercing-${rdv.date}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
