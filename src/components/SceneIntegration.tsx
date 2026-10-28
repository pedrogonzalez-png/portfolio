import { lazy, Suspense, useEffect, useState } from "react";
import { useAccessibility } from "./accessibilityContext";

const Scene3D = lazy(() => import("../scenes/Scene3D"));

export default function SceneIntegration() {
  const { reducedMotion } = useAccessibility();
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let enabled = false;
    if (!reducedMotion) {
      try {
        const canvas = document.createElement("canvas");
        enabled = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
      } catch {
        enabled = false;
      }
    }
    setAvailable(enabled);
    document.documentElement.classList.toggle("has-webgl", enabled);
    return () => document.documentElement.classList.remove("has-webgl");
  }, [reducedMotion]);

  if (!available) return null;
  return (
    <Suspense fallback={null}>
      <Scene3D />
    </Suspense>
  );
}
