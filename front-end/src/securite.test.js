import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import api, { logout, motDePasseValide } from "./api/index.js";
import CONFIG from "./config.js";
import { imageSure } from "./lib/format.js";
import { lienComplet } from "./lib/site.js";
import { egal, empreinteMotDePasse } from "./lib/motdepasse.js";
import { destination } from "./pages/compte/Connexion.jsx";
import { ADMIN_TEST } from "./test/identifiants.js";

const fichiersSource = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? fichiersSource(p) : /\.(jsx?|html)$/.test(f) ? [p] : [];
  });

describe("Sécurité — mots de passe", () => {
  it("aucun mot de passe en clair dans config.js : seulement une empreinte", () => {
    const src = readFileSync(join(process.cwd(), "src", "config.js"), "utf8");
    expect(src).not.toMatch(/motDePasse\w*\s*:/i);
    expect(src).toMatch(/empreinte:\s*"[0-9a-f]{64}"/);
  });

  it("l'ancien mot de passe publié n'existe plus nulle part dans le code", () => {
    const racine = process.cwd(); // dossier front-end
    for (const f of [...fichiersSource(join(racine, "src")), join(racine, "index.html")]) {
      expect(readFileSync(f, "utf8"), f).not.toContain("dz" + "2026");
    }
  });

  it("l'empreinte dépend du sel et ne révèle pas le mot de passe", () => {
    const a = empreinteMotDePasse("secret123", "sel-a");
    const b = empreinteMotDePasse("secret123", "sel-b");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
    expect(a).not.toContain("secret");
    expect(egal(a, a)).toBe(true);
    expect(egal(a, b)).toBe(false);
  });

  it("les comptes clients ne stockent jamais le mot de passe en clair", async () => {
    logout();
    await api.register({ nom: "T", email: "t@t.ht", telephone: "3712-3456", motDePasse: "monSecret42" });
    const brut = localStorage.getItem("dz_piercing_db_v1");
    expect(brut).not.toContain("monSecret42");
    expect(localStorage.getItem("dz_session")).not.toContain("monSecret42");
  });

  it("refuse les mots de passe faibles", () => {
    expect(motDePasseValide("12345678")).toBe(false);   // pas de lettre
    expect(motDePasseValide("password")).toBe(false);   // pas de chiffre
    expect(motDePasseValide("abc12")).toBe(false);      // trop court
    expect(motDePasseValide("Piercing2026")).toBe(true);
  });

  it("bloque la connexion après 5 erreurs (anti-devinette)", async () => {
    logout();
    for (let i = 0; i < 5; i++) await expect(api.login(ADMIN_TEST.email, "faux" + i)).rejects.toThrow(/incorrect/);
    await expect(api.login(ADMIN_TEST.email, ADMIN_TEST.motDePasse)).rejects.toThrow(/Trop d'essais/);
  });

  it("le compte admin de démo est configuré par empreinte (pas de mot de passe)", () => {
    expect(CONFIG.adminDemo.empreinte).toMatch(/^[0-9a-f]{64}$/);
    expect(CONFIG.motDePasseDemo).toBeUndefined();
  });
});

describe("Sécurité — liens et images (anti-injection)", () => {
  it("refuse les liens javascript: et data: pour les réseaux", () => {
    expect(lienComplet("javascript:alert(1)")).not.toMatch(/^javascript:/i);
    expect(lienComplet("data:text/html,<script>")).not.toMatch(/^data:/i);
    expect(lienComplet("instagram.com/dz")).toBe("https://instagram.com/dz");
  });

  it("n'affiche que des images de sources sûres", () => {
    expect(imageSure("javascript:alert(1)")).toBe("");
    expect(imageSure("http://pas-securise.com/a.jpg")).toBe("");
    expect(imageSure('https://x.com/a.jpg") ; background:url(evil')).toBe("");
    expect(imageSure("data:image/svg+xml;base64,PHN2Zz4=")).toBe(""); // SVG (peut contenir du code)
    expect(imageSure("https://cdn.dzpiercing.ht/photo.jpg")).toBe("https://cdn.dzpiercing.ht/photo.jpg");
    expect(imageSure("data:image/jpeg;base64,/9j/4AAQ")).toBe("data:image/jpeg;base64,/9j/4AAQ");
    expect(imageSure("hero.svg")).toBe("hero.svg");
  });

  it("après connexion, ne redirige jamais vers une page inconnue ou un autre site", () => {
    const client = { role: "client" };
    expect(destination(client, "//site-pirate.com")).toBe("/compte");
    expect(destination(client, "https://site-pirate.com")).toBe("/compte");
    expect(destination(client, "/admin")).toBe("/compte");
    expect(destination(client, "/rendez-vous")).toBe("/rendez-vous");
    expect(destination({ role: "admin" }, "/rendez-vous")).toBe("/admin");
  });
});
