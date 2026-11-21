import CONFIG from "../config.js";

export default function Confidentialite() {
  return (
    <div className="container page narrow legal">
      <h1 className="page-title">Mentions légales & confidentialité</h1>

      <section className="card section">
        <h2 className="title-sm">Éditeur du site</h2>
        <p>
          {CONFIG.nomBoutique} — {CONFIG.responsable}<br />
          {CONFIG.adresse}<br />
          SIRET : {CONFIG.siret}<br />
          Téléphone : {CONFIG.telephone} — E-mail : {CONFIG.emailContact}
        </p>
        <h2 className="title-sm">Hébergement</h2>
        <p>GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>
      </section>

      <section className="card section">
        <h2 className="title-sm">Données personnelles (RGPD)</h2>
        <p><strong>Quelles données ?</strong> Quand tu prends rendez-vous ou passes commande, nous collectons
          ton nom, ton numéro de téléphone, ton éventuel message et le détail de ta demande.</p>
        <p><strong>Pourquoi ?</strong> Uniquement pour gérer ton rendez-vous ou ta commande et te recontacter
          à ce sujet. Base légale : l'exécution de ta demande (mesures précontractuelles).</p>
        <p><strong>Qui les voit ?</strong> Seulement {CONFIG.nomBoutique}. Elles ne sont jamais vendues ni
          transmises à des tiers à des fins commerciales.</p>
        <p><strong>Combien de temps ?</strong> 3 ans maximum après ton dernier contact, puis elles sont supprimées.</p>
        <p><strong>Tes droits :</strong> tu peux demander à consulter, corriger ou supprimer tes données, ou
          t'opposer à leur utilisation, en écrivant à <a className="link-gold" href={`mailto:${CONFIG.emailContact}`}>{CONFIG.emailContact}</a>.
          Tu peux aussi saisir la CNIL (www.cnil.fr).</p>
        <p><strong>Cookies :</strong> ce site n'utilise pas de cookies publicitaires ni de mesure d'audience.
          Seul un stockage technique est utilisé pour faire fonctionner l'espace admin.
          La carte de la page Contact est fournie par Google Maps.</p>
      </section>
    </div>
  );
}
