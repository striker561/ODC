import type { Dispatch, SetStateAction } from "react";
import type { FingerIndex } from "./hand";

export interface AppContextValue {
  hoveredFinger: FingerIndex | null;
  setHoveredFinger: (finger: FingerIndex | null) => void;
  showHitZones: boolean;
  setShowHitZones: Dispatch<SetStateAction<boolean>>;
  signModeActive: boolean;
  setSignModeActive: Dispatch<SetStateAction<boolean>>;
  currentSign: string | null;
  setCurrentSign: (sign: string | null) => void;
}
