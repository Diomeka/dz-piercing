import { beforeEach } from "vitest";

// Indique à React qu'on est dans un environnement de test (act)
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Comme les Chrome récents : scrollTo renvoie une Promise.
// (C'est ce comportement qui avait provoqué l'écran noir.)
window.scrollTo = () => Promise.resolve();
Element.prototype.scrollTo = () => Promise.resolve();

beforeEach(() => {
  localStorage.clear();
  location.hash = "";
});
