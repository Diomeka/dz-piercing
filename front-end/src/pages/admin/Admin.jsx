import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { isLoggedIn, logout } from "../../api/index.js";
import Icon from "../../components/Icon.jsx";
import { useToast } from "../../components/Toast.jsx";
import Demandes from "./Demandes.jsx";
import Catalogue from "./Catalogue.jsx";
import GalerieAdmin from "./GalerieAdmin.jsx";

const ONGLETS = [
  { id: "rdv", label: "Rendez-vous" },
  { id: "commandes", label: "Commandes" },
  { id: "piercings", label: "Piercings" },
  { id: "bracelets", label: "Bracelets" },
  { id: "galerie", label: "Galerie" },
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
        <button className="btn btn-outline btn-sm" onClick={deconnexion}>Déconnexion</button>
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
          </button>
        ))}
      </div>

      {onglet === "rdv" && <Demandes key="rdv" type="rendezvous" onError={surErreur} />}
      {onglet === "commandes" && <Demandes key="cmd" type="commandes" onError={surErreur} />}
      {onglet === "piercings" && <Catalogue key="p" type="piercings" onError={surErreur} />}
      {onglet === "bracelets" && <Catalogue key="b" type="bracelets" onError={surErreur} />}
      {onglet === "galerie" && <GalerieAdmin onError={surErreur} />}
    </div>
  );
}
