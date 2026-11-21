import { useState } from "react";
import api from "../../api/index.js";
import useData, { Chargement, Erreur } from "../../components/useData.jsx";
import { useToast } from "../../components/Toast.jsx";
import { DEVISES, formatPrix, getDevise, setDevise } from "../../lib/format.js";

/** Onglet Réglages : choix de la devise affichée partout sur le site. */
export default function Reglages({ onChange, onError }) {
  const toast = useToast();
  const { data, loading, error, reload } = useData(() => api.reglages.get());
  const [choix, setChoix] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  if (loading && !data) return <Chargement />;
  if (error) return <Erreur error={error} onRetry={reload} />;

  const actuelle = data?.devise || getDevise();
  const selection = choix || actuelle;

  async function enregistrer() {
    setEnvoi(true);
    try {
      await api.reglages.update({ devise: selection });
      setDevise(selection);
      setChoix(null);
      toast(`Devise : ${DEVISES[selection].label} ✔`);
      reload();
      onChange?.();
    } catch (err) {
      onError(err);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <section className="card form">
      <h2 className="title-sm">Devise des prix</h2>
      <p className="muted small">
        Choisis la monnaie affichée sur tout le site (piercings, bracelets, commandes).
      </p>

      <div className="devise-choix" role="radiogroup" aria-label="Devise">
        {Object.entries(DEVISES).map(([code, d]) => (
          <label key={code} className={`devise-opt ${selection === code ? "active" : ""}`}>
            <input type="radio" name="devise" value={code} checked={selection === code} onChange={() => setChoix(code)} />
            <span className="devise-code">{d.symbole}</span>
            <span>
              <strong>{d.label}</strong>
              <small className="muted block">
                Exemple : {(() => { const avant = getDevise(); setDevise(code); const ex = formatPrix(35); setDevise(avant); return ex; })()}
              </small>
            </span>
          </label>
        ))}
      </div>

      <p className="notice small">
        ⚠️ Les montants ne sont <strong>pas convertis</strong> automatiquement : si tu passes de dollars à
        gourdes, pense à modifier tes prix dans les onglets Piercings et Bracelets.
      </p>

      <button className="btn btn-gold btn-block btn-lg" disabled={envoi || selection === actuelle} onClick={enregistrer}>
        {envoi ? "Enregistrement…" : selection === actuelle ? `Devise actuelle : ${DEVISES[actuelle].label}` : "Enregistrer la devise"}
      </button>
    </section>
  );
}
