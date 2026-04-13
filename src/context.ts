import { createContext } from "react";
import type { ThemeContextValue } from "./types.js";

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);
