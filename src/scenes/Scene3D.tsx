import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";

function ParticleText() {
  const count = 2000;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) arr[i] = (Math.random() - 0.5) * 4;
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#C96A42" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

export default function Scene3D() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 0, pointerEvents: "none" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 2, 2]} intensity={1} color="#E3B37A" />
        <ParticleText />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
