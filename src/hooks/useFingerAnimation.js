import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Spring-physics finger animation hook.
 * Returns live finger state that can be consumed each frame.
 */
export function useFingerAnimation(hoveredFinger) {
  // Mutable state updated each frame — no React re-renders
  const stateRef = useRef(
    Array.from({ length: 5 }, () => ({
      progress: 0,
      target: 0,
      velocity: 0,
    }))
  );

  // We keep the latest hoveredFinger in a ref so useFrame always has it
  const hoverRef = useRef(hoveredFinger);
  hoverRef.current = hoveredFinger;

  useFrame((_, delta) => {
    const states = stateRef.current;
    const hover = hoverRef.current;

    for (let i = 0; i < states.length; i++) {
      const s = states[i];
      s.target = i === hover ? 1 : 0;

      // Spring physics
      const stiffness = 12;
      const damping = 0.75;
      const force = (s.target - s.progress) * stiffness;
      s.velocity = s.velocity * damping + force * delta;
      s.progress = Math.max(0, Math.min(1, s.progress + s.velocity * delta * 6));
    }
  });

  return stateRef;
}
