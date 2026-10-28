import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdditiveBlending, CatmullRomCurve3, DynamicDrawUsage, Object3D, Vector2, Vector3 } from "three";
import type { Group, InstancedMesh, ShaderMaterial } from "three";
import { useAccessibility } from "./accessibilityContext";

const PARTICLES = 7200;
const VERTEBRAE = 23;

const particleVertex = `
  uniform float uTime;
  uniform vec2 uPointer;
  attribute vec2 aPhase;
  varying float vHeat;

  void main() {
    float y = position.y;
    float angle = aPhase.x + uTime * (0.13 + aPhase.y * 0.28);
    float wave = sin(y * 2.4 + uTime * 0.5 + aPhase.x) * 0.22;
    float radius = length(position.xz) + wave;
    vec3 pos = vec3(
      cos(angle) * radius + sin(y * 0.8) * 0.22,
      y + sin(uTime * 0.7 + aPhase.x) * 0.13,
      sin(angle) * radius
    );
    vec2 away = pos.xy - uPointer;
    float force = exp(-dot(away, away) * 1.65);
    pos.xy += normalize(away + vec2(0.001)) * force * 0.36;
    vec4 view = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = clamp((1.8 + aPhase.y * 2.2) * (8.0 / -view.z), 1.0, 5.2);
    vHeat = 0.35 + 0.65 * sin(aPhase.x * 2.0 + uTime * 0.6) * sin(aPhase.x * 2.0 + uTime * 0.6);
  }
`;
const particleFragment = `
  varying float vHeat;
  void main() {
    float radius = length(gl_PointCoord - vec2(0.5));
    float glow = exp(-radius * radius * 24.0) * 0.82;
    vec3 copper = vec3(0.78, 0.29, 0.22);
    vec3 gold = vec3(0.99, 0.77, 0.53);
    gl_FragColor = vec4(mix(copper, gold, vHeat), glow);
  }
`;

function OrganicDust() {
  const material = useRef<ShaderMaterial>(null);
  const pointer = useRef(new Vector2(80, 80));
  const pointerTarget = useRef(new Vector2(80, 80));

  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLES * 3);
    const phases = new Float32Array(PARTICLES * 2);
    for (let i = 0; i < PARTICLES; i++) {
      const t = i * 2.39996;
      const normalized = (i + 0.5) / PARTICLES;
      const y = (normalized - 0.5) * 8.6;
      const radius = 0.42 + 3.9 * Math.pow(Math.abs(Math.sin(i * 79.137)), 3);
      positions[i * 3] = radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
      phases[i * 2] = t;
      phases[i * 2 + 1] = Math.abs(Math.cos(i * 7.329));
    }
    return { positions, phases };
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const holder = document.getElementById("spine-stage");
      if (!holder) return;
      const bounds = holder.getBoundingClientRect();
      if (bounds.top > innerHeight || bounds.bottom < 0) return;
      pointerTarget.current.set(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 8,
        (0.5 - (event.clientY - bounds.top) / bounds.height) * 7,
      );
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useFrame((_, delta) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value += Math.min(delta, 0.07);
    pointer.current.lerp(pointerTarget.current, Math.min(delta * 2.5, 1));
    material.current.uniforms.uPointer.value.copy(pointer.current);
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} usage={DynamicDrawUsage} />
        <bufferAttribute attach="attributes-aPhase" args={[particles.phases, 2]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={{ uTime: { value: 0 }, uPointer: { value: new Vector2(80, 80) } }}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

function VertebralStructure() {
  const group = useRef<Group>(null);
  const mesh = useRef<InstancedMesh>(null);
  const template = useMemo(() => new Object3D(), []);
  const centerLine = useMemo(() => new CatmullRomCurve3([
    new Vector3(0.1, -3.9, -0.02),
    new Vector3(-0.22, -1.8, 0),
    new Vector3(0.18, 0.1, -0.12),
    new Vector3(-0.1, 2.0, 0.02),
    new Vector3(0.08, 4.0, 0),
  ]), []);

  useEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < VERTEBRAE; i++) {
      const t = i / (VERTEBRAE - 1);
      const p = centerLine.getPoint(t);
      template.position.copy(p);
      template.rotation.set(Math.sin(t * 11) * 0.24 + 0.15, 0, Math.cos(t * 9) * 0.28);
      const taper = 0.55 + Math.sin(t * Math.PI) * 0.58;
      template.scale.set(taper, taper, 0.6 + taper * 0.42);
      template.updateMatrix();
      mesh.current.setMatrixAt(i, template.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [centerLine, template]);

  useFrame(({ clock }, delta) => {
    if (group.current) {
      const t = clock.elapsedTime;
      group.current.rotation.y += Math.min(delta, 0.06) * 0.055;
      group.current.rotation.z = Math.sin(t * 0.3) * 0.035;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <tubeGeometry args={[centerLine, 180, 0.055, 8, false]} />
        <meshStandardMaterial color="#A85244" emissive="#C96A42" emissiveIntensity={0.95} metalness={0.8} roughness={0.22} />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, VERTEBRAE]}>
        <torusGeometry args={[0.53, 0.15, 8, 28]} />
        <meshStandardMaterial color="#C47A68" emissive="#6A2729" emissiveIntensity={0.24} metalness={0.82} roughness={0.25} transparent opacity={0.88} />
      </instancedMesh>
      <OrganicDust />
    </group>
  );
}

function SpineCanvas() {
  return (
    <div className="spine-world" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 13], fov: 43 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[4, 4, 5]} intensity={42} color="#f8b88a" />
        <pointLight position={[-4, -3, 4]} intensity={17} color="#b82946" />
        <VertebralStructure />
      </Canvas>
    </div>
  );
}

export function SpineWorld() {
  const { reducedMotion } = useAccessibility();
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    try {
      const canvas = document.createElement("canvas");
      setReady(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    } catch {
      setReady(false);
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (!ready) return;
    const element = document.getElementById("spine-stage");
    if (!element || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "250px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ready]);

  if (!ready || !active || reducedMotion) {
    return <div className="spine-fallback" aria-hidden="true" />;
  }

  return (
    <Suspense fallback={<div className="spine-fallback" aria-hidden="true" />}>
      <SpineCanvas />
    </Suspense>
  );
}
