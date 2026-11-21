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

injecterFicheCommerce(); // fiche Google (adresse, horaires…) générée depuis config.js

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
