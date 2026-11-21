import { useState } from "react";
import api from "../../api/index.js";
import useData, { Chargement, Erreur } from "../../components/useData.jsx";
import { useToast } from "../../components/Toast.jsx";
import { imageDe } from "../../lib/format.js";
import { placeholder } from "../../lib/placeholder.js";
import ImageUpload from "./ImageUpload.jsx";

export default function GalerieAdmin({ onError }) {
  const toast = useToast();
  const { data, loading, error, reload } = useData(() => api.galerie.list());
  const [image, setImage] = useState("");
  const [legende, setLegende] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function ajouter(e) {
    e.preventDefault();
    if (!image) return toast("Choisis d'abord une photo.", "error");
    setEnvoi(true);
    try {
      await api.galerie.create({ image, legende: legende.trim() });
      setImage("");
      setLegende("");
      toast("Photo ajoutée ✔");
      reload();
    } catch (err) {
      onError(err);
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(g) {
    if (!confirm("Supprimer cette photo de la galerie ?")) return;
    try {
      await api.galerie.remove(g.id);
      toast("Photo supprimée");
      reload();
    } catch (err) {
      onError(err);
    }
  }

  if (loading && !data) return <Chargement />;
  if (error) return <Erreur error={error} onRetry={reload} />;

  return (
    <>
      <form className="card form" onSubmit={ajouter}>
        <h2 className="title-sm">Ajouter une photo</h2>
        <ImageUpload value={image} onChange={setImage} apercu={placeholder("Nouvelle photo", "galerie")} />
        <label className="field">Légende (facultatif)
          <input value={legende} onChange={(e) => setLegende(e.target.value)} placeholder="Ex : Hélix + lobe doré" />
        </label>
        <button className="btn btn-gold btn-block btn-lg" disabled={envoi || !image}>{envoi ? "Envoi…" : "Publier dans la galerie"}</button>
      </form>

      <div className="gallery admin-gallery">
        {data.map((g) => (
          <div key={g.id} className="gallery-item">
            <img src={imageDe(g, "galerie")} alt={g.legende || ""} loading="lazy" />
            {g.legende && <span>{g.legende}</span>}
            <button className="gallery-del" onClick={() => supprimer(g)} aria-label="Supprimer">✕</button>
          </div>
        ))}
      </div>
    </>
  );
}
