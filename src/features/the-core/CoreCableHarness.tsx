import { Alloy, Cable, type V3 } from "./CoreVisualParts";

/**
 * Stylized individually sleeved power harness. This deliberately models
 * cable-management details, not actual connector pinouts or wiring safety.
 *
 * Curved paths have few segments and fixed control points to avoid GPU costs
 * from rebuilding hundreds of tiny independent parts.
 */
const ROUTES: V3[][] = [
  // Cable path behind the motherboard tray and left-hand frame.
  [[-0.51, -0.91, -0.43], [-0.68, -0.76, -0.45], [-0.71, -0.10, -0.47], [-0.70, 0.50, -0.34]],
  // GPU power travels along the lower back edge, surfacing only at its connector.
  [[-0.28, -0.89, -0.44], [0.23, -0.86, -0.46], [0.67, -0.53, -0.43], [0.64, -0.13, -0.21]],
];
const WIRE_OFFSETS = [-0.036, -0.026, -0.016, -0.005, 0.005, 0.016, 0.026, 0.036] as const;

export default function CoreCableHarness({ installed, accent }: {
  installed: boolean; accent: string;
}) {
  if (!installed) return null;
  return (
    <group>
      {ROUTES.map((route, bundle) => (
        <group key={"cable-bundle-" + bundle}>
          {/* Dark continuous sleeve visually unifies the individual conductors. */}
          <Cable points={route} radius={bundle ? 0.027 : 0.033}
            color="#1b2630" segments={40}/>
          {WIRE_OFFSETS.map((offset, strand) => {
            const points = route.map(([x, y, z]) =>
              [x + (bundle ? 0 : offset), y + (bundle ? offset : 0), z + 0.015] as V3);
            return (
              <Cable key={"strand-" + strand} points={points}
                radius={0.0038} color={strand % 3 === 0 ? "#66798a" : "#344556"} segments={32}/>
            );
          })}
        </group>
      ))}
      {/* Flat cable-combs and zip ties make the cables read as organized hardware. */}
      {[-0.46, 0.23].map((y, i) => (
        <group key={"main-comb-" + i}>
          <Alloy position={[-0.707, y, -0.310]} size={[0.210, 0.057, 0.055]}
            color="#81909a" radius={0.011}/>
          {WIRE_OFFSETS.map((offset, n) => (
            <Alloy key={"comb-tooth-" + n}
              position={[-0.707 + offset, y, -0.274]}
              size={[0.011, 0.053, 0.012]} color="#1e2a35" radius={0.002}/>
          ))}
        </group>
      ))}
      {[-0.52, -0.30].map((y, i) => (
        <group key={"gpu-comb-" + i}>
          <Alloy position={[0.673, y, -0.29]} size={[0.072, 0.160, 0.048]}
            color="#647480" radius={0.012}/>
          <Alloy position={[0.673, y, -0.262]} size={[0.051, 0.158, 0.008]}
            color="#222f3b" radius={0.003}/>
        </group>
      ))}
      {/* Illustrative 24-pin housing at the edge of the motherboard. */}
      <Alloy position={[-0.70, 0.50, -0.29]} size={[0.20, 0.14, 0.15]}
        color="#111c27" radius={0.018}/>
      {Array.from({length:12}, (_, i) => (
        <Alloy key={"connector-pin-" + i}
          position={[-0.772 + (i % 6) * 0.027, 0.535 - Math.floor(i / 6) * 0.036, -0.208]}
          size={[0.021, 0.023, 0.013]} color="#9aabb5" radius={0.004}/>
      ))}
      <Alloy position={[0.64, -0.13, -0.20]} size={[0.21, 0.12, 0.20]}
        color="#1a2834" radius={0.019}/>
      <Alloy position={[0.64, -0.060, -0.17]} size={[0.11, 0.012, 0.12]}
        color={accent} radius={0.006} emissive={accent}/>
      {/* Non-electrical decorative fasteners. */}
      {[[-0.74, -0.76, -0.42], [0.68, -0.76, -0.38]].map((point, i) => (
        <group key={"cable-anchor-" + i}>
          <Alloy position={point as V3} size={[0.095, 0.07, 0.042]}
            color="#87939c" radius={0.013}/>
          <mesh position={[point[0],point[1],point[2]+0.028]}>
            <circleGeometry args={[0.018, 14]}/>
            <meshStandardMaterial color="#1c2936" metalness={0.4} roughness={0.48}/>
          </mesh>
        </group>
      ))}
    </group>
  );
}
