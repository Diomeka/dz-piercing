import { useRef, useState } from "react";
import api from "../../api/index.js";

/** Bouton "Choisir une photo" + aperçu. value = URL de l'image. */
export default function ImageUpload({ value, onChange, apercu }) {
  const input = useRef();
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  async function choisir(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErreur("Ce fichier n'est pas une image.");
    if (file.size > 15 * 1024 * 1024) return setErreur("Photo trop lourde (15 Mo maximum).");
    setErreur("");
    setEnvoi(true);
    try {
      onChange(await api.uploadImage(file));
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="upload">
      <img src={value || apercu} alt="Aperçu" />
      <div className="upload-actions">
        <button type="button" className="btn btn-outline" onClick={() => input.current.click()} disabled={envoi}>
          {envoi ? "Envoi…" : value ? "Changer la photo" : "📷 Choisir une photo"}
        </button>
        {value && <button type="button" className="link-danger" onClick={() => onChange("")}>Retirer la photo</button>}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={choisir} />
      {erreur && <p className="form-error">{erreur}</p>}
    </div>
  );
}
