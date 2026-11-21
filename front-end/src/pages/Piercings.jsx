import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/index.js";
import useData, { Chargement, Erreur } from "../components/useData.jsx";
import Icon from "../components/Icon.jsx";
import { formatPrix, imageDe } from "../lib/format.js";

export default function Piercings() {
  const { data, loading, error, reload } = useData(() => api.piercings.list());
  const [filtre, setFiltre] = useState("Tous");

  const categories = ["Tous", ...new Set((data || []).map((p) => p.categorie).filter(Boolean))];
  const liste = (data || []).filter((p) => filtre === "Tous" || p.categorie === filtre);

  return (
    <div className="container page">
      <h1 className="page-title">Piercings</h1>
      <p className="page-sub">Choisis ton piercing, puis réserve ton créneau en quelques secondes.</p>

      {loading && <Chargement />}
      {error && <Erreur error={error} onRetry={reload} />}

      {data && (
        <>
          <div className="chips" role="tablist">
            {categories.map((c) => (
              <button key={c} className={`chip ${filtre === c ? "active" : ""}`} onClick={() => setFiltre(c)}>{c}</button>
            ))}
          </div>

          <div className="grid">
            {liste.map((p) => (
              <article key={p.id} className="card product">
                <img src={imageDe(p, "piercing")} alt={p.nom} loading="lazy" />
                <div className="product-body">
                  <div className="product-top">
                    <div>
                      <span className="tag">{p.categorie}</span>
                      <h3>{p.nom}</h3>
                    </div>
                    <span className="price price-lg">{formatPrix(p.prix)}</span>
                  </div>
                  <p>{p.description}</p>
                  <p className="meta">
                    {p.duree ? <span><Icon name="clock" size={16} /> {p.duree} min</span> : null}
                    {p.cicatrisation ? <span><Icon name="heart" size={16} /> {p.cicatrisation}</span> : null}
                  </p>
                  <Link to={`/rendez-vous?piercing=${p.id}`} className="btn btn-gold btn-block">Réserver ce piercing</Link>
                </div>
              </article>
            ))}
          </div>
          {liste.length === 0 && <div className="card empty">Aucun piercing pour le moment.</div>}
        </>
      )}
    </div>
  );
}
