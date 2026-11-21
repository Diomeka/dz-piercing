import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../api/index.js";
import useData, { Chargement, Erreur } from "../components/useData.jsx";
import Modal from "../components/Modal.jsx";
import Icon from "../components/Icon.jsx";
import { useToast } from "../components/Toast.jsx";
import Consentement from "../components/Consentement.jsx";
import { phrasePaiement } from "../components/Paiements.jsx";
import { useSite } from "../lib/site.js";
import { getUser } from "../api/index.js";
import { couleurHex, formatPrix, imageDe, lienWhatsApp, telValide } from "../lib/format.js";

export function Pastilles({ couleurs }) {
  return (
    <div className="swatches">
      {couleurs.map((c) => (
        <span key={c} className="swatch" style={{ background: couleurHex(c) }} title={c} aria-label={c} />
      ))}
    </div>
  );
}

function CommandeModal({ bracelet, onClose }) {
  const toast = useToast();
  const [couleur, setCouleur] = useState(bracelet.couleurs?.length === 1 ? bracelet.couleurs[0] : "");
  const [quantite, setQuantite] = useState(1);
  const site = useSite();
  const client = getUser()?.role === "client" ? getUser() : null; // compte connecté → champs pré-remplis
  const [nom, setNom] = useState(client?.nom || "");
  const [telephone, setTelephone] = useState(client?.telephone || "");
  const [message, setMessage] = useState("");
  const [accord, setAccord] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [confirmee, setConfirmee] = useState(null);

  async function valider(e) {
    e.preventDefault();
    setErreur("");
    if (bracelet.couleurs?.length && !couleur) return setErreur("Choisis une couleur.");
    if (!nom.trim()) return setErreur("Écris ton nom.");
    if (!telValide(telephone)) return setErreur("Numéro de téléphone invalide (8 chiffres minimum, ex. 3712-3456).");
    if (!accord) return setErreur("Coche la case d'accord pour envoyer ta commande.");
    setEnvoi(true);
    try {
      const c = await api.commandes.create({
        braceletId: bracelet.id, couleur, quantite, nom: nom.trim(), telephone: telephone.trim(), message: message.trim(),
      });
      setConfirmee(c);
      toast("Commande envoyée ✔");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  if (confirmee) {
    const texte = `Bonjour DZ PIERCING ! Je viens de commander : ${confirmee.quantite} × ${confirmee.braceletNom}` +
      `${confirmee.couleur ? ` (${confirmee.couleur})` : ""}. Référence ${confirmee.reference}. — ${confirmee.nom}`;
    return (
      <Modal title="Commande envoyée" onClose={onClose}>
        <div className="success">
          <div className="success-icon"><Icon name="check" size={36} /></div>
          <h3>Merci {confirmee.nom} !</h3>
          <p>Ta commande est bien enregistrée. Je te recontacte très vite au <strong>{confirmee.telephone}</strong> pour la confirmer.</p>
          <dl className="recap">
            <dt>Référence</dt><dd>{confirmee.reference}</dd>
            <dt>Bracelet</dt><dd>{confirmee.braceletNom}{confirmee.couleur ? ` — ${confirmee.couleur}` : ""}</dd>
            <dt>Quantité</dt><dd>{confirmee.quantite}</dd>
            <dt>Total</dt><dd className="price">{formatPrix(confirmee.total)}</dd>
          </dl>
          <a className="btn btn-whatsapp btn-block" href={lienWhatsApp(texte)} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" /> Me prévenir aussi sur WhatsApp
          </a>
          {client && <Link to="/compte" className="btn btn-outline btn-block" onClick={onClose}>Suivre dans mon compte</Link>}
          <button className="btn btn-outline btn-block" onClick={onClose}>Fermer</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`Commander : ${bracelet.nom}`} onClose={onClose}>
      <form onSubmit={valider} className="form">
        <div className="order-head">
          <img src={imageDe(bracelet, "bracelet")} alt="" />
          <div>
            <strong>{bracelet.nom}</strong>
            <span className="price">{formatPrix(bracelet.prix)}</span>
          </div>
        </div>

        {bracelet.couleurs?.length > 0 && (
          <fieldset>
            <legend>Couleur</legend>
            <div className="color-pick">
              {bracelet.couleurs.map((c) => (
                <label key={c} className={`color-opt ${couleur === c ? "active" : ""}`}>
                  <input type="radio" name="couleur" value={c} checked={couleur === c} onChange={() => setCouleur(c)} />
                  <span className="swatch" style={{ background: couleurHex(c) }} /> {c}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend>Quantité</legend>
          <div className="stepper">
            <button type="button" onClick={() => setQuantite((q) => Math.max(1, q - 1))} aria-label="Moins">−</button>
            <span>{quantite}</span>
            <button type="button" onClick={() => setQuantite((q) => Math.min(20, q + 1))} aria-label="Plus">+</button>
          </div>
        </fieldset>

        <label className="field">Ton nom<input value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" placeholder="Prénom Nom" /></label>
        <label className="field">Ton téléphone<input value={telephone} onChange={(e) => setTelephone(e.target.value)} type="tel" autoComplete="tel" inputMode="tel" placeholder="3712-3456" /></label>
        <label className="field">Message (facultatif)<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Taille du poignet, livraison ou retrait…" /></label>

        <Consentement checked={accord} onChange={setAccord} />
        {erreur && <p className="form-error">{erreur}</p>}

        <div className="total-row"><span>Total</span><strong className="price price-lg">{formatPrix(bracelet.prix * quantite)}</strong></div>
        <button className="btn btn-gold btn-block btn-lg" disabled={envoi}>{envoi ? "Envoi…" : "Confirmer la commande"}</button>
        {phrasePaiement(site) && <p className="muted small center">Paiement par {phrasePaiement(site)}, au retrait ou à la livraison.</p>}
      </form>
    </Modal>
  );
}

export default function Bracelets() {
  const { data, loading, error, reload } = useData(() => api.bracelets.list());
  const [choisi, setChoisi] = useState(null);

  return (
    <div className="container page">
      <h1 className="page-title">Bracelets</h1>
      <p className="page-sub">Bijoux sélectionnés par DZ. Commande en ligne, retrait en boutique ou livraison.</p>

      {loading && <Chargement />}
      {error && <Erreur error={error} onRetry={reload} />}

      {data && (
        <div className="grid grid-shop">
          {data.map((b) => (
            <article key={b.id} className={`card product ${!b.disponible ? "out" : ""}`}>
              <div className="img-wrap">
                <img src={imageDe(b, "bracelet")} alt={b.nom} loading="lazy" />
                {!b.disponible && <span className="ribbon">Épuisé</span>}
              </div>
              <div className="product-body">
                <h3>{b.nom}</h3>
                <span className="price price-lg">{formatPrix(b.prix)}</span>
                {b.description && <p className="small">{b.description}</p>}
                {b.couleurs?.length > 0 && <Pastilles couleurs={b.couleurs} />}
                <button className="btn btn-gold btn-block" disabled={!b.disponible} onClick={() => setChoisi(b)}>
                  {b.disponible ? "Commander" : "Indisponible"}
                </button>
              </div>
            </article>
          ))}
          {data.length === 0 && <div className="card empty">La boutique arrive bientôt !</div>}
        </div>
      )}

      {choisi && <CommandeModal bracelet={choisi} onClose={() => setChoisi(null)} />}
    </div>
  );
}
