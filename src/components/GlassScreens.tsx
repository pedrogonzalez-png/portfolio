import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import { MeshTransmissionMaterial } from "@react-three/drei";
import type { Mesh, PerspectiveCamera } from "three";
import { useTheme } from "../stores/themeContext";

/**
 * Optically transmissive 3D surfaces registered to the screen positions of
 * accessible DOM buttons. The atmospheric particles are in the same WebGL scene and can refract
 * through these plates. Non-WebGL clients use the HTML/CSS fallback.
 */
function GlassScreen({ index }: { index: number }) {
  const { theme } = useTheme();
  const plate = useRef<Mesh>(null);
  const { camera, gl, size } = useThree();
  const scratch = useMemo(
    () => ({
      position: new Vector3(),
      cameraX: new Vector3(),
      cameraY: new Vector3(),
      forward: new Vector3(),
    }),
    [],
  );

  useFrame((_, delta) => {
    const object = plate.current;
    if (!object) return;

    const button = document.querySelector<HTMLElement>(".cinematic-panel-" + index);
    if (!button || size.width < 1 || window.innerWidth <= 760) {
      object.visible = false;
      return;
    }

    const bounds = button.getBoundingClientRect();
    const viewport = gl.domElement.getBoundingClientRect();
    if (!viewport.width || !viewport.height || bounds.width < 1 || bounds.height < 1) {
      object.visible = false;
      return;
    }

    const screenX = bounds.left + bounds.width / 2;
    const screenY = bounds.top + bounds.height / 2;
    if (
      bounds.bottom < viewport.top - 30 ||
      bounds.top > viewport.bottom + 30 ||
      bounds.right < viewport.left - 30 ||
      bounds.left > viewport.right + 30
    ) {
      object.visible = false;
      return;
    }

    const perspective = camera as PerspectiveCamera;
    const distance = 8.5;
    const visibleHeight = 2 * Math.tan(MathUtils.degToRad(perspective.fov / 2)) * distance;
    const visibleWidth = visibleHeight * (viewport.width / viewport.height);
    const x = ((screenX - viewport.left) / viewport.width - 0.5) * visibleWidth;
    const y = (0.5 - (screenY - viewport.top) / viewport.height) * visibleHeight;

    camera.updateMatrixWorld();
    scratch.cameraX.set(1, 0, 0).applyQuaternion(camera.quaternion);
    scratch.cameraY.set(0, 1, 0).applyQuaternion(camera.quaternion);
    scratch.forward.set(0, 0, -1).applyQuaternion(camera.quaternion);

    // Position glass under the DOM screen during scrolling and camera travel.
    scratch.position
      .copy(camera.position)
      .addScaledVector(scratch.forward, distance)
      .addScaledVector(scratch.cameraX, x)
      .addScaledVector(scratch.cameraY, y);

    const location = button.dataset.position;
    const targetAngle = MathUtils.degToRad(
      location === "left" ? -36 : location === "right" ? 36 : 0,
    );
    const previousAngle = (object.userData.carouselAngle as number | undefined) ?? targetAngle;
    const angle = MathUtils.damp(previousAngle, targetAngle, 8.0, delta);
    object.userData.carouselAngle = angle;

    object.position.copy(scratch.position);
    object.quaternion.copy(camera.quaternion);
    object.rotateY(angle);
    // The DOM rect is already perspective-projected. Restore the width lost
    // by rotating the real WebGL pane so both glass layers stay aligned.
    object.scale.set(
      (bounds.width / viewport.width) * visibleWidth / Math.max(.68, Math.cos(angle)),
      (bounds.height / viewport.height) * visibleHeight,
      1,
    );
    object.visible = true;
  });

  return (
    <mesh ref={plate} frustumCulled={false}>
      <boxGeometry args={[1, 1, 0.036]} />
      <MeshTransmissionMaterial
        color={index === 1 ? theme.palette.accentYellow : index === 2 ? theme.palette.accentRed : theme.palette.textVariant}
        transmission={1}
        thickness={0.62}
        ior={1.28}
        roughness={0.065}
        chromaticAberration={0.039}
        anisotropicBlur={0.085}
        distortion={0.09}
        distortionScale={0.31}
        temporalDistortion={0.035}
        samples={4}
        resolution={256}
        backside={false}
        clearcoat={1}
        clearcoatRoughness={0.045}
        attenuationColor={theme.palette.accentPrimary}
        attenuationDistance={2.9}
        metalness={0}
        envMapIntensity={1.1}
        transparent
        opacity={1}
        depthWrite={false}
      />
    </mesh>
  );
}

export function GlassScreens() {
  return (
    <group>
      <GlassScreen index={0} />
      <GlassScreen index={1} />
      <GlassScreen index={2} />
    </group>
  );
}
