import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [hoveredFinger, setHoveredFinger] = useState(null);
  const [showHitZones, setShowHitZones] = useState(false);
  const [signModeActive, setSignModeActive] = useState(false);
  const [currentSign, setCurrentSign] = useState(null);

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

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
