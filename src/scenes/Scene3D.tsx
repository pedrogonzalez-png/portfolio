import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending } from "three";
import type { BufferAttribute } from "three";

type ParticleData = {
  positions: Float32Array;
  velocities: Float32Array;
  targets: Float32Array;
  seeds: Float32Array;
  energy: Float32Array;
  count: number;
};

/** Sample the actual accessible heading, at its computed CSS size. */
function sampleHeading(width: number, height: number): ParticleData {
  const targets: number[] = [];
  const seeds: number[] = [];
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const element = document.getElementById("hero-name");
  const fallback = element?.querySelector(".hero-title-fallback");
  if (context && element && fallback) {
    const style = window.getComputedStyle(element);
    const fontSize = Number.parseFloat(style.fontSize) || 100;
    context.font = "700 " + fontSize + 'px "Space Grotesk", sans-serif';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#fff";
    context.fillText(fallback.textContent || "NOME DO AUTOR", width / 2, height / 2, width * 0.96);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const stride = width < 650 ? 2 : 3;
    for (let y = 0; y < canvas.height; y += stride) {
      for (let x = 0; x < canvas.width; x += stride) {
        if (pixels[(y * canvas.width + x) * 4 + 3] < 160) continue;
        const i = seeds.length;
        const r = Math.abs(Math.sin((i + 1) * 78.233) * 43758.5453) % 1;
        targets.push(
          x - width / 2 + (r - 0.5) * stride * 0.7,
          height / 2 - y + (0.5 - r) * stride * 0.7,
          Math.sin(i * 3.17) * 3.2,
        );
        seeds.push(r);
      }
    }
  }
  const count = seeds.length;
  const targetArray = new Float32Array(targets);
  const positions = new Float32Array(targets.length);
  for (let i = 0; i < count; i++) {
    const j = i * 3;
    const seed = seeds[i];
    const direction = i * 2.39996;
    const spread = 15 + seed * Math.min(width * 0.13, 80);
    positions[j] = targets[j] + Math.cos(direction) * spread;
    positions[j + 1] = targets[j + 1] + Math.sin(direction) * spread;
    positions[j + 2] = targets[j + 2] + (seed - 0.5) * 35;
  }
  return {
    positions,
    velocities: new Float32Array(targets.length),
    targets: targetArray,
    seeds: new Float32Array(seeds),
    energy: new Float32Array(count),
    count,
  };
}

const vertex = `
  attribute float aSeed;
  attribute float aEnergy;
  uniform float uPixelRatio;
  varying float vEnergy;
  varying float vSeed;
  void main() {
    vEnergy = clamp(aEnergy, 0.0, 1.0);
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(6.5, (1.4 + aSeed * 1.5 + vEnergy * 1.2) * uPixelRatio);
  }
`;
const fragment = `
  varying float vEnergy;
  varying float vSeed;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = dot(uv, uv);
    float alpha = exp(-dist * 22.0) * (0.76 + vEnergy * 0.24);
    vec3 bronze = vec3(0.75, 0.25, 0.17);
    vec3 gold = vec3(0.99, 0.67, 0.37);
    vec3 fast = vec3(1.0, 0.97, 0.89);
    vec3 color = mix(mix(bronze, gold, vSeed), fast, vEnergy * 0.85);
    gl_FragColor = vec4(color, alpha);
  }
`;

type PointerState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  movedAt: number;
  lastTime: number;
  inside: boolean;
  fired: boolean;
  impulse: number;
};

function ParticleName() {
  const { size, gl } = useThree();
  const data = useMemo(() => sampleHeading(size.width, size.height), [size.width, size.height]);
  const positionAttribute = useRef<BufferAttribute>(null);
  const energyAttribute = useRef<BufferAttribute>(null);
  const pointer = useRef<PointerState>({
    x: 100000, y: 100000, vx: 0, vy: 0,
    movedAt: 0, lastTime: 0, inside: false, fired: false, impulse: 0,
  });
  const time = useRef(0);

  useEffect(() => {
    const title = document.getElementById("hero-name");
    if (!title || !data.count) return;
    const onMove = (event: PointerEvent) => {
      const box = title.getBoundingClientRect();
      const x = event.clientX - box.left - box.width / 2;
      const y = box.height / 2 - (event.clientY - box.top);
      const insideBox = event.clientX >= box.left && event.clientX <= box.right
        && event.clientY >= box.top && event.clientY <= box.bottom;

      // Only trigger when the cursor rests on a letter, not in empty gaps.
      let nearLetter = false;
      if (insideBox) {
        for (let i = 0; i < data.count; i++) {
          const j = i * 3;
          const dx = data.targets[j] - x;
          const dy = data.targets[j + 1] - y;
          if (dx * dx + dy * dy < 360) {
            nearLetter = true;
            break;
          }
        }
      }

      const p = pointer.current;
      const now = performance.now();
      const deltaMs = Math.max(4, now - p.lastTime);
      const distance = Math.hypot(x - p.x, y - p.y);
      if (p.lastTime && distance > 1.8) {
        p.vx = Math.max(-1600, Math.min(1600, (x - p.x) * 1000 / deltaMs));
        p.vy = Math.max(-1600, Math.min(1600, (y - p.y) * 1000 / deltaMs));
      } else {
        p.vx = 0;
        p.vy = 0;
      }
      if (distance > 3 || p.inside !== nearLetter) {
        p.movedAt = now;
        p.fired = false;
      }
      p.x = x;
      p.y = y;
      p.lastTime = now;
      p.inside = nearLetter;
    };
    const onLeave = () => { pointer.current.inside = false; pointer.current.fired = false; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);
    title.classList.add("particles-ready");
    return () => {
      title.classList.remove("particles-ready");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
    };
  }, [data]);

  useFrame((_, delta) => {
    if (!data.count || !positionAttribute.current || !energyAttribute.current) return;
    const dt = Math.min(0.035, delta);
    const now = performance.now();
    const p = pointer.current;
    time.current += dt;

    if (p.inside && !p.fired && now - p.movedAt > 900) {
      p.fired = true;
      p.impulse = 1.0;
    }
    const moveAmount = Math.min(1, Math.hypot(p.vx, p.vy) / 900);
    const moveDecay = Math.exp(-8 * dt);
    const damping = Math.exp(-4.4 * dt);
    const spring = 20;
    const pos = data.positions;
    const vel = data.velocities;
    const targets = data.targets;

    for (let i = 0; i < data.count; i++) {
      const j = i * 3;
      const seed = data.seeds[i];
      const tx = targets[j] + Math.sin(time.current * 0.85 + seed * 23) * 0.46;
      const ty = targets[j + 1] + Math.cos(time.current * 0.77 + seed * 19) * 0.46;
      const dx = pos[j] - p.x;
      const dy = pos[j + 1] - p.y;
      const distSq = dx * dx + dy * dy;
      const falloff = p.inside ? Math.exp(-distSq / (85 * 85)) : 0;
      const dist = Math.sqrt(distSq + 1);

      // Igloo-like local stirring: mouse velocity pushes particles in its
      // direction while a radial force opens a short-lived wake.
      vel[j] += ((tx - pos[j]) * spring
        + falloff * (dx / dist * 1800 * (0.4 + moveAmount)
        + p.vx * 1.25 + (-dy / dist) * 260 * moveAmount)
        + falloff * dx / dist * 3000 * p.impulse) * dt;
      vel[j + 1] += ((ty - pos[j + 1]) * spring
        + falloff * (dy / dist * 1800 * (0.4 + moveAmount)
        + p.vy * 1.25 + (dx / dist) * 260 * moveAmount)
        + falloff * dy / dist * 3000 * p.impulse) * dt;
      vel[j + 2] += ((targets[j + 2] - pos[j + 2]) * spring
        + falloff * (200 * moveAmount + 900 * p.impulse) * (seed - 0.5)) * dt;

      vel[j] *= damping;
      vel[j + 1] *= damping;
      vel[j + 2] *= damping;
      pos[j] += vel[j] * dt;
      pos[j + 1] += vel[j + 1] * dt;
      pos[j + 2] += vel[j + 2] * dt;
      const speed = Math.hypot(vel[j], vel[j + 1], vel[j + 2]);
      data.energy[i] = Math.min(1, speed / 240);
    }

    p.vx *= moveDecay;
    p.vy *= moveDecay;
    p.impulse = Math.max(0, p.impulse - dt * 2.2);
    positionAttribute.current.needsUpdate = true;
    energyAttribute.current.needsUpdate = true;
  });

  if (!data.count) return null;
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute ref={positionAttribute} attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[data.seeds, 1]} />
        <bufferAttribute ref={energyAttribute} attach="attributes-aEnergy" args={[data.energy, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{ uPixelRatio: { value: Math.min(1.75, gl.getPixelRatio()) } }}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

/** The canvas occupies exactly the h1 area, so text and particles cannot double up. */
export default function Scene3D() {
  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas orthographic camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 1000 }}
        dpr={[1, 1.75]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
        <ParticleName />
      </Canvas>
    </div>
  );
}
