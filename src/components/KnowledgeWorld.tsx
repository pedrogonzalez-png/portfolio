import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, RoundedBox } from "@react-three/drei";
import { AdditiveBlending, BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, Vector2, Vector3 } from "three";
import type { Group } from "three";
import { useTheme } from "../stores/themeContext";
import { type KnowledgeProjectId } from "../data/knowledge";

export type SpatialCoordinate = { x: number; y: number };
export type KnowledgeWorldProps = {
  activeProject: KnowledgeProjectId;
  skillPositions: readonly { id: string; position: SpatialCoordinate }[];
  activeSkill: string | null;
  onContextLost: () => void;
};

const worldPoint = (x: number, y: number, width: number, height: number, z: number) =>
  new Vector3((x / 100 - 0.5) * width, (0.5 - y / 100) * height, z);

/** A restrained glint instead of broad brown opaque rectangles. */
function GlassSlab({
  x, y, w, h, z, focus = false, turn = 0,
}: {
  x: number; y: number; w: number; h: number; z: number;
  focus?: boolean; turn?: number;
}) {
  const { theme } = useTheme();
  const { viewport } = useThree();
  const position = worldPoint(x, y, viewport.width, viewport.height, z);
  const width = (w / 100) * viewport.width;
  const height = (h / 100) * viewport.height;
  const accent = theme.palette.accentYellow;
  return (
    <group position={position} rotation={[0.025, turn, 0]}>
      <RoundedBox args={[width + 0.045, height + 0.045, 0.15]} radius={0.12} smoothness={4}>
        <meshBasicMaterial color={accent} transparent opacity={focus ? 0.39 : 0.15} depthWrite={false} />
      </RoundedBox>
      <RoundedBox args={[width, height, 0.24]} radius={0.11} smoothness={4} position={[0, 0, 0.09]}>
        <meshPhysicalMaterial
          color={theme.palette.surface}
          roughness={0.12}
          metalness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.08}
          transmission={0.55}
          thickness={0.55}
          transparent
          opacity={0.56}
          depthWrite={false}
        />
      </RoundedBox>
      <mesh position={[0, height * 0.48, 0.23]}>
        <planeGeometry args={[width * 0.83, 0.012]} />
        <meshBasicMaterial color={accent} transparent opacity={focus ? 0.8 : 0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Connection({
  x, y, width, height, selected,
}: {
  x: number; y: number; width: number; height: number; selected: boolean;
}) {
  const { theme } = useTheme();
  const points = useMemo(() => {
    const start = worldPoint(x, y, width, height, -1.0);
    const end = worldPoint(50, y < 50 ? 29 : 71, width, height, -0.7);
    const mid = start.clone().lerp(end, 0.47);
    mid.z = -2.7;
    mid.y += y < 50 ? 0.19 : -0.19;
    return new CatmullRomCurve3([start, mid, end]).getPoints(18);
  }, [x, y, width, height]);
  return (
    <Line
      points={points}
      color={selected ? theme.palette.accentYellow : theme.palette.accentPrimary}
      lineWidth={selected ? 2 : 0.8}
      opacity={selected ? 0.78 : 0.23}
      transparent depthWrite={false}
    />
  );
}

function StarField() {
  const { theme } = useTheme();
  const geometry = useMemo(() => {
    const coords = new Float32Array(720 * 3);
    for (let i = 0; i < 720; i += 1) {
      const rx = Math.sin(i * 77.113 + 0.13) * 43758.5453;
      const ry = Math.sin(i * 11.847 + 3.71) * 25193.1453;
      const rz = Math.sin(i * 35.927 + 9.47) * 8345.7323;
      coords[i * 3] = (rx - Math.floor(rx) - 0.5) * 38;
      coords[i * 3 + 1] = (ry - Math.floor(ry) - 0.5) * 21;
      coords[i * 3 + 2] = -4 - (rz - Math.floor(rz)) * 15;
    }
    const geom = new BufferGeometry();
    geom.setAttribute("position", new BufferAttribute(coords, 3));
    return geom;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const tone = useMemo(() => new Color(theme.palette.accentYellow), [theme.palette.accentYellow]);
  return (
    <points geometry={geometry}>
      <pointsMaterial color={tone} size={0.035} opacity={0.65} transparent sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Aura({ at, size, color }: { at: [number, number, number]; size: number; color: string }) {
  return (
    <mesh position={at} scale={size}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={{ uColor: { value: new Color(color) } }}
        vertexShader={"varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }"}
        fragmentShader={"uniform vec3 uColor; varying vec2 vUv; void main(){ float d=distance(vUv,vec2(.5)); float a=pow(max(0.0,1.0-d*2.0),3.3)*0.19; gl_FragColor=vec4(uColor,a); }"}
        transparent depthWrite={false} blending={AdditiveBlending}
      />
    </mesh>
  );
}

function Architecture({
  skillPositions, activeSkill,
}: Pick<KnowledgeWorldProps, "skillPositions" | "activeSkill">) {
  const { theme } = useTheme();
  const { viewport } = useThree();
  const rig = useRef<Group>(null);
  useFrame(({ clock }, delta) => {
    if (!rig.current) return;
    rig.current.position.y = Math.sin(clock.elapsedTime * 0.37) * 0.045;
    rig.current.rotation.y = Math.sin(clock.elapsedTime * 0.19) * 0.012;
    rig.current.rotation.z = Math.sin(clock.elapsedTime * 0.21) * 0.006;
    void delta;
  });
  return (
    <>
      <ambientLight intensity={1.6} />
      <pointLight position={[-5, 3, 8]} intensity={38} color={theme.palette.accentYellow} />
      <pointLight position={[6, -2, 5]} intensity={26} color={theme.palette.accentPrimary} />
      <StarField />
      <Aura at={[0, 0, -11]} size={21} color={theme.palette.accentPrimary} />
      <Aura at={[6.8, -1.8, -12]} size={13} color={theme.palette.accentYellow} />
      <group ref={rig}>
        <mesh position={[0, 0, -7]} rotation={[0.42, -0.28, 0.22]}>
          <torusGeometry args={[viewport.height * 0.54, 0.012, 5, 160]} />
          <meshBasicMaterial color={theme.palette.accentYellow} transparent opacity={0.13} depthWrite={false} />
        </mesh>
        <mesh position={[0.2, 0.1, -9]} rotation={[-0.24, 0.37, -0.21]}>
          <torusGeometry args={[viewport.height * 0.78, 0.008, 5, 160]} />
          <meshBasicMaterial color={theme.palette.accentPrimary} transparent opacity={0.11} depthWrite={false} />
        </mesh>
        <GlassSlab x={50} y={50} w={40} h={44} z={-0.9} focus />
        <GlassSlab x={12} y={51} w={16} h={25} z={-2.2} turn={0.20} />
        <GlassSlab x={88} y={51} w={16} h={25} z={-2.2} turn={-0.20} />
        {skillPositions.map(({ id, position }) => (
          <group key={id}>
            <Connection
              x={position.x} y={position.y}
              width={viewport.width} height={viewport.height}
              selected={activeSkill === id}
            />
            <GlassSlab x={position.x} y={position.y} w={13} h={8.6} z={-1.65} focus={activeSkill === id} />
          </group>
        ))}
      </group>
    </>
  );
}

function CameraDrift() {
  const pointer = useRef(new Vector2());
  const target = useRef(new Vector2());
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const stage = document.getElementById("knowledge-spatial-stage");
      if (!stage) return;
      const bounds = stage.getBoundingClientRect();
      target.current.set(
        (event.clientX - bounds.left) / bounds.width * 2 - 1,
        1 - (event.clientY - bounds.top) / bounds.height * 2,
      );
      target.current.clampScalar(-1, 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  useFrame(({ camera }, delta) => {
    const speed = 1 - Math.exp(-1.6 * Math.min(delta, 0.06));
    pointer.current.lerp(target.current, speed);
    camera.position.x += (pointer.current.x * 0.13 - camera.position.x) * speed;
    camera.position.y += (pointer.current.y * 0.09 - camera.position.y) * speed;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function SpatialWorld(props: KnowledgeWorldProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 16], zoom: 54, near: 0.1, far: 80 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", props.onContextLost, { once: true })}
    >
      <CameraDrift />
      <Architecture {...props} />
    </Canvas>
  );
}

export default SpatialWorld;
