import { useState } from "react";
import api from "../api/index.js";
import useData, { Chargement, Erreur } from "../components/useData.jsx";
import Modal from "../components/Modal.jsx";
import { imageDe } from "../lib/format.js";

export default function Galerie() {
  const { data, loading, error, reload } = useData(() => api.galerie.list());
  const [zoom, setZoom] = useState(null);

  return (
    <div className="container page">
      <h1 className="page-title">Galerie</h1>
      <p className="page-sub">Quelques-unes de mes réalisations. Touche une photo pour l'agrandir.</p>

      {loading && <Chargement />}
      {error && <Erreur error={error} onRetry={reload} />}

      {data && (
        <div className="gallery">
          {data.map((g) => (
            <button key={g.id} className="gallery-item" onClick={() => setZoom(g)}>
              <img src={imageDe(g, "galerie")} alt={g.legende || "Réalisation DZ PIERCING"} loading="lazy" />
              {g.legende && <span>{g.legende}</span>}
            </button>
          ))}
          {data.length === 0 && <div className="card empty">Les photos arrivent bientôt.</div>}
        </div>
      )}

      {zoom && (
        <Modal title={zoom.legende || "Réalisation"} onClose={() => setZoom(null)} wide>
          <img className="zoom-img" src={imageDe(zoom, "galerie")} alt={zoom.legende || ""} />
        </Modal>
      )}
    </div>
  );
}
