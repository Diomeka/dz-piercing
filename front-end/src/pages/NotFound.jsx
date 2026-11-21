import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container page narrow center">
      <h1 className="page-title">Page introuvable</h1>
      <p className="page-sub">Cette page n'existe pas (ou plus).</p>
      <Link to="/" className="btn btn-gold btn-lg">Retour à l'accueil</Link>
    </div>
  );
}
