import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import type { Build } from "./coreModel";

export type CoreModule = "hub" | "assembly" | "overclock" | "linux";
type Props = {
  module: CoreModule;
  build: Build;
  onChoose: (module: Exclude<CoreModule, "hub">) => void;
};

function Orbits({ animated }: { animated: boolean }) {
  const shell = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!animated || !shell.current) return;
    shell.current.rotation.y += delta * 0.035;
    shell.current.rotation.z += delta * 0.011;
  });
  return (
    <group ref={shell} position={[0, 0, 0]}>
      {[2.0, 2.34, 2.68].map((radius, index) => (
        <group key={radius} rotation={[1.1 + index * 0.14, 0.2 + index * 0.24, -0.3 + index * 0.3]}>
          <mesh>
            <torusGeometry args={[radius, 0.012, 6, 100]} />
            <meshBasicMaterial color={index === 0 ? "#ddaa83" : index === 1 ? "#ad97de" : "#7e99c2"} transparent opacity={index === 0 ? 0.67 : 0.4} />
          </mesh>
          <mesh position={[radius, 0, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial color={index === 0 ? "#f5d0ab" : "#bfc6f4"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Computer({ build, onChoose, module }: Props) {
  const body = useRef<Group>(null);
  useFrame((state, delta) => {
    if (!body.current) return;
    body.current.rotation.y += (Math.sin(state.clock.elapsedTime * 0.22) * 0.045 - body.current.rotation.y) * Math.min(1, delta * 2);
  });
  return (
    <group ref={body} position={module === "linux" ? [-1.0, -0.2, 0] : [0, -0.15, 0]} rotation={[0, -0.22, 0]}>
      <mesh position={[0, 0, -0.29]}>
        <boxGeometry args={[1.55, 2.28, 0.7]} />
        <meshStandardMaterial color="#222831" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[1.45, 2.12, 0.055]} />
        <meshStandardMaterial color="#19222e" metalness={0.7} roughness={0.22} transparent opacity={0.32} />
      </mesh>
      <mesh position={[-0.3, 0.26, 0.12]} onClick={(event) => {event.stopPropagation();onChoose("assembly");}}>
        <boxGeometry args={[0.8, 1.4, 0.1]} />
        <meshStandardMaterial color="#2f4350" metalness={0.55} roughness={0.43} />
      </mesh>
      {build.cpu && (
        <mesh position={[-0.35, 0.53, 0.22]} onClick={(event) => {event.stopPropagation();onChoose("overclock");}}>
          <boxGeometry args={[0.46, 0.44, 0.14]} />
          <meshStandardMaterial color="#c19d77" metalness={0.85} roughness={0.22} emissive="#473020" emissiveIntensity={0.3} />
        </mesh>
      )}
      {build.gpu && (
        <group position={[0.13, -0.35, 0.27]} onClick={(event) => {event.stopPropagation();onChoose("overclock");}}>
          <mesh>
            <boxGeometry args={[1.14, 0.31, 0.3]} />
            <meshStandardMaterial color="#17191e" metalness={0.88} roughness={0.25} />
          </mesh>
          {[-0.32, 0.24].map((x) => (
            <mesh key={x} position={[x, 0, 0.17]}>
              <torusGeometry args={[0.115, 0.025, 8, 24]} />
              <meshStandardMaterial color="#a2a8aa" metalness={0.75} roughness={0.3}/>
            </mesh>
          ))}
        </group>
      )}
      {build.memory && (
        <mesh position={[0.23, 0.69, 0.17]} onClick={(event)=>{event.stopPropagation();onChoose("assembly");}}>
          <boxGeometry args={[0.13, 0.82, 0.12]} />
          <meshStandardMaterial color="#a5a8ac" metalness={0.6} roughness={0.34} />
        </mesh>
      )}
      <mesh position={[0.48, -0.83, 0.15]}>
        <boxGeometry args={[0.53, 0.38, 0.22]} />
        <meshStandardMaterial color="#262c38" metalness={0.65} roughness={0.4}/>
      </mesh>
      <mesh position={[0, -1.13, 0.12]}>
        <boxGeometry args={[1.5, 0.07, 0.75]} />
        <meshStandardMaterial color="#65707c" metalness={0.82} roughness={0.23} />
      </mesh>
      <group position={module === "linux" ? [1.9, 0.3, 0] : [1.5, 0.38, -0.45]}
        onClick={(event)=>{event.stopPropagation();onChoose("linux");}}>
        <mesh>
          <boxGeometry args={[1.4, 0.9, 0.08]}/>
          <meshStandardMaterial color="#161920" metalness={0.63} roughness={0.3}/>
        </mesh>
        <mesh position={[0, 0, 0.049]}>
          <planeGeometry args={[1.24, 0.73]}/>
          <meshBasicMaterial color={module === "linux" ? "#45436e" : "#34273d"}/>
        </mesh>
        <mesh position={[0, -0.58, 0]}>
          <boxGeometry args={[0.08, 0.3, 0.08]}/>
          <meshStandardMaterial color="#7d8490" metalness={0.8} roughness={0.2}/>
        </mesh>
        <mesh position={[0, -0.76, 0]}>
          <boxGeometry args={[0.6, 0.04, 0.26]}/>
          <meshStandardMaterial color="#7d8490" metalness={0.8} roughness={0.2}/>
        </mesh>
      </group>
    </group>
  );
}

export default function CoreScene({ module, build, onChoose }: Props) {
  const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  return (
    <div className="core-scene" aria-hidden="true">
      <Suspense fallback={<div className="core-scene-fallback">Carregando visualização 3D…</div>}>
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.6, 7], fov: 44 }}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[3, 4, 5]} intensity={2.5} />
          <pointLight position={[-2, 1, 2]} color="#bca6e9" intensity={13}/>
          <Orbits animated={!reducedMotion} />
          <Computer module={module} build={build} onChoose={onChoose}/>
          <OrbitControls enablePan={false} enableZoom minDistance={5.1} maxDistance={9}
            minPolarAngle={0.8} maxPolarAngle={2.3} autoRotate={false}/>
        </Canvas>
      </Suspense>
    </div>
  );
}
