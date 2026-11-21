import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import api, { logout } from "../../api/index.js";
import useData from "../../components/useData.jsx";
import useSession from "../../components/useSession.js";
import Icon from "../../components/Icon.jsx";
import ErrorBoundary from "../../components/ErrorBoundary.jsx";
import { Logo } from "../../components/Layout.jsx";
import { useToast } from "../../components/Toast.jsx";
import CONFIG from "../../config.js";
import Demandes from "./Demandes.jsx";
import Catalogue from "./Catalogue.jsx";
import GalerieAdmin from "./GalerieAdmin.jsx";
import Reglages from "./Reglages.jsx";

const ONGLETS = [
  { id: "rdv", label: "RDV" },
  { id: "commandes", label: "Commandes" },
  { id: "piercings", label: "Piercings" },
  { id: "bracelets", label: "Bracelets" },
  { id: "galerie", label: "Galerie" },
  { id: "reglages", label: "Site" },
];

/**
 * INTERFACE ADMIN — séparée du site client (pas de menus clients).
 * Accès : se connecter sur le site (page Connexion) avec le compte admin.
 */
export default function Admin() {
  const toast = useToast();
  const { user, isAdmin } = useSession();
  const [params, setParams] = useSearchParams();
  const onglet = ONGLETS.some((o) => o.id === params.get("onglet")) ? params.get("onglet") : "rdv";

  useEffect(() => {
    document.title = `Admin — ${CONFIG.nomBoutique}`;
  }, []);

  // "tick" : chaque incrément recharge les demandes et les compteurs
  // (bouton Actualiser, après une action, et automatiquement toutes les minutes)
  const [tick, setTick] = useState(0);
  const actualiser = () => setTick((t) => t + 1);
  useEffect(() => {
    if (!isAdmin) return;
    const minuteur = setInterval(actualiser, 60_000);
    return () => clearInterval(minuteur);
  }, [isAdmin]);

  const compteurs = useData(async () => {
    if (!isAdmin) return {};
    const enAttente = (liste) => liste.filter((x) => x.statut === "pending").length;
    const [rdv, commandes] = await Promise.all([api.rendezvous.list(), api.commandes.list()]);
    return { rdv: enAttente(rdv), commandes: enAttente(commandes) };
  }, [isAdmin, tick]);
  const nb = compteurs.data || {};

  // Pas admin (pas connecté, ou client) → page de connexion du site
  if (!user) return <Navigate to="/connexion?retour=/admin" replace />;
  if (!isAdmin) return <Navigate to="/compte" replace />;

  const deconnexion = () => { logout(); toast("Déconnecté"); };
  // Si le serveur répond 401, la session est effacée : la redirection se fait toute seule
  const surErreur = (err) => toast(err.message, "error");

  return (
    <div className="app admin-app">
      <header className="topbar admin-bar">
        <div className="container topbar-inner">
          <Link to="/admin" className="admin-brand" aria-label="Tableau de bord admin">
            <Logo />
            <span className="admin-tag">ADMIN</span>
          </Link>
          <div className="admin-head-actions">
            <Link to="/" className="btn btn-gold btn-sm"><Icon name="home" size={18} /> Voir le site</Link>
            <button className="btn btn-outline btn-sm" onClick={deconnexion}>Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="container page admin">
        <ErrorBoundary>
          <div className="admin-head">
            <h1 className="page-title">Tableau de bord</h1>
            <button className="btn btn-outline btn-sm" onClick={() => { actualiser(); toast("Actualisé ✔"); }}>↻ Actualiser</button>
          </div>
          {api.mode === "demo" && (
            <p className="notice small">
              Mode démo : les données sont enregistrées uniquement sur cet appareil.
              Elles seront partagées en ligne quand le backend sera branché.{" "}
              <button className="link-gold" onClick={() => {
                if (confirm("Remettre toutes les données d'exemple ? Tes modifications seront effacées.")) {
                  api.resetDemo(); location.reload();
                }
              }}>Réinitialiser la démo</button>
            </p>
          )}

          <div className="tabs" role="tablist">
            {ONGLETS.map((o) => (
              <button key={o.id} role="tab" aria-selected={onglet === o.id}
                className={`tab ${onglet === o.id ? "active" : ""}`} onClick={() => setParams({ onglet: o.id })}>
                {o.label}
                {nb[o.id] > 0 && <span className="tab-count" aria-label={`${nb[o.id]} en attente`}>{nb[o.id]}</span>}
              </button>
            ))}
          </div>

          {onglet === "rdv" && <Demandes key="rdv" type="rendezvous" tick={tick} onChange={actualiser} onError={surErreur} />}
          {onglet === "commandes" && <Demandes key="cmd" type="commandes" tick={tick} onChange={actualiser} onError={surErreur} />}
          {onglet === "piercings" && <Catalogue key="p" type="piercings" onError={surErreur} />}
          {onglet === "bracelets" && <Catalogue key="b" type="bracelets" onError={surErreur} />}
          {onglet === "galerie" && <GalerieAdmin onError={surErreur} />}
          {onglet === "reglages" && <Reglages onChange={actualiser} onError={surErreur} />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
