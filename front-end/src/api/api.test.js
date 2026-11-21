import { describe, expect, it } from "vitest";
import api, { isLoggedIn, logout } from "./index.js";

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
    await expect(api.login("mauvais")).rejects.toThrow(/incorrect/);
    await api.login("dz2026");
    expect(isLoggedIn()).toBe(true);
  });

  it("libère le créneau quand l'admin refuse", async () => {
    await api.login("dz2026");
    const r = await api.rendezvous.create({ ...RDV, date: "2027-01-06" });
    await api.rendezvous.setStatus(r.id, "refused");
    expect(await api.rendezvous.booked("2027-01-06")).toEqual([]);
  });

  it("ajoute, modifie et supprime un piercing", async () => {
    await api.login("dz2026");
    const p = await api.piercings.create({ nom: "Test", prix: 10 });
    await api.piercings.update(p.id, { prix: 12 });
    expect((await api.piercings.list()).find((x) => x.id === p.id).prix).toBe(12);
    await api.piercings.remove(p.id);
    expect((await api.piercings.list()).some((x) => x.id === p.id)).toBe(false);
  });
});
