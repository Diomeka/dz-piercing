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
import { egal, empreinteMotDePasse, nouveauSel } from "../lib/motdepasse.js";

const DB_KEY = "dz_piercing_db_v1";
const SESSION_KEY = "dz_session";
const TOKEN_KEY = "dz_admin_token"; // ancienne clé (avant les comptes) — effacée au démarrage

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

/* ---------------------------------------------------------------------------
   SESSION : { token, user: { id, nom, email, telephone, role: "admin"|"client" } }
   Une seule connexion pour tout le monde : le rôle décide où l'on arrive
   (admin → interface admin, client → « Mon compte »).
   --------------------------------------------------------------------------- */
const listeners = new Set();
function lireSession() {
  try { return JSON.parse(storage.get(SESSION_KEY) || "null"); } catch { return null; }
}
let session = lireSession();
storage.remove(TOKEN_KEY); // ancienne version (mot de passe seul) : on repart propre

function setSession(s) {
  session = s;
  if (s) storage.set(SESSION_KEY, JSON.stringify(s));
  else storage.remove(SESSION_KEY);
  listeners.forEach((fn) => fn());
}
/** Pour React (useSyncExternalStore) : être prévenu quand on se connecte / déconnecte */
export const onSessionChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const getSession = () => session;
export const getToken = () => session?.token || null;
export const getUser = () => session?.user || null;
export const isLoggedIn = () => !!getToken();
export const isAdmin = () => getUser()?.role === "admin";
export const isClient = () => getUser()?.role === "client";
export const logout = () => setSession(null);

/* =============================== MODE DÉMO =============================== */
function loadDb() {
  const raw = storage.get(DB_KEY);
  if (raw) {
    try {
      const db = JSON.parse(raw);
      // nouvelles collections ajoutées depuis (ex. utilisateurs) : on complète
      for (const k of Object.keys(SEED)) if (!(k in db)) db[k] = structuredClone(SEED[k]);
      return db;
    } catch { /* données corrompues : on repart de zéro */ }
  }
  const db = structuredClone(SEED);
  storage.set(DB_KEY, JSON.stringify(db));
  return db;
}

/* --- Mots de passe (MODE DÉMO) : uniquement des empreintes salées, jamais le mot de passe --- */
const sansMotDePasse = ({ mdp: _mdp, sel: _sel, ...u }) => u;
const normEmail = (e) => String(e || "").trim().toLowerCase();
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mot de passe acceptable : 8 caractères minimum, avec au moins une lettre et un chiffre. */
export function motDePasseValide(m) {
  const s = String(m || "");
  return s.length >= 8 && /[A-Za-zÀ-ÿ]/.test(s) && /\d/.test(s);
}

/* --- Anti « devinette » : après 5 erreurs, connexion bloquée 1 minute --- */
const ESSAIS_KEY = "dz_essais";
const MAX_ESSAIS = 5;
const BLOCAGE_MS = 60_000;
function verifierBlocage() {
  let e;
  try { e = JSON.parse(storage.get(ESSAIS_KEY) || "null"); } catch { e = null; }
  if (e && e.jusqua > Date.now()) {
    const s = Math.ceil((e.jusqua - Date.now()) / 1000);
    throw new Error(`Trop d'essais. Réessaie dans ${s} seconde${s > 1 ? "s" : ""}.`);
  }
}
function noterEchec() {
  let e;
  try { e = JSON.parse(storage.get(ESSAIS_KEY) || "null") || { n: 0 }; } catch { e = { n: 0 }; }
  e.n = (e.jusqua && e.jusqua <= Date.now() ? 0 : e.n) + 1;
  e.jusqua = e.n >= MAX_ESSAIS ? Date.now() + BLOCAGE_MS : 0;
  if (e.n >= MAX_ESSAIS) e.n = 0;
  storage.set(ESSAIS_KEY, JSON.stringify(e));
}
const oublierEchecs = () => storage.remove(ESSAIS_KEY);
const saveDb = (db) => storage.set(DB_KEY, JSON.stringify(db));
const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 120));
const newId = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const newRef = () => "DZ-" + Math.random().toString(36).slice(2, 7).toUpperCase();

function requireAdmin() {
  if (!isAdmin()) throw new Error("Accès réservé à l'administrateur. Reconnecte-toi.");
}
function requireClient() {
  if (!isClient()) throw new Error("Connecte-toi à ton compte.");
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
  /** Connexion unique (admin OU client). Renvoie l'utilisateur ({ role, … }). */
  login: async (email, motDePasse) => {
    await wait(null);
    verifierBlocage();
    const e = normEmail(email);
    const mdp = String(motDePasse || "");
    const admin = CONFIG.adminDemo || {};
    if (e === normEmail(admin.email) && admin.sel && egal(empreinteMotDePasse(mdp, admin.sel), admin.empreinte)) {
      oublierEchecs();
      const user = { id: "admin", nom: "Admin", email: e, role: "admin" };
      setSession({ token: "demo:admin", user });
      return user;
    }
    const u = loadDb().utilisateurs.find((x) => x.email === e);
    if (!u || !u.sel || !egal(empreinteMotDePasse(mdp, u.sel), u.mdp)) {
      noterEchec();
      throw new Error("E-mail ou mot de passe incorrect.");
    }
    oublierEchecs();
    const user = sansMotDePasse(u);
    setSession({ token: `demo:${u.id}`, user });
    return user;
  },
  /** Création d'un compte client, puis connexion automatique. */
  register: async ({ nom, email, telephone, motDePasse }) => {
    await wait(null);
    const e = normEmail(email);
    if (!String(nom || "").trim()) throw new Error("Écris ton nom.");
    if (!EMAIL_OK.test(e)) throw new Error("Adresse e-mail invalide.");
    if (!motDePasseValide(motDePasse)) throw new Error("Mot de passe trop faible : 8 caractères minimum, avec des lettres et des chiffres.");
    const db = loadDb();
    if (e === normEmail(CONFIG.adminDemo?.email) || db.utilisateurs.some((x) => x.email === e)) {
      throw new Error("Un compte existe déjà avec cet e-mail. Connecte-toi.");
    }
    const sel = nouveauSel();
    const u = {
      id: newId("u"), nom: String(nom).trim().slice(0, 80), email: e, telephone: String(telephone || "").trim().slice(0, 30),
      role: "client", sel, mdp: empreinteMotDePasse(String(motDePasse), sel), creeLe: new Date().toISOString(),
    };
    db.utilisateurs.push(u);
    saveDb(db);
    const user = sansMotDePasse(u);
    setSession({ token: `demo:${u.id}`, user });
    return user;
  },
  /** Espace client : uniquement SES rendez-vous. */
  moi: {
    rendezvous: async () => { requireClient(); return wait(loadDb().rendezvous.filter((r) => r.clientId === getUser().id)); },
  },
  piercings: crud("piercings", "p"),
  braces: crud("braces", "br"),
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
      // Prestation : un piercing OU des braces (pose au salon). Le nom est repris de la base.
      const type = data.prestationType === "braces" ? "braces" : "piercing";
      const p = (type === "braces" ? db.braces : db.piercings).find((x) => x.id === data.prestationId);
      if (!p) throw new Error("Prestation introuvable, choisis-en une autre.");
      if (type === "braces" && p.disponible === false) throw new Error("Ce modèle de braces n'est pas disponible pour le moment.");
      if (type === "braces" && p.couleurs?.length && !p.couleurs.includes(data.couleur)) throw new Error("Choisis une couleur.");
      const item = {
        ...data, prestationType: type, prestationNom: p.nom, couleur: type === "braces" ? data.couleur || "" : "",
        id: newId("r"), reference: newRef(), statut: "pending", creeLe: new Date().toISOString(),
        clientId: isClient() ? getUser().id : null, // relié au compte si le client est connecté
      };
      db.rendezvous.unshift(item);
      saveDb(db);
      return wait(item);
    },
  },
  // Réglages du site (devise…). Lecture publique, modification admin.
  reglages: {
    get: async () => wait({ devise: CONFIG.devise, ...(loadDb().reglages || {}) }),
    update: async (data) => {
      requireAdmin();
      const db = loadDb();
      db.reglages = { ...(db.reglages || {}), ...data };
      saveDb(db);
      return wait({ devise: CONFIG.devise, ...db.reglages });
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
  login: async (email, motDePasse) => {
    const { token, user } = await http("POST", "/auth/login", { email: normEmail(email), password: motDePasse });
    setSession({ token, user });
    return user;
  },
  register: async ({ nom, email, telephone, motDePasse }) => {
    const { token, user } = await http("POST", "/auth/register", {
      nom: String(nom || "").trim(), email: normEmail(email), telephone, password: motDePasse,
    });
    setSession({ token, user });
    return user;
  },
  moi: {
    rendezvous: () => http("GET", "/moi/rendezvous"),
  },
  piercings: restCrud("/piercings"),
  braces: restCrud("/braces"),
  galerie: restCrud("/galerie"),
  rendezvous: {
    ...restStatus("/rendezvous"),
    booked: (date) => http("GET", `/rendezvous/creneaux-pris?date=${encodeURIComponent(date)}`),
  },
  reglages: {
    get: () => http("GET", "/reglages"),
    update: (data) => http("PUT", "/reglages", data),
  },
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
