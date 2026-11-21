import { describe, expect, it, afterEach } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

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
  confidentialite: "RGPD",
  admin: "Espace admin",
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

describe("L'espace admin reste discret", () => {
  it("aucun lien vers l'admin n'est visible par les clients", async () => {
    const el = await ouvrir("");
    expect(el.querySelector('a[href="#/admin"]')).toBeNull();
    expect(el.textContent).not.toContain("Espace admin");
  });
});
