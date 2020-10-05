import * as React from "react";

/**
 * A convenience wrapper around an asynchronously loaded resource with
 * loading and error states.
 */
export interface Resource<T> {
  resource: T | null;
  error: null | Error;
  loading: boolean;
  lastStart: Date; // last time the resource has started loading
  lastEnd: Date; // last time resource has been completely loaded
}

interface ResourceProps {
  /**
   * A delay interval in milliseconds before loading the resource.
   * This helps to display the loading message if loading the result involves
   * blocking the main thread for an extended period of time.
   */
  delay?: number;
  /**
   * A cleanup function. In case if there is a delayed execution scheduled,
   * it's the cleanup function's responsibility to cancel the timeout.
   */
  cleanup?: (delayTimeout?: number | null) => void;
}

export default function useResource<T>(
  load: () => Promise<T>, // An asynchronous function that return the loaded resource
  { cleanup, delay }: ResourceProps = {}
): Resource<T> {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [resource, setResource] = React.useState<T | null>(null);
  const [lastStart, setLastStart] = React.useState(new Date());
  const [lastEnd, setLastEnd] = React.useState(new Date());
  React.useEffect(() => {
    let delayTimeout: number | null = null;
    const loadResource = async () => {
      setLoading(true);
      setError(null);
      setLastStart(new Date());
      if (delay)
        await new Promise(
          (res) => (delayTimeout = window.setTimeout(res, delay))
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
    void loadResource();
    return () => {
      setLoading(false);
      if (cleanup) cleanup(delayTimeout);
      else if (delayTimeout) window.clearTimeout(delayTimeout);
    };
  }, [load, cleanup, delay]);
  return { loading, error, resource, lastStart, lastEnd };
}
