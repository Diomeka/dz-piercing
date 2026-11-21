import { Link } from "react-router-dom";

/** Case d'accord obligatoire avant d'envoyer nom + téléphone (protection des données). */
export default function Consentement({ checked, onChange }) {
  return (
    <label className="consent">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        J'accepte que mes informations soient utilisées pour traiter ma demande et me recontacter.{" "}
        <Link to="/confidentialite" className="link-gold" target="_blank">En savoir plus</Link>
      </span>
    </label>
  );
}
