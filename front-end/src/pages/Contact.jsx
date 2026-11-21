import CONFIG from "../config.js";
import Icon from "../components/Icon.jsx";
import { JOURS, lienTel, lienWhatsApp } from "../lib/format.js";

export default function Contact() {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.adresse)}`;
  const ordre = [1, 2, 3, 4, 5, 6, 0];

  return (
    <div className="container page narrow">
      <h1 className="page-title">Contact</h1>
      <p className="page-sub">Une question, un projet de piercing ? Écris-moi, je réponds vite.</p>

      <div className="contact-buttons">
        <a className="btn btn-whatsapp btn-lg btn-block" href={lienWhatsApp("Bonjour DZ PIERCING !")} target="_blank" rel="noreferrer">
          <Icon name="whatsapp" /> WhatsApp
        </a>
        <a className="btn btn-gold btn-lg btn-block" href={lienTel()}>
          <Icon name="phone" /> Appeler — {CONFIG.telephone}
        </a>
        <div className="row-2">
          <a className="btn btn-outline btn-lg" href={CONFIG.instagram} target="_blank" rel="noreferrer">
            <Icon name="instagram" /> Instagram
          </a>
          <a className="btn btn-outline btn-lg" href={CONFIG.tiktok} target="_blank" rel="noreferrer">
            <Icon name="tiktok" /> TikTok
          </a>
        </div>
      </div>

      <section className="card section">
        <h2 className="title-sm"><Icon name="pin" /> Adresse</h2>
        <p className="big">{CONFIG.adresse}</p>
        <a className="btn btn-outline btn-block" href={maps} target="_blank" rel="noreferrer">Ouvrir l'itinéraire</a>
        <iframe
          className="map"
          title="Plan d'accès"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(CONFIG.adresse)}&output=embed`}
        />
      </section>

      <section className="card section">
        <h2 className="title-sm"><Icon name="clock" /> Horaires</h2>
        <table className="table">
          <tbody>
            {ordre.map((j) => {
              const h = CONFIG.horaires[j];
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
    </div>
  );
}
