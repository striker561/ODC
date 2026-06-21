import { useContext } from "react";
import { AppContext } from "@/context/app-context";
import type { AppContextValue } from "@/types/app";

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
}
