import type { FingerConfig } from "@/types/hand";

export const FINGER_COUNT = 5;

export const FINGERS: FingerConfig[] = [
  {
    name: "Index",
    patterns: ["Bone009_02", "Bone010_03", "Bone011_04", "Bone011_end_017"],
    color: "#4a9eff",
    hitRadii: [0.024, 0.028, 0.03],
    pose: { axis: "x", amounts: [-0.37, -0.13, -0.18] },
  },
  {
    name: "Middle",
    patterns: ["Bone012_05", "Bone013_06", "Bone014_07", "Bone014_end_018"],
    color: "#a78bfa",
    hitRadii: [0.032, 0.034, 0.036],
    pose: { axis: "x", amounts: [-0.37, -0.13, -0.18] },
  },
  {
    name: "Ring",
    patterns: ["Bone015_08", "Bone016_09", "Bone017_010", "Bone017_end_019"],
    color: "#34d399",
    hitRadii: [0.032, 0.034, 0.036],
    pose: { axis: "x", amounts: [-0.37, -0.13, -0.18] },
  },
  {
    name: "Pinky",
    patterns: ["Bone018_011", "Bone019_012", "Bone020_013", "Bone020_end_020"],
    color: "#f472b6",
    hitRadii: [0.028, 0.03, 0.032],
    pose: { axis: "x", amounts: [-0.37, -0.13, -0.18] },
  },
  {
    name: "Thumb",
    patterns: ["Bone003_014", "Bone004_015", "Bone005_016", "Bone005_end_021"],
    color: "#fbbf24",
    hitRadii: [0.03, 0.032, 0.034],
    pose: { axis: "z", amounts: [-0.12, -0.16, -0.3] },
  },
];
