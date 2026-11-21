import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { lienWhatsApp } from "../lib/format.js";

const ETAPES = [
  { titre: "Lave-toi les mains", texte: "Toujours avant de toucher ton piercing. C'est la règle n°1." },
  { titre: "Nettoie 2 fois par jour", texte: "Avec du sérum physiologique ou une solution saline stérile, sur une compresse propre." },
  { titre: "Sèche en tamponnant", texte: "Avec une compresse ou un mouchoir propre. Pas de serviette (elle garde les microbes)." },
  { titre: "Ne tourne pas le bijou", texte: "Laisse-le tranquille : le faire tourner abîme la cicatrisation." },
];

const EVITER = [
  "Piscine, mer, jacuzzi et hammam pendant 4 semaines",
  "Alcool, eau oxygénée, Bétadine ou crèmes grasses",
  "Dormir sur le piercing (oreille) ou vêtements serrés (nombril)",
  "Changer le bijou avant la fin de la cicatrisation",
  "Maquillage, parfum ou laque sur la zone",
];

const SPECIFIQUES = [
  { zone: "Langue & bouche", conseils: "Bain de bouche sans alcool après chaque repas. Aliments froids et mous les premiers jours. Évite tabac, alcool et bisous profonds pendant 2 semaines." },
  { zone: "Oreille (cartilage)", conseils: "Ne dors pas dessus (l'oreiller de voyage est ton ami). Attention aux écouteurs, casques et cheveux attachés trop serré." },
  { zone: "Nombril", conseils: "Vêtements amples, taille haute à éviter. Pas de ceinture qui frotte. Patience : c'est long à cicatriser." },
  { zone: "Nez & visage", conseils: "Attention en t'essuyant le visage et en enlevant un pull. Pas de crème ou maquillage directement dessus." },
];

const DUREES = [
  ["Lobe", "6 à 8 semaines"], ["Langue", "4 à 6 semaines"], ["Narine / Septum", "2 à 4 mois"],
  ["Sourcil / Labret", "2 à 3 mois"], ["Hélix / Tragus", "3 à 6 mois"], ["Nombril", "6 à 12 mois"],
];

export default function Soins() {
  return (
    <div className="container page narrow">
      <h1 className="page-title">Soins après piercing</h1>
      <p className="page-sub">Un piercing bien soigné, c'est un piercing qui cicatrise vite et reste beau.</p>

      <section className="section">
        <h2 className="title">Chaque jour</h2>
        <ol className="steps-list">
          {ETAPES.map((e, i) => (
            <li key={e.titre} className="card">
              <span className="step-num">{i + 1}</span>
              <div><strong>{e.titre}</strong><p>{e.texte}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2 className="title">À éviter</h2>
        <ul className="card avoid-list">
          {EVITER.map((t) => <li key={t}><span aria-hidden="true">✕</span>{t}</li>)}
        </ul>
      </section>

      <section className="section">
        <h2 className="title">Selon la zone</h2>
        {SPECIFIQUES.map((s) => (
          <details key={s.zone} className="card accordion">
            <summary>{s.zone}</summary>
            <p>{s.conseils}</p>
          </details>
        ))}
      </section>

      <section className="section">
        <h2 className="title">Temps de cicatrisation</h2>
        <div className="card">
          <table className="table">
            <tbody>
              {DUREES.map(([z, d]) => <tr key={z}><td>{z}</td><td className="gold">{d}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card alert">
        <h3>⚠️ Quand me contacter ?</h3>
        <p>Rougeur qui s'étend, chaleur, douleur qui augmente, pus jaune/vert, ou fièvre : contacte-moi et consulte un médecin. Ne retire pas le bijou toi-même.</p>
        <a className="btn btn-whatsapp btn-block" href={lienWhatsApp("Bonjour, j'ai une question sur la cicatrisation de mon piercing.")} target="_blank" rel="noreferrer">
          <Icon name="whatsapp" /> Poser une question
        </a>
        <p className="muted small">Ces conseils ne remplacent pas l'avis d'un professionnel de santé.</p>
      </section>

      <Link to="/rendez-vous" className="btn btn-gold btn-block btn-lg">Prendre rendez-vous</Link>
    </div>
  );
}
