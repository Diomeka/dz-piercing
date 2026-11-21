import { beforeEach } from "vitest";
import CONFIG from "../config.js";
import { empreinteMotDePasse } from "../lib/motdepasse.js";
import { ADMIN_TEST } from "./identifiants.js";

// Indique à React qu'on est dans un environnement de test (act)
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Comme les Chrome récents : scrollTo renvoie une Promise.
// (C'est ce comportement qui avait provoqué l'écran noir.)
window.scrollTo = () => Promise.resolve();
Element.prototype.scrollTo = () => Promise.resolve();

// Compte admin de test (le vrai mot de passe n'apparaît nulle part dans le code)
CONFIG.adminDemo = { email: ADMIN_TEST.email, sel: "sel-de-test", empreinte: empreinteMotDePasse(ADMIN_TEST.motDePasse, "sel-de-test") };

beforeEach(() => {
  localStorage.clear();
  location.hash = "";
});
