import type { FingerIndex } from "@/types/hand";

export function isFingerIndex(value: number): value is FingerIndex {
  return value >= 0 && value <= 4;
}

export function toFingerIndex(value: number): FingerIndex | null {
  return isFingerIndex(value) ? value : null;
}
