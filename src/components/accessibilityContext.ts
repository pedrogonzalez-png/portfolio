import { createContext, useContext } from "react";

export interface AccessibilityContextValue {
  reducedMotion: boolean;
  audioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
}

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
