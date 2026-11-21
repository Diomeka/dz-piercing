import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { isLoggedIn, logout } from "../../api/index.js";
import useData from "../../components/useData.jsx";
import Icon from "../../components/Icon.jsx";
import { useToast } from "../../components/Toast.jsx";
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
  { id: "reglages", label: "Réglages" },
];

function Connexion({ onOk }) {
  const [mdp, setMdp] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function valider(e) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      await api.login(mdp);
      onOk();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="container page narrow">
      <form className="card form login" onSubmit={valider}>
        <div className="success-icon"><Icon name="lock" size={32} /></div>
        <h1 className="page-title center">Espace admin</h1>
        <label className="field">Mot de passe
          <input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="current-password" autoFocus />
        </label>
        {erreur && <p className="form-error">{erreur}</p>}
        <button className="btn btn-gold btn-block btn-lg" disabled={envoi || !mdp}>{envoi ? "Connexion…" : "Se connecter"}</button>
        {api.mode === "demo" && <p className="muted small center">Mode démo : le mot de passe se trouve dans src/config.js (motDePasseDemo).</p>}
      </form>
    </div>
  );
}

export default function Admin() {
  const toast = useToast();
  const [connecte, setConnecte] = useState(isLoggedIn());
  const [params, setParams] = useSearchParams();
  const onglet = ONGLETS.some((o) => o.id === params.get("onglet")) ? params.get("onglet") : "rdv";

  // "tick" : chaque incrément recharge les demandes et les compteurs
  // (bouton Actualiser, après une action, et automatiquement toutes les minutes)
  const [tick, setTick] = useState(0);
  const actualiser = () => setTick((t) => t + 1);
  useEffect(() => {
    if (!connecte) return;
    const minuteur = setInterval(actualiser, 60_000);
    return () => clearInterval(minuteur);
  }, [connecte]);

  const compteurs = useData(async () => {
    if (!connecte) return {};
    const enAttente = (liste) => liste.filter((x) => x.statut === "pending").length;
    const [rdv, commandes] = await Promise.all([api.rendezvous.list(), api.commandes.list()]);
    return { rdv: enAttente(rdv), commandes: enAttente(commandes) };
  }, [connecte, tick]);
  const nb = compteurs.data || {};

  if (!connecte) return <Connexion onOk={() => setConnecte(true)} />;

  const deconnexion = () => { logout(); setConnecte(false); toast("Déconnecté"); };
  // Si le serveur répond 401, le jeton est effacé : on renvoie vers la connexion
  const surErreur = (err) => {
    if (!isLoggedIn()) setConnecte(false);
    toast(err.message, "error");
  };

  return (
    <div className="container page admin">
      <div className="admin-head">
        <h1 className="page-title">Admin</h1>
        <div className="admin-head-actions">
          <button className="btn btn-outline btn-sm" onClick={() => { actualiser(); toast("Actualisé ✔"); }}>↻ Actualiser</button>
          <button className="btn btn-outline btn-sm" onClick={deconnexion}>Déconnexion</button>
        </div>
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
    </div>
  );
}
