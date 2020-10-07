import React from "react";

export default function useWindowFocus() {
  const [focused, setFocused] = React.useState(true);
  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);
  React.useEffect(() => {
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  });
  return focused;
}
