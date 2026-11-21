import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
// Polices hébergées avec le site (pas d'appel à Google Fonts → vie privée + rapidité)
import "@fontsource/bebas-neue/latin-400.css";
import "@fontsource-variable/inter/index.css";
import "./styles.css";
import { injecterFicheCommerce } from "./lib/seo.js";
import api from "./api/index.js";
import { appliquerReglages } from "./lib/site.js";

function afficher() {
  injecterFicheCommerce(); // fiche Google (adresse, horaires…) à partir des réglages
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

// On récupère les réglages de l'admin (accueil, contact, menus, devise…) avant
// d'afficher le site. Si le serveur ne répond pas (ou tarde plus de 3 s), on
// affiche quand même le site avec les valeurs de départ de config.js.
Promise.race([api.reglages.get(), new Promise((r) => setTimeout(r, 3000))])
  .then((r) => r && appliquerReglages(r))
  .catch(() => {})
  .finally(afficher);
