import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getUser } from "../api/index.js";
import useData, { Chargement, Erreur } from "../components/useData.jsx";
import Icon from "../components/Icon.jsx";
import { useToast } from "../components/Toast.jsx";
import Consentement from "../components/Consentement.jsx";
import { ajouterAgenda } from "../lib/agenda.js";
import {
  aujourdhui, creneauxDuJour, formatDate, formatPrix, imageDe, lienWhatsApp, telValide,
} from "../lib/format.js";

export default function RendezVous() {
  const toast = useToast();
  const [params] = useSearchParams();
  const piercings = useData(() => api.piercings.list());

  const [piercingId, setPiercingId] = useState(params.get("piercing") || "");
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
  const piercing = (piercings.data || []).find((p) => p.id === piercingId);

  async function valider(e) {
    e.preventDefault();
    setErreur("");
    if (!piercing) return setErreur("Choisis un piercing.");
    if (!date) return setErreur("Choisis une date.");
    if (!heure) return setErreur("Choisis une heure.");
    if (!nom.trim()) return setErreur("Écris ton nom.");
    if (!telValide(telephone)) return setErreur("Numéro de téléphone invalide (8 chiffres minimum, ex. 3712-3456).");
    if (!accord) return setErreur("Coche la case d'accord pour envoyer ta demande.");
    setEnvoi(true);
    try {
      const rdv = await api.rendezvous.create({
        piercingId: piercing.id, piercingNom: piercing.nom, date, heure,
        nom: nom.trim(), telephone: telephone.trim(), message: message.trim(),
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
    const texte = `Bonjour DZ PIERCING ! J'ai demandé un RDV pour un piercing ${confirme.piercingNom} ` +
      `le ${formatDate(confirme.date)} à ${confirme.heure}. Référence ${confirme.reference}. — ${confirme.nom}`;
    return (
      <div className="container page narrow">
        <div className="card success">
          <div className="success-icon"><Icon name="check" size={40} /></div>
          <h1 className="page-title">C'est noté, {confirme.nom} !</h1>
          <p>Ta demande de rendez-vous est bien reçue. Je la confirme rapidement par message au <strong>{confirme.telephone}</strong>.</p>
          <dl className="recap">
            <dt>Référence</dt><dd>{confirme.reference}</dd>
            <dt>Piercing</dt><dd>{confirme.piercingNom}</dd>
            <dt>Date</dt><dd className="capitalize">{formatDate(confirme.date)}</dd>
            <dt>Heure</dt><dd>{confirme.heure}</dd>
            <dt>Statut</dt><dd><span className="badge badge-pending">En attente de confirmation</span></dd>
          </dl>
          <button className="btn btn-gold btn-block" onClick={() => ajouterAgenda(confirme, piercing?.duree)}>
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
      <p className="page-sub">3 étapes, moins d'une minute.</p>

      {piercings.loading && <Chargement />}
      {piercings.error && <Erreur error={piercings.error} onRetry={piercings.reload} />}

      {piercings.data && (
        <form className="form" onSubmit={valider}>
          {/* ÉTAPE 1 */}
          <section className="card step">
            <h2><span className="step-num">1</span> Ton piercing</h2>
            <select value={piercingId} onChange={(e) => setPiercingId(e.target.value)} className="select-lg" aria-label="Piercing">
              <option value="">— Choisir un piercing —</option>
              {piercings.data.map((p) => (
                <option key={p.id} value={p.id}>{p.nom} — {formatPrix(p.prix)}</option>
              ))}
            </select>
            {piercing && (
              <div className="order-head">
                <img src={imageDe(piercing, "piercing")} alt="" />
                <div>
                  <strong>{piercing.nom}</strong>
                  <span className="price">{formatPrix(piercing.prix)}</span>
                  {piercing.duree ? <small className="muted">Environ {piercing.duree} min</small> : null}
                </div>
              </div>
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
