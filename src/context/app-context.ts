import { createContext } from "react";
import type { AppContextValue } from "@/types/app";

export const AppContext = createContext<AppContextValue | null>(null);
