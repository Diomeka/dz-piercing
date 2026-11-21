import { Component } from "react";

/**
 * Filet de sécurité : si une page plante, on affiche un message clair
 * (au lieu d'un écran noir) avec un bouton pour recharger.
 */
export default class ErrorBoundary extends Component {
  state = { erreur: null };

  static getDerivedStateFromError(erreur) {
    return { erreur };
  }

  componentDidCatch(erreur, info) {
    console.error("[DZ] Erreur d'affichage :", erreur, info?.componentStack);
  }

  render() {
    if (!this.state.erreur) return this.props.children;
    return (
      <div className="container page narrow">
        <div className="card empty" role="alert">
          <p className="big">😕 Oups, cette page a rencontré un problème.</p>
          <p className="muted small">Recharge la page. Si ça continue, contacte-nous sur WhatsApp.</p>
          <button className="btn btn-gold" onClick={() => location.reload()}>Recharger la page</button>
          <a className="link-gold" href="#/">Retour à l'accueil</a>
        </div>
      </div>
    );
  }
}
