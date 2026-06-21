import { useState, type PropsWithChildren } from "react";
import { AppContext } from "@/context/app-context";
import type { FingerIndex } from "@/types/hand";

export function AppProvider({ children }: PropsWithChildren) {
  const [hoveredFinger, setHoveredFinger] = useState<FingerIndex | null>(null);
  const [showHitZones, setShowHitZones] = useState(false);
  const [signModeActive, setSignModeActive] = useState(false);
  const [currentSign, setCurrentSign] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        hoveredFinger,
        setHoveredFinger,
        showHitZones,
        setShowHitZones,
        signModeActive,
        setSignModeActive,
        currentSign,
        setCurrentSign,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
