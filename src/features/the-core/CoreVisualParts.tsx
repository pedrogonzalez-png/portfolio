import { useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, DoubleSide, Shape, Vector3, type Group } from "three";

export type V3 = [number, number, number];

/** Brushed, softly beveled enclosures make the silhouette readable from any angle. */
export function Alloy({ position, size, color = "#26313c", radius = 0.018,
  roughness = 0.35, metalness = 0.72, emissive }: {
  position: V3; size: V3; color?: string; radius?: number;
  roughness?: number; metalness?: number; emissive?: string;
}) {
  return (
    <RoundedBox position={position} args={size}
      radius={Math.min(radius, size[0] / 3, size[1] / 3, size[2] / 3)} smoothness={3}>
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness}
        emissive={emissive || "#000000"} emissiveIntensity={emissive ? 0.35 : 0} />
    </RoundedBox>
  );
}

export function Pin({ position, size = 0.018 }: { position: V3; size?: number }) {
  return (
    <group position={position}>
      <mesh><cylinderGeometry args={[size, size, 0.009, 12]}/>
        <meshStandardMaterial color="#b1b9c3" metalness={0.88} roughness={0.2}/>
      </mesh>
      <Alloy position={[0, 0.006, 0]} size={[size * 1.2, 0.007, 0.006]} color="#4d5a67" />
    </group>
  );
}

/** Decorative cable spline; no real wire lengths/power specifications are implied. */
export function Cable({ points, radius = 0.022, color = "#313d4c", segments = 32 }: {
  points: V3[]; radius?: number; color?: string; segments?: number;
}) {
  const path = useMemo(() => new CatmullRomCurve3(points.map(p => new Vector3(...p))), [points]);
  return (
    <mesh raycast={() => {}}>
      <tubeGeometry args={[path, segments, radius, 7, false]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.08} />
    </mesh>
  );
}

const FAN_BLADE = (() => {
  const shape = new Shape();
  shape.moveTo(0.12, -0.06);
  shape.bezierCurveTo(0.29, -0.18, 0.61, -0.12, 0.75, 0.16);
  shape.bezierCurveTo(0.85, 0.39, 0.66, 0.50, 0.51, 0.33);
  shape.bezierCurveTo(0.33, 0.19, 0.11, 0.19, 0.12, -0.06);
  return shape;
})();

/** Fan axis points toward +Z. Seven blade silhouette, housing, screws, RGB ring. */
export function Fan({ position, radius, accent, animated, speed = 0.5, variant = "case" }: {
  position: V3; radius: number; accent: string; animated: boolean; speed?: number;
  variant?: "case" | "gpu";
}) {
  const rotor = useRef<Group>(null);
  useFrame((_, dt) => {
    if (animated && rotor.current) rotor.current.rotation.z += dt * speed;
  });
  const width = radius * 2.24;
  return (
    <group position={position}>
      <Alloy position={[0, 0, 0]} size={[width, width, 0.09]} color="#141922" radius={radius * 0.14}/>
      <mesh position={[0, 0, 0.054]}>
        <circleGeometry args={[radius * 0.96, 32]}/>
        <meshBasicMaterial color="#080e16"/>
      </mesh>
      {[0.98, 0.84, 0.71].map((ratio, i) => (
        <mesh key={ratio} position={[0, 0, 0.057 + i * 0.008]}>
          <ringGeometry args={[radius * ratio - radius * (i === 0 ? 0.055 : 0.018),
            radius * ratio, 36]}/>
          <meshBasicMaterial color={i === 1 ? accent : "#778896"}
            transparent opacity={i === 1 ? (variant === "gpu" ? 0.48 : 0.76) : 0.48} depthWrite={false} />
        </mesh>
      ))}
      <group ref={rotor} position={[0, 0, 0.074]}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} rotation={[0, 0, i * 2 * Math.PI / 7]} scale={[radius * 1.08, radius * 1.08, 1]}>
            <shapeGeometry args={[FAN_BLADE, 7]}/>
            <meshStandardMaterial color={variant === "gpu" ? "#57616b" : "#667480"}
              metalness={0.52} roughness={0.38} side={DoubleSide}/>
          </mesh>
        ))}
        <mesh position={[0, 0, 0.013]}>
          <circleGeometry args={[radius * 0.23, 20]}/>
          <meshStandardMaterial color="#a4b1bc" metalness={0.85} roughness={0.22} side={DoubleSide}/>
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <ringGeometry args={[radius * 0.16, radius * 0.20, 20]}/>
          <meshBasicMaterial color={accent}/>
        </mesh>
      </group>
      {[-1, 1].flatMap(x => [-1, 1].map(y => (
        <group key={x + "/" + y} position={[x * radius * 0.94, y * radius * 0.94, 0.07]}>
          <mesh>
            <circleGeometry args={[radius * 0.086, 10]} />
            <meshStandardMaterial color="#b2bbc7" metalness={0.8} roughness={0.21}/>
          </mesh>
          <Alloy position={[0, 0, 0.005]} size={[radius * 0.11, radius * 0.019, 0.006]} color="#354453"/>
        </group>
      )))}
    </group>
  );
}

/* Stylized technical PCB, with raised heat sinks, traces, slot rails and I/O. */
export function Board({ accent }: { accent: string }) {
  return (
    <group>
      <Alloy position={[0, 0, -0.025]} size={[1.19, 1.64, 0.075]} color="#14282d" roughness={0.67} metalness={0.35}/>
      {Array.from({ length: 17 }, (_, i) => {
        const startX = -0.52 + (i % 7) * 0.15;
        const endY = 0.67 - Math.floor(i / 7) * 0.33 - (i % 3) * 0.11;
        return <group key={"trace-" + i}>
          <Alloy position={[startX, endY, 0.021]} size={[0.016, 0.13 + (i % 3) * 0.065, 0.007]}
            color={i % 5 === 0 ? accent : "#416965"} radius={0.002} metalness={0.37}/>
          <Alloy position={[startX + 0.04, endY + 0.043, 0.023]} size={[0.08, 0.012, 0.007]}
            color="#426969" radius={0.002}/>
        </group>;
      })}
      {[-0.53, 0.53].flatMap(x => [-0.73, 0.73].map(y => (
        <mesh key={"screw-"+x+"-"+y} position={[x, y, 0.033]}>
          <circleGeometry args={[0.025, 12]}/>
          <meshStandardMaterial color="#b8b5a3" metalness={0.74} roughness={0.22}/>
        </mesh>
      )))}
      <Alloy position={[-0.40, 0.66, 0.07]} size={[0.31, 0.24, 0.11]} color="#647582"/>
      <Alloy position={[-0.40, 0.66, 0.134]} size={[0.21, 0.035, 0.025]} color="#9eafba"/>
      <Alloy position={[-0.40, 0.55, 0.134]} size={[0.21, 0.035, 0.025]} color="#9eafba"/>
      <Alloy position={[-0.46, -0.59, 0.09]} size={[0.30, 0.33, 0.13]} color="#525f6d"/>
      {[-0.52, -0.41, -0.30].map(x=>
        <Alloy key={x} position={[x, -0.59, 0.161]} size={[0.064, 0.24, 0.017]} color="#84929e" radius={0.003}/>)}
      {[-0.48, -0.33, -0.18, -0.03, 0.12, 0.27, 0.42].map((x,i)=>
        <Alloy key={x} position={[x, -0.29 + (i % 2) * 0.043, 0.038]}
          size={[0.12, 0.044, 0.044]} color="#8999a3" radius={0.008}/>)}
      {[0.12, 0.25, 0.38].map(x=>
        <Alloy key={x} position={[x, -0.47, 0.076]} size={[0.052, 0.25, 0.080]} color="#343e49" radius={0.006}/>)}
      {[-0.28, -0.44].map(y=>
        <Alloy key={y} position={[-0.05, y, 0.072]} size={[0.65, 0.045, 0.052]} color="#a5adb3" radius={0.005}/>)}
      <Alloy position={[0.43, 0.58, 0.048]} size={[0.072, 0.75, 0.083]} color="#202f3b" />
      <Alloy position={[0.51, 0.58, 0.049]} size={[0.034, 0.75, 0.086]} color="#667783"/>
      {Array.from({ length: 12 }, (_, i) =>
        <Alloy key={"cap-" + i} position={[-0.44 + (i % 6) * 0.16, -0.73 + Math.floor(i / 6) * 0.065, 0.058]}
          size={[0.035, 0.043, 0.042]} color="#4c606a" radius={0.005}/>)}
    </group>
  );
}
