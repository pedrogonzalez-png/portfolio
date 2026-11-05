import { useLayoutEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { Alloy, Cable, Fan, type V3 } from "./CoreVisualParts";
import { EngravedLabel } from "./CoreSurfaceDetails";

/**
 * Detail-oriented 360 mm AIO concept, not a CAD model or a specific brand.
 * Three visible radiator fans, core fins, end tanks, coolant fittings and
 * pump are modeled together so the assembly can be revised independently.
 *
 * The internal scene is intentionally stylized: dimensions, mounting,
 * airflow direction and coolant-loop routing are NOT physical validation.
 */
const FAN_CENTERS = [-0.51, 0, 0.51] as const;
const RADIATOR_FIN_COUNT = 62;

function RadiatorFins() {
  const instances = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!instances.current) return;
    const dummy = new Object3D();
    for (let i = 0; i < RADIATOR_FIN_COUNT; i++) {
      dummy.position.set(-0.725 + i * 0.02375, 1.117, -0.12);
      dummy.rotation.set(0, 0, i % 2 ? 0.035 : -0.035);
      dummy.updateMatrix();
      instances.current.setMatrixAt(i, dummy.matrix);
    }
    instances.current.instanceMatrix.needsUpdate = true;
    instances.current.computeBoundingSphere();
  }, []);
  return (
    <instancedMesh ref={instances} args={[undefined, undefined, RADIATOR_FIN_COUNT]} raycast={() => {}}>
      <boxGeometry args={[0.010, 0.055, 0.59]} />
      <meshStandardMaterial color="#64707b" metalness={0.67} roughness={0.52} />
    </instancedMesh>
  );
}

const COOLANT_TUBES: V3[][] = [
  [[-0.53, 0.41, 0.08], [-0.78, 0.52, 0.19], [-0.79, 0.85, 0.24], [-0.71, 1.05, 0.11]],
  [[-0.38, 0.44, 0.08], [-0.61, 0.60, 0.28], [-0.66, 0.90, 0.30], [-0.71, 1.05, -0.04]],
];
const BRAID_OFFSETS: V3[] = [
  [0.010, 0, 0.010],
  [-0.010, 0, -0.010],
];

function Radiator({ accent, secondary, animated }: {
  accent: string; secondary: string; animated: boolean;
}) {
  return (
    <group>
      {/* Side rails, hollow-looking fin tray and two end tanks. */}
      <Alloy position={[0, 1.035, -0.12]} size={[1.55, 0.13, 0.70]}
        color="#111a25" radius={0.028} roughness={0.56}/>
      <Alloy position={[0, 1.093, -0.12]} size={[1.49, 0.024, 0.625]}
        color="#202b37" radius={0.008}/>
      <RadiatorFins/>
      {[-0.755, 0.755].map(x => (
        <group key={"tank-" + x}>
          <Alloy position={[x, 1.055, -0.12]} size={[0.085, 0.22, 0.70]}
            color="#2b3541" radius={0.026}/>
          <Alloy position={[x, 1.158, -0.12]} size={[0.060, 0.011, 0.61]}
            color="#a1aab3" radius={0.004}/>
        </group>
      ))}
      {[-0.445, 0.205].map(z => (
        <Alloy key={"rail-" + z} position={[0, 1.136, z]}
          size={[1.49, 0.038, 0.022]} color="#84919d" radius={0.009}/>
      ))}
      {/* Three fans orient their faces upward, instead of floating on the glass. */}
      {FAN_CENTERS.map((x, i) => (
        <group key={"360-fan-" + i} position={[x, 1.180, -0.12]} rotation={[-Math.PI / 2, 0, 0]}>
          <Fan position={[0, 0, 0]} radius={0.194} accent={i === 1 ? secondary : accent}
            animated={animated} speed={0.55 + i * 0.06}/>
          <mesh position={[0, 0, 0.145]} raycast={() => {}}>
            <ringGeometry args={[0.143, 0.152, 48]} />
            <meshBasicMaterial color={i === 1 ? secondary : accent}
              transparent opacity={0.43} depthWrite={false} />
          </mesh>
        </group>
      ))}
      <EngravedLabel position={[0, 1.063, 0.256]} size={[0.60, 0.080]}
        title="AIO / 360" subtitle="TRIPLE RADIATOR" accent={secondary}/>
      {FAN_CENTERS.map((x, i) => (
        <group key={"fan-connector-" + i}>
          <Alloy position={[x + 0.16, 1.018, -0.465]}
            size={[0.075, 0.055, 0.058]} color="#192430" radius={0.009}/>
          <Cable points={[[x + 0.16, 1.015, -0.45],
            [x + 0.18, 0.91, -0.53], [0.66, 0.72, -0.55]]}
            radius={0.009} color="#354451" segments={16}/>
        </group>
      ))}
      {/* Hose sockets at the left end of the upper tank. */}
      {[0.11, -0.04].map(z => (
        <group key={"rad-socket-" + z} position={[-0.71, 1.055, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.050, 0.048, 0.052, 18]} />
            <meshStandardMaterial color="#949da6" metalness={0.88} roughness={0.29}/>
          </mesh>
          <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.042, 0.010, 7, 24]}/>
            <meshStandardMaterial color="#293747" roughness={0.65}/>
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PumpBlock({ accent, secondary, onInspect }: {
  accent: string; secondary: string; onInspect: () => void;
}) {
  return (
    <group onClick={event => {event.stopPropagation();onInspect();}}>
      <Alloy position={[-0.43, 0.39, -0.21]} size={[0.44, 0.45, 0.14]}
        color="#afa999" radius={0.030} roughness={0.3}/>
      <Alloy position={[-0.43, 0.39, -0.11]} size={[0.50, 0.51, 0.22]}
        color="#202a35" radius={0.060}/>
      <mesh position={[-0.43, 0.39, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.204, 0.204, 0.065, 48]}/>
        <meshStandardMaterial color="#131c27" metalness={0.78} roughness={0.26}/>
      </mesh>
      <mesh position={[-0.43, 0.39, 0.052]}>
        <ringGeometry args={[0.158, 0.192, 48]}/>
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.44}
          metalness={0.58} roughness={0.22}/>
      </mesh>
      <mesh position={[-0.43, 0.39, 0.054]}>
        <circleGeometry args={[0.139, 48]}/>
        <meshStandardMaterial color="#273341" metalness={0.9} roughness={0.23}/>
      </mesh>
      <mesh position={[-0.43, 0.39, 0.056]}>
        <ringGeometry args={[0.072, 0.079, 48]}/>
        <meshBasicMaterial color={secondary} transparent opacity={0.95}/>
      </mesh>
      <EngravedLabel position={[-0.43, 0.33, 0.059]} size={[0.25, 0.071]}
        title="CORE" subtitle="AIO / PUMP" accent={secondary}/>
      {[-1, 1].flatMap(x => [-1, 1].map(y => (
        <group key={"pump-mount-" + x + "-" + y} position={[-0.43 + x * 0.221, 0.39 + y * 0.231, 0.010]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.016, 12]}/>
            <meshStandardMaterial color="#bbc6cf" metalness={0.9} roughness={0.24}/>
          </mesh>
          <Alloy position={[0, 0, 0.011]} size={[0.028, 0.006, 0.005]} color="#283543"/>
        </group>
      )))}
      {/* Two metal elbow couplings are visibly separate from the braiding. */}
      {[-0.53, -0.38].map((x, i) => (
        <group key={"elbow-" + i}>
          <Alloy position={[x, 0.46, 0.089]} size={[0.070, 0.085, 0.085]}
            color="#8496a4" radius={0.018}/>
          <Alloy position={[x, 0.515, 0.102]} size={[0.057, 0.035, 0.068]}
            color="#293645" radius={0.010}/>
        </group>
      ))}
    </group>
  );
}

function BraidedHoses() {
  return (
    <group>
      {COOLANT_TUBES.map((points, i) => (
        <group key={"hose-" + i}>
          <Cable points={points} radius={0.035} color="#1c2632" segments={46}/>
          {BRAID_OFFSETS.map(([dx, dy, dz], n) => (
            <Cable key={"sleeve-" + n}
              points={points.map(([x, y, z]) => [x + dx, y + dy, z + dz] as V3)}
              radius={0.0042} color={n ? "#60717e" : "#364957"} segments={40}/>
          ))}
        </group>
      ))}
      <Alloy position={[-0.75, 0.773, 0.258]} size={[0.12, 0.068, 0.10]}
        color="#697988" radius={0.014}/>
      <Alloy position={[-0.67, 0.90, 0.298]} size={[0.095, 0.06, 0.066]}
        color="#586978" radius={0.012}/>
    </group>
  );
}

export default function CoreCoolingAssembly({ accent, secondary, animated, installed, onInspect }: {
  accent: string;
  secondary: string;
  animated: boolean;
  installed: boolean;
  onInspect: () => void;
}) {
  return (
    <group>
      <Radiator accent={accent} secondary={secondary} animated={animated}/>
      {installed && (
        <>
          <PumpBlock accent={accent} secondary={secondary} onInspect={onInspect}/>
          <BraidedHoses/>
        </>
      )}
    </group>
  );
}
