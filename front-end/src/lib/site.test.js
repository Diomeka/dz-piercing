import { describe, expect, it, afterEach } from "vitest";
import { appliquerReglages, defauts, fusion, getSite, lienComplet } from "./site.js";
import { creneauxDuJour, getDevise, lienTel, lienWhatsApp, telValide, versWhatsApp } from "./format.js";

afterEach(() => appliquerReglages(null));

describe("Réglages du site modifiables dans l'admin", () => {
  it("part des valeurs de config.js (Haïti, dollars)", () => {
    const d = defauts();
    expect(d.devise).toBe("USD");
    expect(d.contact.whatsapp).toMatch(/^509/);
    expect(d.menus.galerie).toEqual({ visible: true, label: "Galerie" });
    expect(d.paiements.moncash.actif).toBe(true);
  });

  it("fusionne un bloc enregistré sans perdre le reste", () => {
    const f = fusion(defauts(), { menus: { galerie: { visible: false } }, contact: { adresse: "Delmas 33" } });
    expect(f.menus.galerie).toEqual({ visible: false, label: "Galerie" });
    expect(f.menus.soins.visible).toBe(true);
    expect(f.contact.adresse).toBe("Delmas 33");
    expect(f.contact.whatsapp).toBe(defauts().contact.whatsapp);
  });

  it("applique les réglages partout : WhatsApp, appel, horaires, devise", () => {
    appliquerReglages({
      devise: "HTG",
      contact: { whatsapp: "3712-3456", telephone: "+509 3712-3456" },
      horaires: { 0: null, 1: ["08:00", "10:00"], 2: null, 3: null, 4: null, 5: null, 6: null },
    });
    expect(getDevise()).toBe("HTG");
    expect(lienWhatsApp()).toBe("https://wa.me/50937123456");
    expect(lienTel()).toBe("tel:+50937123456");
    expect(creneauxDuJour("2026-11-30")).toEqual(["08:00", "08:30", "09:00", "09:30"]); // lundi
    expect(getSite().horaires[2]).toBeNull();
  });

  it("complète les liens des réseaux tapés sans https://", () => {
    expect(lienComplet("instagram.com/dz")).toBe("https://instagram.com/dz");
    expect(lienComplet("https://x.com/dz")).toBe("https://x.com/dz");
    expect(lienComplet("  ")).toBe("");
  });
});

describe("Numéros haïtiens", () => {
  it("acceptent 8 chiffres", () => {
    expect(telValide("3712-3456")).toBe(true);
    expect(telValide("+509 3712-3456")).toBe(true);
    expect(telValide("3712")).toBe(false);
  });
  it("sont convertis au format WhatsApp international", () => {
    expect(versWhatsApp("3712-3456")).toBe("50937123456");
    expect(versWhatsApp("+509 3712 3456")).toBe("50937123456");
    expect(versWhatsApp("00509 37123456")).toBe("50937123456");
    expect(versWhatsApp("+1 (305) 555-0100")).toBe("13055550100");
  });
});
