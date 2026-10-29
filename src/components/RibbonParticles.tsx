import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Vector2,
} from "three";
import { useTheme } from "../stores/themeContext";

// Partículas em torno das três fitas do FlowingLight, com cores individuais.
// O mouse interage via contêiner, sem bloquear botões HTML nem o vidro.
const PARTICLE_COUNT = 480;

const vertexShader = `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aGlow;
  uniform float uDpr;
  varying vec3 vColor;
  varying float vGlow;

  void main() {
    vColor = aColor;
    vGlow = aGlow;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = min(15.0, aSize * uDpr * (1.0 + aGlow * 0.68));
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vGlow;

  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = length(p);
    if (d > 1.0) discard;

    float core = 1.0 - smoothstep(0.08, 0.34, d);
    float halo = pow(max(0.0, 1.0 - d), 2.15);
    float opacity = (core * 0.52 + halo * 0.37) * (0.67 + vGlow * 0.35);
    vec3 color = vColor * (0.86 + vGlow * 0.52);
    gl_FragColor = vec4(color, opacity);
  }
`;

// Distribuição estável, sem Math.random por render.
const noise = (n: number) => {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

export default function RibbonParticles() {
  const { theme } = useTheme();
  const { viewport, gl } = useThree();
  const mouse = useRef(new Vector2());
  const mouseActive = useRef(false);

  const particleData = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const glows = new Float32Array(PARTICLE_COUNT);
    const rest = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);

    const palette = [
      theme.palette.accentYellow,
      theme.palette.accentRed,
      theme.palette.accentPrimary,
      "#8daeda",
      "#c9b1e9",
      "#a2d5d0",
      "#ffead0",
    ].map((hex) => new Color(hex));

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const band = i % 3;
      const t = noise(i * 13 + 7);
      const phase = band * 1.55;
      const spread = (noise(i * 31 + 11) - 0.5) * viewport.height * 0.15;

      // Mesma curva matemática usada nas três fitas luminosas.
      const x = (t - 0.5) * viewport.width * 0.85
        + (noise(i * 23 + 3) - 0.5) * viewport.width * 0.038;
      const y = Math.sin(t * Math.PI * (2.7 + band * 0.15) + phase)
        * viewport.height * (0.20 + band * 0.025)
        + (band - 1) * 0.53 + spread;
      const z = -3.8 + Math.sin(t * Math.PI * 2.2 + phase) * 0.7
        + (noise(i * 17 + 19) - 0.5) * 1.3;

      const index = i * 3;
      rest[index] = positions[index] = x;
      rest[index + 1] = positions[index + 1] = y;
      rest[index + 2] = positions[index + 2] = z;
      phases[i] = noise(i * 53 + 29) * Math.PI * 2;
      sizes[i] = 1.6 + noise(i * 37 + 23) * 3.2;

      const chosen = palette[Math.floor(noise(i * 41 + 5) * palette.length)];
      const brightness = 0.70 + noise(i * 43 + 9) * 0.42;
      colors[index] = chosen.r * brightness;
      colors[index + 1] = chosen.g * brightness;
      colors[index + 2] = chosen.b * brightness;
    }

    const geometry = new BufferGeometry();
    const positionAttr = new BufferAttribute(positions, 3);
    const glowAttr = new BufferAttribute(glows, 1);
    positionAttr.setUsage(DynamicDrawUsage);
    glowAttr.setUsage(DynamicDrawUsage);
    geometry.setAttribute("position", positionAttr);
    geometry.setAttribute("aColor", new BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
    geometry.setAttribute("aGlow", glowAttr);

    return { geometry, positions, glows, rest, phases, positionAttr, glowAttr };
  }, [
    viewport.width,
    viewport.height,
    theme.palette.accentYellow,
    theme.palette.accentRed,
    theme.palette.accentPrimary,
  ]);

  useEffect(() => () => particleData.geometry.dispose(), [particleData]);

  // O canvas está com pointer-events:none. Eventos no contêiner permitem
  // reação ao mouse mesmo ao passar em cima de botões e áreas de vidro.
  useEffect(() => {
    const stage = document.getElementById("knowledge-spatial-stage");
    if (!stage) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      mouse.current.set(
        ((event.clientX - rect.left) / rect.width - 0.5) * viewport.width,
        (0.5 - (event.clientY - rect.top) / rect.height) * viewport.height,
      );
      mouseActive.current = true;
    };
    const onLeave = () => { mouseActive.current = false; };

    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [viewport.width, viewport.height]);

  useFrame(({ clock }, delta) => {
    const { positions, rest, phases, glows, positionAttr, glowAttr } = particleData;
    const time = clock.elapsedTime;
    const ease = 1 - Math.exp(-Math.min(delta, 0.05) * 9);
    const radius = Math.min(viewport.width, viewport.height) * 0.24;
    const driftY = Math.sin(time * 0.26) * 0.12;
    const angle = Math.sin(time * 0.12) * 0.036;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const index = i * 3;
      const phase = phases[i];
      const bx = rest[index];
      const bz = rest[index + 2];
      let x = bx * cosA + bz * sinA + Math.sin(time * 0.6 + phase) * 0.05;
      let y = rest[index + 1] + driftY + Math.cos(time * 0.72 + phase) * 0.065;
      const z = -bx * sinA + bz * cosA;
      let glow = 0.08 + 0.15 * (0.5 + Math.sin(time * 1.25 + phase) * 0.5);

      if (mouseActive.current) {
        const dx = x - mouse.current.x;
        const dy = y - mouse.current.y;
        const distance = Math.hypot(dx, dy);
        if (distance < radius) {
          const influence = Math.pow(1 - distance / radius, 2);
          const inv = 1 / Math.max(0.04, distance);
          // Repulsão + giro tangencial para movimento orgânico.
          x += (dx * inv * 1.65 - dy * inv * 0.35) * influence;
          y += (dy * inv * 1.65 + dx * inv * 0.35) * influence;
          glow += influence * 1.55;
        }
      }

      positions[index] += (x - positions[index]) * ease;
      positions[index + 1] += (y - positions[index + 1]) * ease;
      positions[index + 2] += (z - positions[index + 2]) * ease;
      glows[i] += (glow - glows[i]) * ease;
    }

    positionAttr.needsUpdate = true;
    glowAttr.needsUpdate = true;
  }, -2);

  const uniforms = useMemo(() => ({
    uDpr: { value: gl.getPixelRatio() },
  }), [gl]);

  return (
    <points geometry={particleData.geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest
        blending={AdditiveBlending}
      />
    </points>
  );
}
