import { useEffect, useState, type ReactNode } from "react";
import { Box3, Group, Vector3, type Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * CC0 reference model imported into public/assets/the-core/gpu-generic-cc0.glb.
 * It is a GENERIC three-fan GPU, not a product-accurate Gigabyte RX 7600.
 *
 * The procedural GPU is the safe visual fallback whenever the GLB is missing,
 * blocked, or decoding fails. No third-party asset is loaded at runtime.
 */
export const GPU_ASSET_PATH = "/assets/the-core/gpu-generic-cc0.glb";

function fitIntoCurrentSlot(original: Object3D): Group {
  const model = original.clone(true);
  const orient = new Group();
  orient.add(model);
  model.updateMatrixWorld(true);
  const raw = new Box3().setFromObject(model).getSize(new Vector3());

  // Generic model shipped horizontally on its backplate with the fans up:
  // rotate to put the fan side toward the glass (+Z).
  if (raw.y < raw.z) orient.rotation.x = Math.PI / 2;
  orient.updateMatrixWorld(true);

  const box = new Box3().setFromObject(orient);
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  if (![size.x, size.y, size.z].every(value => value > 1e-6 && Number.isFinite(value)))
    throw new Error("Invalid GPU model bounds");

  orient.position.sub(center);
  const fitted = new Group();
  fitted.scale.set(1.49 / size.x, 0.49 / size.y, 0.34 / size.z);
  fitted.add(orient);
  return fitted;
}

export default function GpuAsset({ children }: { children: ReactNode }) {
  const [mesh, setMesh] = useState<Group | null>(null);

  useEffect(() => {
    let active = true;
    const marker = document.querySelector(".core-scene");
    marker?.setAttribute("data-gpu-model", "loading");
    const loader = new GLTFLoader();
    loader.load(
      GPU_ASSET_PATH,
      gltf => {
        if (!active) return;
        try {
          setMesh(fitIntoCurrentSlot(gltf.scene));
          marker?.setAttribute("data-gpu-model", "glb");
        } catch {
          marker?.setAttribute("data-gpu-model", "fallback");
        }
      },
      undefined,
      () => { marker?.setAttribute("data-gpu-model", "fallback"); },
    );
    return () => {
      active = false;
      marker?.removeAttribute("data-gpu-model");
    };
  }, []);

  return mesh
    ? <primitive object={mesh} dispose={null} />
    : <>{children}</>;
}
