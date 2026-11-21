import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/index.js";
import useSession from "../../components/useSession.js";
import Icon from "../../components/Icon.jsx";
import { lienWhatsApp } from "../../lib/format.js";

/** Pages où l'on peut revenir après connexion (liste fermée : pas de redirection vers un autre site) */
const RETOURS_OK = ["/compte", "/rendez-vous", "/bracelets", "/piercings"];

/** Destination après connexion : l'admin va dans l'admin, le client dans son compte. */
export const destination = (user, retour) =>
  user?.role === "admin" ? "/admin" : RETOURS_OK.includes(retour) ? retour : "/compte";

export default function Connexion() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const retour = params.get("retour");
  const { user } = useSession();
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [voir, setVoir] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  if (user && !envoi) return <Navigate to={destination(user, retour)} replace />;

  async function valider(e) {
    e.preventDefault();
    setErreur("");
    if (!email.trim() || !mdp) return setErreur("Écris ton e-mail et ton mot de passe.");
    setEnvoi(true);
    try {
      const u = await api.login(email, mdp);
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
        <h1 className="page-title center">Connexion</h1>
        <p className="muted center">Retrouve tes rendez-vous et tes commandes.</p>

        <label className="field">E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" placeholder="ton@email.com" />
        </label>
        <label className="field">Mot de passe
          <span className="password">
            <input type={voir ? "text" : "password"} value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="current-password" />
            <button type="button" className="link-gold" onClick={() => setVoir((v) => !v)}>{voir ? "Masquer" : "Afficher"}</button>
          </span>
        </label>

        {erreur && <p className="form-error">{erreur}</p>}
        <button className="btn btn-gold btn-block btn-lg" disabled={envoi}>{envoi ? "Connexion…" : "Se connecter"}</button>

        <p className="center">Pas encore de compte ?{" "}
          <Link className="link-gold" to={`/inscription${retour ? `?retour=${encodeURIComponent(retour)}` : ""}`}>Créer un compte</Link>
        </p>
        <p className="center small">
          <a className="link-gold" href={lienWhatsApp("Bonjour, j'ai oublié le mot de passe de mon compte DZ PIERCING.")} target="_blank" rel="noreferrer">
            Mot de passe oublié ?
          </a>
        </p>
      </form>
    </div>
  );
}
