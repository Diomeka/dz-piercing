import { useState } from "react";
import api from "../../api/index.js";
import { useToast } from "../../components/Toast.jsx";
import { LogoReseau } from "../../components/Reseaux.jsx";
import { DEVISES, JOURS, emailValide, formatPrix, getDevise, setDevise, telValide } from "../../lib/format.js";
import { MOYENS_PAIEMENT, PAGES_MENU, RESEAUX, appliquerReglages, useSite } from "../../lib/site.js";
import { placeholder } from "../../lib/placeholder.js";
import ImageUpload from "./ImageUpload.jsx";

/**
 * Onglet « Site » : tout ce qui se modifie SANS toucher au code.
 * Chaque bloc a son propre bouton Enregistrer (enregistre seulement ce bloc).
 */
function Bloc({ titre, aide, cle, rendu, verifier, onError, ouvert = false }) {
  const toast = useToast();
  const site = useSite();
  const [brouillon, setBrouillon] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const valeur = brouillon ?? site[cle];
  const modifie = brouillon !== null;
  const changer = (v) => setBrouillon(typeof v === "function" ? v(structuredClone(valeur)) : v);

  async function enregistrer() {
    const err = verifier?.(valeur);
    if (err) return toast(err, "error");
    setEnvoi(true);
    try {
      const r = await api.reglages.update({ [cle]: valeur });
      appliquerReglages(r);
      setBrouillon(null);
      toast(`${titre} : enregistré ✔`);
    } catch (e) {
      onError(e);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <details className="card accordion reglage" open={ouvert}>
      <summary>{titre}{modifie && <span className="badge badge-pending">non enregistré</span>}</summary>
      <div className="reglage-corps form">
        {aide && <p className="muted small">{aide}</p>}
        {rendu(valeur, changer)}
        <div className="row-2">
          <button className="btn btn-gold" disabled={!modifie || envoi} onClick={enregistrer}>{envoi ? "Enregistrement…" : "Enregistrer"}</button>
          <button className="btn btn-outline" disabled={!modifie || envoi} onClick={() => setBrouillon(null)}>Annuler</button>
        </div>
      </div>
    </details>
  );
}

const exemplePrix = (code) => { const avant = getDevise(); setDevise(code); const ex = formatPrix(35); setDevise(avant); return ex; };
const ORDRE_JOURS = [1, 2, 3, 4, 5, 6, 0];

export default function Reglages({ onError }) {
  return (
    <div className="reglages">
      <p className="notice small">
        Ici tu modifies le contenu du site <strong>sans toucher au code</strong>. Chaque bloc s'enregistre séparément.
        Les clients voient les changements tout de suite{" "}
        {api.mode === "demo" ? "(en mode démo : seulement sur cet appareil, jusqu'au branchement du serveur)." : "."}
      </p>

      {/* ---------------- ACCUEIL ---------------- */}
      <Bloc titre="Page d'accueil" cle="accueil" onError={onError} ouvert
        aide="Photo du haut de page, phrase d'accroche, les 3 points forts et les sections affichées."
        verifier={(v) => (!v.slogan?.trim() ? "Écris une phrase d'accroche." : null)}
        rendu={(v, set) => (
          <>
            <span className="field">Photo du haut de page</span>
            <ImageUpload value={v.photo === "hero.svg" ? "" : v.photo} apercu="hero.svg"
              onChange={(photo) => set((x) => ({ ...x, photo: photo || "hero.svg" }))} />
            <label className="field">Phrase d'accroche
              <input value={v.slogan || ""} onChange={(e) => set((x) => ({ ...x, slogan: e.target.value }))} />
            </label>
            <span className="field">Points forts (laisser le titre vide pour masquer)</span>
            {v.atouts.map((a, i) => (
              <div key={i} className="row-2">
                <input aria-label={`Point fort ${i + 1} — titre`} placeholder="Titre" value={a.titre}
                  onChange={(e) => set((x) => { x.atouts[i].titre = e.target.value; return x; })} />
                <input aria-label={`Point fort ${i + 1} — détail`} placeholder="Détail" value={a.texte}
                  onChange={(e) => set((x) => { x.atouts[i].texte = e.target.value; return x; })} />
              </div>
            ))}
            <label className="consent"><input type="checkbox" checked={v.afficherPiercings}
              onChange={(e) => set((x) => ({ ...x, afficherPiercings: e.target.checked }))} /> Afficher « Piercings populaires »</label>
            <label className="consent"><input type="checkbox" checked={v.afficherBraces}
              onChange={(e) => set((x) => ({ ...x, afficherBraces: e.target.checked }))} /> Afficher « Nos braces »</label>
          </>
        )} />

      {/* ---------------- MENUS ---------------- */}
      <Bloc titre="Menus du site" cle="menus" onError={onError}
        aide="Choisis les pages visibles dans les menus et leur nom. L'Accueil est toujours visible."
        rendu={(v, set) => (
          <div className="list">
            {PAGES_MENU.map((p) => (
              <div key={p.id} className="menu-ligne">
                <label className="consent">
                  <input type="checkbox" checked={v[p.id]?.visible !== false}
                    onChange={(e) => set((x) => { x[p.id] = { ...x[p.id], visible: e.target.checked }; return x; })} />
                  Visible
                </label>
                <input aria-label={`Nom du menu ${p.label}`} value={v[p.id]?.label ?? p.label} placeholder={p.label}
                  onChange={(e) => set((x) => { x[p.id] = { ...x[p.id], label: e.target.value }; return x; })} />
              </div>
            ))}
          </div>
        )} />

      {/* ---------------- CONTACT ---------------- */}
      <Bloc titre="Contact" cle="contact" onError={onError}
        aide="Utilisé par les boutons WhatsApp et Appeler, la page Contact et le pied de page."
        verifier={(v) =>
          v.whatsapp && !telValide(v.whatsapp) ? "Numéro WhatsApp invalide (8 chiffres minimum)."
            : v.telephone && !telValide(v.telephone) ? "Numéro de téléphone invalide."
              : v.emailContact && !emailValide(v.emailContact) ? "E-mail invalide." : null}
        rendu={(v, set) => (
          <>
            <label className="field">Numéro WhatsApp<input type="tel" value={v.whatsapp} placeholder="3712-3456 ou +509 3712-3456"
              onChange={(e) => set((x) => ({ ...x, whatsapp: e.target.value }))} /></label>
            <label className="field">Téléphone (bouton Appeler)<input type="tel" value={v.telephone} placeholder="+509 3712-3456"
              onChange={(e) => set((x) => ({ ...x, telephone: e.target.value }))} /></label>
            <label className="field">Adresse<input value={v.adresse}
              onChange={(e) => set((x) => ({ ...x, adresse: e.target.value }))} /></label>
            <label className="field">E-mail de contact<input type="email" value={v.emailContact}
              onChange={(e) => set((x) => ({ ...x, emailContact: e.target.value }))} /></label>
          </>
        )} />

      {/* ---------------- HORAIRES ---------------- */}
      <Bloc titre="Horaires d'ouverture" cle="horaires" onError={onError}
        aide="Les créneaux de rendez-vous sont calculés à partir de ces horaires."
        verifier={(v) => (Object.values(v).some((h) => h && h[0] >= h[1]) ? "L'heure de fermeture doit être après l'ouverture." : null)}
        rendu={(v, set) => (
          <div className="list">
            {ORDRE_JOURS.map((j) => {
              const h = v[j];
              return (
                <div key={j} className="horaire-ligne">
                  <label className="consent">
                    <input type="checkbox" checked={!!h}
                      onChange={(e) => set((x) => { x[j] = e.target.checked ? ["10:00", "19:00"] : null; return x; })} />
                    <strong>{JOURS[j]}</strong>
                  </label>
                  {h ? (
                    <span className="horaire-heures">
                      <input type="time" aria-label={`${JOURS[j]} ouverture`} value={h[0]}
                        onChange={(e) => set((x) => { x[j][0] = e.target.value; return x; })} />
                      <span>à</span>
                      <input type="time" aria-label={`${JOURS[j]} fermeture`} value={h[1]}
                        onChange={(e) => set((x) => { x[j][1] = e.target.value; return x; })} />
                    </span>
                  ) : <span className="muted">Fermé</span>}
                </div>
              );
            })}
          </div>
        )} />

      {/* ---------------- RÉSEAUX ---------------- */}
      <Bloc titre="Réseaux sociaux" cle="reseaux" onError={onError}
        aide="Colle le lien de ta page. Laisse vide pour masquer le logo."
        rendu={(v, set) => RESEAUX.map((r) => (
          <label key={r.id} className="field reseau-champ">
            <span><LogoReseau id={r.id} size={18} /> {r.label}</span>
            <input type="url" inputMode="url" value={v[r.id] || ""} placeholder={r.exemple}
              onChange={(e) => set((x) => ({ ...x, [r.id]: e.target.value }))} />
          </label>
        ))} />

      {/* ---------------- PAIEMENTS ---------------- */}
      <Bloc titre="Moyens de paiement" cle="paiements" onError={onError}
        aide="Affichés en pied de page. Tu peux téléverser le logo officiel de chaque moyen de paiement."
        rendu={(v, set) => MOYENS_PAIEMENT.map((m) => (
          <div key={m.id} className="card paiement-ligne">
            <label className="consent">
              <input type="checkbox" checked={v[m.id]?.actif !== false}
                onChange={(e) => set((x) => { x[m.id] = { ...x[m.id], actif: e.target.checked }; return x; })} />
              <strong>{m.label}</strong>
            </label>
            <ImageUpload value={v[m.id]?.logo || ""} apercu={placeholder(m.label, "piercing")}
              onChange={(logo) => set((x) => { x[m.id] = { ...x[m.id], logo }; return x; })} />
          </div>
        ))} />

      {/* ---------------- DEVISE ---------------- */}
      <Bloc titre="Devise des prix" cle="devise" onError={onError}
        aide="⚠️ Les montants ne sont pas convertis : si tu changes de devise, modifie aussi tes prix."
        rendu={(v, set) => (
          <div className="devise-choix" role="radiogroup" aria-label="Devise">
            {Object.entries(DEVISES).map(([code, d]) => (
              <label key={code} className={`devise-opt ${v === code ? "active" : ""}`}>
                <input type="radio" name="devise" value={code} checked={v === code} onChange={() => set(code)} />
                <span className="devise-code">{d.symbole}</span>
                <span><strong>{d.label}</strong><small className="muted block">Exemple : {exemplePrix(code)}</small></span>
              </label>
            ))}
          </div>
        )} />

      {/* ---------------- LÉGAL ---------------- */}
      <Bloc titre="Informations légales" cle="legal" onError={onError}
        aide="Affichées sur la page « Mentions légales & confidentialité »."
        rendu={(v, set) => (
          <>
            <label className="field">Nom (ou entreprise)<input value={v.responsable}
              onChange={(e) => set((x) => ({ ...x, responsable: e.target.value }))} /></label>
            <label className="field">NIF<input value={v.nif}
              onChange={(e) => set((x) => ({ ...x, nif: e.target.value }))} /></label>
          </>
        )} />
    </div>
  );
}
