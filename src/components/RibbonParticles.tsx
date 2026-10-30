import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
} from "three";
import { useTheme } from "../stores/themeContext";
import { advanceParticles, type ParticleState } from "../scenes/particlePhysics";

// Partículas em torno das três fitas do FlowingLight, com cores individuais.
// O mouse interage via contêiner, sem bloquear botões HTML nem o vidro.
const PARTICLE_COUNT = 1100;

type PointerState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lastTime: number;
  movedAt: number;
  lastBurstAt: number;
  burstStarted: number;
  burstX: number;
  burstY: number;
  nearParticle: boolean;
  idleFired: boolean;
  inside: boolean;
};

// Same pointer gesture rules as ParticleName (Scene3D.tsx).
// Uses the very same damped spring/burst solver as the hero title.

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
    gl_PointSize = min(16.0, aSize * uDpr * (1.0 + aGlow * 0.52));
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
    float halo = pow(max(0.0, 1.0 - d), 2.35);
    float opacity = (core * 0.48 + halo * 0.32) * (0.62 + vGlow * 0.35);
    vec3 color = vColor * (0.85 + vGlow * 0.42);
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
  const { viewport, gl, size } = useThree();
  const scale = size.width / viewport.width;
  const pointer = useRef<PointerState>({
    x: 100000, y: 100000, vx: 0, vy: 0,
    lastTime: 0, movedAt: 0, lastBurstAt: -100000,
    burstStarted: -100000, burstX: 100000, burstY: 100000,
    nearParticle: false, idleFired: false, inside: false,
  });
  const time = useRef(0);

  const particleData = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const glows = new Float32Array(PARTICLE_COUNT);
    const rest = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);
    const layers = new Float32Array(PARTICLE_COUNT);
    const seeds = new Float32Array(PARTICLE_COUNT);
    const springPositions = new Float32Array(PARTICLE_COUNT * 3);
    const targets = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const energy = new Float32Array(PARTICLE_COUNT);

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
      const layer = noise(i * 67 + 17);
      layers[i] = layer;
      seeds[i] = noise(i * 53 + 29);
      const spread = (noise(i * 31 + 11) - 0.5) * viewport.height * (0.11 + layer * 0.095);

      // Mesma curva matemática usada nas três fitas luminosas.
      const x = (t - 0.5) * viewport.width * 0.85
        + (noise(i * 23 + 3) - 0.5) * viewport.width * (0.025 + layer * 0.043);
      const y = Math.sin(t * Math.PI * (2.7 + band * 0.15) + phase)
        * viewport.height * (0.20 + band * 0.025)
        + (band - 1) * 0.53 + spread;
      const z = -3.8 + Math.sin(t * Math.PI * 2.2 + phase) * 0.7
        + (noise(i * 17 + 19) - 0.5) * (0.65 + layer * 1.15);

      const index = i * 3;
      rest[index] = positions[index] = x;
      rest[index + 1] = positions[index + 1] = y;
      rest[index + 2] = positions[index + 2] = z;
      phases[i] = seeds[i] * Math.PI * 2;
      springPositions[index] = targets[index] = x * scale;
      springPositions[index + 1] = targets[index + 1] = y * scale;
      springPositions[index + 2] = targets[index + 2] = z * scale;
      sizes[i] = 1.1 + layer * 2.7 + noise(i * 37 + 23) * 1.8;

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

    const state: ParticleState = {
      positions: springPositions,
      velocities,
      targets,
      seeds,
      energy,
      count: PARTICLE_COUNT,
    };
    return { geometry, positions, glows, rest, phases, layers, positionAttr, glowAttr, state };
  }, [
    viewport.width,
    viewport.height,
    scale,
    theme.palette.accentYellow,
    theme.palette.accentRed,
    theme.palette.accentPrimary,
  ]);

  useEffect(() => () => particleData.geometry.dispose(), [particleData]);

  // Same interaction as the author name: localized burst when the cursor
  // crosses the particle field, a single idle pulse, then spring reassembly.
  // Events are on the stage (canvas pointer-events:none), so HTML controls work.
  useEffect(() => {
    const stage = document.getElementById("knowledge-spatial-stage");
    if (!stage) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const bounds = stage.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = bounds.height / 2 - (event.clientY - bounds.top);
      const p = pointer.current;
      const now = performance.now();
      const deltaMs = Math.max(4, now - p.lastTime);
      const moved = Math.hypot(x - p.x, y - p.y);
      if (p.lastTime && moved > 1.8) {
        p.vx = Math.max(-1700, Math.min(1700, (x - p.x) * 1000 / deltaMs));
        p.vy = Math.max(-1700, Math.min(1700, (y - p.y) * 1000 / deltaMs));
      } else {
        p.vx = 0;
        p.vy = 0;
      }

      // Test ORIGINAL rest/target positions, never scattered positions.
      // Reusing the title's near-letter logic makes interactions local.
      let nearParticle = false;
      const targets = particleData.state.targets;
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const j = i * 3;
        const dx = targets[j] - x;
        const dy = targets[j + 1] - y;
        if (dx * dx + dy * dy < 1300) {
          nearParticle = true;
          break;
        }
      }

      const traveled = Math.hypot(x - p.burstX, y - p.burstY);
      if (nearParticle && now - p.lastBurstAt > 320
        && (!p.nearParticle || traveled > 78)) {
        p.burstStarted = now;
        p.burstX = x;
        p.burstY = y;
        p.lastBurstAt = now;
        p.idleFired = false;
      }
      if (moved > 4) {
        p.movedAt = now;
        p.idleFired = false;
      }
      p.x = x;
      p.y = y;
      p.lastTime = now;
      p.inside = true;
      p.nearParticle = nearParticle;
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const bounds = stage.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = bounds.height / 2 - (event.clientY - bounds.top);
      if (x < -bounds.width / 2 || x > bounds.width / 2
        || y < -bounds.height / 2 || y > bounds.height / 2) return;
      const p = pointer.current;
      p.burstX = x;
      p.burstY = y;
      p.burstStarted = performance.now();
      p.lastBurstAt = p.burstStarted;
      p.idleFired = true;
    };
    const onLeave = () => {
      const p = pointer.current;
      p.inside = false;
      p.nearParticle = false;
      p.vx = 0;
      p.vy = 0;
    };
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [particleData]);

  // Use the EXACT SAME spring physics as the hero name (advanceParticles).
  // Only the REST targets drift with the ambient ribbon animation.
  // Updates run before SharedGlass samples the scene into the FBO (-1).
  useFrame((_, delta) => {
    const { positions, rest, phases, layers, glows, positionAttr, glowAttr, state } = particleData;
    const dt = Math.min(0.04, delta);
    if (dt <= 0) return;
    time.current += dt;
    const now = performance.now();
    const p = pointer.current;

    // Identical idle trigger used in ParticleName.
    if (p.inside && p.nearParticle && !p.idleFired
      && now - p.movedAt > 950 && now - p.lastBurstAt > 900) {
      p.burstStarted = now;
      p.burstX = p.x;
      p.burstY = p.y;
      p.lastBurstAt = now;
      p.idleFired = true;
    }

    const timeSinceMove = now - p.lastTime;
    const damping = Math.exp(-7 * dt);
    p.vx *= damping;
    p.vy *= damping;
    if (timeSinceMove > 300) {
      p.vx = 0;
      p.vy = 0;
    }

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const k = i * 3;
      const phase = phases[i];
      const layer = layers[i];
      const orbit = time.current * (0.42 + layer * 0.23) + phase;
      state.targets[k] = scale * (
        rest[k] + Math.sin(orbit) * (0.045 + layer * 0.11)
        + Math.sin(time.current * 0.72 + phase * 1.7) * 0.04
      );
      state.targets[k + 1] = scale * (
        rest[k + 1] + Math.cos(orbit * 0.92) * (0.045 + layer * 0.10)
        + Math.sin(time.current * 0.29) * 0.12
      );
      state.targets[k + 2] = scale * (
        rest[k + 2] + Math.sin(time.current * 0.47 + phase) * (0.07 + layer * 0.22)
      );
    }

    advanceParticles(state, {
      dt,
      time: time.current,
      burstAge: (now - p.burstStarted) / 1000,
      burstX: p.burstX,
      burstY: p.burstY,
      width: size.width,
      pointerX: p.x,
      pointerY: p.y,
      pointerVX: p.vx,
      pointerVY: p.vy,
      pointerActive: p.nearParticle && timeSinceMove < 180,
    });

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const k = i * 3;
      positions[k] = state.positions[k] / scale;
      positions[k + 1] = state.positions[k + 1] / scale;
      positions[k + 2] = state.positions[k + 2] / scale;
      glows[i] = Math.min(1.35, state.energy[i] * 1.15
        + 0.08 * (0.5 + Math.sin(time.current * 1.25 + phases[i]) * 0.5));
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
