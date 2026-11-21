import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Modal({ title, onClose, children, wide }) {
  const boite = useRef(null);
  const fermer = useRef(onClose);
  useEffect(() => {
    fermer.current = onClose;
  });

  // À l'ouverture seulement : bloque le défilement, place le focus dans la fenêtre,
  // garde la touche Tab à l'intérieur, Échap ferme, et rend le focus à la fermeture.
  useEffect(() => {
    const avant = document.activeElement;
    document.body.classList.add("no-scroll");
    const premier = boite.current?.querySelector(".modal-body " + FOCUSABLES) || boite.current?.querySelector(FOCUSABLES);
    premier?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === "Escape") return fermer.current();
      if (e.key !== "Tab" || !boite.current) return;
      const liste = [...boite.current.querySelectorAll(FOCUSABLES)];
      if (!liste.length) return;
      const [debut, fin] = [liste[0], liste[liste.length - 1]];
      if (e.shiftKey && document.activeElement === debut) { e.preventDefault(); fin.focus(); }
      else if (!e.shiftKey && document.activeElement === fin) { e.preventDefault(); debut.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
      if (avant && typeof avant.focus === "function") avant.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={boite} className={`modal ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
