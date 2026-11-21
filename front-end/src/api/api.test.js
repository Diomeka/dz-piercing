import { describe, expect, it } from "vitest";
import api, { getUser, isAdmin, isLoggedIn, logout } from "./index.js";

const ADMIN = "admin@dzpiercing.ht";

const RDV = { piercingId: "p1", piercingNom: "Lobe", date: "2027-01-05", heure: "11:00", nom: "Test", telephone: "0612345678", message: "" };

describe("API — mode démo", () => {
  it("est en mode démo sans apiUrl", () => {
    expect(api.mode).toBe("demo");
  });

  it("charge les données d'exemple", async () => {
    expect((await api.piercings.list()).length).toBeGreaterThan(5);
    expect((await api.bracelets.list()).length).toBeGreaterThan(3);
    expect((await api.galerie.list()).length).toBeGreaterThan(3);
  });

  it("crée un rendez-vous en attente et bloque le créneau", async () => {
    const r = await api.rendezvous.create(RDV);
    expect(r.statut).toBe("pending");
    expect(r.reference).toMatch(/^DZ-[A-Z0-9]{5}$/);
    expect(await api.rendezvous.booked("2027-01-05")).toEqual(["11:00"]);
    await expect(api.rendezvous.create(RDV)).rejects.toThrow(/créneau/);
  });

  it("calcule le total d'une commande à partir du prix réel", async () => {
    const c = await api.commandes.create({ braceletId: "b1", couleur: "Doré", quantite: 3, nom: "T", telephone: "0612345678", prixUnitaire: 1 });
    expect(c.prixUnitaire).toBe(29);
    expect(c.total).toBe(87);
  });

  it("protège l'admin par mot de passe", async () => {
    logout();
    await expect(api.rendezvous.list()).rejects.toThrow();
    await expect(api.piercings.create({ nom: "X", prix: 1 })).rejects.toThrow();
    await expect(api.login(ADMIN, "mauvais")).rejects.toThrow(/incorrect/);
    await api.login(ADMIN, "dz2026");
    expect(isLoggedIn()).toBe(true);
  });

  it("libère le créneau quand l'admin refuse", async () => {
    await api.login(ADMIN, "dz2026");
    const r = await api.rendezvous.create({ ...RDV, date: "2027-01-06" });
    await api.rendezvous.setStatus(r.id, "refused");
    expect(await api.rendezvous.booked("2027-01-06")).toEqual([]);
  });

  it("ajoute, modifie et supprime un piercing", async () => {
    await api.login(ADMIN, "dz2026");
    const p = await api.piercings.create({ nom: "Test", prix: 10 });
    await api.piercings.update(p.id, { prix: 12 });
    expect((await api.piercings.list()).find((x) => x.id === p.id).prix).toBe(12);
    await api.piercings.remove(p.id);
    expect((await api.piercings.list()).some((x) => x.id === p.id)).toBe(false);
  });

  it("enregistre la devise choisie (admin seulement)", async () => {
    expect((await api.reglages.get()).devise).toBe("USD");
    logout();
    await expect(api.reglages.update({ devise: "HTG" })).rejects.toThrow();
    await api.login(ADMIN, "dz2026");
    await api.reglages.update({ devise: "HTG" });
    expect((await api.reglages.get()).devise).toBe("HTG");
  });

  it("crée un compte client, le connecte et refuse les doublons", async () => {
    logout();
    const u = await api.register({ nom: "Inès", email: "Ines@Mail.com ", telephone: "3712-3456", motDePasse: "secret123" });
    expect(u).toMatchObject({ nom: "Inès", email: "ines@mail.com", role: "client" });
    expect(u.mdp).toBeUndefined(); // le mot de passe ne sort jamais
    expect(getUser().email).toBe("ines@mail.com");
    expect(isAdmin()).toBe(false);
    logout();
    await expect(api.register({ nom: "X", email: "ines@mail.com", motDePasse: "autre1234" })).rejects.toThrow(/existe déjà/);
    await expect(api.register({ nom: "X", email: "pas-un-email", motDePasse: "autre1234" })).rejects.toThrow(/e-mail/);
    await expect(api.register({ nom: "X", email: "x@y.ht", motDePasse: "court" })).rejects.toThrow(/8 caractères/);
  });

  it("le client se reconnecte et ne voit que SES rendez-vous", async () => {
    logout();
    await api.register({ nom: "Client A", email: "a@a.ht", telephone: "3711-1111", motDePasse: "motdepasse" });
    await api.rendezvous.create({ ...RDV, date: "2027-02-01" });
    logout();
    await api.rendezvous.create({ ...RDV, date: "2027-02-02", nom: "Invité" }); // sans compte
    await expect(api.login("a@a.ht", "mauvais")).rejects.toThrow(/incorrect/);
    const u = await api.login("A@a.ht", "motdepasse");
    expect(u.role).toBe("client");
    const mes = await api.moi.rendezvous();
    expect(mes.map((r) => r.date)).toEqual(["2027-02-01"]);
    // un client n'accède pas à l'admin
    await expect(api.rendezvous.list()).rejects.toThrow(/administrateur/);
    await expect(api.piercings.create({ nom: "X", prix: 1 })).rejects.toThrow();
    await expect(api.reglages.update({ devise: "HTG" })).rejects.toThrow();
  });

  it("l'admin se connecte avec son e-mail et arrive avec le rôle admin", async () => {
    logout();
    const u = await api.login("ADMIN@dzpiercing.ht", "dz2026");
    expect(u.role).toBe("admin");
    expect(isAdmin()).toBe(true);
    await expect(api.moi.rendezvous()).rejects.toThrow(); // l'espace client est réservé aux clients
  });

  it("enregistre un bloc de réglages du site (admin)", async () => {
    await api.login(ADMIN, "dz2026");
    await api.reglages.update({ contact: { whatsapp: "3712-3456", telephone: "+509 3712-3456", adresse: "Delmas 33", emailContact: "a@b.ht" } });
    const r = await api.reglages.get();
    expect(r.contact.adresse).toBe("Delmas 33");
  });
});
