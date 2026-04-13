import { useContext } from "react";
import { ThemeContext } from "./context.js";
import type { UseThemeReturn } from "./types.js";

/**
 * Hook to access and control the current theme.
 * Must be used within a ThemeProvider.
 *
 * @returns UseThemeReturn — theme, resolvedTheme, setTheme, systemTheme, themes
 */
export function useTheme<T extends string = "light" | "dark" | "system">(): UseThemeReturn<T> {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return {
    theme: context.theme,
    resolvedTheme: context.resolvedTheme,
    setTheme: context.setTheme,
    systemTheme: context.systemTheme,
    themes: context.themes,
  };
}
