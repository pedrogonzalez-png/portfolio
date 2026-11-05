import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { CatmullRomCurve3, Vector3, type Group } from "three";
import { useTheme } from "../../stores/themeContext";
import type { Build } from "./coreModel";

export type CoreModule = "hub" | "assembly" | "overclock" | "linux";
type Props = {
  module: CoreModule;
  build: Build;
  onChoose: (module: Exclude<CoreModule, "hub">) => void;
};
type Vec3 = [number, number, number];

const COOLANT_A = new CatmullRomCurve3([
  new Vector3(-0.38, 0.45, 0.28),
  new Vector3(-0.66, 0.8, 0.3),
  new Vector3(-0.48, 1.01, 0.18),
  new Vector3(0.08, 1.05, -0.06),
]);
const COOLANT_B = new CatmullRomCurve3([
  new Vector3(-0.34, 0.47, 0.29),
  new Vector3(-0.62, 0.83, 0.4),
  new Vector3(-0.35, 1.12, 0.3),
  new Vector3(0.22, 1.09, -0.07),
]);

function Metal({
  position, size, color = "#202731", metalness = 0.8, roughness = 0.28,
}: {
  position: Vec3;
  size: Vec3;
  color?: string;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
}

/* Animated impellers are decorative; keep frame and illuminated rim stationary. */
function CoolingFan({
  position, radius, accent, animated, speed = 0.65,
}: {
  position: Vec3;
  radius: number;
  accent: string;
  animated: boolean;
  speed?: number;
}) {
  const impeller = useRef<Group>(null);
  useFrame((_, delta) => {
    if (animated && impeller.current) impeller.current.rotation.z += delta * speed;
  });
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 1.05, radius * 1.05, 0.043, 32]} />
        <meshStandardMaterial color="#0c111a" metalness={0.7} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0, 0.033]}>
        <torusGeometry args={[radius * 0.85, 0.017, 6, 40]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.56} metalness={0.65} />
      </mesh>
      <group ref={impeller} position={[0, 0, 0.051]}>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.sin(a) * radius * 0.36, Math.cos(a) * radius * 0.36, 0]}
              rotation={[0, 0, -a - 0.5]}
              scale={[radius * 0.24, radius * 0.6, 0.018]}
            >
              <sphereGeometry args={[1, 9, 7]} />
              <meshStandardMaterial color="#57626f" metalness={0.67} roughness={0.32} />
            </mesh>
          );
        })}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.015]}>
          <cylinderGeometry args={[radius * 0.17, radius * 0.17, 0.037, 16]} />
          <meshStandardMaterial color="#b8c0c6" metalness={0.9} roughness={0.19} />
        </mesh>
      </group>
    </group>
  );
}

function Orbits({ animated, accent, secondary }: { animated: boolean; accent: string; secondary: string }) {
  const rings = useRef<Array<Group | null>>([]);
  const specifications = [
    { radius: 2.45, tilt: 1.14, phase: -0.39, speed: 0.042, color: secondary },
    { radius: 2.85, tilt: 1.25, phase: 0.15, speed: -0.031, color: accent },
    { radius: 3.24, tilt: 0.96, phase: 0.38, speed: 0.021, color: "#91a2bb" },
  ];
  useFrame((state, delta) => {
    if (!animated) return;
    rings.current.forEach((ring, index) => {
      if (!ring) return;
      ring.rotation.z += delta * specifications[index].speed;
      ring.rotation.x = specifications[index].tilt + Math.sin(state.clock.elapsedTime * 0.18 + index) * 0.017;
    });
  });
  return (
    <group position={[0, 0.05, -0.73]}>
      {specifications.map((ring, index) => (
        <group
          key={ring.radius}
          ref={(element) => { rings.current[index] = element; }}
          rotation={[ring.tilt, 0.14 * index, ring.phase]}
        >
          <mesh>
            <torusGeometry args={[ring.radius, 0.010, 6, 150]} />
            <meshBasicMaterial color={ring.color} transparent opacity={index === 0 ? 0.68 : 0.42} depthWrite={false} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 18]}>
            <torusGeometry args={[ring.radius + 0.035, 0.0025, 4, 150]} />
            <meshBasicMaterial color={ring.color} transparent opacity={0.26} depthWrite={false} />
          </mesh>
          {[0, 1, 2].map((node) => {
            const angle = (node * 2 * Math.PI) / 3 + index * 0.52;
            return (
              <group key={node} position={[Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, 0]}>
                <mesh>
                  <sphereGeometry args={[node === 0 ? 0.048 : 0.031, 12, 9]} />
                  <meshBasicMaterial color={ring.color} />
                </mesh>
                <mesh>
                  <sphereGeometry args={[0.085, 10, 9]} />
                  <meshBasicMaterial color={ring.color} transparent opacity={0.13} depthWrite={false} />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

function EnergyCore({ accent, secondary, animated }: { accent: string; secondary: string; animated: boolean }) {
  const halo = useRef<Group>(null);
  useFrame((state, delta) => {
    if (!halo.current || !animated) return;
    halo.current.rotation.y += delta * 0.025;
    halo.current.position.y = Math.sin(state.clock.elapsedTime * 0.65) * 0.05;
  });
  return (
    <group ref={halo} position={[-0.18, 0, -1.42]}>
      <mesh>
        <icosahedronGeometry args={[0.88, 1]} />
        <meshBasicMaterial color={accent} transparent opacity={0.085} wireframe depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.48, 24, 18]} />
        <meshBasicMaterial color={secondary} transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh rotation={[0.43, -0.17, 0]}>
        <torusGeometry args={[1.0, 0.011, 6, 90]} />
        <meshBasicMaterial color={secondary} transparent opacity={0.53} depthWrite={false} />
      </mesh>
    </group>
  );
}

function ShowcasePlatform({ accent }: { accent: string }) {
  return (
    <group position={[-0.15, -1.55, -0.32]}>
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.32, 1.5, 0.13, 64]} />
        <meshStandardMaterial color="#161b25" metalness={0.82} roughness={0.29} />
      </mesh>
      <mesh position={[0, 0.071, 0]}>
        <cylinderGeometry args={[1.27, 1.27, 0.012, 64]} />
        <meshStandardMaterial color="#232b37" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.083, 0]}>
        <torusGeometry args={[1.16, 0.012, 6, 80]} />
        <meshBasicMaterial color={accent} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, -0.085, 0]}>
        <cylinderGeometry args={[1.39, 1.39, 0.015, 64]} />
        <meshStandardMaterial color="#5c6879" metalness={0.85} roughness={0.24} />
      </mesh>
    </group>
  );
}

/**
 * Educational, procedural PC silhouette — not a licensed GLB or an exact
 * replica of the creator's unverified case/motherboard. All picking targets
 * remain on the CPU/GPU, motherboard and monitor from the first prototype.
 */
function Computer({ build, onChoose, module, accent, secondary, animated }: Props & {
  accent: string;
  secondary: string;
  animated: boolean;
}) {
  const body = useRef<Group>(null);
  useFrame((state, delta) => {
    if (!body.current || !animated) return;
    body.current.rotation.y +=
      (Math.sin(state.clock.elapsedTime * 0.2) * 0.045 - body.current.rotation.y) * Math.min(1, delta * 1.8);
  });
  return (
    <group ref={body} position={module === "linux" ? [-0.68, -0.1, 0.12] : [-0.47, -0.1, 0.1]}>
      {/* PC chassis: brushed metal back, open glass-side frame and bevel lines. */}
      <group rotation={[0, -0.17, 0]}>
        <Metal position={[0, 0, -0.44]} size={[1.62, 2.37, 0.12]} color="#141920" />
        <Metal position={[-0.80, 0, 0.01]} size={[0.09, 2.44, 1.02]} color="#303945" />
        <Metal position={[0.80, 0, 0.01]} size={[0.09, 2.44, 1.02]} color="#303945" />
        <Metal position={[0, 1.19, 0.01]} size={[1.64, 0.10, 1.03]} color="#343e49" />
        <Metal position={[0, -1.19, 0.01]} size={[1.64, 0.10, 1.03]} color="#343e49" />
        <Metal position={[-0.73, 0, 0.48]} size={[0.025, 2.30, 0.024]} color="#8b959c" />
        <Metal position={[0.73, 0, 0.48]} size={[0.025, 2.30, 0.024]} color="#8b959c" />
        <Metal position={[0, 1.12, 0.48]} size={[1.47, 0.023, 0.022]} color="#89949b" />
        <Metal position={[0, -1.12, 0.48]} size={[1.47, 0.023, 0.022]} color="#89949b" />
        {/* Thin glass does not capture raycasts, so inner hardware remains clickable. */}
        <mesh position={[0, 0, 0.5]} raycast={() => {}}>
          <boxGeometry args={[1.48, 2.21, 0.012]} />
          <meshPhysicalMaterial color="#a3baca" transparent opacity={0.075} metalness={0.18}
            roughness={0.13} depthWrite={false} />
        </mesh>
        <mesh position={[-0.52, 0, 0.516]} rotation={[0, 0, -0.10]} raycast={() => {}}>
          <planeGeometry args={[0.015, 1.95]} />
          <meshBasicMaterial color="#cbd7e0" transparent opacity={0.21} depthWrite={false} />
        </mesh>

        {/* Motherboard and traces. Selection still opens the assembly module. */}
        <group onClick={(event) => { event.stopPropagation(); onChoose("assembly"); }}>
          <Metal position={[-0.13, 0.14, -0.27]} size={[1.12, 1.69, 0.095]} color="#1b3440" roughness={0.53} />
          <Metal position={[-0.12, 0.89, -0.205]} size={[1.04, 0.125, 0.035]} color="#495665" />
          <Metal position={[-0.48, -0.49, -0.20]} size={[0.29, 0.30, 0.055]} color="#667680" />
          {[-0.55, -0.37, -0.19, 0.03].map((x) => (
            <Metal key={x} position={[x, -0.31, -0.208]} size={[0.11, 0.025, 0.037]} color="#8f9a9a" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <Metal key={i} position={[-0.60 + i * 0.134, -0.70 + (i % 2) * 0.075, -0.204]}
              size={[0.06, 0.018, 0.015]} color={i % 2 ? "#738b8e" : "#577982"} />
          ))}
        </group>

        {/* AIO 360 mm approximation: three top fans, pump and twin coolant tubes. */}
        <Metal position={[0, 0.97, 0.0]} size={[1.43, 0.28, 0.51]} color="#141920" />
        {[-0.46, 0, 0.46].map((x) => (
          <CoolingFan key={x} position={[x, 0.98, 0.283]} radius={0.185} accent={accent}
            animated={animated} speed={0.88} />
        ))}
        {build.cpu && (
          <group onClick={(event) => { event.stopPropagation(); onChoose("overclock"); }}>
            <Metal position={[-0.38, 0.42, -0.15]} size={[0.42, 0.40, 0.11]} color="#aaa69a" />
            <mesh position={[-0.38, 0.43, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.17, 32]} />
              <meshStandardMaterial color="#181e28" metalness={0.86} roughness={0.28} />
            </mesh>
            <mesh position={[-0.38, 0.43, 0.18]}>
              <torusGeometry args={[0.16, 0.018, 8, 36]} />
              <meshStandardMaterial color={secondary} emissive={secondary} emissiveIntensity={0.55} />
            </mesh>
            <mesh position={[-0.38, 0.43, 0.184]}>
              <circleGeometry args={[0.12, 24]} />
              <meshBasicMaterial color="#34404e" />
            </mesh>
          </group>
        )}
        {build.cpu && [COOLANT_A, COOLANT_B].map((curve, i) => (
          <mesh key={i}>
            <tubeGeometry args={[curve, 36, 0.027, 6, false]} />
            <meshStandardMaterial color="#3d444f" roughness={0.75} metalness={0.08} />
          </mesh>
        ))}

        {/* DDR sticks reflect the shared assembly state. */}
        {build.memory && (
          <group onClick={(event) => { event.stopPropagation(); onChoose("assembly"); }}>
            {[0.19, 0.35].map((x) => (
              <group key={x}>
                <Metal position={[x, 0.42, -0.10]} size={[0.095, 0.78, 0.11]} color="#697681" />
                <Metal position={[x, 0.74, -0.022]} size={[0.098, 0.04, 0.022]} color={accent} />
              </group>
            ))}
          </group>
        )}

        {/* Dedicated GPU, dual fans, silver heat-sink layers and PCIe contact. */}
        {build.gpu && (
          <group position={[0.04, -0.40, 0.04]}
            onClick={(event) => { event.stopPropagation(); onChoose("overclock"); }}>
            <Metal position={[0, 0, 0]} size={[1.35, 0.42, 0.34]} color="#141820" />
            <Metal position={[0, 0.21, -0.06]} size={[1.38, 0.055, 0.30]} color="#626b78" />
            <Metal position={[0, -0.21, 0.01]} size={[1.34, 0.04, 0.28]} color="#78818b" />
            {[-0.36, 0.30].map((x) => (
              <CoolingFan key={x} position={[x, 0, 0.19]} radius={0.168}
                accent={secondary} animated={animated} speed={0.48} />
            ))}
            {[-0.47, -0.28, -0.09, 0.10, 0.29, 0.48].map((x) => (
              <Metal key={x} position={[x, -0.14, -0.20]} size={[0.018, 0.22, 0.035]} color="#77818b" />
            ))}
            <Metal position={[0.53, -0.24, -0.11]} size={[0.18, 0.052, 0.09]} color="#bb986c" />
          </group>
        )}

        {/* PSU enclosure and ventilation. */}
        {build.psu && (
          <group onClick={(event) => { event.stopPropagation(); onChoose("assembly"); }}>
            <Metal position={[-0.26, -0.92, 0.05]} size={[0.88, 0.37, 0.66]} color="#1c222a" />
            {[-0.19, 0, 0.19].map((x) => (
              <Metal key={x} position={[-0.27 + x, -0.91, 0.385]}
                size={[0.065, 0.17, 0.014]} color="#6f7b83" />
            ))}
          </group>
        )}

        {/* Case intake fans: avoid opaque side wall, keep visual depth. */}
        {[0.55, -0.03, -0.61].map((y) => (
          <CoolingFan key={y} position={[0.61, y, -0.08]} radius={0.225} accent={accent}
            animated={animated} speed={0.75} />
        ))}
        <Metal position={[0.57, -0.89, 0.11]} size={[0.22, 0.13, 0.24]} color="#343d49" />
      </group>

      {/* The screen remains a direct entry to the Linux simulation. */}
      <group position={module === "linux" ? [1.93, 0.43, 0.0] : [1.93, 0.40, -0.2]}
        rotation={[0, -0.12, 0]}
        onClick={(event) => { event.stopPropagation(); onChoose("linux"); }}>
        <Metal position={[0, 0, -0.06]} size={[1.56, 1.02, 0.11]} color="#202830" />
        <Metal position={[0, 0, 0.008]} size={[1.47, 0.91, 0.011]} color="#080e18" />
        <mesh position={[0, 0, 0.018]}>
          <planeGeometry args={[1.41, 0.85]} />
          <meshBasicMaterial color={module === "linux" ? secondary : "#20253c"} />
        </mesh>
        <Metal position={[0, 0.364, 0.028]} size={[1.33, 0.054, 0.012]} color="#131b27" />
        <Metal position={[-0.31, -0.04, 0.029]} size={[0.62, 0.62, 0.006]} color="#171a2a" />
        <Metal position={[0.33, 0.06, 0.029]} size={[0.56, 0.41, 0.006]} color="#353653" />
        <Metal position={[0.36, -0.28, 0.029]} size={[0.50, 0.16, 0.006]} color="#171a2a" />
        <Metal position={[0, -0.68, -0.05]} size={[0.09, 0.35, 0.10]} color="#69717f" />
        <Metal position={[0, -0.86, 0.01]} size={[0.65, 0.046, 0.34]} color="#7f8996" />
      </group>
    </group>
  );
}

export default function CoreScene({ module, build, onChoose }: Props) {
  const { theme } = useTheme();
  const accent = theme.palette.accentPrimary;
  const secondary = theme.palette.accentYellow;
  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  return (
    <div className="core-scene" aria-hidden="true">
      <Suspense fallback={<div className="core-scene-fallback">Carregando visualização 3D…</div>}>
        <Canvas dpr={[1, 1.5]} camera={{ position: [0.28, 0.35, 8.25], fov: 43 }}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}>
          <ambientLight intensity={1.15} />
          <hemisphereLight args={["#b4bdd7", "#191b29", 1.15]} />
          <directionalLight position={[3, 4, 5]} intensity={2.35} />
          <pointLight position={[-2.3, 1.4, 2.9]} color={accent} intensity={4.4} distance={8} />
          <pointLight position={[2.3, -0.7, 2.3]} color={secondary} intensity={2.7} distance={7} />
          <EnergyCore accent={accent} secondary={secondary} animated={!reducedMotion} />
          <Orbits accent={accent} secondary={secondary} animated={!reducedMotion} />
          <ShowcasePlatform accent={accent} />
          <Computer module={module} build={build} onChoose={onChoose}
            accent={accent} secondary={secondary} animated={!reducedMotion} />
          <OrbitControls enablePan={false} enableZoom minDistance={5.4} maxDistance={9.8}
            minPolarAngle={0.8} maxPolarAngle={2.25} autoRotate={false} />
        </Canvas>
      </Suspense>
    </div>
  );
}
