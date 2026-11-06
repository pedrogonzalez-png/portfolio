import { useEffect, useState, type ReactNode } from "react";
import {
  Box3, DoubleSide, Group, Mesh, Vector3, type Material, type Object3D,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Visual-only models from Innerscene Free Parts Library (CC0 1.0).
 * The generic ATX motherboard depicts an LGA socket, so it must NOT be used
 * to infer compatibility with the educational AM4/AM5 parts catalog.
 * The original procedural meshes remain when files/decoding are unavailable.
 *
 * Case: closed mid-tower 1374583e — glass side -X, front -Y, up +Z.
 * Board: generic ATX 7794769f — flat component side +Z, rear I/O +Y.
 */
export const CASE_ASSET_PATH = "/assets/the-core/case-mid-tower-cc0.glb";
export const BOARD_ASSET_PATH = "/assets/the-core/motherboard-atx-cc0.glb";

type Kind = "case" | "board";
const configs = {
  case: {
    src: CASE_ASSET_PATH,
    target: [1.76, 2.45, 1.28] as const,
    marker: "data-case-model",
  },
  board: {
    src: BOARD_ASSET_PATH,
    target: [1.12, 1.58, 0.15] as const,
    marker: "data-board-model",
  },
} as const;

function visualMesh(root: Object3D, kind: Kind) {
  root.traverse(item => {
    if (!(item instanceof Mesh)) return;
    if (kind === "case") {
      // Do not obstruct picking the motherboard, GPU, RAM, or CPU through
      // the chassis and glass when the user clicks inside the build.
      item.raycast = () => {};
      const mats = Array.isArray(item.material) ? item.material : [item.material];
      const adjusted = mats.map((original: Material) => {
        const named = (item.name + " " + original.name).toLowerCase();
        if (!/glass|window|tempered|pane/.test(named)) return original;
        const copy = original.clone();
        copy.transparent = true;
        copy.opacity = 0.10;
        copy.depthWrite = false;
        copy.side = DoubleSide;
        return copy;
      });
      item.material = Array.isArray(item.material) ? adjusted : adjusted[0];
    }
  });
}

function normalize(original: Object3D, kind: Kind): Group {
  const source = original.clone(true);
  visualMesh(source, kind);
  const oriented = new Group();

  if (kind === "case") {
    // Two nested axes (not one Euler triple) make transforms unambiguous:
    // source +Z vertical -> +Y; -X glass side -> +Z; -Y front -> +X.
    const upright = new Group();
    upright.rotation.x = -Math.PI / 2;
    upright.add(source);
    const face = new Group();
    face.rotation.y = Math.PI / 2;
    face.add(upright);
    oriented.add(face);
  } else {
    // ATX board lies flat by default. Turn its longer edge upright, while
    // keeping its components directed toward the visitor (+Z).
    source.rotation.z = Math.PI / 2;
    oriented.add(source);
  }

  oriented.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(oriented);
  const dimensions = bounds.getSize(new Vector3());
  if (![dimensions.x, dimensions.y, dimensions.z].every(n => n > 1e-6 && Number.isFinite(n)))
    throw new Error("Invalid " + kind + " GLB bounds");

  const center = bounds.getCenter(new Vector3());
  oriented.position.sub(center);

  const target = configs[kind].target;
  const scaled = new Group();
  scaled.scale.set(target[0] / dimensions.x, target[1] / dimensions.y, target[2] / dimensions.z);
  scaled.add(oriented);
  return scaled;
}

export default function CoreHighFidelityAsset({ kind, children }: {
  kind: Kind;
  children: ReactNode;
}) {
  const [model, setModel] = useState<Group | null>(null);
  useEffect(() => {
    let active = true;
    const cfg = configs[kind];
    const scene = document.querySelector(".core-scene");
    scene?.setAttribute(cfg.marker, "loading");
    const loader = new GLTFLoader();

    loader.load(cfg.src, gltf => {
      if (!active) return;
      try {
        setModel(normalize(gltf.scene, kind));
        scene?.setAttribute(cfg.marker, "glb");
      } catch {
        scene?.setAttribute(cfg.marker, "fallback");
      }
    }, undefined, () => {
      if (active) scene?.setAttribute(cfg.marker, "fallback");
    });

    return () => {
      active = false;
      scene?.removeAttribute(cfg.marker);
    };
  }, [kind]);

  return model ? <primitive object={model} dispose={null} /> : <>{children}</>;
}
