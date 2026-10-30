import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Color, Vector2 } from "three";
import type { ShaderMaterial } from "three";
import { useTheme } from "../stores/themeContext";

// Animated caustics, fluid interference and cursor ripples behind the glass.
// The scene is optical/abstract, not an actual water simulation.
const waterVertex = [
  "varying vec2 vUv;",
  "void main() {",
  "  vUv = uv;",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
  "}",
].join("\n");

const waterFragment = [
  "uniform float uTime;",
  "uniform float uRippleStart;",
  "uniform float uPointerStrength;",
  "uniform float uAspect;",
  "uniform vec2 uPointer;",
  "uniform vec2 uRipple;",
  "uniform vec3 uPrimary;",
  "uniform vec3 uWarm;",
  "varying vec2 vUv;",
  "void main() {",
  "  vec2 uv = vUv;",
  "  float t = uTime * 0.32;",
  "  // Two intersecting, slightly drifting sets of waves.",
  "  vec2 warped = uv + 0.012 * vec2(",
  "    sin(uv.y*13.0 + t*1.2) + sin(uv.x*8.0 - t),",
  "    cos(uv.x*12.0 - t*0.8) + cos(uv.y*11.0 + t)",
  "  );",
  "  float a = sin(warped.x*30.0 + sin(warped.y*16.0 + t)*2.1 + t*1.3);",
  "  float b = cos(warped.y*25.0 - sin(warped.x*14.0 - t)*1.8 - t);",
  "  float interference = a*b;",
  "  float caustic = pow(max(0.0, interference), 5.0);",
  "  // One expanding ring follows recent pointer movement; it fades gracefully.",
  "  float age = max(0.0, uTime - uRippleStart);",
  "  float dist = length((uv-uRipple)*vec2(uAspect, 1.0));",
  "  float radius = age*0.37;",
  "  float ring = exp(-pow((dist-radius)*24.0, 2.0))*exp(-age*1.55);",
  "  float nearPointer = exp(-pow(length((uv-uPointer)*vec2(uAspect,1.0))*8.0,2.0));",
  "  float shimmer = caustic*(0.10 + 0.035*sin(t*2.2));",
  "  float ripples = ring*0.24 + nearPointer*uPointerStrength*0.035;",
  "  vec3 color = uPrimary*(shimmer + ripples*0.65)",
  "    + uWarm*(caustic*0.035 + ripples*0.20);",
  "  float alpha = clamp(0.065 + caustic*0.13 + ripples*0.30, 0.0, 0.28);",
  "  gl_FragColor = vec4(color, alpha);",
  "}",
].join("\n");

export default function WaterVeil() {
  const { theme } = useTheme();
  const { viewport } = useThree();
  const material = useRef<ShaderMaterial>(null);
  const targetPointer = useRef(new Vector2(0.5, 0.5));
  const pendingRipple = useRef(false);
  const active = useRef(false);
  const lastWave = useRef(0);
  const lastLocation = useRef(new Vector2(-1, -1));

  // A larger plane keeps the caustics from ending at the canvas edges.
  const planeWidth = viewport.width * 1.65;
  const planeHeight = viewport.height * 1.6;
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRippleStart: { value: -100 },
    uPointerStrength: { value: 0 },
    uAspect: { value: planeWidth / planeHeight },
    uPointer: { value: new Vector2(0.5, 0.5) },
    uRipple: { value: new Vector2(0.5, 0.5) },
    uPrimary: { value: new Color(theme.palette.accentPrimary) },
    uWarm: { value: new Color(theme.palette.accentYellow) },
  }), [planeWidth, planeHeight, theme.palette.accentPrimary, theme.palette.accentYellow]);

  useEffect(() => {
    const stage = document.getElementById("knowledge-spatial-stage");
    if (!stage) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const rect = stage.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      const nextX = 0.5 + (x - 0.5) / 1.65;
      const nextY = 0.5 + (y - 0.5) / 1.6;
      targetPointer.current.set(nextX, nextY);
      active.current = true;

      // Rate-limit visible rings; continuous fast mouse movements still affect
      // the fluid through the smoothly interpolated uPointer uniform.
      const now = event.timeStamp;
      const moved = lastLocation.current.distanceToSquared(targetPointer.current) > 0.00015;
      if (moved && now - lastWave.current > 130) {
        pendingRipple.current = true;
        lastWave.current = now;
        lastLocation.current.copy(targetPointer.current);
      }
    };
    const onLeave = () => { active.current = false; };

    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  // Run before the shared refraction capture (-1) so the ripples appear
  // through the glass in the same frame.
  useFrame(({ clock }, delta) => {
    const data = material.current?.uniforms;
    if (!data) return;
    data.uTime.value = clock.elapsedTime;
    const ease = 1 - Math.exp(-Math.min(delta, 0.05)*7);
    (data.uPointer.value as Vector2).lerp(targetPointer.current, ease);
    const targetStrength = active.current ? 1 : 0;
    data.uPointerStrength.value +=
      (targetStrength-data.uPointerStrength.value)*ease;
    if (pendingRipple.current) {
      (data.uRipple.value as Vector2).copy(targetPointer.current);
      data.uRippleStart.value = clock.elapsedTime;
      pendingRipple.current = false;
    }
  }, -2);

  return (
    <mesh position={[0, 0, -6.9]} frustumCulled={false}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={waterVertex}
        fragmentShader={waterFragment}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}
