import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/index.js";
import useSession from "../../components/useSession.js";
import Consentement from "../../components/Consentement.jsx";
import Icon from "../../components/Icon.jsx";
import { emailValide, telValide } from "../../lib/format.js";
import { motDePasseValide } from "../../api/index.js";
import { destination } from "./Connexion.jsx";

export default function Inscription() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const retour = params.get("retour");
  const { user } = useSession();
  const [f, setF] = useState({ nom: "", email: "", telephone: "", motDePasse: "", confirmation: "" });
  const [accord, setAccord] = useState(false);
  const [voir, setVoir] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  if (user && !envoi) return <Navigate to={destination(user, retour)} replace />;

  async function valider(e) {
    e.preventDefault();
    setErreur("");
    if (!f.nom.trim()) return setErreur("Écris ton nom.");
    if (!emailValide(f.email)) return setErreur("Adresse e-mail invalide.");
    if (!telValide(f.telephone)) return setErreur("Numéro de téléphone invalide (8 chiffres minimum, ex. 3712-3456).");
    if (!motDePasseValide(f.motDePasse)) return setErreur("Mot de passe trop faible : 8 caractères minimum, avec des lettres et des chiffres.");
    if (f.motDePasse !== f.confirmation) return setErreur("Les deux mots de passe ne sont pas identiques.");
    if (!accord) return setErreur("Coche la case d'accord pour créer ton compte.");
    setEnvoi(true);
    try {
      const u = await api.register(f);
      navigate(destination(u, retour), { replace: true });
    } catch (err) {
      setErreur(err.message);
      setEnvoi(false);
    }
  }

  return (
    <div className="container page narrow">
      <form className="card form auth" onSubmit={valider} noValidate>
        <div className="success-icon"><Icon name="user" size={32} /></div>
        <h1 className="page-title center">Créer un compte</h1>
        <p className="muted center">Pour suivre tes rendez-vous et commandes, sans retaper tes infos.</p>

        <label className="field">Nom<input value={f.nom} onChange={set("nom")} autoComplete="name" placeholder="Prénom Nom" /></label>
        <label className="field">E-mail<input type="email" value={f.email} onChange={set("email")} autoComplete="email" inputMode="email" placeholder="ton@email.com" /></label>
        <label className="field">Téléphone<input type="tel" value={f.telephone} onChange={set("telephone")} autoComplete="tel" inputMode="tel" placeholder="3712-3456" /></label>
        <label className="field">Mot de passe (8 caractères min., lettres + chiffres)
          <span className="password">
            <input type={voir ? "text" : "password"} value={f.motDePasse} onChange={set("motDePasse")} autoComplete="new-password" />
            <button type="button" className="link-gold" onClick={() => setVoir((v) => !v)}>{voir ? "Masquer" : "Afficher"}</button>
          </span>
        </label>
        <label className="field">Confirme le mot de passe
          <input type={voir ? "text" : "password"} value={f.confirmation} onChange={set("confirmation")} autoComplete="new-password" />
        </label>
        <Consentement checked={accord} onChange={setAccord} />

        {erreur && <p className="form-error">{erreur}</p>}
        <button className="btn btn-gold btn-block btn-lg" disabled={envoi}>{envoi ? "Création…" : "Créer mon compte"}</button>
        <p className="center">Déjà un compte ?{" "}
          <Link className="link-gold" to={`/connexion${retour ? `?retour=${encodeURIComponent(retour)}` : ""}`}>Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
