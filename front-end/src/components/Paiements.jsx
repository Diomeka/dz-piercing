import { useSite, MOYENS_PAIEMENT } from "../lib/site.js";

/** Pastille par défaut (tant que l'admin n'a pas téléversé le logo officiel). */
function Pastille({ id }) {
  if (id === "virement") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M3 9.5 12 4l9 5.5M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18" />
      </svg>
    );
  }
  return <span className="paiement-texte">{id === "moncash" ? "MonCash" : "NatCash"}</span>;
}

/** Logos des moyens de paiement actifs ; le nom apparaît au survol (et au toucher). */
export default function Paiements({ className = "" }) {
  const site = useSite();
  const actifs = MOYENS_PAIEMENT.filter((m) => site.paiements?.[m.id]?.actif !== false);
  if (!actifs.length) return null;
  return (
    <div className={`paiements ${className}`}>
      <span className="paiements-titre">Paiement accepté</span>
      <ul className="paiements-liste">
        {actifs.map((m) => {
          const logo = site.paiements?.[m.id]?.logo;
          return (
            <li key={m.id}>
              <span className={`paiement paiement-${m.id}`} tabIndex={0} data-nom={m.label} aria-label={m.label}>
                {logo ? <img src={logo} alt={m.label} /> : <Pastille id={m.id} />}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Phrase pour les formulaires : « MonCash, NatCash ou virement bancaire » */
export function phrasePaiement(site) {
  const noms = MOYENS_PAIEMENT.filter((m) => site.paiements?.[m.id]?.actif !== false).map((m) => m.court);
  if (!noms.length) return "";
  return noms.length === 1 ? noms[0] : `${noms.slice(0, -1).join(", ")} ou ${noms.at(-1)}`;
}
