import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getUser } from "../api/index.js";
import useData, { Chargement, Erreur } from "../components/useData.jsx";
import Icon from "../components/Icon.jsx";
import { useToast } from "../components/Toast.jsx";
import Consentement from "../components/Consentement.jsx";
import { ajouterAgenda } from "../lib/agenda.js";
import {
  aujourdhui, couleurHex, creneauxDuJour, formatDate, formatPrix, imageDe, lienWhatsApp, telValide,
} from "../lib/format.js";

/** Libellé d'une prestation : « Piercing Hélix » ou « Braces dorés » */
export const libellePrestation = (r) =>
  r.prestationType === "braces" ? r.prestationNom : `Piercing ${r.prestationNom}`;

export default function RendezVous() {
  const toast = useToast();
  const [params] = useSearchParams();
  // Piercings ET braces : les deux se réservent au salon
  const catalogue = useData(async () => {
    const [piercings, braces] = await Promise.all([api.piercings.list(), api.braces.list()]);
    return { piercings, braces: braces.filter((b) => b.disponible !== false) };
  });

  // Choix encodé "type:id" (ex. "piercing:p2", "braces:br1") — pré-rempli depuis le lien
  const [choix, setChoix] = useState(
    params.get("braces") ? `braces:${params.get("braces")}` : params.get("piercing") ? `piercing:${params.get("piercing")}` : ""
  );
  const [couleur, setCouleur] = useState("");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const creneauxPris = useData(() => (date ? api.rendezvous.booked(date) : []), [date]);
  const pris = creneauxPris.data || [];
  const chargementCreneaux = creneauxPris.loading;
  const client = getUser()?.role === "client" ? getUser() : null; // compte connecté → champs pré-remplis
  const [nom, setNom] = useState(client?.nom || "");
  const [telephone, setTelephone] = useState(client?.telephone || "");
  const [message, setMessage] = useState("");
  const [accord, setAccord] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [confirme, setConfirme] = useState(null);

  const creneaux = date ? creneauxDuJour(date) : [];
  const [type, id] = choix.split(":");
  const prestation = type === "braces"
    ? (catalogue.data?.braces || []).find((b) => b.id === id)
    : (catalogue.data?.piercings || []).find((p) => p.id === id);
  const couleurs = type === "braces" ? prestation?.couleurs || [] : [];
  // une seule couleur proposée → choisie d'office
  const couleurChoisie = couleurs.length === 1 ? couleurs[0] : couleur;

  async function valider(e) {
    e.preventDefault();
    setErreur("");
    if (!prestation) return setErreur("Choisis un piercing ou des braces.");
    if (couleurs.length > 1 && !couleurChoisie) return setErreur("Choisis la couleur de tes braces.");
    if (!date) return setErreur("Choisis une date.");
    if (!heure) return setErreur("Choisis une heure.");
    if (!nom.trim()) return setErreur("Écris ton nom.");
    if (!telValide(telephone)) return setErreur("Numéro de téléphone invalide (8 chiffres minimum, ex. 3712-3456).");
    if (!accord) return setErreur("Coche la case d'accord pour envoyer ta demande.");
    setEnvoi(true);
    try {
      const rdv = await api.rendezvous.create({
        prestationType: type, prestationId: prestation.id, prestationNom: prestation.nom,
        couleur: type === "braces" ? couleurChoisie : "",
        date, heure, nom: nom.trim(), telephone: telephone.trim(), message: message.trim(),
      });
      setConfirme(rdv);
      toast("Demande de rendez-vous envoyée ✔");
      window.scrollTo(0, 0);
    } catch (err) {
      setErreur(err.message);
      // le créneau a peut-être été pris entre-temps : on rafraîchit
      creneauxPris.reload();
    } finally {
      setEnvoi(false);
    }
  }

  if (confirme) {
    const quoi = libellePrestation(confirme) + (confirme.couleur ? ` (${confirme.couleur})` : "");
    const texte = `Bonjour DZ PIERCING ! J'ai demandé un RDV : ${quoi}, ` +
      `le ${formatDate(confirme.date)} à ${confirme.heure}. Référence ${confirme.reference}. — ${confirme.nom}`;
    return (
      <div className="container page narrow">
        <div className="card success">
          <div className="success-icon"><Icon name="check" size={40} /></div>
          <h1 className="page-title">C'est noté, {confirme.nom} !</h1>
          <p>Ta demande de rendez-vous est bien reçue. Je la confirme rapidement par message au <strong>{confirme.telephone}</strong>.</p>
          <dl className="recap">
            <dt>Référence</dt><dd>{confirme.reference}</dd>
            <dt>Prestation</dt><dd>{libellePrestation(confirme)}</dd>
            {confirme.couleur && <><dt>Couleur</dt><dd>{confirme.couleur}</dd></>}
            <dt>Date</dt><dd className="capitalize">{formatDate(confirme.date)}</dd>
            <dt>Heure</dt><dd>{confirme.heure}</dd>
            <dt>Statut</dt><dd><span className="badge badge-pending">En attente de confirmation</span></dd>
          </dl>
          <button className="btn btn-gold btn-block" onClick={() => ajouterAgenda(confirme, prestation?.duree)}>
            <Icon name="calendar" /> Ajouter à mon agenda
          </button>
          <a className="btn btn-whatsapp btn-block" href={lienWhatsApp(texte)} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" /> M'envoyer aussi un WhatsApp
          </a>
          <Link to="/soins" className="btn btn-outline btn-block">Lire les conseils de soins</Link>
          {client
            ? <Link to="/compte" className="btn btn-outline btn-block">Suivre dans mon compte</Link>
            : <p className="muted small center">Crée un compte pour suivre tes rendez-vous : <Link to="/inscription" className="link-gold">créer un compte</Link></p>}
          <Link to="/" className="link-gold center">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page narrow">
      <h1 className="page-title">Prendre rendez-vous</h1>
      <p className="page-sub">Piercing ou pose de braces : 3 étapes, moins d'une minute.</p>

      {catalogue.loading && <Chargement />}
      {catalogue.error && <Erreur error={catalogue.error} onRetry={catalogue.reload} />}

      {catalogue.data && (
        <form className="form" onSubmit={valider}>
          {/* ÉTAPE 1 */}
          <section className="card step">
            <h2><span className="step-num">1</span> Ta prestation</h2>
            <select value={choix} onChange={(e) => { setChoix(e.target.value); setCouleur(""); }} className="select-lg" aria-label="Prestation">
              <option value="">— Choisir un piercing ou des braces —</option>
              <optgroup label="Piercings">
                {catalogue.data.piercings.map((p) => (
                  <option key={p.id} value={`piercing:${p.id}`}>{p.nom} — {formatPrix(p.prix)}</option>
                ))}
              </optgroup>
              {catalogue.data.braces.length > 0 && (
                <optgroup label="Braces (pose)">
                  {catalogue.data.braces.map((b) => (
                    <option key={b.id} value={`braces:${b.id}`}>{b.nom} — {formatPrix(b.prix)}</option>
                  ))}
                </optgroup>
              )}
            </select>
            {prestation && (
              <div className="order-head">
                <img src={imageDe(prestation, type === "braces" ? "braces" : "piercing")} alt="" />
                <div>
                  <strong>{prestation.nom}</strong>
                  <span className="price">{formatPrix(prestation.prix)}</span>
                  {prestation.duree ? <small className="muted">Environ {prestation.duree} min</small> : null}
                </div>
              </div>
            )}
            {couleurs.length > 1 && (
              <fieldset className="step-couleur">
                <legend>Couleur</legend>
                <div className="color-pick">
                  {couleurs.map((c) => (
                    <label key={c} className={`color-opt ${couleurChoisie === c ? "active" : ""}`}>
                      <input type="radio" name="couleur" value={c} checked={couleurChoisie === c} onChange={() => setCouleur(c)} />
                      <span className="swatch" style={{ background: couleurHex(c) }} /> {c}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </section>

          {/* ÉTAPE 2 */}
          <section className="card step">
            <h2><span className="step-num">2</span> Date et heure</h2>
            <input type="date" className="select-lg" value={date} min={aujourdhui()} max={aujourdhui(90)}
              onChange={(e) => { setDate(e.target.value); setHeure(""); }} aria-label="Date" />
            {date && creneaux === null && <p className="notice">Fermé ce jour-là, choisis une autre date.</p>}
            {date && creneaux && chargementCreneaux && <Chargement />}
            {date && creneaux && !chargementCreneaux && (
              creneaux.length === 0
                ? <p className="notice">Plus de créneau disponible ce jour-là.</p>
                : (
                  <div className="slots">
                    {creneaux.map((h) => {
                      const occupe = pris.includes(h);
                      return (
                        <button type="button" key={h} disabled={occupe}
                          className={`slot ${heure === h ? "active" : ""}`} onClick={() => setHeure(h)}>
                          {h}
                        </button>
                      );
                    })}
                  </div>
                )
            )}
          </section>

          {/* ÉTAPE 3 */}
          <section className="card step">
            <h2><span className="step-num">3</span> Tes coordonnées</h2>
            <label className="field">Nom<input value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" placeholder="Prénom Nom" /></label>
            <label className="field">Téléphone<input value={telephone} onChange={(e) => setTelephone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="3712-3456" /></label>
            <label className="field">Message (facultatif)<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Une question, un bijou en particulier…" /></label>
            <p className="muted small">Mineur(e) ? Viens accompagné(e) d'un parent avec une pièce d'identité.</p>
            <Consentement checked={accord} onChange={setAccord} />
          </section>

          {erreur && <p className="form-error">{erreur}</p>}
          <button className="btn btn-gold btn-block btn-lg" disabled={envoi}>
            {envoi ? "Envoi…" : "Confirmer le rendez-vous"}
          </button>
        </form>
      )}
    </div>
  );
}
