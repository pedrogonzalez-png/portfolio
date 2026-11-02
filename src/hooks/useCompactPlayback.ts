import { useEffect, useState } from "react";

/** Compact screens and touch devices shouldn't decode five simultaneous MP4 covers. */
export function useCompactPlayback() {
  const isCompact = () => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 760px)").matches;
  };
  const [compact, setCompact] = useState(isCompact);
  useEffect(() => {
    if (!window.matchMedia) return;
    const queries = [
      window.matchMedia("(pointer: coarse)"),
      window.matchMedia("(max-width: 760px)"),
    ];
    const update = () => setCompact(queries.some(query => query.matches));
    update();
    queries.forEach(query => query.addEventListener?.("change", update));
    return () => queries.forEach(query => query.removeEventListener?.("change", update));
  }, []);
  return compact;
}
