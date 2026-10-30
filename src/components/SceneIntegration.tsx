import { lazy, Suspense, useEffect, useState } from "react";
import { useAccessibility } from "./accessibilityContext";
import { ParticleNameCanvas } from "./ParticleNameCanvas";

const Scene3D = lazy(() => import("../scenes/Scene3D"));

/**
 * Prefer the original WebGL physics on desktop. On phones, reduced-motion
 * devices and browsers without WebGL, render the same creator name as visible
 * Canvas2D dots instead of silently falling back to a solid text heading.
 */
export default function SceneIntegration() {
  const { reducedMotion } = useAccessibility();
  const [mode, setMode] = useState<"2d" | "webgl">("2d");

  useEffect(() => {
    const query = window.matchMedia("(max-width: 850px), (pointer: coarse)");
    const refresh = () => {
      if (reducedMotion || query.matches) {
        setMode("2d");
        return;
      }
      try {
        const probe = document.createElement("canvas");
        setMode(probe.getContext("webgl2") || probe.getContext("webgl") ? "webgl" : "2d");
      } catch {
        setMode("2d");
      }
    };
    refresh();
    query.addEventListener?.("change", refresh);
    return () => query.removeEventListener?.("change", refresh);
  }, [reducedMotion]);

  if (mode === "2d") {
    return <ParticleNameCanvas reducedMotion={reducedMotion} />;
  }
  return (
    <Suspense fallback={<ParticleNameCanvas reducedMotion={reducedMotion} />}>
      <Scene3D />
    </Suspense>
  );
}
