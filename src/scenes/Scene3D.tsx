import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Color } from "three";
import { useTheme } from "../stores/themeContext";
import type { BufferAttribute, ShaderMaterial } from "three";
import { advanceParticles, type ParticleState } from "./particlePhysics";

type ParticleData = ParticleState;

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
    context.fillText(fallback.textContent || "PORTFÓLIO 3D", width / 2, height / 2, Math.min(width * 0.9, element.getBoundingClientRect().width * 0.96));
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
  uniform vec3 uBronze;
  uniform vec3 uGold;
  uniform vec3 uFast;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = dot(uv, uv);
    float alpha = exp(-dist * 22.0) * (0.76 + vEnergy * 0.24);
    vec3 color = mix(mix(uBronze, uGold, vSeed), uFast, vEnergy * 0.85);
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
  nearLetter: boolean;
  idleFired: boolean;
  burstStarted: number;
  burstX: number;
  burstY: number;
  lastBurstAt: number;
};

function ParticleName() {
  const { theme } = useTheme();
  const colors = useMemo(() => ({
    bronze: new Color(theme.palette.accentPrimary),
    gold: new Color(theme.palette.accentYellow),
    fast: new Color(theme.palette.text),
  }), [theme.palette]);
  const material = useRef<ShaderMaterial>(null);
  const { size, gl } = useThree();
  const data = useMemo(() => sampleHeading(size.width, size.height), [size.width, size.height]);
  const positionAttribute = useRef<BufferAttribute>(null);
  const energyAttribute = useRef<BufferAttribute>(null);
  const pointer = useRef<PointerState>({
    x: 100000, y: 100000, vx: 0, vy: 0,
    movedAt: 0, lastTime: 0, inside: false, nearLetter: false,
    idleFired: false, burstStarted: -100000, burstX: 100000, burstY: 100000, lastBurstAt: -100000,
  });
  const time = useRef(0);

  useEffect(() => {
    const title = document.getElementById("hero-name");
    if (!title || !data.count) return;
    const onMove = (event: PointerEvent) => {
      const box = title.getBoundingClientRect();
      const canvasBox = gl.domElement.getBoundingClientRect();
      // The canvas is deliberately larger than the heading so dispersed
      // particles remain visible above and below the letters.
      const x = event.clientX - canvasBox.left - canvasBox.width / 2;
      const y = canvasBox.height / 2 - (event.clientY - canvasBox.top);
      const insideBox = event.clientX >= box.left && event.clientX <= box.right
        && event.clientY >= box.top && event.clientY <= box.bottom;

      // Letter proximity is only required for the idle re-trigger, not hover
      // activation; grazing the letter edge must still start a visible burst.
      let nearLetter = false;
      if (insideBox) {
        for (let i = 0; i < data.count; i++) {
          const j = i * 3;
          const dx = data.targets[j] - x;
          const dy = data.targets[j + 1] - y;
          if (dx * dx + dy * dy < 750) {
            nearLetter = true;
            break;
          }
        }
      }

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

      // Start a localized pulse only when entering a glyph or moving
      // far enough along the text to reach the next letter neighborhood.
      const traveled = Math.hypot(x - p.burstX, y - p.burstY);
      if (nearLetter && now - p.lastBurstAt > 320
        && (!p.nearLetter || traveled > 78)) {
        p.burstStarted = now;
        p.burstX = x;
        p.burstY = y;
        p.lastBurstAt = now;
        p.idleFired = false;
      }
      if (insideBox && moved > 4) {
        p.movedAt = now;
        p.idleFired = false;
      }
      p.x = x;
      p.y = y;
      p.lastTime = now;
      p.inside = insideBox;
      p.nearLetter = nearLetter;
    };
    const onDown = (event: PointerEvent) => {
      const box = title.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right
        || event.clientY < box.top || event.clientY > box.bottom) return;
      const p = pointer.current;
      const bounds = gl.domElement.getBoundingClientRect();
      p.burstX = event.clientX - bounds.left - bounds.width / 2;
      p.burstY = bounds.height / 2 - (event.clientY - bounds.top);
      p.burstStarted = performance.now();
      p.lastBurstAt = p.burstStarted;
      p.idleFired = true;
    };
    const onLeave = () => {
      pointer.current.inside = false;
      pointer.current.nearLetter = false;
      pointer.current.vx = 0;
      pointer.current.vy = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("blur", onLeave);
    title.classList.add("particles-ready");
    return () => {
      title.classList.remove("particles-ready");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("blur", onLeave);
    };
  }, [data, gl]);

  useFrame((_, delta) => {
    if (material.current) {
      const easing = 1 - Math.exp(-5 * Math.min(delta, 0.06));
      material.current.uniforms.uBronze.value.lerp(colors.bronze, easing);
      material.current.uniforms.uGold.value.lerp(colors.gold, easing);
      material.current.uniforms.uFast.value.lerp(colors.fast, easing);
    }
    if (!data.count || !positionAttribute.current || !energyAttribute.current) return;
    const dt = Math.min(0.04, delta);
    const now = performance.now();
    const p = pointer.current;
    time.current += dt;

    // Hover disperses immediately; remaining still on a letter after the
    // previous burst causes one more pulse, then stops until movement resumes.
    if (p.inside && p.nearLetter && !p.idleFired
      && now - p.movedAt > 950 && now - p.lastBurstAt > 900) {
      p.burstStarted = now;
      p.burstX = p.x;
      p.burstY = p.y;
      p.lastBurstAt = now;
      p.idleFired = true;
    }

    const timeSinceMove = now - p.lastTime;
    const decay = Math.exp(-7 * dt);
    p.vx *= decay;
    p.vy *= decay;
    if (timeSinceMove > 300) {
      p.vx = 0;
      p.vy = 0;
    }

    advanceParticles(data, {
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
      pointerActive: p.nearLetter && timeSinceMove < 180,
    });
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
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{ uPixelRatio: { value: Math.min(1.75, gl.getPixelRatio()) }, uBronze: { value: colors.bronze.clone() }, uGold: { value: colors.gold.clone() }, uFast: { value: colors.fast.clone() } }}
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
