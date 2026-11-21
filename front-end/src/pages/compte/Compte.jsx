import { Link, Navigate } from "react-router-dom";
import api, { logout } from "../../api/index.js";
import useSession from "../../components/useSession.js";
import useData, { Chargement, Erreur } from "../../components/useData.jsx";
import Icon from "../../components/Icon.jsx";
import { useToast } from "../../components/Toast.jsx";
import { STATUTS, formatDate, formatPrix } from "../../lib/format.js";

function Statut({ statut }) {
  const s = STATUTS[statut] || STATUTS.pending;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

/** Espace client : il ne voit QUE ses propres rendez-vous et commandes. */
export default function Compte() {
  const toast = useToast();
  const { user, isAdmin } = useSession();
  const donnees = useData(async () => {
    if (user?.role !== "client") return null;
    const [rendezvous, commandes] = await Promise.all([api.moi.rendezvous(), api.moi.commandes()]);
    return { rendezvous, commandes };
  }, [user?.id]);

  if (!user) return <Navigate to="/connexion?retour=/compte" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  const rdv = [...(donnees.data?.rendezvous || [])].sort((a, b) => `${b.date} ${b.heure}`.localeCompare(`${a.date} ${a.heure}`));
  const cmd = [...(donnees.data?.commandes || [])].sort((a, b) => String(b.creeLe).localeCompare(String(a.creeLe)));

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
        <Link to="/bracelets" className="btn btn-outline"><Icon name="bag" /> Bracelets</Link>
      </div>

      {donnees.loading && !donnees.data && <Chargement />}
      {donnees.error && <Erreur error={donnees.error} onRetry={donnees.reload} />}

      {donnees.data && (
        <>
          <section className="section">
            <h2 className="title">Mes rendez-vous</h2>
            {rdv.length === 0 && <div className="card empty">Aucun rendez-vous pour le moment.</div>}
            <div className="list">
              {rdv.map((r) => (
                <article key={r.id} className="card request">
                  <div className="request-top">
                    <strong className="big">Piercing {r.piercingNom}</strong>
                    <Statut statut={r.statut} />
                  </div>
                  <dl className="recap compact">
                    <dt>Date</dt><dd className="capitalize">{formatDate(r.date)}</dd>
                    <dt>Heure</dt><dd>{r.heure}</dd>
                  </dl>
                  <p className="muted small">Réf. {r.reference}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="title">Mes commandes</h2>
            {cmd.length === 0 && <div className="card empty">Aucune commande pour le moment.</div>}
            <div className="list">
              {cmd.map((c) => (
                <article key={c.id} className="card request">
                  <div className="request-top">
                    <strong className="big">{c.quantite} × {c.braceletNom}</strong>
                    <Statut statut={c.statut} />
                  </div>
                  <dl className="recap compact">
                    {c.couleur && <><dt>Couleur</dt><dd>{c.couleur}</dd></>}
                    <dt>Total</dt><dd className="price">{formatPrix(c.total)}</dd>
                    <dt>Date</dt><dd>{new Date(c.creeLe).toLocaleDateString("fr-FR")}</dd>
                  </dl>
                  <p className="muted small">Réf. {c.reference}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
