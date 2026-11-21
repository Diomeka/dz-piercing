import { useState } from "react";
import api from "../../api/index.js";
import useData, { Chargement, Erreur } from "../../components/useData.jsx";
import Icon from "../../components/Icon.jsx";
import { useToast } from "../../components/Toast.jsx";
import { STATUTS, formatDate, versWhatsApp } from "../../lib/format.js";
import { libellePrestation } from "../RendezVous.jsx";

const FILTRES = [
  { id: "pending", label: "En attente" },
  { id: "accepted", label: "Acceptés" },
  { id: "refused", label: "Refusés" },
  { id: "all", label: "Tous" },
];

/** Message WhatsApp prêt à envoyer au client après « Accepter » / « Refuser » */
function messageClient(item, statut) {
  const quoi = libellePrestation(item) + (item.couleur ? ` (${item.couleur})` : "");
  return statut === "accepted"
    ? `Bonjour ${item.nom}, c'est DZ PIERCING ✨ Ton rendez-vous (${quoi}) est CONFIRMÉ le ${formatDate(item.date)} à ${item.heure}. À très vite ! (Réf. ${item.reference})`
    : `Bonjour ${item.nom}, c'est DZ PIERCING. Désolé, je ne suis pas disponible le ${formatDate(item.date)} à ${item.heure}. Tu peux reprendre un autre créneau sur le site 🙏 (Réf. ${item.reference})`;
}

export default function Demandes({ type, tick = 0, onChange, onError }) {
  const toast = useToast();
  const { data, loading, error, reload } = useData(() => api[type].list(), [type, tick]);
  const [filtre, setFiltre] = useState("pending");
  const [occupe, setOccupe] = useState(null);

  const tri = (a, b) => `${a.date} ${a.heure}`.localeCompare(`${b.date} ${b.heure}`);
  const liste = (data || []).filter((x) => filtre === "all" || x.statut === filtre).sort(tri);
  const nbAttente = (data || []).filter((x) => x.statut === "pending").length;

  async function changer(item, statut) {
    setOccupe(item.id);
    try {
      await api[type].setStatus(item.id, statut);
      toast(statut === "accepted" ? "Accepté ✔" : "Refusé");
      onChange ? onChange() : reload();
    } catch (err) {
      onError(err);
    } finally {
      setOccupe(null);
    }
  }

  async function supprimer(item) {
    if (!confirm(`Supprimer définitivement la demande de ${item.nom} ?`)) return;
    try {
      await api[type].remove(item.id);
      toast("Supprimé");
      onChange ? onChange() : reload();
    } catch (err) {
      onError(err);
    }
  }

  if (loading && !data) return <Chargement />;
  if (error) return <Erreur error={error} onRetry={reload} />;

  return (
    <>
      <div className="chips">
        {FILTRES.map((f) => (
          <button key={f.id} className={`chip ${filtre === f.id ? "active" : ""}`} onClick={() => setFiltre(f.id)}>
            {f.label}{f.id === "pending" && nbAttente ? ` (${nbAttente})` : ""}
          </button>
        ))}
      </div>

      {liste.length === 0 && <div className="card empty">Rien ici pour le moment.</div>}

      <div className="list">
        {liste.map((x) => {
          const s = STATUTS[x.statut] || STATUTS.pending;
          return (
            <article key={x.id} className="card request">
              <div className="request-top">
                <div>
                  <strong className="big">{x.nom}</strong>
                  <a className="link-gold block" href={`tel:${x.telephone.replace(/\s/g, "")}`}>{x.telephone}</a>
                </div>
                <span className={`badge ${s.cls}`}>{s.label}</span>
              </div>

              <dl className="recap compact">
                <dt>{x.prestationType === "braces" ? "Braces" : "Piercing"}</dt><dd>{x.prestationNom}</dd>
                {x.couleur && <><dt>Couleur</dt><dd>{x.couleur}</dd></>}
                <dt>Date</dt><dd className="capitalize">{formatDate(x.date)}</dd>
                <dt>Heure</dt><dd>{x.heure}</dd>
              </dl>
              {x.message && <p className="quote">« {x.message} »</p>}
              <p className="muted small">Réf. {x.reference}</p>

              {x.statut === "pending" ? (
                <div className="row-2">
                  <button className="btn btn-gold" disabled={occupe === x.id} onClick={() => changer(x, "accepted")}>
                    <Icon name="check" /> Accepter
                  </button>
                  <button className="btn btn-danger" disabled={occupe === x.id} onClick={() => changer(x, "refused")}>
                    ✕ Refuser
                  </button>
                </div>
              ) : (
                <div className="row-2">
                  <a className="btn btn-whatsapp" target="_blank" rel="noreferrer"
                    href={`https://wa.me/${versWhatsApp(x.telephone)}?text=${encodeURIComponent(messageClient(x, x.statut))}`}>
                    <Icon name="whatsapp" /> Prévenir le client
                  </a>
                  <button className="btn btn-outline" onClick={() => changer(x, "pending")}>Remettre en attente</button>
                </div>
              )}
              <button className="link-danger" onClick={() => supprimer(x)}>Supprimer</button>
            </article>
          );
        })}
      </div>
    </>
  );
}
