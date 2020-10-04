import * as React from "react";

interface Size {
  width: number;
  height: number;
}

export default function useSizeRef<E extends HTMLElement>(): [
  React.RefObject<E>,
  Size
] {
  const ref = React.useRef<E>(null);
  const [size, setSize] = React.useState<{ width: number; height: number }>({
    width: 640,
    height: 480,
  });
  React.useEffect(() => {
    function refreshSize() {
      if (!ref.current) return;
      const { clientWidth, clientHeight } = ref.current;
      setSize({ width: clientWidth, height: clientHeight });
    }
    const af = requestAnimationFrame(refreshSize);
    window.addEventListener("resize", refreshSize);
    return () => {
      cancelAnimationFrame(af);
      window.removeEventListener("resize", refreshSize);
    };
  }, []);
  return [ref, size];
}
