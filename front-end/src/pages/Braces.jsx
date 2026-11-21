import { Link } from "react-router-dom";
import api from "../api/index.js";
import useData, { Chargement, Erreur } from "../components/useData.jsx";
import Icon from "../components/Icon.jsx";
import { phrasePaiement } from "../components/Paiements.jsx";
import { couleurHex, formatPrix, imageDe } from "../lib/format.js";
import { useSite } from "../lib/site.js";

export function Pastilles({ couleurs }) {
  return (
    <div className="swatches">
      {couleurs.map((c) => (
        <span key={c} className="swatch" style={{ background: couleurHex(c) }} title={c} aria-label={c} />
      ))}
    </div>
  );
}

/** Braces de mode : le client choisit son modèle puis réserve la pose au salon. */
export default function Braces() {
  const { data, loading, error, reload } = useData(() => api.braces.list());
  const site = useSite();
  const paiement = phrasePaiement(site);

  return (
    <div className="container page">
      <h1 className="page-title">Braces</h1>
      <p className="page-sub">Choisis ton modèle et ta couleur, puis réserve ta pose au salon.</p>

      {loading && <Chargement />}
      {error && <Erreur error={error} onRetry={reload} />}

      {data && (
        <div className="grid grid-shop">
          {data.map((b) => (
            <article key={b.id} className={`card product ${!b.disponible ? "out" : ""}`}>
              <div className="img-wrap">
                <img src={imageDe(b, "braces")} alt={b.nom} loading="lazy" />
                {!b.disponible && <span className="ribbon">Indisponible</span>}
              </div>
              <div className="product-body">
                <h3>{b.nom}</h3>
                <span className="price price-lg">{formatPrix(b.prix)}</span>
                {b.description && <p className="small">{b.description}</p>}
                {b.duree ? <p className="meta"><span><Icon name="clock" size={16} /> Pose : environ {b.duree} min</span></p> : null}
                {b.couleurs?.length > 0 && <Pastilles couleurs={b.couleurs} />}
                {b.disponible
                  ? <Link to={`/rendez-vous?braces=${encodeURIComponent(b.id)}`} className="btn btn-gold btn-block"><Icon name="calendar" /> Réserver la pose</Link>
                  : <button className="btn btn-gold btn-block" disabled>Indisponible</button>}
              </div>
            </article>
          ))}
          {data.length === 0 && <div className="card empty">Les modèles arrivent bientôt !</div>}
        </div>
      )}

      <section className="card section braces-info">
        <h2 className="title-sm">Bon à savoir</h2>
        <ul>
          <li>Pose au salon, sur rendez-vous, avec du matériel propre et adapté.</li>
          <li>Ce sont des <strong>braces décoratifs</strong> : ils ne corrigent pas l'alignement des dents.
            Pour un vrai traitement, il faut consulter un dentiste ou un orthodontiste.</li>
          <li>En cas de douleur, de saignement ou d'irritation : contacte-nous et consulte un dentiste.</li>
          {paiement && <li>Paiement au salon par {paiement}.</li>}
        </ul>
        <Link to="/soins" className="link-gold">Conseils d'entretien des braces →</Link>
      </section>
    </div>
  );
}
