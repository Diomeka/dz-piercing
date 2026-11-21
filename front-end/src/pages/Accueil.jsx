import { Link } from "react-router-dom";
import CONFIG from "../config.js";
import api from "../api/index.js";
import useData from "../components/useData.jsx";
import { Logo } from "../components/Layout.jsx";
import Icon from "../components/Icon.jsx";
import { formatPrix, imageDe } from "../lib/format.js";

export default function Accueil() {
  const piercings = useData(() => api.piercings.list());
  const bracelets = useData(() => api.bracelets.list());

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${CONFIG.photoAccueil})` }}>
        <div className="hero-overlay" />
        <div className="container hero-content">
          <Logo size="xl" />
          <p className="hero-slogan">{CONFIG.slogan}</p>
          <div className="hero-actions">
            <Link to="/rendez-vous" className="btn btn-gold btn-lg">
              <Icon name="calendar" /> Prendre rendez-vous
            </Link>
            <Link to="/bracelets" className="btn btn-outline btn-lg">
              <Icon name="bag" /> Voir les bracelets
            </Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="atouts">
          <div className="atout"><span>✦</span><strong>Matériel stérile</strong><small>Usage unique</small></div>
          <div className="atout"><span>✦</span><strong>Bijoux de qualité</strong><small>Acier & titane</small></div>
          <div className="atout"><span>✦</span><strong>Conseils offerts</strong><small>Suivi des soins</small></div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2 className="title">Piercings populaires</h2>
          <Link to="/piercings" className="link-gold">Tout voir →</Link>
        </div>
        <div className="scroller">
          {(piercings.data || []).slice(0, 6).map((p) => (
            <Link key={p.id} to={`/rendez-vous?piercing=${p.id}`} className="mini-card">
              <img src={imageDe(p, "piercing")} alt={p.nom} loading="lazy" />
              <div><strong>{p.nom}</strong><span className="price">{formatPrix(p.prix)}</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2 className="title">La boutique bracelets</h2>
          <Link to="/bracelets" className="link-gold">Tout voir →</Link>
        </div>
        <div className="scroller">
          {(bracelets.data || []).filter((b) => b.disponible).slice(0, 6).map((b) => (
            <Link key={b.id} to="/bracelets" className="mini-card">
              <img src={imageDe(b, "bracelet")} alt={b.nom} loading="lazy" />
              <div><strong>{b.nom}</strong><span className="price">{formatPrix(b.prix)}</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="tiles">
          <Link to="/galerie" className="tile"><Icon name="image" size={30} /><strong>Galerie</strong><small>Mes réalisations</small></Link>
          <Link to="/soins" className="tile"><Icon name="heart" size={30} /><strong>Soins</strong><small>Bien cicatriser</small></Link>
          <Link to="/contact" className="tile"><Icon name="phone" size={30} /><strong>Contact</strong><small>WhatsApp, appel</small></Link>
        </div>
      </section>
    </>
  );
}
