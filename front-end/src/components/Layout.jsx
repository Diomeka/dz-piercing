import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import CONFIG from "../config.js";
import { PAGES_MENU, useSite } from "../lib/site.js";
import Icon from "./Icon.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import LiensReseaux from "./Reseaux.jsx";
import Paiements from "./Paiements.jsx";
import useSession from "./useSession.js";

export function Logo({ size = "md" }) {
  return (
    <span className={`logo logo-${size}`}>
      <span className="logo-dz">DZ</span>
      <span className="logo-txt">PIERCING</span>
    </span>
  );
}

const TITRES = {
  "/": null,
  "/piercings": "Piercings",
  "/braces": "Braces",
  "/rendez-vous": "Prendre rendez-vous",
  "/galerie": "Galerie",
  "/soins": "Soins après piercing",
  "/contact": "Contact",
  "/confidentialite": "Mentions légales",
  "/connexion": "Connexion",
  "/inscription": "Créer un compte",
  "/compte": "Mon compte",
};

/** Bouton du compte en haut à droite : Connexion / Mon compte / Admin (si admin). */
function BoutonCompte({ compact }) {
  const { user, isAdmin } = useSession();
  const [to, label, icon] = isAdmin
    ? ["/admin", "Admin", "lock"]
    : user ? ["/compte", "Mon compte", "user"] : ["/connexion", "Connexion", "user"];
  return (
    <Link to={to} className={`btn btn-outline btn-sm compte-btn ${compact ? "compte-btn-compact" : ""}`} aria-label={label}>
      <Icon name={icon} size={18} /> <span>{label}</span>
    </Link>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const site = useSite();

  // Menus choisis par l'admin (onglet Site → Menus)
  const pages = PAGES_MENU.filter((p) => site.menus[p.id]?.visible !== false).map((p) => ({
    ...p, label: site.menus[p.id]?.label?.trim() || p.label,
  }));
  const principaux = [{ id: "accueil", to: "/", label: "Accueil", icon: "home", end: true }, ...pages.filter((p) => p.principal)];
  const secondaires = pages.filter((p) => !p.principal);
  const rdvVisible = pages.some((p) => p.id === "rendez-vous");

  // Titre de l'onglet du navigateur (et de l'historique) selon la page
  useEffect(() => {
    const t = pathname in TITRES ? TITRES[pathname] : "Page introuvable";
    document.title = t ? `${t} — ${CONFIG.nomBoutique}` : `${CONFIG.nomBoutique} — Piercings & braces`;
  }, [pathname]);
  // On retient sur quelle page le menu a été ouvert : il se ferme tout seul en changeant de page
  const [menuOuvertSur, setMenuOuvertSur] = useState(null);
  const menuOuvert = menuOuvertSur === pathname;
  const setMenuOuvert = (ouvert) => setMenuOuvertSur(ouvert ? pathname : null);
  const surSecondaire = secondaires.some((l) => pathname.startsWith(l.to))
    || ["/compte", "/connexion", "/inscription"].includes(pathname);

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" aria-label="Accueil DZ PIERCING"><Logo /></Link>
          <nav className="desk-nav" aria-label="Navigation principale">
            {[...principaux, ...secondaires].map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>{l.id === "soins" && l.label === "Soins après piercing" ? "Soins" : l.label}</NavLink>
            ))}
          </nav>
          <div className="topbar-actions">
            <BoutonCompte />
            {rdvVisible && <Link to="/rendez-vous" className="btn btn-gold btn-sm desk-only">Prendre RDV</Link>}
          </div>
        </div>
      </header>

      <main className="main">
        {/* key = page : changer de page efface l'erreur ; le menu reste utilisable */}
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className="footer">
        <div className="container">
          <Logo size="sm" />
          <p>{site.contact.adresse}</p>
          <LiensReseaux className="footer-reseaux" />
          <Paiements className="footer-paiements" />
          <p className="footer-links">
            <Link to="/confidentialite">Mentions légales & confidentialité</Link>
          </p>
          <p className="muted small">© {new Date().getFullYear()} {CONFIG.nomBoutique}</p>
        </div>
      </footer>

      {/* Barre du bas (mobile) */}
      <nav className="bottom-nav" aria-label="Navigation mobile" style={{ gridTemplateColumns: `repeat(${principaux.length + 1}, 1fr)` }}>
        {principaux.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            <Icon name={l.icon} />
            <span>{l.label}</span>
          </NavLink>
        ))}
        <button className={surSecondaire ? "active" : ""} onClick={() => setMenuOuvert(true)} aria-label="Plus de pages">
          <Icon name="menu" />
          <span>Plus</span>
        </button>
      </nav>

      {menuOuvert && (
        <div className="sheet-backdrop" onClick={() => setMenuOuvert(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            {secondaires.map((l) => (
              <NavLink key={l.to} to={l.to} className="sheet-link">
                <Icon name={l.icon} /> {l.label}
              </NavLink>
            ))}
            <SheetCompte />
          </div>
        </div>
      )}
    </div>
  );
}

function SheetCompte() {
  const { user, isAdmin } = useSession();
  if (isAdmin) return <NavLink to="/admin" className="sheet-link sheet-sep"><Icon name="lock" /> Interface admin</NavLink>;
  return user
    ? <NavLink to="/compte" className="sheet-link sheet-sep"><Icon name="user" /> Mon compte</NavLink>
    : <NavLink to="/connexion" className="sheet-link sheet-sep"><Icon name="user" /> Connexion / Créer un compte</NavLink>;
}
