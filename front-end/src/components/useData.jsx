import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Charge des données via une fonction async.
 * Renvoie { data, loading, error, reload }.
 * `deps` : quand une de ces valeurs change, les données sont rechargées.
 * Pendant un rechargement, les anciennes données restent affichées.
 */
export default function useData(loader, deps = []) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({ data: null, error: null, key: null });
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  const key = `${JSON.stringify(deps)}#${version}`;

  useEffect(() => {
    let annule = false;
    Promise.resolve()
      .then(() => loaderRef.current())
      .then((data) => {
        if (!annule) setState({ data, error: null, key });
      })
      .catch((error) => {
        if (!annule) setState((s) => ({ data: s.data, error, key }));
      });
    return () => {
      annule = true;
    };
  }, [key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const loading = state.key !== key;
  return { data: state.data, error: loading ? null : state.error, loading, reload };
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
