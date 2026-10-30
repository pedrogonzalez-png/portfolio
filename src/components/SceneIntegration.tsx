import { lazy, Suspense, useEffect, useState } from "react";
import { useAccessibility } from "./accessibilityContext";
import { MobileParticleName } from "./MobileParticleName";

const Scene3D = lazy(() => import("../scenes/Scene3D"));

/**
 * Desktop keeps the original 3D physics and shader unchanged.
 * Phones use its matching point typography in Canvas2D; this also avoids
 * WebGL driver issues on Opera Android, and stays dotted in reduced motion.
 */
export default function SceneIntegration() {
  const { reducedMotion } = useAccessibility();
  const [useCanvas2D, setUseCanvas2D] = useState(true);

  useEffect(() => {
    const device = window.matchMedia("(max-width: 850px), (pointer: coarse)");
    const chooseRenderer = () => {
      if (device.matches || reducedMotion) {
        setUseCanvas2D(true);
        return;
      }
      try {
        const probe = document.createElement("canvas");
        setUseCanvas2D(!(probe.getContext("webgl2") || probe.getContext("webgl")));
      } catch {
        setUseCanvas2D(true);
      }
    };
    chooseRenderer();
    device.addEventListener?.("change", chooseRenderer);
    return () => device.removeEventListener?.("change", chooseRenderer);
  }, [reducedMotion]);

  if (useCanvas2D) return <MobileParticleName reducedMotion={reducedMotion} />;
  return (
    <Suspense fallback={<MobileParticleName reducedMotion={reducedMotion} />}>
      <Scene3D />
    </Suspense>
  );
}
