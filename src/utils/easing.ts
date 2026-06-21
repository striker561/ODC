/** Smooth deceleration — good for settling into a pose. */
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Smooth acceleration — good for gently resuming idle motion. */
export function easeInCubic(t: number): number {
  return t ** 3;
}
