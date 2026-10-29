import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, useFBO } from "@react-three/drei";
import { AdditiveBlending, BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, Vector2, Vector3 } from "three";
import type { Group, OrthographicCamera, ShaderMaterial } from "three";
import { useTheme } from "../stores/themeContext";
import RibbonParticles from "./RibbonParticles";
import WaterVeil from "./WaterVeil";
import type { KnowledgeProjectId } from "../data/knowledge";

export type KnowledgeSelection =
  | { kind: "skill"; id: string }
  | { kind: "project"; id: KnowledgeProjectId }
  | null;

export type SpatialCoordinate = { x: number; y: number };
export type KnowledgeWorldProps = {
  activeProject: KnowledgeProjectId;
  skillPositions: readonly { id: string; position: SpatialCoordinate }[];
  activeSkill: string | null;
  onContextLost: () => void;
};

const spacePoint = (x: number, y: number, width: number, height: number, z: number) =>
  new Vector3((x / 100 - 0.5) * width, (0.5 - y / 100) * height, z);

// The background has recognizable bright ribbons for the lens to refract.
// It uses original mathematical shapes, no external textures or reference assets.
const veilVertex = [
  "varying vec2 vUv;",
  "void main() {",
  "  vUv = uv;",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
  "}",
].join("\n");

const veilFragment = [
  "uniform float uTime;",
  "uniform vec3 uWarm;",
  "uniform vec3 uRose;",
  "varying vec2 vUv;",
  "float bell(float x, float k) { return exp(-x*x*k); }",
  "void main() {",
  "  vec2 p = vUv - 0.5;",
  "  float t = uTime * 0.14;",
  "  float current = p.y - 0.19*sin(p.x*6.8 + t) - 0.045*cos(p.x*15.0-t);",
  "  float ribbon = bell(current, 120.0) * (0.4 + 0.6*bell(p.x, 7.0));",
  "  float filament = bell(current + 0.055*sin(p.x*12.0-t), 2600.0);",
  "  float returnWave = p.y + 0.16*sin(p.x*6.1 - t*0.7) + 0.11;",
  "  float second = bell(returnWave, 600.0) * 0.72;",
  "  float glow = bell(p.x + 0.18, 20.0) * bell(p.y + 0.09, 9.0);",
  "  float flare = bell(p.x - 0.28, 32.0) * bell(p.y - 0.12, 60.0);",
  "  vec3 color = vec3(0.015,0.012,0.028);",
  "  color += uWarm*(ribbon*0.15 + filament*0.31 + glow*0.085);",
  "  color += uRose*(second*0.19 + flare*0.16);",
  "  color += vec3(0.32,0.47,0.65)*(filament*0.15 + second*0.085);",
  "  gl_FragColor = vec4(color, 1.0);",
  "}",
].join("\n");

// All panes read the same offscreen image: genuine screen-space refraction,
// prism edges and grazing-angle reflection, rather than opaque CSS tint.
const lensVertex = [
  "varying vec2 vUv;",
  "varying vec3 vViewNormal;",
  "varying vec3 vViewDirection;",
  "void main() {",
  "  vUv = uv;",
  "  vec4 eye = modelViewMatrix * vec4(position, 1.0);",
  "  vViewNormal = normalize(normalMatrix * normal);",
  "  vViewDirection = normalize(-eye.xyz);",
  "  gl_Position = projectionMatrix * eye;",
  "}",
].join("\n");

const lensFragment = [
  "uniform sampler2D uBackdrop;",
  "uniform vec2 uResolution;",
  "uniform float uTime;",
  "uniform vec3 uTint;",
  "uniform float uFocus;",
  "uniform vec2 uPanelSize;",
  "uniform float uCorner;",
  "varying vec2 vUv;",
  "varying vec3 vViewNormal;",
  "varying vec3 vViewDirection;",
  "void main() {",
  "  vec2 p = vUv - 0.5;",
  "  vec2 q = abs(p * uPanelSize) - (uPanelSize * 0.5 - vec2(uCorner));",
  "  float roundedDistance = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uCorner;",
  "  float alpha = 1.0 - smoothstep(-1.0, 1.0, roundedDistance);",
  "  if (alpha <= 0.001) discard;",
  "  float side = min(min(vUv.x, 1.0-vUv.x), min(vUv.y, 1.0-vUv.y));",
  "  float rim = 1.0 - smoothstep(0.0, 0.075, side);",
  "  float fresnel = pow(1.0 - abs(dot(normalize(vViewNormal), normalize(vViewDirection))), 2.3);",
  "  vec2 bend = -p * (0.004 + rim * 0.010);",
  "  bend += vec2(sin(vUv.y * 11.0 + uTime * 0.15), cos(vUv.x * 9.0 - uTime * 0.11)) * 0.0006;",
  "  bend += vec2(sin(vUv.y*19.0 + uTime*0.36), cos(vUv.x*17.0-uTime*0.31))*0.00028;",
  "  vec2 uv = clamp(gl_FragCoord.xy/uResolution + bend, vec2(0.002), vec2(0.998));",
  "  vec2 dispersion = normalize(p + vec2(0.0001)) * rim * (0.00045 + 0.00045*uFocus);",
  "  float r = texture2D(uBackdrop, clamp(uv+dispersion, vec2(0.002), vec2(0.998))).r;",
  "  float g = texture2D(uBackdrop, uv).g;",
  "  float b = texture2D(uBackdrop, clamp(uv-dispersion, vec2(0.002), vec2(0.998))).b;",
  "  vec3 refracted = vec3(r,g,b);",
  "  refracted = mix(refracted, refracted * uTint, 0.028);",
  "  float highlight = pow(max(0.0, 1.0-abs(vUv.x*0.8+vUv.y*0.6-0.54)), 58.0)*0.035;",
  "  float edgeLight = rim*(0.035+uFocus*0.055) + fresnel*0.09;",
  "  vec3 color = refracted + vec3(0.91,0.93,1.0)*highlight + uTint*edgeLight;",
  "  gl_FragColor = vec4(color, alpha * 0.965);",
  "}",
].join("\n");

function Backdrop() {
  const { theme } = useTheme();
  const { viewport } = useThree();
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uWarm: { value: new Color(theme.palette.accentYellow) },
    uRose: { value: new Color(theme.palette.accentRed) },
  }), [theme.palette.accentYellow, theme.palette.accentRed]);
  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh position={[0, 0, -7.5]} frustumCulled={false}>
      <planeGeometry args={[viewport.width * 1.65, viewport.height * 1.6]} />
      <shaderMaterial
        key={theme.id}
        ref={material}
        uniforms={uniforms}
        vertexShader={veilVertex}
        fragmentShader={veilFragment}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * A few sculptural light ribbons behind the glass make optical bending visible.
 * They're not an anatomical object or a copy of the agency's artwork.
 */
function FlowingLight() {
  const { theme } = useTheme();
  const { viewport } = useThree();
  const movement = useRef<Group>(null);
  const strands = useMemo(() => [0, 1, 2].map((index) => {
    const curve = new CatmullRomCurve3(Array.from({ length: 24 }, (_, step) => {
      const t = step / 23;
      const phase = index * 1.55;
      return new Vector3(
        (t - 0.5) * viewport.width * 0.85,
        Math.sin(t * Math.PI * (2.7 + index * 0.15) + phase) * viewport.height * (0.20 + index * 0.025)
          + (index - 1) * 0.53,
        -3.8 + Math.sin(t * Math.PI * 2.2 + phase) * 0.7,
      );
    }));
    return { index, curve };
  }), [viewport.width, viewport.height]);

  useFrame(({ clock }) => {
    if (!movement.current) return;
    movement.current.rotation.y = Math.sin(clock.elapsedTime * 0.12) * 0.036;
    movement.current.position.y = Math.sin(clock.elapsedTime * 0.26) * 0.12;
  });

  return (
    <group ref={movement}>
      {strands.map(({ index, curve }) => (
        <mesh key={index}>
          <tubeGeometry args={[curve, 200, index === 1 ? 0.018 : 0.012, 6, false]} />
          <meshBasicMaterial
            color={index === 0 ? theme.palette.accentYellow : index === 1 ? "#8daeda" : theme.palette.accentRed}
            transparent
            opacity={index === 1 ? 0.29 : 0.22}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function OpticalDust() {
  const { theme } = useTheme();
  const geometry = useMemo(() => {
    const coords = new Float32Array(490 * 3);
    for (let i = 0; i < 490; i += 1) {
      const sx = Math.sin(i * 79.3) * 47758.34;
      const sy = Math.sin(i * 13.91) * 32139.32;
      const sz = Math.sin(i * 27.51) * 9117.54;
      coords[i * 3] = (sx - Math.floor(sx) - 0.5) * 33;
      coords[i * 3 + 1] = (sy - Math.floor(sy) - 0.5) * 19;
      coords[i * 3 + 2] = -3.2 - (sz - Math.floor(sz)) * 7.4;
    }
    const buffer = new BufferGeometry();
    buffer.setAttribute("position", new BufferAttribute(coords, 3));
    return buffer;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.028}
        color={theme.palette.accentYellow}
        opacity={0.67}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

type Pane = {
  x: number; y: number; w: number; h: number; z: number;
  focus?: boolean; turn?: number;
};

function Lens({
  pane, uniforms,
}: {
  pane: Pane;
  uniforms: {
    uBackdrop: { value: import("three").Texture };
    uResolution: { value: Vector2 };
    uTime: { value: number };
    uTint: { value: Color };
    uFocus: { value: number };
  };
}) {
  const { theme } = useTheme();
  const { viewport, size } = useThree();
  const { x, y, w, h, z, turn = 0, focus = false } = pane;
  const p = spacePoint(x, y, viewport.width, viewport.height, z);
  const width = w / 100 * viewport.width;
  const height = h / 100 * viewport.height;
  const ownUniforms = useMemo(() => ({
    ...uniforms,
    uFocus: { value: focus ? 1 : 0 },
    uPanelSize: { value: new Vector2((w / 100) * size.width, (h / 100) * size.height) },
    uCorner: { value: focus && w > 30 ? 25 : h > 15 ? 19 : 13 },
  }), [focus, w, h, size.width, size.height, uniforms]);

  return (
    <group position={p} rotation={[0, turn, 0]}>
      {/* The thick beveled body gives depth. Its color must not obscure the lens. */}
      <RoundedBox args={[width, height, 0.15]} radius={0.055} smoothness={4}>
        <meshBasicMaterial
          color={theme.palette.accentYellow}
          opacity={focus ? 0.055 : 0.034}
          transparent
          depthWrite={false}
        />
      </RoundedBox>
      {/* Refraction only on the front face. Sampling the box's sides caused RGB streaks. */}
      <mesh position={[0, 0, 0.081]} renderOrder={2}>
        <planeGeometry args={[width, height]} />
        <shaderMaterial
          vertexShader={lensVertex}
          fragmentShader={lensFragment}
          uniforms={ownUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, height * 0.474, 0.084]} renderOrder={3}>
        <planeGeometry args={[width * 0.58, 0.007]} />
        <meshBasicMaterial color="#f7f1e9" opacity={focus ? 0.29 : 0.15} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

function AmbientRings() {
  const { theme } = useTheme();
  const { viewport } = useThree();
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.12) * 0.055;
  });
  return (
    <group ref={group} position={[0, 0, -5.6]}>
      <mesh rotation={[0.56, -0.30, 0.14]}>
        <torusGeometry args={[viewport.height * 0.68, 0.012, 5, 144]} />
        <meshBasicMaterial color={theme.palette.accentYellow} opacity={0.11} transparent depthWrite={false} side={DoubleSide} />
      </mesh>
      <mesh rotation={[0.1, 0.28, -0.20]}>
        <torusGeometry args={[viewport.height * 0.89, 0.009, 5, 144]} />
        <meshBasicMaterial color={theme.palette.accentRed} opacity={0.09} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

/** One shared framebuffer for every lens; no render pass per card. */
function SharedGlass({ skillPositions, activeSkill }: Pick<KnowledgeWorldProps, "skillPositions" | "activeSkill">) {
  const { theme } = useTheme();
  const { gl, size } = useThree();
  const dpr = gl.getPixelRatio();
  const canvasWidth = Math.max(1, Math.round(size.width * dpr));
  const canvasHeight = Math.max(1, Math.round(size.height * dpr));
  // Preserve the stage's aspect ratio: independent caps distort glass refraction.
  const scale = Math.min(1, 1400 / canvasWidth, 900 / canvasHeight);
  const bufferWidth = Math.max(1, Math.round(canvasWidth * scale));
  const bufferHeight = Math.max(1, Math.round(canvasHeight * scale));
  const target = useFBO(bufferWidth, bufferHeight, { depthBuffer: false, samples: 0 });
  const glassGroup = useRef<Group>(null);
  const uniforms = useMemo(() => ({
    uBackdrop: { value: target.texture },
    uResolution: { value: new Vector2(canvasWidth, canvasHeight) },
    uTime: { value: 0 },
    uTint: { value: new Color(theme.palette.accentYellow) },
    uFocus: { value: 1 },
  }), [target.texture, canvasWidth, canvasHeight, theme.palette.accentYellow]);

  useFrame(({ scene, camera, clock }) => {
    if (!glassGroup.current) return;
    const previous = gl.getRenderTarget();
    glassGroup.current.visible = false;
    try {
      gl.setRenderTarget(target);
      gl.clear(true, true, true);
      gl.render(scene, camera);
    } finally {
      gl.setRenderTarget(previous);
      glassGroup.current.visible = true;
    }
    uniforms.uTime.value = clock.elapsedTime;
  }, -1);

  const chipWidth = Math.max(135, Math.min(182, size.width * 0.13)) / size.width * 100;
  const panes: Pane[] = [
    { x: 50, y: 50, w: 40, h: 44, z: -0.75, focus: true },
    { x: 12, y: 51, w: 16, h: 25, z: -1.7, turn: -0.17 },
    { x: 88, y: 51, w: 16, h: 25, z: -1.7, turn: 0.17 },
    ...skillPositions.map(({ position, id }) => ({
      x: position.x, y: position.y, w: chipWidth,
      h: (id === "procedural" ? 57 : 47) / size.height * 100, z: -1.25,
      focus: activeSkill === id,
    })),
  ];

  return (
    <group ref={glassGroup}>
      {panes.map((pane, index) =>
        <Lens key={index} pane={pane} uniforms={uniforms} />,
      )}
    </group>
  );
}

/** A small lens-breathing move connects the glass cards to scroll navigation.
 *  Runs before the FBO pass so the glass captures the same camera this frame.
 *  Orthographic zoom is eased and returns to its exact resting value.
 */
function CameraProjectTransition({ project }: { project: KnowledgeProjectId }) {
  const { camera } = useThree();
  const previous = useRef(project);
  const motion = useRef(0);
  useEffect(() => {
    if (previous.current !== project) {
      previous.current = project;
      motion.current = 1;
    }
  }, [project]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    motion.current *= Math.exp(-2.8 * dt);
    if (motion.current < 0.001) motion.current = 0;
    const ortho = camera as OrthographicCamera;
    const targetZoom = 54 - motion.current * 1.2;
    const easing = 1 - Math.exp(-7 * dt);
    const nextZoom = ortho.zoom + (targetZoom - ortho.zoom) * easing;
    if (Math.abs(nextZoom - ortho.zoom) > 0.0001) {
      ortho.zoom = nextZoom;
      ortho.updateProjectionMatrix();
    }
  }, -3);
  return null;
}

export default function KnowledgeWorld(props: KnowledgeWorldProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 16], zoom: 54, near: 0.1, far: 80 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", props.onContextLost, { once: true })}
    >
      <color attach="background" args={["#090b15"]} />
      <CameraProjectTransition project={props.activeProject} />
      <Backdrop />
      <WaterVeil />
      <AmbientRings />
      <FlowingLight />
      <RibbonParticles />
      <OpticalDust />
      <SharedGlass skillPositions={props.skillPositions} activeSkill={props.activeSkill} />
    </Canvas>
  );
}
