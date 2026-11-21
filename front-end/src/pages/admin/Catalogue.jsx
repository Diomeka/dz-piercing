import { useState } from "react";
import api from "../../api/index.js";
import useData, { Chargement, Erreur } from "../../components/useData.jsx";
import Modal from "../../components/Modal.jsx";
import Icon from "../../components/Icon.jsx";
import { useToast } from "../../components/Toast.jsx";
import { formatPrix, imageDe, symboleDevise } from "../../lib/format.js";
import { placeholder } from "../../lib/placeholder.js";
import { Pastilles } from "../Braces.jsx";
import ImageUpload from "./ImageUpload.jsx";

const VIDE = {
  piercings: { nom: "", categorie: "Oreille", prix: "", duree: 20, cicatrisation: "", description: "", image: "" },
  braces: { nom: "", prix: "", duree: 45, couleurs: [], disponible: true, description: "", image: "" },
};
const CATEGORIES = ["Oreille", "Visage", "Bouche", "Corps"];

function Formulaire({ type, initial, onClose, onSaved, onError }) {
  const toast = useToast();
  const [f, setF] = useState({ ...VIDE[type], ...initial });
  const [couleursTxt, setCouleursTxt] = useState((initial?.couleurs || []).join(", "));
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function valider(e) {
    e.preventDefault();
    setErreur("");
    const prix = Number(String(f.prix).replace(",", "."));
    if (!f.nom.trim()) return setErreur("Le nom est obligatoire.");
    if (!(prix >= 0) || f.prix === "") return setErreur("Prix invalide.");
    const data = { ...f, nom: f.nom.trim(), description: f.description.trim(), prix };
    delete data.id;
    data.duree = Number(f.duree) || null;
    if (type === "braces") data.couleurs = couleursTxt.split(",").map((c) => c.trim()).filter(Boolean);

    setEnvoi(true);
    try {
      if (initial?.id) await api[type].update(initial.id, data);
      else await api[type].create(data);
      toast(initial?.id ? "Modifié ✔" : "Ajouté ✔");
      onSaved();
    } catch (err) {
      setErreur(err.message);
      onError(err);
    } finally {
      setEnvoi(false);
    }
  }

  const titre = `${initial?.id ? "Modifier" : "Ajouter"} ${type === "piercings" ? "un piercing" : "un modèle de braces"}`;
  return (
    <Modal title={titre} onClose={onClose}>
      <form className="form" onSubmit={valider}>
        <ImageUpload value={f.image} onChange={(image) => setF((x) => ({ ...x, image }))}
          apercu={placeholder(f.nom || "Photo", type === "braces" ? "braces" : "piercing")} />
        <label className="field">Nom<input value={f.nom} onChange={set("nom")} placeholder={type === "piercings" ? "Ex : Hélix" : "Ex : Braces élastiques couleur"} /></label>
        <div className="row-2">
          <label className="field">Prix ({symboleDevise()})<input value={f.prix} onChange={set("prix")} inputMode="decimal" placeholder="35" /></label>
          {type === "piercings" ? (
            <label className="field">Catégorie
              <select value={f.categorie} onChange={set("categorie")}>
                {[...new Set([...CATEGORIES, f.categorie].filter(Boolean))].map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          ) : (
            <label className="field check">
              <input type="checkbox" checked={!!f.disponible} onChange={set("disponible")} /> Disponible
            </label>
          )}
        </div>

        {type === "piercings" && (
          <div className="row-2">
            <label className="field">Durée (min)<input value={f.duree ?? ""} onChange={set("duree")} inputMode="numeric" /></label>
            <label className="field">Cicatrisation<input value={f.cicatrisation} onChange={set("cicatrisation")} placeholder="3 à 6 mois" /></label>
          </div>
        )}
        {type === "braces" && (
          <label className="field">Durée de la pose (min)<input value={f.duree ?? ""} onChange={set("duree")} inputMode="numeric" /></label>
        )}
        {type === "braces" && (
          <label className="field">Couleurs proposées (séparées par des virgules)
            <input value={couleursTxt} onChange={(e) => setCouleursTxt(e.target.value)} placeholder="Argent, Rose, Bleu, Multicolore" />
            <Pastilles couleurs={couleursTxt.split(",").map((c) => c.trim()).filter(Boolean)} />
          </label>
        )}
        <label className="field">Description<textarea value={f.description} onChange={set("description")} rows={3} /></label>

        {erreur && <p className="form-error">{erreur}</p>}
        <button className="btn btn-gold btn-block btn-lg" disabled={envoi}>{envoi ? "Enregistrement…" : "Enregistrer"}</button>
      </form>
    </Modal>
  );
}

export default function Catalogue({ type, onError }) {
  const toast = useToast();
  const { data, loading, error, reload } = useData(() => api[type].list(), [type]);
  const [edition, setEdition] = useState(null); // null | {} (nouveau) | item

  async function supprimer(item) {
    if (!confirm(`Supprimer « ${item.nom} » ?`)) return;
    try {
      await api[type].remove(item.id);
      toast("Supprimé");
      reload();
    } catch (err) {
      onError(err);
    }
  }

  if (loading && !data) return <Chargement />;
  if (error) return <Erreur error={error} onRetry={reload} />;

  return (
    <>
      <button className="btn btn-gold btn-block btn-lg" onClick={() => setEdition({})}>
        <Icon name="plus" /> Ajouter {type === "piercings" ? "un piercing" : "un modèle de braces"}
      </button>

      <div className="list">
        {data.map((item) => (
          <article key={item.id} className="card admin-item">
            <img src={imageDe(item, type === "braces" ? "braces" : "piercing")} alt="" />
            <div className="admin-item-body">
              <strong>{item.nom}</strong>
              <span className="price">{formatPrix(item.prix)}</span>
              <small className="muted">
                {type === "piercings" ? item.categorie : (item.disponible ? "Disponible" : "Indisponible")}
              </small>
            </div>
            <div className="admin-item-actions">
              <button className="btn btn-outline btn-sm" onClick={() => setEdition(item)}>Modifier</button>
              <button className="link-danger" onClick={() => supprimer(item)}>Supprimer</button>
            </div>
          </article>
        ))}
        {data.length === 0 && <div className="card empty">Aucun élément. Clique sur « Ajouter ».</div>}
      </div>

      {edition && (
        <Formulaire type={type} initial={edition} onError={onError}
          onClose={() => setEdition(null)} onSaved={() => { setEdition(null); reload(); }} />
      )}
    </>
  );
}
