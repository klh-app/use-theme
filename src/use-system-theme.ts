import { useSyncExternalStore } from "react";
import { MEDIA_QUERY } from "./constants.js";

function getMediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia(MEDIA_QUERY);
}

function subscribeToSystemTheme(callback: () => void): () => void {
  const mql = getMediaQuery();
  if (!mql) return () => {};

  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSystemThemeSnapshot(): "light" | "dark" {
  return getMediaQuery()?.matches ? "dark" : "light";
}

function getServerSnapshot(): undefined {
  return undefined;
}

/**
 * Hook to detect the user's OS color scheme preference.
 * Uses useSyncExternalStore to subscribe to matchMedia changes.
 *
 * @returns 'dark' | 'light' | undefined (undefined on server)
 */
export function useSystemTheme(): "light" | "dark" | undefined {
  return useSyncExternalStore(subscribeToSystemTheme, getSystemThemeSnapshot, getServerSnapshot);
}
