import { useEffect, useState } from 'react';

/**
 * Tiny data hook. `loader` is an async function and `deps` retrigger it.
 * Returns `{ data, loading, error, refresh }`. Cancels in-flight reloads via
 * an `AbortController` passed to the loader as its `signal`.
 */
export function useAsyncData(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    let live = true;
    setLoading(true);
    setError(null);

    Promise.resolve(loader({ signal: ctrl.signal }))
      .then((result) => {
        if (live) setData(result);
      })
      .catch((err) => {
        if (live && err?.name !== 'CanceledError' && err?.name !== 'AbortError') {
          setError(err);
        }
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { data, loading, error, refresh: () => setReloadKey((k) => k + 1) };
}
