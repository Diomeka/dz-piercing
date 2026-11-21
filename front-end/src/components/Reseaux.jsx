import { RESEAUX, lienComplet, useSite } from "../lib/site.js";
import { lienWhatsApp } from "../lib/format.js";

/** Logos simplifiés des réseaux (dessinés en SVG, couleur = currentColor). */
const LOGOS = {
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </g>
  ),
  tiktok: (
    <path fill="currentColor" d="M16.6 3c.4 2.3 1.8 3.8 4 4.1v3.2c-1.5 0-2.9-.5-4-1.2v6.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.2a2.4 2.4 0 1 0 1.5 2.3V3h3.2z" />
  ),
  facebook: (
    <path fill="currentColor" d="M13.6 21v-7.4h2.5l.4-3h-2.9V8.8c0-.9.3-1.5 1.5-1.5h1.5V4.6c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.3H8.2v3h2.5V21h2.9z" />
  ),
  snapchat: (
    <path fill="currentColor" d="M12 3.2c2.9 0 4.9 2.1 4.9 5v2.2l1.5-.5c.7-.2 1.2.7.5 1.1l-1.8 1.1c.6 1.5 1.7 2.6 3.2 3.1.5.2.4.9-.1 1l-1.7.4-.4 1.3-1.8-.2c-1 0-1.8 1.4-4.3 1.4s-3.3-1.4-4.3-1.4l-1.8.2-.4-1.3-1.7-.4c-.5-.1-.6-.8-.1-1 1.5-.5 2.6-1.6 3.2-3.1L5.1 11c-.7-.4-.2-1.3.5-1.1l1.5.5V8.2c0-2.9 2-5 4.9-5z" />
  ),
  whatsapp: (
    <path fill="currentColor" d="M12 2.5a9.4 9.4 0 0 0-8.1 14.2L2.6 21.5l4.9-1.3A9.4 9.4 0 1 0 12 2.5zm0 17.1c-1.5 0-2.9-.4-4.2-1.1l-.3-.2-2.9.8.8-2.8-.2-.3a7.7 7.7 0 1 1 6.8 3.6zm4.2-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.3 6.3 0 0 1-3.1-2.7c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1c0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2l-.5-.3z" />
  ),
  x: (
    <path fill="currentColor" d="M17.8 3.5h3l-6.6 7.5 7.8 9.5h-6.1l-4.8-5.9-5.4 5.9H2.7l7-7.9L2.3 3.5h6.2l4.3 5.4 5-5.4zm-1 15.3h1.7L7.5 5.1H5.7l11.1 13.7z" />
  ),
};

export function LogoReseau({ id, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{LOGOS[id]}</svg>
  );
}

/** Rangée de logos (seulement les réseaux renseignés dans l'admin) + bouton WhatsApp. */
export default function LiensReseaux({ whatsapp = true, className = "" }) {
  const site = useSite();
  const presents = RESEAUX.filter((r) => lienComplet(site.reseaux?.[r.id]));
  return (
    <div className={`reseaux ${className}`}>
      {presents.map((r) => (
        <a key={r.id} className={`reseau reseau-${r.id}`} href={lienComplet(site.reseaux[r.id])} target="_blank" rel="noreferrer"
          aria-label={r.label} title={r.label}>
          <LogoReseau id={r.id} />
        </a>
      ))}
      {whatsapp && site.contact.whatsapp && (
        <a className="reseau reseau-whatsapp" href={lienWhatsApp("Bonjour DZ PIERCING !")} target="_blank" rel="noreferrer"
          aria-label="WhatsApp" title="WhatsApp">
          <LogoReseau id="whatsapp" />
        </a>
      )}
    </div>
  );
}
