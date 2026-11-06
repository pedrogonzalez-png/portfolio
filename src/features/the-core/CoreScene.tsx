import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import DetailedComputer from "./DetailedComputer";
import { EngravedLabel } from "./CoreSurfaceDetails";
import { useTheme } from "../../stores/themeContext";
import type { Build } from "./coreModel";

export type CoreModule = "hub" | "assembly" | "overclock" | "linux";
type Props = {
  module: CoreModule;
  build: Build;
  onChoose: (module: Exclude<CoreModule, "hub">) => void;
};
function Orbits({ animated, accent, secondary }: { animated: boolean; accent: string; secondary: string }) {
  const rings = useRef<Array<Group | null>>([]);
  const specifications = [
    { radius: 2.15, tilt: 1.14, phase: -0.39, speed: 0.042, color: secondary },
    { radius: 2.48, tilt: 1.25, phase: 0.15, speed: -0.031, color: accent },
    { radius: 2.79, tilt: 0.96, phase: 0.38, speed: 0.021, color: "#91a2bb" },
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
    <group position={[0, 0.05, 0]}>
      {specifications.map((ring, index) => (
        <group
          key={ring.radius}
          ref={(element) => { rings.current[index] = element; }}
          rotation={[ring.tilt, 0.14 * index, ring.phase]}
        >
          <mesh>
            <torusGeometry args={[ring.radius, 0.010, 6, 150]} />
            <meshBasicMaterial color={ring.color} transparent opacity={index === 0 ? 0.29 : 0.18} depthWrite={false} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 18]}>
            <torusGeometry args={[ring.radius + 0.035, 0.0025, 4, 150]} />
            <meshBasicMaterial color={ring.color} transparent opacity={0.075} depthWrite={false} />
          </mesh>
          {/* Fine graduation marks reinforce the engineered-instrument identity. */}
          {Array.from({ length: 12 }, (_, tick) => {
            const angle = tick * Math.PI / 6;
            return (
              <mesh key={"graduation-" + tick}
                position={[Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, 0]}
                rotation={[0, 0, angle - Math.PI / 2]} raycast={() => {}}>
                <boxGeometry args={[0.007, tick % 3 === 0 ? 0.090 : 0.045, 0.006]}/>
                <meshBasicMaterial color={ring.color} transparent
                  opacity={tick % 3 === 0 ? 0.36 : 0.18} depthWrite={false}/>
              </mesh>
            );
          })}
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
    <group ref={halo} position={[-0.18, 0, -0.28]}>
      <mesh>
        <icosahedronGeometry args={[0.46, 1]} />
        <meshBasicMaterial color={accent} transparent opacity={0.038} wireframe depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.26, 24, 18]} />
        <meshBasicMaterial color={secondary} transparent opacity={0.065} depthWrite={false} />
      </mesh>
      <mesh rotation={[0.43, -0.17, 0]}>
        <torusGeometry args={[0.58, 0.008, 6, 90]} />
        <meshBasicMaterial color={secondary} transparent opacity={0.26} depthWrite={false} />
      </mesh>
    </group>
  );
}

/**
 * The orbit rings are decorative BACKGROUND, not physical parts of the PC.
 * A fixed world Z put them in front when the user orbited to the service
 * panel. Anchor them behind the camera's focus at every viewing direction.
 * 19.5 world units with 1.45 scale keeps even the tilted outermost ring
 * behind the entire workstation, including at max OrbitControls distance.
 * Updating this even with reduced motion is essential for interaction.
 */
function CameraBackplate({ animated, accent, secondary }: {
  animated: boolean; accent: string; secondary: string;
}) {
  const backplate = useRef<Group>(null);
  useFrame(({ camera }) => {
    if (!backplate.current) return;
    // Transform a camera-local offset into world space without per-frame
    // object allocation. OrbitControls updates the camera before this frame.
    backplate.current.position.set(0, 0, -19.5).applyMatrix4(camera.matrixWorld);
    backplate.current.quaternion.copy(camera.quaternion);
  });
  return (
    <group ref={backplate} scale={1.45} name="the-core-camera-backplate">
      <Orbits accent={accent} secondary={secondary} animated={animated}/>
      <EnergyCore accent={accent} secondary={secondary} animated={animated}/>
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
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.085, 0]}>
        <torusGeometry args={[1.16, 0.012, 6, 80]} />
        <meshBasicMaterial color={accent} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, -0.085, 0]}>
        <cylinderGeometry args={[1.39, 1.39, 0.015, 64]} />
        <meshStandardMaterial color="#5c6879" metalness={0.85} roughness={0.24} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.101, 0]}>
        <torusGeometry args={[0.99, 0.006, 6, 80]} />
        <meshBasicMaterial color={accent} transparent opacity={0.37}/>
      </mesh>
      {Array.from({length:16},(_,i)=>{
        const angle = i * Math.PI / 8;
        return (
          <group key={i} position={[Math.cos(angle)*1.22,0.095,Math.sin(angle)*1.22]}
            rotation={[0,-angle,0]}>
            <mesh>
              <boxGeometry args={[0.07,0.009,0.015]}/>
              <meshBasicMaterial color={accent} transparent opacity={i%4===0?0.83:0.36}/>
            </mesh>
          </group>
        );
      })}
      <mesh position={[0,-0.17,0]}>
        <cylinderGeometry args={[1.11,1.33,0.13,64]}/>
        <meshStandardMaterial color="#141a22" metalness={0.7} roughness={0.38}/>
      </mesh>
      <mesh rotation={[Math.PI / 2,0,0]} position={[0,0.103,0]}>
        <torusGeometry args={[0.80,0.005,5,80]}/>
        <meshBasicMaterial color="#9ba4b2" transparent opacity={0.4}/>
      </mesh>
      <EngravedLabel position={[0,-0.075,1.37]} size={[0.74,0.15]}
        title="THE CORE" subtitle="HARDWARE SIMULATION" accent={accent}/>
      {[-1,1].map((sign) => (
        <group key={sign} position={[sign * 0.82,-0.016,1.04]} rotation={[0,sign*0.55,0]}>
          <mesh>
            <boxGeometry args={[0.33,0.038,0.035]}/>
            <meshStandardMaterial color="#8293a0" metalness={0.85} roughness={0.24}/>
          </mesh>
          <mesh position={[0,0.028,0]}>
            <boxGeometry args={[0.24,0.009,0.020]}/>
            <meshBasicMaterial color={accent} transparent opacity={0.5}/>
          </mesh>
        </group>
      ))}
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
    <div className="core-scene" aria-hidden="true" data-case-model="cutaway" data-board-model="educational">
      <Suspense fallback={<div className="core-scene-fallback">Carregando visualização 3D…</div>}>
        <Canvas dpr={[1, 1.5]} camera={{ position: [1.6, 1.35, 7.45], fov: 42 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
          <ambientLight intensity={1.55} />
          <hemisphereLight args={["#d2ddf1", "#1e2632", 1.15]} />
          <directionalLight position={[3, 4, 5]} intensity={3.0} />
          <directionalLight position={[-3, 2, -5]} color="#b3c4de" intensity={2.0} />
          <pointLight position={[-2.3, 1.4, 2.9]} color={accent} intensity={4.4} distance={8} />
          <pointLight position={[2.3, -0.7, 2.3]} color={secondary} intensity={2.7} distance={7} />
          <pointLight position={[0, -0.1, -2.8]} color="#a1b8ce" intensity={1.8} distance={5} />
          <CameraBackplate accent={accent} secondary={secondary} animated={!reducedMotion} />
          <ShowcasePlatform accent={accent} />
          <DetailedComputer module={module} build={build} onChoose={onChoose}
            accent={accent} secondary={secondary} animated={!reducedMotion} />
          <OrbitControls enablePan={false} enableZoom minDistance={5.4} maxDistance={9.8}
            minPolarAngle={0.8} maxPolarAngle={2.25} autoRotate={false} />
        </Canvas>
      </Suspense>
    </div>
  );
}
