import { describe, expect, it, vi, afterEach } from "vitest";
import { couleurHex, creneauxDuJour, formatDate, formatPrix, lienWhatsApp, telValide, aujourdhui } from "./format.js";

afterEach(() => vi.useRealTimers());

describe("formatPrix", () => {
  it("affiche les euros à la française", () => {
    expect(formatPrix(35)).toBe("35 €");
    expect(formatPrix(12.5).replace(/\s/g, " ")).toBe("12,50 €");
  });
});

describe("formatDate", () => {
  it("écrit la date en toutes lettres", () => {
    expect(formatDate("2026-12-02")).toBe("mercredi 2 décembre 2026");
  });
});

describe("telValide", () => {
  it("accepte un numéro de 10 chiffres avec espaces", () => expect(telValide("06 12 34 56 78")).toBe(true));
  it("accepte le format international", () => expect(telValide("+33 6 12 34 56 78")).toBe(true));
  it("refuse un numéro trop court", () => expect(telValide("06 12 34")).toBe(false));
});

describe("creneauxDuJour", () => {
  it("renvoie null un jour de fermeture (lundi)", () => {
    expect(creneauxDuJour("2026-11-30")).toBeNull();
  });
  it("découpe la journée en créneaux de 30 min (mardi 10h-19h)", () => {
    const c = creneauxDuJour("2026-12-01");
    expect(c[0]).toBe("10:00");
    expect(c.at(-1)).toBe("18:30");
    expect(c).toHaveLength(18);
  });
  it("aujourd'hui, ne propose que les créneaux au moins 1 h plus tard", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 1, 14, 10)); // mardi 14h10
    expect(aujourdhui()).toBe("2026-12-01");
    expect(creneauxDuJour("2026-12-01")[0]).toBe("15:30");
  });
});

describe("divers", () => {
  it("encode le message WhatsApp", () => {
    expect(lienWhatsApp("Bonjour à tous")).toMatch(/^https:\/\/wa\.me\/\d+\?text=Bonjour%20%C3%A0%20tous$/);
  });
  it("connaît les couleurs courantes, gris par défaut", () => {
    expect(couleurHex("Doré")).toBe("#d4af37");
    expect(couleurHex("inconnue")).toBe("#555555");
  });
});
