/**
 * One-handed Naruto-style sign sequence (Minato / Flying Raijin inspired).
 * Each finger value is curl progress: 0 = extended, 1 = fully curled.
 * Order: Index, Middle, Ring, Pinky, Thumb
 */
import type { HandSignStep } from "@/types/animation";

export const MINATO_SIGN_SEQUENCE: HandSignStep[] = [
  {
    name: "Open Palm",
    hold: 1.0,
    fingers: [0, 0, 0, 0, 0],
  },
  {
    name: "Rat",
    hold: 1.4,
    fingers: [0, 0, 1, 1, 0.9],
  },
  {
    name: "Tiger",
    hold: 1.2,
    fingers: [0, 0, 0, 0, 1],
  },
  {
    name: "Boar",
    hold: 1.0,
    fingers: [1, 1, 1, 1, 0.95],
  },
  {
    name: "Release",
    hold: 1.0,
    fingers: [0, 0, 0, 0, 0],
  },
];

export const SIGN_TRANSITION_SEC = 0.18;
