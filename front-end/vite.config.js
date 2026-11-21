import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * SÉCURITÉ — Politique de sécurité du contenu (CSP), ajoutée à la version publiée.
 * Le navigateur refuse alors tout script qui ne vient pas du site lui-même
 * (protection contre l'injection de code / XSS), les plugins, et les formulaires
 * envoyés ailleurs. (Pas en mode développement : Vite y a besoin de scripts en ligne.)
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",          // API du backend (en https)
  "frame-src https://www.google.com",   // carte Google Maps (seulement après clic)
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securite = {
  name: "dz-securite",
  apply: "build",
  transformIndexHtml: () => [
    { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: CSP }, injectTo: "head-prepend" },
  ],
};

// base "./" : le site marche dans n'importe quel dossier (GitHub Pages, Netlify, Laravel /public…)
export default defineConfig({
  plugins: [react(), securite],
  base: "./",
  build: { sourcemap: false }, // pas de code source lisible publié
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
  },
});
