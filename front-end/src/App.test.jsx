import { describe, expect, it, afterEach } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import api, { logout } from "./api/index.js";
import { ADMIN_TEST } from "./test/identifiants.js";

let root, container;

async function ouvrir(page) {
  location.hash = `#/${page}`;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <ErrorBoundary>
        <HashRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </HashRouter>
      </ErrorBoundary>
    );
  });
  // laisse le temps aux données (démo : ~120 ms) de se charger
  await act(() => new Promise((r) => setTimeout(r, 300)));
  return container;
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const PAGES = {
  "": "Prendre rendez-vous",
  piercings: "Hélix",
  bracelets: "Chaîne Cubaine",
  "rendez-vous": "Ton piercing",
  galerie: "Galerie",
  soins: "Soins après piercing",
  contact: "WhatsApp",
  confidentialite: "Tes données personnelles",
  connexion: "Se connecter",
  inscription: "Créer mon compte",
  compte: "Se connecter",          // pas connecté → renvoyé vers la connexion
  admin: "Se connecter",           // pas admin → renvoyé vers la connexion
  "page-qui-nexiste-pas": "Page introuvable",
};

describe("Chaque page s'affiche sans planter (pas d'écran noir)", () => {
  for (const [page, texte] of Object.entries(PAGES)) {
    it(`/${page}`, async () => {
      const el = await ouvrir(page);
      expect(el.textContent).not.toMatch(/Oups/);
      expect(el.textContent).toContain(texte);
    });
  }
});

describe("L'espace admin reste discret et séparé", () => {
  it("aucun lien vers l'admin n'est visible par les clients", async () => {
    const el = await ouvrir("");
    expect(el.querySelector('a[href="#/admin"]')).toBeNull();
    expect(el.textContent).toContain("Connexion");
  });

  it("l'admin connecté a sa propre interface, avec « Voir le site » et sans les menus clients", async () => {
    await api.login(ADMIN_TEST.email, ADMIN_TEST.motDePasse);
    const el = await ouvrir("admin");
    expect(el.textContent).toContain("Tableau de bord");
    expect(el.textContent).toContain("Voir le site");
    expect(el.querySelector(".bottom-nav")).toBeNull();
    expect(el.querySelector(".footer")).toBeNull();
    logout();
  });
});

describe("Pied de page", () => {
  it("affiche les logos des réseaux, WhatsApp et les moyens de paiement (sans YouTube)", async () => {
    const el = await ouvrir("");
    const pied = el.querySelector(".footer");
    expect(pied.querySelector('a[aria-label="Instagram"]')).not.toBeNull();
    expect(pied.querySelector('a.reseau-whatsapp[aria-label="WhatsApp"]').href).toMatch(/^https:\/\/wa\.me\/509/);
    expect(pied.textContent).not.toMatch(/youtube/i);
    const noms = [...pied.querySelectorAll(".paiement")].map((p) => p.dataset.nom);
    expect(noms).toEqual(["MonCash", "NatCash", "Virement bancaire"]);
  });
});
