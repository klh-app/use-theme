import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ThemeContextValue, ThemeProviderProps } from "./types.js";
import { DEFAULT_ATTRIBUTE, DEFAULT_THEMES, STORAGE_KEY, SYSTEM_THEME } from "./constants.js";
import { ThemeContext } from "./context.js";
import { applyTheme, disableTransitions } from "./dom.js";
import { createLocalStorageAdapter } from "./storage.js";
import { useSystemTheme } from "./use-system-theme.js";

export function ThemeProvider({
  children,
  defaultTheme = SYSTEM_THEME,
  themes = DEFAULT_THEMES,
  storageKey = STORAGE_KEY,
  storage: storageProp,
  attribute = DEFAULT_ATTRIBUTE,
  value,
  enableSystem = true,
  enableColorScheme = true,
  disableTransitionOnChange = false,
  nonce,
}: ThemeProviderProps) {
  // Create or reuse storage adapter
  const storage = useMemo(
    () => storageProp ?? createLocalStorageAdapter(storageKey),
    [storageProp, storageKey],
  );

  const getSnapshot = useCallback(() => storage.get() ?? defaultTheme, [storage, defaultTheme]);

  const getServerSnapshot = useCallback(() => defaultTheme, [defaultTheme]);

  const theme = useSyncExternalStore(storage.subscribe, getSnapshot, getServerSnapshot);

  const systemTheme = useSystemTheme();

  // Resolve theme: if 'system' and enableSystem, use OS preference
  const resolvedTheme = useMemo(() => {
    if (theme === SYSTEM_THEME && enableSystem) {
      return systemTheme ?? "light";
    }
    return theme;
  }, [theme, enableSystem, systemTheme]);

  // Expose themes list: include 'system' if enableSystem
  const allThemes = useMemo(() => {
    if (enableSystem && !themes.includes(SYSTEM_THEME)) {
      return [...themes, SYSTEM_THEME];
    }
    return themes;
  }, [themes, enableSystem]);

  const setTheme = useCallback(
    (themeOrUpdater: string | ((prev: string) => string)) => {
      const newTheme =
        typeof themeOrUpdater === "function"
          ? themeOrUpdater(storage.get() ?? defaultTheme)
          : themeOrUpdater;
      // storage.set() notifies subscribers directly (same-tab)
      // and StorageEvent handles cross-tab sync
      storage.set(newTheme);
    },
    [storage, defaultTheme],
  );

  // Apply theme to DOM
  useEffect(() => {
    const restore = disableTransitionOnChange ? disableTransitions(nonce) : undefined;

    applyTheme(resolvedTheme, attribute, value, allThemes, enableColorScheme);

    // Re-enable transitions immediately after applying.
    // The double-rAF inside restore() ensures the browser has painted
    // with the new theme before transitions come back.
    restore?.();
  }, [
    resolvedTheme,
    attribute,
    value,
    disableTransitionOnChange,
    nonce,
    allThemes,
    enableColorScheme,
  ]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      systemTheme,
      themes: allThemes,
      storage,
      enableSystem,
      enableColorScheme,
      defaultTheme,
      attribute,
      value,
      disableTransitionOnChange,
      nonce,
    }),
    [
      theme,
      resolvedTheme,
      setTheme,
      systemTheme,
      allThemes,
      storage,
      enableSystem,
      enableColorScheme,
      defaultTheme,
      attribute,
      value,
      disableTransitionOnChange,
      nonce,
    ],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
