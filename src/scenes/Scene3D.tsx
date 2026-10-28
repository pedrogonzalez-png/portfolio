import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, CatmullRomCurve3, DoubleSide, MathUtils, Vector3 } from "three";
import type { Points } from "three";

type ParticleCloud = { positions: Float32Array; targets: Float32Array; count: number };

function buildTextParticles(): ParticleCloud {
  const canvas = document.createElement("canvas");
  canvas.width = 1100;
  canvas.height = 260;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { positions: new Float32Array(), targets: new Float32Array(), count: 0 };

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 126px Space Grotesk, sans-serif";
  ctx.fillText("NOME DO AUTOR", canvas.width / 2, canvas.height / 2);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const points: number[] = [];
  for (let y = 30; y < 230; y += 5) {
    for (let x = 25; x < 1075; x += 5) {
      if (pixels[(y * canvas.width + x) * 4 + 3] > 140) {
        points.push((x - 550) / 118, (130 - y) / 118 + 0.65, 0);
      }
    }
  }
  const targets = new Float32Array(points);
  const positions = new Float32Array(targets.length);
  for (let i = 0; i < targets.length; i += 3) {
    const j = i / 3;
    positions[i] = targets[i] + Math.sin(j * 79.71) * 3.5;
    positions[i + 1] = targets[i + 1] + Math.cos(j * 35.12) * 2.2;
    positions[i + 2] = Math.sin(j * 21.7) * 3;
  }
  return { positions, targets, count: points.length / 3 };
}

function ParticleName() {
  const data = useMemo(buildTextParticles, []);
  const geometry = useMemo(() => {
    const attribute = new BufferAttribute(data.positions, 3);
    attribute.setUsage(35048); // DynamicDrawUsage
    return attribute;
  }, [data.positions]);
  const points = useRef<Points>(null);
  const pointer = useRef({ x: 100, y: 100, inside: false, movedAt: 0, triggered: false, burstUntil: 0 });
  const elapsed = useRef(0);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const hero = document.getElementById("hero-name");
      const box = hero?.getBoundingClientRect();
      const inside = Boolean(box && event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom);
      const p = pointer.current;
      const x = (event.clientX / window.innerWidth - 0.5) * 9.5;
      const y = (0.5 - event.clientY / window.innerHeight) * 5.5;
      if (Math.hypot(p.x - x, p.y - y) > 0.03 || p.inside !== inside) {
        p.movedAt = performance.now();
        p.triggered = false;
      }
      p.x = x;
      p.y = y;
      p.inside = inside;
    };
    const onLeave = () => { pointer.current.inside = false; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  useFrame((_, delta) => {
    if (!points.current || !data.count) return;
    elapsed.current += Math.min(delta, 0.05);
    const p = pointer.current;
    const now = performance.now();
    if (p.inside && !p.triggered && now - p.movedAt > 850) {
      p.triggered = true;
      p.burstUntil = now + 1100;
    }
    const scatter = p.inside && p.burstUntil > now ? Math.sin(((p.burstUntil - now) / 1100) * Math.PI) * 0.62 : 0;
    const follow = 1 - Math.exp(-Math.min(delta, 0.05) * 3.1);
    const array = data.positions;
    for (let i = 0; i < data.count; i++) {
      const n = i * 3;
      const tx = data.targets[n];
      const ty = data.targets[n + 1];
      const dist = Math.hypot(tx - p.x, ty - p.y);
      const influence = p.inside ? Math.max(0, 1 - dist / 0.95) : 0;
      const repulsion = influence * influence * 0.38;
      const phase = i * 0.31;
      array[n] += (tx + Math.sin(phase + elapsed.current * 0.8) * (scatter + repulsion) - array[n]) * follow;
      array[n + 1] += (ty + Math.cos(phase + elapsed.current) * (scatter + repulsion) - array[n + 1]) * follow;
      array[n + 2] += (scatter * Math.sin(phase * 1.4) * 1.6 - array[n + 2]) * follow;
    }
    geometry.needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <primitive attach="attributes-position" object={geometry} />
      </bufferGeometry>
      <pointsMaterial size={0.027} color="#E3B37A" transparent opacity={0.92} depthWrite={false} blending={AdditiveBlending} sizeAttenuation />
    </points>
  );
}

function AmbientStars() {
  const positions = useMemo(() => {
    const result = new Float32Array(550 * 3);
    for (let i = 0; i < 550; i++) {
      result[i * 3] = Math.sin(i * 31.77) * 11;
      result[i * 3 + 1] = Math.cos(i * 19.13) * 7;
      result[i * 3 + 2] = -4 - ((i * 0.618) % 6);
    }
    return result;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color="#C96A42" transparent opacity={0.48} sizeAttenuation />
    </points>
  );
}

function CameraJourney() {
  const { camera } = useThree();
  const progress = useRef(0);
  const curve = useMemo(() => new CatmullRomCurve3([
    new Vector3(0, 0, 9.5),
    new Vector3(0.5, -0.2, 9),
    new Vector3(-0.9, 0.2, 8.7),
    new Vector3(0.1, 0.1, 9.1),
  ]), []);

  useEffect(() => {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.current = MathUtils.clamp(window.scrollY / max, 0, 1);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useFrame((_, delta) => {
    const desired = curve.getPoint(progress.current);
    const easing = 1 - Math.exp(-2.6 * Math.min(delta, 0.05));
    camera.position.lerp(desired, easing);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function SceneContent() {
  return (
    <>
      <CameraJourney />
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 4]} color="#E3B37A" intensity={6} />
      <AmbientStars />
      <ParticleName />
      <mesh position={[0, 0.5, -2.8]} rotation={[0.25, 0.28, 0.2]}>
        <torusGeometry args={[3.8, 0.009, 6, 160]} />
        <meshBasicMaterial color="#8D3F31" transparent opacity={0.25} side={DoubleSide} />
      </mesh>
    </>
  );
}

export default function Scene3D() {
  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 9.5], fov: 48 }} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
        <SceneContent />
      </Canvas>
    </div>
  );
}
