import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
// Polices hébergées avec le site (pas d'appel à Google Fonts → RGPD + rapidité)
import "@fontsource/bebas-neue/latin-400.css";
import "@fontsource-variable/inter/index.css";
import "./styles.css";
import { injecterFicheCommerce } from "./lib/seo.js";
import api from "./api/index.js";
import { setDevise } from "./lib/format.js";

injecterFicheCommerce(); // fiche Google (adresse, horaires…) générée depuis config.js

function afficher() {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ErrorBoundary>
        <HashRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </HashRouter>
      </ErrorBoundary>
    </StrictMode>
  );
}

// On récupère la devise choisie par l'admin avant d'afficher les prix.
// Si le serveur ne répond pas (ou tarde plus de 3 s), on affiche quand même
// le site avec la devise par défaut de config.js.
Promise.race([api.reglages.get(), new Promise((r) => setTimeout(r, 3000))])
  .then((r) => r?.devise && setDevise(r.devise))
  .catch(() => {})
  .finally(afficher);
