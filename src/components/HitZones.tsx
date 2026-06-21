import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { FINGERS } from "@/constants/fingers";
import type { FingerIndex, HandModelApi } from "@/types/hand";

interface FingerJointSphereProps {
  fingerIndex: FingerIndex;
  jointIndex: number;
  handRef: RefObject<HandModelApi | null>;
  hovered: boolean;
  visible: boolean;
  onPointerEnter: (fingerIndex: FingerIndex) => void;
  onPointerLeave: () => void;
}

function FingerJointSphere({
  fingerIndex,
  jointIndex,
  handRef,
  hovered,
  visible,
  onPointerEnter,
  onPointerLeave,
}: FingerJointSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const finger = FINGERS[fingerIndex];
  const radius = finger.hitRadii[jointIndex];

  useFrame(() => {
    const mesh = meshRef.current;
    const api = handRef.current;
    const bone = api?.getFingers()?.[fingerIndex]?.bones?.[jointIndex];
    const handGroup = api?.getHandGroup?.();
    if (!mesh || !bone || !handGroup) return;

    bone.getWorldPosition(worldPos);
    handGroup.worldToLocal(worldPos);
    mesh.position.copy(worldPos);

    const localRadius = radius / handGroup.scale.x;
    mesh.scale.set(localRadius, localRadius, localRadius);
    mesh.updateMatrixWorld(true);
  });

  return (
    <mesh
      ref={meshRef}
      renderOrder={visible ? 10 : 0}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerEnter(fingerIndex);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointerLeave();
      }}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color={finger.color}
        transparent
        opacity={visible ? (hovered ? 0.65 : 0.4) : 0}
        depthWrite={false}
        depthTest={visible}
        toneMapped={false}
      />
    </mesh>
  );
}

export interface HitZonesProps {
  handRef: RefObject<HandModelApi | null>;
  hoveredFinger: FingerIndex | null;
  visible: boolean;
  onPointerEnter: (fingerIndex: FingerIndex) => void;
  onPointerLeave: () => void;
}

/** Always active for hover; visibility controlled by `visible` prop. */
export default function HitZones({
  handRef,
  hoveredFinger,
  visible,
  onPointerEnter,
  onPointerLeave,
}: HitZonesProps) {
  return (
    <group name="finger-hit-zones">
      {FINGERS.map((finger, fingerIndex) =>
        finger.hitRadii.map((_, jointIndex) => (
          <FingerJointSphere
            key={`${finger.name}-${jointIndex}`}
            fingerIndex={fingerIndex as FingerIndex}
            jointIndex={jointIndex}
            handRef={handRef}
            hovered={hoveredFinger === fingerIndex}
            visible={visible}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
          />
        )),
      )}
    </group>
  );
}
