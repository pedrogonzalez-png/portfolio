import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Box3, Group, Vector3, type Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * CC0, visual-only hardware. Neither model is an exact physical replica:
 * the PSU asset is labelled 750W (the demonstration selects GX 700W), and
 * the DIMM asset depicts DDR5. Never validate electrical fit from a GLB.
 *
 * Preserve the procedural fallback and native click propagation.
 * The library files are served from this site's own public/ folder.
 */
export const PSU_ASSET_PATH = "/assets/the-core/psu-atx-cc0.glb";
export const RAM_ASSET_PATH = "/assets/the-core/ram-ddr5-cc0.glb";

type Kind = "psu" | "ram";
const configs = {
  psu: {
    path: PSU_ASSET_PATH,
    target: [0.90, 0.42, 0.50] as const,
    marker: "data-psu-model",
  },
  ram: {
    path: RAM_ASSET_PATH,
    target: [0.10, 0.81, 0.125] as const,
    marker: "data-ram-model",
  },
} as const;

function fitHardware(original: Object3D, kind: Kind): Group {
  const source = original.clone(true);
  const oriented = new Group();
  if (kind === "psu") {
    // Source: X=width, Y=depth, Z=height; scene uses Y=height.
    source.rotation.x = -Math.PI / 2;
  } else {
    // Source DIMM is laid flat along X; turn its long axis upright along Y.
    source.rotation.z = Math.PI / 2;
  }
  oriented.add(source);
  oriented.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(oriented);
  const size = bounds.getSize(new Vector3());
  if (![size.x, size.y, size.z].every(value => Number.isFinite(value) && value > 1e-6)) {
    throw new Error("Invalid " + kind + " GLB bounds");
  }
  oriented.position.sub(bounds.getCenter(new Vector3()));
  const target = configs[kind].target;
  const fitted = new Group();
  fitted.scale.set(target[0] / size.x, target[1] / size.y, target[2] / size.z);
  fitted.add(oriented);
  return fitted;
}

export default function CorePeripheralAsset({ kind, position, children, enabled = true }: {
  kind: Kind;
  position: [number, number, number];
  children: ReactNode;
  enabled?: boolean;
}) {
  const [model, setModel] = useState<Group | null>(null);
  const config = configs[kind];
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const scene = document.querySelector(".core-scene");
    scene?.setAttribute(config.marker, "loading");
    const loader = new GLTFLoader();
    loader.load(config.path, gltf => {
      if (!active) return;
      try {
        setModel(fitHardware(gltf.scene, kind));
        scene?.setAttribute(config.marker, "glb");
      } catch {
        scene?.setAttribute(config.marker, "fallback");
      }
    }, undefined, () => {
      if (active) scene?.setAttribute(config.marker, "fallback");
    });
    return () => {
      active = false;
      scene?.removeAttribute(config.marker);
    };
  }, [kind, config.marker, config.path, enabled]);

  const visual = useMemo(() => {
    if (!model || !enabled) return null;
    if (kind === "ram") {
      // Match the two sticks shown in the didactic slot layout.
      return (
        <group position={position}>
          {[-0.08, 0.08].map((x, i) => (
            <primitive key={i} object={model.clone(true)} position={[x, 0, 0]} dispose={null} />
          ))}
        </group>
      );
    }
    return <primitive object={model} position={position} dispose={null} />;
  }, [enabled, kind, model, position]);

  return visual ?? <>{children}</>;
}
