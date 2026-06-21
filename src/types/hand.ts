import type { Bone, Group, SkinnedMesh, Vector3 } from "three";

export type RotationAxis = "x" | "y" | "z";

export type FingerIndex = 0 | 1 | 2 | 3 | 4;

export type FingerProgress = [number, number, number, number, number];

export interface BoneRotation {
  x: number;
  y: number;
  z: number;
}

export interface FingerPose {
  axis: RotationAxis;
  amounts: number[];
}

export interface FingerConfig {
  name: string;
  patterns: string[];
  color: string;
  hitRadii: number[];
  pose: FingerPose;
}

export interface ResolvedFinger extends FingerConfig {
  bones: Bone[];
}

export interface HandData {
  bones: Record<string, Bone>;
  originalRotations: Record<string, BoneRotation>;
  fingers: ResolvedFinger[];
  skinnedMesh: SkinnedMesh | null;
  boneIndexToFinger: number[] | null;
}

export interface ApplyFingerPoseOptions {
  skipEmissive?: boolean;
}

export interface HandModelApi {
  getFingers: () => ResolvedFinger[];
  getBones: () => Record<string, Bone>;
  getFingerCount: () => number;
  getHandGroup: () => Group | null;
  pickFingerAtPoint: (point: Vector3) => FingerIndex | null;
  updateMatrices: () => void;
  applyFingerPose: (
    fingerIndex: FingerIndex,
    progress: number,
    opts?: ApplyFingerPoseOptions,
  ) => void;
}
