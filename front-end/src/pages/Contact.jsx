import { useState } from "react";
import Icon from "../components/Icon.jsx";
import { LogoReseau } from "../components/Reseaux.jsx";
import Paiements from "../components/Paiements.jsx";
import { JOURS, lienTel, lienWhatsApp } from "../lib/format.js";
import { RESEAUX, lienComplet, useSite } from "../lib/site.js";

export default function Contact() {
  const site = useSite(); // contact, horaires et réseaux : modifiables dans l'admin (onglet Site)
  const { adresse, telephone, whatsapp } = site.contact;
  const [carte, setCarte] = useState(false);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`;
  const ordre = [1, 2, 3, 4, 5, 6, 0];
  const reseaux = RESEAUX.filter((r) => lienComplet(site.reseaux?.[r.id]));

  return (
    <div className="container page narrow">
      <h1 className="page-title">Contact</h1>
      <p className="page-sub">Une question, un projet de piercing ? Écris-moi, je réponds vite.</p>

      <div className="contact-buttons">
        {whatsapp && (
          <a className="btn btn-whatsapp btn-lg btn-block" href={lienWhatsApp("Bonjour DZ PIERCING !")} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" /> WhatsApp
          </a>
        )}
        {telephone && (
          <a className="btn btn-gold btn-lg btn-block" href={lienTel()}>
            <Icon name="phone" /> Appeler — {telephone}
          </a>
        )}
        {reseaux.length > 0 && (
          <div className="row-2">
            {reseaux.map((r) => (
              <a key={r.id} className="btn btn-outline btn-lg" href={lienComplet(site.reseaux[r.id])} target="_blank" rel="noreferrer">
                <LogoReseau id={r.id} /> {r.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {adresse && (
        <section className="card section">
          <h2 className="title-sm"><Icon name="pin" /> Adresse</h2>
          <p className="big">{adresse}</p>
          <a className="btn btn-outline btn-block" href={maps} target="_blank" rel="noreferrer">Ouvrir l'itinéraire</a>
          {/* La carte Google n'est chargée que si le client la demande (vie privée : pas d'envoi
              automatique de son adresse IP à Google, et page plus rapide) */}
          {carte ? (
            <iframe
              className="map"
              title="Plan d'accès"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(adresse)}&output=embed`}
            />
          ) : (
            <button className="map map-placeholder" onClick={() => setCarte(true)}>
              <Icon name="pin" size={32} />
              <strong>Afficher la carte</strong>
              <small>La carte est fournie par Google Maps</small>
            </button>
          )}
        </section>
      )}

      <section className="card section">
        <h2 className="title-sm"><Icon name="clock" /> Horaires</h2>
        <table className="table">
          <tbody>
            {ordre.map((j) => {
              const h = site.horaires[j];
              return (
                <tr key={j} className={new Date().getDay() === j ? "today" : ""}>
                  <td>{JOURS[j]}</td>
                  <td className={h ? "gold" : "muted"}>{h ? `${h[0]} – ${h[1]}` : "Fermé"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card section center">
        <Paiements />
      </section>
    </div>
  );
}
