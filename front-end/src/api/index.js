/* =========================================================================
   COUCHE DE DONNÉES — tout le site passe par ici.

   • CONFIG.apiUrl vide  → MODE DÉMO : données stockées dans le navigateur
                            (localStorage), initialisées avec src/data/seed.js
   • CONFIG.apiUrl rempli → MODE API : appels REST vers le backend
                            (contrat complet dans BACKEND.md)

   Les deux modes exposent exactement les mêmes fonctions, donc les pages
   React n'ont rien à changer quand le backend est prêt.
   ========================================================================= */
import CONFIG from "../config.js";
import SEED from "../data/seed.js";

const DB_KEY = "dz_piercing_db_v1";
const TOKEN_KEY = "dz_admin_token";

/* ---------- stockage navigateur sécurisé (navigation privée, quota…) ---------- */
const memory = {};
const storage = {
  get(k) {
    try { return localStorage.getItem(k); } catch { return memory[k] ?? null; }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {
      if (e && e.name === "QuotaExceededError") {
        throw new Error("Mémoire du navigateur pleine : supprime quelques photos (mode démo).", { cause: e });
      }
      memory[k] = v;
    }
  },
  remove(k) {
    try { localStorage.removeItem(k); } catch { /* ignoré */ }
    delete memory[k];
  },
};

export const getToken = () => storage.get(TOKEN_KEY);
export const isLoggedIn = () => !!getToken();
export const logout = () => storage.remove(TOKEN_KEY);

/* =============================== MODE DÉMO =============================== */
function loadDb() {
  const raw = storage.get(DB_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* données corrompues : on repart de zéro */ }
  }
  const db = structuredClone(SEED);
  storage.set(DB_KEY, JSON.stringify(db));
  return db;
}
const saveDb = (db) => storage.set(DB_KEY, JSON.stringify(db));
const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 120));
const newId = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const newRef = () => "DZ-" + Math.random().toString(36).slice(2, 7).toUpperCase();

function requireAdmin() {
  if (!isLoggedIn()) throw new Error("Session expirée, reconnecte-toi.");
}

function crud(collection, prefix) {
  return {
    list: () => wait(loadDb()[collection]),
    create: async (data) => {
      requireAdmin();
      const db = loadDb();
      const item = { ...data, id: newId(prefix) };
      db[collection].unshift(item);
      saveDb(db);
      return wait(item);
    },
    update: async (id, data) => {
      requireAdmin();
      const db = loadDb();
      const i = db[collection].findIndex((x) => x.id === id);
      if (i < 0) throw new Error("Élément introuvable.");
      db[collection][i] = { ...db[collection][i], ...data, id };
      saveDb(db);
      return wait(db[collection][i]);
    },
    remove: async (id) => {
      requireAdmin();
      const db = loadDb();
      db[collection] = db[collection].filter((x) => x.id !== id);
      saveDb(db);
      return wait(null);
    },
  };
}

function resizeImage(file, max = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossible de lire la photo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Format de photo non reconnu."));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function statusApi(collection) {
  return {
    list: async () => { requireAdmin(); return wait(loadDb()[collection]); },
    setStatus: async (id, statut) => {
      requireAdmin();
      const db = loadDb();
      const item = db[collection].find((x) => x.id === id);
      if (!item) throw new Error("Élément introuvable.");
      item.statut = statut;
      saveDb(db);
      return wait(item);
    },
    remove: async (id) => {
      requireAdmin();
      const db = loadDb();
      db[collection] = db[collection].filter((x) => x.id !== id);
      saveDb(db);
      return wait(null);
    },
  };
}

const demoApi = {
  mode: "demo",
  login: async (password) => {
    await wait(null);
    if (password !== CONFIG.motDePasseDemo) throw new Error("Mot de passe incorrect.");
    storage.set(TOKEN_KEY, "demo-token");
    return true;
  },
  piercings: crud("piercings", "p"),
  bracelets: crud("bracelets", "b"),
  galerie: crud("galerie", "g"),
  rendezvous: {
    ...statusApi("rendezvous"),
    // Public : renvoie seulement les heures déjà prises (pas les noms des clients)
    booked: (date) =>
      wait(loadDb().rendezvous.filter((r) => r.date === date && r.statut !== "refused").map((r) => r.heure)),
    create: async (data) => {
      const db = loadDb();
      if (db.rendezvous.some((r) => r.date === data.date && r.heure === data.heure && r.statut !== "refused")) {
        throw new Error("Ce créneau vient d'être pris, choisis-en un autre.");
      }
      const item = { ...data, id: newId("r"), reference: newRef(), statut: "pending", creeLe: new Date().toISOString() };
      db.rendezvous.unshift(item);
      saveDb(db);
      return wait(item);
    },
  },
  commandes: {
    ...statusApi("commandes"),
    create: async (data) => {
      const db = loadDb();
      const b = db.bracelets.find((x) => x.id === data.braceletId);
      if (!b) throw new Error("Bracelet introuvable.");
      const item = {
        ...data, id: newId("c"), reference: newRef(), braceletNom: b.nom, prixUnitaire: b.prix,
        total: b.prix * data.quantite, statut: "pending", creeLe: new Date().toISOString(),
      };
      db.commandes.unshift(item);
      saveDb(db);
      return wait(item);
    },
  },
  uploadImage: async (file) => { requireAdmin(); return resizeImage(file); },
  resetDemo: () => { storage.remove(DB_KEY); },
};

/* =============================== MODE API =============================== */
async function http(method, path, body) {
  const headers = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = body instanceof FormData;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(CONFIG.apiUrl.replace(/\/$/, "") + path, {
      method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new Error("Connexion impossible. Vérifie ta connexion internet.");
  }
  if (res.status === 401) logout();
  if (!res.ok) {
    let msg;
    try { msg = (await res.json()).message; } catch { /* pas de JSON */ }
    throw new Error(msg || `Erreur serveur (${res.status}).`);
  }
  if (res.status === 204) return null;
  const json = await res.json();
  // Accepte les réponses Laravel "API Resource" ({ data: ... }) ou brutes
  return json && typeof json === "object" && "data" in json && Object.keys(json).length <= 3 ? json.data : json;
}

const restCrud = (path) => ({
  list: () => http("GET", path),
  create: (data) => http("POST", path, data),
  update: (id, data) => http("PUT", `${path}/${id}`, data),
  remove: (id) => http("DELETE", `${path}/${id}`),
});
const restStatus = (path) => ({
  list: () => http("GET", path),
  create: (data) => http("POST", path, data),
  setStatus: (id, statut) => http("PATCH", `${path}/${id}`, { statut }),
  remove: (id) => http("DELETE", `${path}/${id}`),
});

const restApi = {
  mode: "api",
  login: async (password) => {
    const { token } = await http("POST", "/auth/login", { password });
    storage.set(TOKEN_KEY, token);
    return true;
  },
  piercings: restCrud("/piercings"),
  bracelets: restCrud("/bracelets"),
  galerie: restCrud("/galerie"),
  rendezvous: {
    ...restStatus("/rendezvous"),
    booked: (date) => http("GET", `/rendezvous/creneaux-pris?date=${encodeURIComponent(date)}`),
  },
  commandes: restStatus("/commandes"),
  uploadImage: async (file) => {
    const form = new FormData();
    form.append("image", file);
    const { url } = await http("POST", "/uploads", form);
    return url;
  },
  resetDemo: () => {},
};

const api = CONFIG.apiUrl ? restApi : demoApi;
export default api;
