import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [hoveredFinger, setHoveredFinger] = useState(null);
  const [showHitZones, setShowHitZones] = useState(false);

  return (
    <AppContext.Provider
      value={{
        hoveredFinger,
        setHoveredFinger,
        showHitZones,
        setShowHitZones,
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
