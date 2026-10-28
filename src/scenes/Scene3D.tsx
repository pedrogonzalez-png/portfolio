import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, CatmullRomCurve3, MathUtils, Vector2, Vector3 } from "three";
import type { Group, ShaderMaterial } from "three";

type ParticleTextData = {
  targets: Float32Array;
  scattered: Float32Array;
  seeds: Float32Array;
};

function buildLetterParticles(): ParticleTextData {
  const canvas = document.createElement("canvas");
  canvas.width = 1100;
  canvas.height = 240;
  const context = canvas.getContext("2d");
  if (!context) return { targets: new Float32Array(0), scattered: new Float32Array(0), seeds: new Float32Array(0) };
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "700 126px Space Grotesk, sans-serif";
  context.fillText("NOME DO AUTOR", 550, 118);
  const pixels = context.getImageData(0, 0, 1100, 240).data;
  const targets: number[] = [];
  const scattered: number[] = [];
  const seeds: number[] = [];

  for (let y = 20; y < 220; y += 4) {
    for (let x = 20; x < 1080; x += 4) {
      if (pixels[(y * 1100 + x) * 4 + 3] < 150) continue;
      const j = targets.length / 3;
      const seed = (Math.sin(j * 91.719 + 0.11) * 43758.5453) % 1;
      const spread = Math.abs(seed);
      const tx = (x - 550) / 120;
      const ty = (120 - y) / 120 + 0.42;
      targets.push(tx, ty, 0);
      scattered.push(tx + Math.cos(j * 2.317) * (1.5 + spread * 4.5), ty + Math.sin(j * 1.837) * (1.3 + spread * 3), Math.sin(j * 4.713) * (1 + spread * 3));
      seeds.push(spread);
    }
  }
  return { targets: new Float32Array(targets), scattered: new Float32Array(scattered), seeds: new Float32Array(seeds) };
}

const textVertex = `
  attribute vec3 aScatter;
  attribute float aSeed;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uBurst;
  varying float vWarmth;

  void main() {
    float gathered = smoothstep(0.0, 3.1, uTime + aSeed * 0.7);
    vec3 pos = mix(aScatter, position, gathered);
    float ripple = sin(uTime * 1.2 + position.x * 3.1 + aSeed * 22.0);
    pos.xy += vec2(ripple, cos(uTime * 0.83 + aSeed * 16.0)) * 0.012;
    vec2 away = pos.xy - uPointer;
    float influence = exp(-dot(away, away) * 2.6);
    pos.xy += normalize(away + vec2(0.0001)) * influence * 0.31 * gathered;
    pos.xyz += (aScatter - position) * uBurst * (0.12 + aSeed * 0.17);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((2.0 + aSeed * 2.0) * 9.0 / -mv.z, 1.2, 5.1);
    vWarmth = aSeed * 0.65 + abs(ripple) * 0.35;
  }
`;
const textFragment = `
  varying float vWarmth;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = exp(-d * d * 22.0);
    vec3 color = mix(vec3(0.80, 0.34, 0.23), vec3(1.0, 0.80, 0.55), vWarmth);
    gl_FragColor = vec4(color, alpha * 0.91);
  }
`;

function ParticleName() {
  const data = useMemo(buildLetterParticles, []);
  const shader = useRef<ShaderMaterial>(null);
  const pointer = useRef({ current: new Vector2(90, 90), target: new Vector2(90, 90), hover: false, changedAt: 0, fired: false, burstStart: -10000 });
  const progress = useRef(0);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      const rect = document.getElementById("hero-name")?.getBoundingClientRect();
      const inside = Boolean(rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom);
      const x = (event.clientX / window.innerWidth - 0.5) * 10.5;
      const y = (0.5 - event.clientY / window.innerHeight) * 8.2;
      const state = pointer.current;
      if (state.target.distanceTo(new Vector2(x, y)) > 0.07 || state.hover !== inside) {
        state.changedAt = performance.now();
        state.fired = false;
      }
      state.target.set(x, y);
      state.hover = inside;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, []);

  useFrame((_, delta) => {
    if (!shader.current) return;
    const dt = Math.min(delta, 0.06);
    progress.current += dt;
    const state = pointer.current;
    state.current.lerp(state.target, Math.min(1, dt * 4));
    const now = performance.now();
    if (state.hover && !state.fired && now - state.changedAt > 950) {
      state.burstStart = now;
      state.fired = true;
    }
    const burstProgress = (now - state.burstStart) / 1400;
    shader.current.uniforms.uTime.value = progress.current;
    shader.current.uniforms.uPointer.value.copy(state.current);
    shader.current.uniforms.uBurst.value = burstProgress >= 0 && burstProgress < 1 ? Math.sin(burstProgress * Math.PI) : 0;
  });

  if (data.seeds.length === 0) return null;
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.targets, 3]} />
        <bufferAttribute attach="attributes-aScatter" args={[data.scattered, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[data.seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={shader}
        vertexShader={textVertex}
        fragmentShader={textFragment}
        uniforms={{ uTime: { value: 0 }, uPointer: { value: new Vector2(90, 90) }, uBurst: { value: 0 } }}
        transparent depthWrite={false} blending={AdditiveBlending}
      />
    </points>
  );
}

function Atmosphere() {
  const group = useRef<Group>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(1800 * 3);
    for (let i = 0; i < 1800; i++) {
      const a = i * 2.39996;
      const r = 2.7 + Math.abs(Math.sin(i * 18.82)) * 9;
      array[i * 3] = Math.cos(a) * r;
      array[i * 3 + 1] = Math.sin(a) * r * 0.48;
      array[i * 3 + 2] = -3 - Math.abs(Math.sin(i * 41.77)) * 6;
    }
    return array;
  }, []);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.07) * 0.06;
  });
  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.022} color="#C96A42" transparent opacity={0.6} sizeAttenuation depthWrite={false} blending={AdditiveBlending} />
      </points>
    </group>
  );
}

function CameraJourney() {
  const { camera } = useThree();
  const scroll = useRef(0);
  const curve = useMemo(() => new CatmullRomCurve3([
    new Vector3(0, 0, 9.5),
    new Vector3(0.5, -0.2, 9),
    new Vector3(-0.9, 0.2, 8.7),
    new Vector3(0.1, 0.1, 9.1),
  ]), []);

  useEffect(() => {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scroll.current = MathUtils.clamp(window.scrollY / max, 0, 1);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useFrame((_, delta) => {
    camera.position.lerp(curve.getPoint(scroll.current), 1 - Math.exp(-2.6 * Math.min(delta, 0.05)));
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene3D() {
  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 9.5], fov: 48 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
        <CameraJourney />
        <Atmosphere />
        <ParticleName />
      </Canvas>
    </div>
  );
}
