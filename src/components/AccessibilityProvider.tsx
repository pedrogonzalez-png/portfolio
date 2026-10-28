import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AccessibilityContextValue {
  reducedMotion: boolean;
  audioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    setMatches(m.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [audioMuted, setAudioMutedState] = useState(true); // áudio desligado até opt-in (doc 01)
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

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}