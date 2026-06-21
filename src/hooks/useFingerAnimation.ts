import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { FINGER_COUNT } from "@/constants/fingers";
import type { FingerAnimState } from "@/types/animation";
import type { FingerIndex } from "@/types/hand";

/**
 * Spring-physics finger animation hook.
 * Returns live finger state that can be consumed each frame.
 */
export function useFingerAnimation(hoveredFinger: FingerIndex | null) {
  const stateRef = useRef<FingerAnimState[]>(
    Array.from({ length: FINGER_COUNT }, () => ({
      progress: 0,
      target: 0,
      velocity: 0,
    })),
  );

  const hoverRef = useRef(hoveredFinger);

  useEffect(() => {
    hoverRef.current = hoveredFinger;
  }, [hoveredFinger]);

  useFrame((_, delta) => {
    const states = stateRef.current;
    const hover = hoverRef.current;

    for (let i = 0; i < states.length; i++) {
      const s = states[i];
      s.target = i === hover ? 1 : 0;

      const stiffness = 12;
      const damping = 0.75;
      const force = (s.target - s.progress) * stiffness;
      s.velocity = s.velocity * damping + force * delta;
      s.progress = Math.max(
        0,
        Math.min(1, s.progress + s.velocity * delta * 6),
      );
    }
  });

  return stateRef;
}
