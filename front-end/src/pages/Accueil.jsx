import { Link } from "react-router-dom";
import api from "../api/index.js";
import useData from "../components/useData.jsx";
import { Logo } from "../components/Layout.jsx";
import Icon from "../components/Icon.jsx";
import { formatPrix, imageDe } from "../lib/format.js";
import { useSite } from "../lib/site.js";

export default function Accueil() {
  const piercings = useData(() => api.piercings.list());
  const bracelets = useData(() => api.bracelets.list());
  const site = useSite(); // contenu modifiable dans l'admin (onglet Site)
  const menu = (id) => site.menus[id]?.visible !== false;
  const atouts = (site.accueil.atouts || []).filter((a) => a.titre?.trim());

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${site.accueil.photo || "hero.svg"})` }}>
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="hero-mark">
            {/* Cercle doré décoratif, toujours centré derrière le logo */}
            <svg className="hero-ring" viewBox="0 0 400 400" aria-hidden="true">
              <defs>
                <linearGradient id="heroOr" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#e3c35a" /><stop offset=".5" stopColor="#c19a2b" /><stop offset="1" stopColor="#8a6a12" />
                </linearGradient>
              </defs>
              <circle cx="200" cy="200" r="196" fill="none" stroke="#d4af37" strokeOpacity=".18" strokeWidth="1.5" />
              <g className="hero-ring-spin">
                <circle cx="200" cy="200" r="172" fill="none" stroke="url(#heroOr)" strokeWidth="7"
                  strokeLinecap="round" strokeDasharray="860 2000" transform="rotate(-60 200 200)" />
                <circle cx="200" cy="200" r="138" fill="none" stroke="url(#heroOr)" strokeOpacity=".45" strokeWidth="2.5"
                  strokeLinecap="round" strokeDasharray="420 2000" transform="rotate(110 200 200)" />
                {/* petite bille au bout de l'arc (angle -60° + longueur de l'arc) */}
                <circle cx={200 + 172 * Math.cos(((-60 + (860 / (2 * Math.PI * 172)) * 360) * Math.PI) / 180)}
                  cy={200 + 172 * Math.sin(((-60 + (860 / (2 * Math.PI * 172)) * 360) * Math.PI) / 180)}
                  r="11" fill="url(#heroOr)" />
              </g>
            </svg>
            <Logo size="xl" />
          </div>
          <p className="hero-slogan">{site.accueil.slogan}</p>
          <div className="hero-actions">
            {menu("rendez-vous") && (
              <Link to="/rendez-vous" className="btn btn-gold btn-lg">
                <Icon name="calendar" /> Prendre rendez-vous
              </Link>
            )}
            {menu("bracelets") && (
              <Link to="/bracelets" className="btn btn-outline btn-lg">
                <Icon name="bag" /> Voir les bracelets
              </Link>
            )}
          </div>
        </div>
      </section>

      {atouts.length > 0 && (
        <section className="container section">
          <div className="atouts" style={{ gridTemplateColumns: `repeat(${atouts.length}, 1fr)` }}>
            {atouts.map((a, i) => (
              <div key={i} className="atout"><span>✦</span><strong>{a.titre}</strong>{a.texte && <small>{a.texte}</small>}</div>
            ))}
          </div>
        </section>
      )}

      {site.accueil.afficherPiercings && menu("piercings") && <section className="container section">
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
      </section>}

      {site.accueil.afficherBracelets && menu("bracelets") && <section className="container section">
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
      </section>}

      <section className="container section">
        <div className="tiles">
          {menu("galerie") && <Link to="/galerie" className="tile"><Icon name="image" size={30} /><strong>Galerie</strong><small>Mes réalisations</small></Link>}
          {menu("soins") && <Link to="/soins" className="tile"><Icon name="heart" size={30} /><strong>Soins</strong><small>Bien cicatriser</small></Link>}
          {menu("contact") && <Link to="/contact" className="tile"><Icon name="phone" size={30} /><strong>Contact</strong><small>WhatsApp, appel</small></Link>}
        </div>
      </section>
    </>
  );
}
