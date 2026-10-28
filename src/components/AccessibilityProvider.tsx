import { useCallback, useEffect, useMemo, useState } from "react";
import { AccessibilityContext, type AccessibilityContextValue } from "./accessibilityContext";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const queryList = window.matchMedia(query);
    setMatches(queryList.matches);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    queryList.addEventListener("change", handler);
    return () => queryList.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [audioMuted, setAudioMutedState] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(systemReduced);

  useEffect(() => {
    setReducedMotion(systemReduced);
  }, [systemReduced]);

  const setAudioMuted = useCallback((muted: boolean) => {
    setAudioMutedState(muted);
  }, []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({ reducedMotion, audioMuted, setAudioMuted, setReducedMotion }),
    [reducedMotion, audioMuted, setAudioMuted],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}
