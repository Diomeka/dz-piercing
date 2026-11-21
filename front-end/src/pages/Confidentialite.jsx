import CONFIG from "../config.js";
import { useSite } from "../lib/site.js";

export default function Confidentialite() {
  const site = useSite(); // infos modifiables dans l'admin (onglet Site)
  const { adresse, telephone, emailContact } = site.contact;
  return (
    <div className="container page narrow legal">
      <h1 className="page-title">Mentions légales & confidentialité</h1>

      <section className="card section">
        <h2 className="title-sm">Éditeur du site</h2>
        <p>
          {CONFIG.nomBoutique} — {site.legal.responsable}<br />
          {adresse}<br />
          NIF : {site.legal.nif}<br />
          Téléphone : {telephone} — E-mail : {emailContact}
        </p>
        <h2 className="title-sm">Hébergement</h2>
        <p>GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>
      </section>

      <section className="card section">
        <h2 className="title-sm">Tes données personnelles</h2>
        <p><strong>Quelles données ?</strong> Quand tu prends rendez-vous, passes commande ou crées un compte,
          nous enregistrons ton nom, ton numéro de téléphone, ton e-mail (pour un compte), ton éventuel
          message et le détail de ta demande.</p>
        <p><strong>Pourquoi ?</strong> Uniquement pour gérer tes rendez-vous et commandes, te permettre de
          les suivre dans ton compte, et te recontacter à ce sujet.</p>
        <p><strong>Qui les voit ?</strong> Seulement {CONFIG.nomBoutique}. Elles ne sont jamais vendues ni
          transmises à d'autres entreprises.</p>
        <p><strong>Ton mot de passe</strong> est enregistré de façon chiffrée : personne, même pas nous,
          ne peut le lire.</p>
        <p><strong>Combien de temps ?</strong> 3 ans maximum après ton dernier contact, puis elles sont supprimées.
          Tu peux aussi demander la suppression de ton compte à tout moment.</p>
        <p><strong>Tes droits :</strong> tu peux demander à consulter, corriger ou supprimer tes données en
          écrivant à <a className="link-gold" href={`mailto:${emailContact}`}>{emailContact}</a> ou
          sur WhatsApp au {telephone}.</p>
        <p><strong>Cookies :</strong> ce site n'utilise pas de cookies publicitaires ni de mesure d'audience.
          Seul un stockage technique est utilisé pour garder ta connexion à ton compte.
          Les polices d'écriture sont hébergées avec le site.
          La carte de la page Contact (Google Maps) ne se charge que si tu cliques sur « Afficher la carte » ;
          Google peut alors déposer ses propres cookies.</p>
      </section>
    </div>
  );
}
