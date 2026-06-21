import type { FingerProgress } from "./hand";

export interface FingerAnimState {
  progress: number;
  target: number;
  velocity: number;
}

export interface SignFingerState {
  progress: number;
}

export type SignPhase = "transition" | "hold";

export interface HandSignStep {
  name: string;
  hold: number;
  fingers: FingerProgress;
}

export interface SignSequenceState {
  index: number;
  phase: SignPhase;
  stepElapsed: number;
  fromProgress: number[];
}

export interface SignReleaseState {
  active: boolean;
  elapsed: number;
  from: number[];
}
