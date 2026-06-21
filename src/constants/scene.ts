/** Target hand size in world units — smaller reads cleaner on screen. */
export const HAND_DISPLAY_SCALE = 0.26;

export const CAMERA_CONFIG = {
  fov: 38,
  position: [0, 0.05, 0.58] as [number, number, number],
  near: 0.01,
  far: 100,
} as const;

export const ORBIT_CONFIG = {
  target: [0, 0.015, 0] as [number, number, number],
  minPolarAngle: Math.PI * 0.24,
  maxPolarAngle: Math.PI * 0.46,
  dampingFactor: 0.06,
} as const;
