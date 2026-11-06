import { useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, DoubleSide, Shape, Vector3, type Group } from "three";
import { PCBPrint, EngravedLabel } from "./CoreSurfaceDetails";

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
      {/* Inner metallic diffuser and precisely layered rotor / hub. */}
      <mesh position={[0, 0, 0.071]}>
        <ringGeometry args={[radius * 0.52, radius * 0.55, 48]}/>
        <meshStandardMaterial color="#8797a3" metalness={0.85} roughness={0.31}/>
      </mesh>
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
        <mesh position={[0, 0, 0.020]}>
          <ringGeometry args={[radius * 0.16, radius * 0.20, 32]}/>
          <meshBasicMaterial color={accent}/>
        </mesh>
        <mesh position={[0, 0, 0.023]}>
          <circleGeometry args={[radius * 0.115, 30]}/>
          <meshStandardMaterial color="#273641" metalness={0.77} roughness={0.19}/>
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
      <Alloy position={[0, 0, -0.025]} size={[1.19, 1.64, 0.075]} color="#14282d" roughness={0.72} metalness={0.27}/>
      {/* Multi-layer PCB rim, ground traces and nickel mounting inserts. */}
      {[-0.566, 0.566].map(x =>
        <Alloy key={"pcb-edge-"+x} position={[x,0,0.023]} size={[0.018,1.55,0.017]}
          color="#3b615e" radius={0.003} metalness={0.40}/>)}
      {[-0.776,0.776].map(y =>
        <Alloy key={"pcb-end-"+y} position={[0,y,0.023]} size={[1.14,0.016,0.017]}
          color="#3b615e" radius={0.003} metalness={0.40}/>)}
      <PCBPrint position={[0, 0, 0.016]} size={[1.115,1.55]} accent={accent} />
      <EngravedLabel position={[0.06, -0.76, 0.065]} size={[0.50,0.087]}
        title="AM PLATFORM" subtitle="ENGINEERING" accent={accent}/>
      {/* CPU socket under the removable cooling block, with stiffener / retention rail. */}
      <Alloy position={[-0.22,0.26,0.057]} size={[0.47,0.48,0.045]} color="#939da4"
        radius={0.025} roughness={0.33} metalness={0.85}/>
      <Alloy position={[-0.22,0.26,0.084]} size={[0.40,0.41,0.018]} color="#252d38"
        radius={0.020} roughness={0.50}/>
      <Alloy position={[-0.22,0.26,0.095]} size={[0.32,0.34,0.014]} color="#9a9c94"
        radius={0.012} roughness={0.28} metalness={0.82}/>
      {[-1,1].flatMap(x => [-1,1].map(y =>
        <Alloy key={"socket-screw-"+x+"-"+y} position={[-0.22+x*0.214,0.26+y*0.210,0.093]}
          size={[0.032,0.032,0.011]} color="#bdc8d1" radius={0.010}/>))}
      <Alloy position={[0.034,0.26,0.102]} size={[0.021,0.28,0.033]}
        color="#a5b3be" radius={0.007}/>
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
      {[-0.28, -0.44].map((y,i)=>
        <group key={"pcie-lane-"+y}>
          <Alloy position={[-0.05,y,0.075]} size={[0.78,0.064,0.088]}
            color={i?"#424f5e":"#a5adb3"} radius={0.007}/>
          <Alloy position={[-0.045,y,0.126]} size={[0.71,0.012,0.009]}
            color="#1a2a35" radius={0.003}/>
          <Alloy position={[0.32,y,0.135]} size={[0.056,0.081,0.020]}
            color="#9baab6" radius={0.006}/>
        </group>)}
      <Alloy position={[0.43, 0.58, 0.048]} size={[0.072, 0.75, 0.083]} color="#202f3b" />
      <Alloy position={[0.51, 0.58, 0.049]} size={[0.034, 0.75, 0.086]} color="#667783"/>
      {/* DIMM sockets with keyed grooves and retaining clips. */}
      {[0.36,0.52].map(x =>
        <group key={"dimm-slot-"+x}>
          <Alloy position={[x,0.20,0.091]} size={[0.052,1.02,0.085]}
            color="#161e2b" radius={0.007}/>
          <Alloy position={[x,0.20,0.138]} size={[0.015,0.92,0.007]}
            color="#73828e" radius={0.003}/>
          {[-0.31,0.70].map(y =>
            <Alloy key={"dimm-clip-"+y} position={[x,y,0.147]} size={[0.080,0.065,0.024]}
              color="#b5c2c9" radius={0.010}/>)}
        </group>)}
      {/* Segmented aluminum VRM banks and I/O shield. */}
      <Alloy position={[-0.27,0.73,0.098]} size={[0.57,0.18,0.16]}
        color="#495663" radius={0.022}/>
      {Array.from({length:11},(_,i)=>
        <Alloy key={"vrm-top-fin-"+i}
          position={[-0.51+i*0.047,0.73,0.192]} size={[0.020,0.140,0.026]}
          color={i%2?"#b0bbc3":"#798d9b"} radius={0.004}/>)}
      <Alloy position={[-0.50,0.21,0.121]} size={[0.15,0.54,0.13]}
        color="#516371" radius={0.016}/>
      {Array.from({length:8},(_,i)=>
        <Alloy key={"vrm-left-fin-"+i} position={[-0.50,-0.022+i*0.063,0.198]}
          size={[0.126,0.020,0.019]} color="#9dabba" radius={0.004}/>)}
      <Alloy position={[-0.49,0.57,0.202]} size={[0.07,0.020,0.019]}
        color={accent} radius={0.003} emissive={accent}/>
      {/* DIMM catches, power headers, VRM chokes and SATA connectors. */}
      {[-0.73,0.73].map(y => (
        <Alloy key={"dimm-lock-"+y} position={[0.44,y,0.072]}
          size={[0.17,0.043,0.10]} color="#c1c3b9" radius={0.012}/>
      ))}
      {Array.from({length:7},(_,i)=>
        <Alloy key={"vrm-"+i} position={[-0.53+i*0.15,0.47,0.064]}
          size={[0.10,0.12,0.090]} color="#566673" radius={0.015}/>)}
      {[-0.1,0.04,0.18].map(x=>
        <Alloy key={"sata-"+x} position={[x,-0.70,0.082]}
          size={[0.095,0.12,0.08]} color="#1d2935" radius={0.009}/>)}
      <Alloy position={[-0.47,0.18,0.08]} size={[0.20,0.28,0.11]} color="#697c89" radius={0.018}/>
      {Array.from({length:5},(_,i)=>
        <Alloy key={"io-pin-"+i} position={[-0.55+i*0.058,0.18,0.14]}
          size={[0.022,0.18,0.012]} color="#b4c2c8" radius={0.003}/>)}
      <Alloy position={[0.43,-0.58,0.11]} size={[0.17,0.18,0.12]} color="#253644"/>
      {Array.from({length:6},(_,i)=>
        <Alloy key={"header-"+i} position={[0.35+(i%3)*0.072,-0.58+(Math.floor(i/3)*0.070),0.184]}
          size={[0.025,0.030,0.014]} color="#bda77b" radius={0.004}/>)}
      {Array.from({ length: 12 }, (_, i) =>
        <group key={"cap-" + i} position={[-0.44 + (i % 6) * 0.16, -0.73 + Math.floor(i / 6) * 0.065, 0.058]}>
          <mesh rotation={[Math.PI/2,0,0]}>
            <cylinderGeometry args={[0.020,0.020,0.046,10]}/>
            <meshStandardMaterial color="#596b76" metalness={0.66} roughness={0.35}/>
          </mesh>
          <Alloy position={[0,0,0.023]} size={[0.012,0.015,0.007]}
            color="#a7b3bf" radius={0.002}/>
        </group>)}
    </group>
  );
}

/** DDR4 fallback: premium heatspreaders instead of two plain blocks. */
export function MemoryStick({ position, accent, secondary }: {
  position: V3; accent: string; secondary: string;
}) {
  return (
    <group position={position}>
      {/* Connector board, stamped aluminum side plates and top light diffuser. */}
      <Alloy position={[0,0,-0.005]} size={[0.090,0.78,0.092]}
        color="#193c36" radius={0.008} roughness={0.62} metalness={0.24}/>
      <Alloy position={[0,0,0.063]} size={[0.112,0.735,0.075]}
        color="#313d4b" radius={0.015} metalness={0.72} roughness={0.32}/>
      {[-0.31,0.31].map(y =>
        <Alloy key={"shroud-edge-"+y} position={[0,y,0.105]}
          size={[0.114,0.058,0.016]} color="#788897" radius={0.005}/>)}
      {Array.from({length:9},(_,i)=>
        <Alloy key={"heat-fin-"+i} position={[0,-0.25+i*0.064,0.108]}
          size={[0.098,0.012,0.014]} color={i%2?"#637687":"#9baab5"}
          radius={0.003}/>)}
      <Alloy position={[0,0.379,0.075]} size={[0.128,0.056,0.095]}
        color="#adbcc4" radius={0.014} metalness={0.57}/>
      <Alloy position={[0,0.410,0.084]} size={[0.101,0.014,0.081]}
        color={accent} radius={0.004} emissive={accent}/>
      <Alloy position={[0,-0.38,0.057]} size={[0.089,0.038,0.072]}
        color="#1c3332" radius={0.004}/>
      {Array.from({length:12},(_,i)=>
        <Alloy key={"contact-"+i} position={[0,-0.383 + i*0.0044,0.096]}
          size={[0.075,0.0026,0.007]} color="#c4a574" radius={0.001}/>)}
      <Alloy position={[0,0.155,0.120]} size={[0.077,0.013,0.006]}
        color={secondary} radius={0.003} emissive={secondary}/>
    </group>
  );
}
