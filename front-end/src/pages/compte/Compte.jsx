import { Link, Navigate } from "react-router-dom";
import api, { logout } from "../../api/index.js";
import useSession from "../../components/useSession.js";
import useData, { Chargement, Erreur } from "../../components/useData.jsx";
import Icon from "../../components/Icon.jsx";
import { useToast } from "../../components/Toast.jsx";
import { STATUTS, formatDate } from "../../lib/format.js";
import { libellePrestation } from "../RendezVous.jsx";

function Statut({ statut }) {
  const s = STATUTS[statut] || STATUTS.pending;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

/** Espace client : il ne voit QUE ses propres rendez-vous (piercings et braces). */
export default function Compte() {
  const toast = useToast();
  const { user, isAdmin } = useSession();
  const donnees = useData(async () => (user?.role === "client" ? api.moi.rendezvous() : null), [user?.id]);

  if (!user) return <Navigate to="/connexion?retour=/compte" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const rdv = [...(donnees.data || [])].sort((a, b) => `${b.date} ${b.heure}`.localeCompare(`${a.date} ${a.heure}`));
  const aVenir = rdv.filter((r) => r.date >= aujourdhui).reverse();
  const passes = rdv.filter((r) => r.date < aujourdhui);

  const Carte = ({ r }) => (
    <article className="card request">
      <div className="request-top">
        <strong className="big">{libellePrestation(r)}</strong>
        <Statut statut={r.statut} />
      </div>
      <dl className="recap compact">
        {r.couleur && <><dt>Couleur</dt><dd>{r.couleur}</dd></>}
        <dt>Date</dt><dd className="capitalize">{formatDate(r.date)}</dd>
        <dt>Heure</dt><dd>{r.heure}</dd>
      </dl>
      <p className="muted small">Réf. {r.reference}</p>
    </article>
  );

  return (
    <div className="container page narrow">
      <div className="admin-head">
        <h1 className="page-title">Mon compte</h1>
        <button className="btn btn-outline btn-sm" onClick={() => { logout(); toast("À bientôt 👋"); }}>Déconnexion</button>
      </div>

      <section className="card section profil">
        <div className="success-icon small-icon"><Icon name="user" size={26} /></div>
        <div>
          <strong className="big">{user.nom}</strong>
          <span className="muted block">{user.email}</span>
          {user.telephone && <span className="muted block">{user.telephone}</span>}
        </div>
      </section>

      <div className="row-2 section">
        <Link to="/rendez-vous" className="btn btn-gold"><Icon name="calendar" /> Prendre RDV</Link>
        <Link to="/braces" className="btn btn-outline"><Icon name="smile" /> Braces</Link>
      </div>

      {donnees.loading && !donnees.data && <Chargement />}
      {donnees.error && <Erreur error={donnees.error} onRetry={donnees.reload} />}

      {donnees.data && (
        <>
          <section className="section">
            <h2 className="title">Mes rendez-vous à venir</h2>
            {aVenir.length === 0 && <div className="card empty">Aucun rendez-vous à venir.</div>}
            <div className="list">{aVenir.map((r) => <Carte key={r.id} r={r} />)}</div>
          </section>
          {passes.length > 0 && (
            <section className="section">
              <h2 className="title">Historique</h2>
              <div className="list">{passes.map((r) => <Carte key={r.id} r={r} />)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
