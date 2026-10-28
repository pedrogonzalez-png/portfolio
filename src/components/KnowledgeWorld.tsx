import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, RoundedBox } from "@react-three/drei";
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, MathUtils, Vector2, Vector3 } from "three";
import type { Group } from "three";
import { useTheme } from "../stores/themeContext";
import {
  KNOWLEDGE_DOMAINS, KNOWLEDGE_NODES, KNOWLEDGE_PROJECTS,
  type KnowledgeNode, type KnowledgeProjectId,
} from "../data/knowledge";
import { PLACEHOLDER_PROJECTS } from "./PlaceholderCatalog";

export type KnowledgeSelection =
  | { kind: "skill"; id: string }
  | { kind: "project"; id: KnowledgeProjectId }
  | null;

type WorldProps = {
  nodes: readonly KnowledgeNode[];
  selection: KnowledgeSelection;
  onSelect: (selection: KnowledgeSelection) => void;
  onContextLost: () => void;
};

// Authored spatial layout: the depth axis is deliberate, not CSS perspective.
const PROJECT_POSITIONS: Record<KnowledgeProjectId, [number, number, number]> = {
  abismo: [-5.3, -0.12, 1.25],
  "site-3d": [0, 0.62, 2.1],
  "hyprland-themes": [5.3, -0.15, 0.95],
};
const SKILL_POSITIONS: Record<string, [number, number, number]> = {
  javascript: [-7.8, 3.2, -0.6],
  react: [-3.15, 3.8, -1.25],
  css: [0.7, 3.45, -2.1],
  vite: [4.55, 3.55, -1.45],
  phaser: [-8.35, -2.65, -0.85],
  procedural: [-5.7, -4.0, -0.45],
  indexeddb: [-2.35, -3.45, -1.0],
  hyprland: [8.0, 2.6, -1.2],
  qml: [8.25, -2.65, -0.4],
  shell: [4.8, -3.8, -1.25],
  actions: [1.25, -4.0, -1.8],
};

function isNodeLinked(node: KnowledgeNode, selection: KnowledgeSelection) {
  if (!selection) return true;
  return selection.kind === "skill"
    ? node.id === selection.id
    : node.projects.includes(selection.id);
}

function isProjectLinked(projectId: KnowledgeProjectId, selection: KnowledgeSelection) {
  if (!selection) return true;
  return selection.kind === "project"
    ? projectId === selection.id
    : KNOWLEDGE_NODES.some((node) => node.id === selection.id && node.projects.includes(projectId));
}

function GlassPanel({
  size, bright, project,
}: {
  size: [number, number];
  bright: boolean;
  project: boolean;
}) {
  const { theme } = useTheme();
  const accent = bright ? theme.palette.accentYellow : theme.palette.accentPrimary;
  return (
    <group>
      <RoundedBox args={[size[0] + 0.075, size[1] + 0.075, 0.13]} radius={0.16} smoothness={4}>
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={bright ? 0.58 : 0.19}
          depthWrite={false}
        />
      </RoundedBox>
      <RoundedBox args={[size[0], size[1], 0.19]} radius={0.14} smoothness={4} position={[0, 0, 0.07]}>
        <meshPhysicalMaterial
          color={theme.palette.surfaceContainerHigh}
          metalness={0.22}
          roughness={0.13}
          clearcoat={1}
          clearcoatRoughness={0.08}
          transmission={project ? 0.38 : 0.15}
          thickness={0.5}
          transparent
          opacity={project ? 0.84 : 0.81}
          depthWrite={false}
        />
      </RoundedBox>
      <mesh position={[0, size[1] * 0.44, 0.192]}>
        <planeGeometry args={[size[0] * 0.82, 0.014]} />
        <meshBasicMaterial color={accent} transparent opacity={bright ? 0.85 : 0.3} depthWrite={false} />
      </mesh>
    </group>
  );
}

function KnowledgeCard({
  node, active, onSelect,
}: {
  node: KnowledgeNode;
  active: boolean;
  onSelect: (s: KnowledgeSelection) => void;
}) {
  const position = SKILL_POSITIONS[node.id];
  const category = KNOWLEDGE_DOMAINS.find((domain) => domain.id === node.domain)?.name ?? node.domain;
  if (!position) return null;

  return (
    <group position={position} rotation={[0, position[0] * -0.014, 0]}>
      <GlassPanel size={[2.55, 0.83]} bright={active} project={false} />
      <Html center distanceFactor={15} zIndexRange={[50, 10]} className="knowledge-html-anchor">
        <button
          className={"knowledge-node knowledge-domain-" + node.domain + (!active ? " is-dimmed" : "")}
          type="button"
          onClick={() => onSelect({ kind: "skill", id: node.id })}
          aria-label={node.label + " — " + category + ", ver conexões"}
        >
          <span className="knowledge-node-dot" aria-hidden="true" />
          <span>{node.label}</span>
        </button>
      </Html>
    </group>
  );
}

function ProjectCard({
  id, active, onSelect,
}: {
  id: KnowledgeProjectId;
  active: boolean;
  onSelect: (s: KnowledgeSelection) => void;
}) {
  const position = PROJECT_POSITIONS[id];
  const project = PLACEHOLDER_PROJECTS.find((item) => item.id === id);
  if (!project) return null;
  return (
    <group position={position} rotation={[0, position[0] * -0.025, 0]}>
      <GlassPanel size={[3.45, 1.9]} bright={active} project />
      <mesh position={[0, 0, -0.8]}>
        <torusGeometry args={[1.65, 0.013, 6, 90]} />
        <meshBasicMaterial color="#e6a979" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <Html center distanceFactor={15} zIndexRange={[80, 20]} className="knowledge-html-anchor">
        <button
          className={"knowledge-hub" + (!active ? " is-dimmed" : "")}
          type="button"
          onClick={() => onSelect({ kind: "project", id })}
          aria-label={"Destacar projeto: " + project.title}
        >
          <span className="knowledge-hub-mark" aria-hidden="true">✧</span>
          <span>{project.title}</span>
          <small>PROJETO / ABRIR CONEXÕES</small>
        </button>
      </Html>
    </group>
  );
}

function NetworkStrand({
  start, end, bright,
}: {
  start: [number, number, number];
  end: [number, number, number];
  bright: boolean;
}) {
  const { theme } = useTheme();
  const points = useMemo(() => {
    const mid = new Vector3(
      (start[0] + end[0]) * 0.5,
      (start[1] + end[1]) * 0.5 + 0.2,
      Math.min(start[2], end[2]) - 0.9,
    );
    return new CatmullRomCurve3([new Vector3(...start), mid, new Vector3(...end)]).getPoints(22);
  }, [start, end]);
  return (
    <Line
      points={points}
      color={bright ? theme.palette.accentYellow : theme.palette.accentPrimary}
      lineWidth={bright ? 1.5 : 0.6}
      transparent
      opacity={bright ? 0.65 : 0.095}
      depthWrite={false}
    />
  );
}

function AmbientSpace() {
  const { theme } = useTheme();
  const geometry = useMemo(() => {
    const coords = new Float32Array(450 * 3);
    for (let i = 0; i < 450; i += 1) {
      const a = Math.sin((i + 13) * 77.113) * 43758.5453;
      const b = Math.sin((i + 29) * 11.847) * 25193.1453;
      const c = Math.sin((i + 47) * 35.927) * 8345.7323;
      coords[i * 3] = (a - Math.floor(a) - 0.5) * 34;
      coords[i * 3 + 1] = (b - Math.floor(b) - 0.5) * 19;
      coords[i * 3 + 2] = -5 - (c - Math.floor(c)) * 15;
    }
    const result = new BufferGeometry();
    result.setAttribute("position", new BufferAttribute(coords, 3));
    return result;
  }, []);
  const tint = useMemo(() => new Color(theme.palette.accentYellow), [theme.palette.accentYellow]);
  return (
    <group>
      <points geometry={geometry}>
        <pointsMaterial color={tint} size={0.027} transparent opacity={0.58} sizeAttenuation depthWrite={false} />
      </points>
      <mesh position={[0, 0.2, -8.5]} rotation={[0.5, 0.13, 0]}>
        <torusGeometry args={[7.5, 0.012, 6, 128]} />
        <meshBasicMaterial color={theme.palette.accentPrimary} transparent opacity={0.17} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.2, -10.5]} rotation={[0.18, -0.32, 0.15]}>
        <torusGeometry args={[10, 0.012, 6, 128]} />
        <meshBasicMaterial color={theme.palette.accentYellow} transparent opacity={0.10} depthWrite={false} />
      </mesh>
    </group>
  );
}

function CinematicRig({ selection }: { selection: KnowledgeSelection }) {
  const pointer = useRef(new Vector2());
  const desired = useRef(new Vector3());
  useFrame(({ camera, pointer: canvasPointer }, delta) => {
    const ease = 1 - Math.exp(-1.8 * Math.min(delta, 0.06));
    pointer.current.lerp(canvasPointer, ease);
    const chosen = selection?.kind === "skill"
      ? SKILL_POSITIONS[selection.id]
      : selection?.kind === "project"
        ? PROJECT_POSITIONS[selection.id]
        : undefined;
    desired.current.set(
      pointer.current.x * 0.62 + (chosen?.[0] ?? 0) * 0.075,
      pointer.current.y * 0.38 + (chosen?.[1] ?? 0) * 0.065,
      selection ? 19.0 : 19.8,
    );
    camera.position.lerp(desired.current, ease);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function WorldContents({
  nodes, selection, onSelect,
}: Pick<WorldProps, "nodes" | "selection" | "onSelect">) {
  const worldRef = useRef<Group>(null);
  useFrame(({ pointer, clock }, delta) => {
    if (!worldRef.current) return;
    const ease = 1 - Math.exp(-1.7 * Math.min(delta, 0.06));
    worldRef.current.rotation.y = MathUtils.lerp(worldRef.current.rotation.y, pointer.x * 0.038, ease);
    worldRef.current.rotation.x = MathUtils.lerp(worldRef.current.rotation.x, -pointer.y * 0.027, ease);
    worldRef.current.position.y = Math.sin(clock.elapsedTime * 0.33) * 0.07;
  });
  return (
    <>
      <color attach="background" args={["#0e080c"]} />
      <ambientLight intensity={1.2} />
      <pointLight position={[0, 5, 8]} intensity={65} color="#ecb78c" />
      <pointLight position={[-6, -3, 3]} intensity={37} color="#ac4d44" />
      <CinematicRig selection={selection} />
      <AmbientSpace />
      <group ref={worldRef}>
      {nodes.flatMap((node) =>
        node.projects.map((id) => {
          const start = SKILL_POSITIONS[node.id];
          const end = PROJECT_POSITIONS[id];
          if (!start) return null;
          const bright = isNodeLinked(node, selection) && isProjectLinked(id, selection);
          return <NetworkStrand key={node.id + "-" + id} start={start} end={end} bright={bright} />;
        }),
      )}
      {KNOWLEDGE_PROJECTS.map((hub) =>
        <ProjectCard key={hub.id} id={hub.id} active={isProjectLinked(hub.id, selection)} onSelect={onSelect} />,
      )}
      {nodes.map((node) =>
        <KnowledgeCard key={node.id} node={node} active={isNodeLinked(node, selection)} onSelect={onSelect} />,
      )}
      </group>
    </>
  );
}

export default function KnowledgeWorld({ nodes, selection, onSelect, onContextLost }: WorldProps) {
  return (
    <div className="knowledge-webgl">
      <Canvas
        camera={{ position: [0, 0, 19.8], fov: 39, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
        }}
      >
        <WorldContents nodes={nodes} selection={selection} onSelect={onSelect} />
      </Canvas>
    </div>
  );
}
