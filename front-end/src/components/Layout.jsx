import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import CONFIG from "../config.js";
import Icon from "./Icon.jsx";

const PRINCIPAUX = [
  { to: "/", label: "Accueil", icon: "home", end: true },
  { to: "/piercings", label: "Piercings", icon: "needle" },
  { to: "/bracelets", label: "Bracelets", icon: "bag" },
  { to: "/rendez-vous", label: "RDV", icon: "calendar" },
];
const SECONDAIRES = [
  { to: "/galerie", label: "Galerie", icon: "image" },
  { to: "/soins", label: "Soins après piercing", icon: "heart" },
  { to: "/contact", label: "Contact", icon: "phone" },
];

export function Logo({ size = "md" }) {
  return (
    <span className={`logo logo-${size}`}>
      <span className="logo-dz">DZ</span>
      <span className="logo-txt">PIERCING</span>
    </span>
  );
}

export default function Layout() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setMenuOuvert(false);
  }, [pathname]);
  const surSecondaire = SECONDAIRES.some((l) => pathname.startsWith(l.to)) || pathname.startsWith("/admin");

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" aria-label="Accueil DZ PIERCING"><Logo /></Link>
          <nav className="desk-nav" aria-label="Navigation principale">
            {[...PRINCIPAUX, ...SECONDAIRES].map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>{l.label === "Soins après piercing" ? "Soins" : l.label}</NavLink>
            ))}
          </nav>
          <Link to="/rendez-vous" className="btn btn-gold btn-sm desk-only">Prendre RDV</Link>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <Logo size="sm" />
          <p>{CONFIG.adresse}</p>
          <p className="footer-links">
            <a href={CONFIG.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href={CONFIG.tiktok} target="_blank" rel="noreferrer">TikTok</a>
            <Link to="/admin">Espace admin</Link>
          </p>
          <p className="muted small">© {new Date().getFullYear()} {CONFIG.nomBoutique}</p>
        </div>
      </footer>

      {/* Barre du bas (mobile) */}
      <nav className="bottom-nav" aria-label="Navigation mobile">
        {PRINCIPAUX.map((l) => (
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
            {SECONDAIRES.map((l) => (
              <NavLink key={l.to} to={l.to} className="sheet-link">
                <Icon name={l.icon} /> {l.label}
              </NavLink>
            ))}
            <NavLink to="/admin" className="sheet-link sheet-admin">
              <Icon name="lock" /> Espace admin
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
}
