import * as React from "react";

/**
 * A convenience wrapper around an asynchronously loaded resource with
 * loading and error states.
 */
export interface Resource<T> {
  resource: T | null;
  error: null | Error;
  loading: boolean;
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
  React.useEffect(() => {
    let delayTimeout: number | null = null;
    const loadResource = async () => {
      setLoading(true);
      setError(null);
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
    };
    void loadResource();
    return () => {
      setLoading(false);
      if (cleanup) cleanup(delayTimeout);
      else if (delayTimeout) window.clearTimeout(delayTimeout);
    };
  }, [load, cleanup, delay]);
  return { loading, error, resource };
}
