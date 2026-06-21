import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Invisible hit spheres at each finger-bone world position.
 * Uses R3F pointer events for clean hover detection.
 */
export default function HitZones({ handRef, onPointerEnter, onPointerLeave }) {
  const meshesRef = useRef([]);

  // Build zones from current finger data once (ref is stable)
  const zones = useMemo(() => {
    const result = [];
    const count = handRef.current?.getFingerCount?.() ?? 5;

    for (let fi = 0; fi < count; fi++) {
      // We'll use 3 joints per finger; dynamic count from actual bones if possible
      const jointCount = 3;
      for (let ji = 0; ji < jointCount; ji++) {
        result.push({ fingerIndex: fi, jointIndex: ji });
      }
    }
    return result;
  }, [handRef]);

  useFrame(() => {
    const hand = handRef.current;
    if (!hand) return;

    const fingers = hand.getFingers?.() ?? [];
    meshesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const zone = zones[i];
      if (!zone) return;

      const finger = fingers[zone.fingerIndex];
      if (!finger?.bones?.[zone.jointIndex]) return;

      // Update mesh position to follow bone world position
      const bone = finger.bones[zone.jointIndex];
      bone.getWorldPosition(mesh.position);
    });
  });

  return (
    <group>
      {zones.map((zone, i) => (
        <mesh
          key={`${zone.fingerIndex}-${zone.jointIndex}`}
          ref={(el) => (meshesRef.current[i] = el)}
          onPointerEnter={(e) => {
            e.stopPropagation();
            onPointerEnter(zone.fingerIndex);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            onPointerLeave();
          }}
          visible={false}
        >
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial />
        </mesh>
      ))}
    </group>
  );
}
