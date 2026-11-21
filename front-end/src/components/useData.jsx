import { useCallback, useEffect, useState } from "react";

/** Charge des données via une fonction async. Renvoie { data, loading, error, reload }. */
export default function useData(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(loader, deps);

  const reload = useCallback(() => {
    let annule = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(load)
      .then((data) => !annule && setState({ data, loading: false, error: null }))
      .catch((error) => !annule && setState({ data: null, loading: false, error }));
    return () => { annule = true; };
  }, [load]);

  useEffect(() => reload(), [reload]);
  return { ...state, reload };
}

export function Chargement() {
  return <div className="loader" aria-label="Chargement" />;
}

export function Erreur({ error, onRetry }) {
  return (
    <div className="card empty">
      <p>😕 {error?.message || "Une erreur est survenue."}</p>
      {onRetry && <button className="btn btn-outline" onClick={onRetry}>Réessayer</button>}
    </div>
  );
}
