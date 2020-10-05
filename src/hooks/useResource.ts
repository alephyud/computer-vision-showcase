import * as React from "react";

export interface Resource<T> {
  resource: T | null;
  error: null | Error;
  loading: boolean;
  lastStart: Date;
  lastEnd: Date;
}

export default function useResource<T>(
  load: () => Promise<T>,
  { cleanup, debounce }: { cleanup?: () => void; debounce?: number } = {}
): Resource<T> {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [resource, setResource] = React.useState<T | null>(null);
  const [lastStart, setLastStart] = React.useState(new Date());
  const [lastEnd, setLastEnd] = React.useState(new Date());
  React.useEffect(() => {
    let debounceTimeout: number | null = null;
    const loadResource = async () => {
      setLoading(true);
      setError(null);
      setLastStart(new Date());
      if (debounce)
        await new Promise(
          (res) => (debounceTimeout = window.setTimeout(res, debounce))
        );
      try {
        setResource(await load());
      } catch (e) {
        console.error(e);
        setError(e);
      }
      setLoading(false);
      setLastEnd(new Date());
    };
    loadResource();
    return () => {
      setLoading(false);
      if (debounceTimeout) window.clearTimeout(debounceTimeout);
      else if (cleanup) cleanup();
    };
  }, [load, cleanup]);
  return { loading, error, resource, lastStart, lastEnd };
}
