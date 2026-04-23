import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { ThemeProvider } from "../provider.js";
import { useTheme } from "../use-theme.js";
import { createMockLocalStorage, createMockMatchMedia, cleanupDOM } from "./helpers.js";

function createWrapper(props: Record<string, unknown> = {}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(ThemeProvider, { ...props, children });
  };
}

describe("useTheme", () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    createMockMatchMedia();
    cleanupDOM();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanupDOM();
  });

  it("throws when used outside ThemeProvider", () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme must be used within a ThemeProvider");
  });

  it("returns default theme as 'system'", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    });

    expect(result.current.theme).toBe("system");
  });

  it("resolves system theme to light when OS prefers light", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    });

    // matchMedia mock returns false for dark, so system resolves to light
    expect(result.current.resolvedTheme).toBe("light");
  });

  it("resolves system theme to dark when OS prefers dark", () => {
    createMockMatchMedia(true);

    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    });

    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("uses a custom default theme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper({ defaultTheme: "dark" }),
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("includes system in themes list when enableSystem is true", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    });

    expect(result.current.themes).toContain("system");
    expect(result.current.themes).toContain("light");
    expect(result.current.themes).toContain("dark");
  });

  it("excludes system from themes list when enableSystem is false", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper({ enableSystem: false }),
    });

    expect(result.current.themes).not.toContain("system");
  });

  it("switches theme via setTheme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("supports updater function in setTheme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper({ defaultTheme: "light" }),
    });

    act(() => {
      result.current.setTheme((prev) => (prev === "light" ? "dark" : "light"));
    });

    expect(result.current.theme).toBe("dark");
  });

  it("persists theme to storage", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
  });

  it("reads persisted theme from storage on mount", () => {
    mockStorage.theme = "dark";

    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("applies theme attribute to document", () => {
    renderHook(() => useTheme(), {
      wrapper: createWrapper({ defaultTheme: "dark" }),
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("uses custom attribute", () => {
    renderHook(() => useTheme(), {
      wrapper: createWrapper({ defaultTheme: "dark", attribute: "data-mode" }),
    });

    expect(document.documentElement.getAttribute("data-mode")).toBe("dark");
  });

  it("uses value mapping", () => {
    renderHook(() => useTheme(), {
      wrapper: createWrapper({
        defaultTheme: "dark",
        value: { dark: "theme-dark", light: "theme-light" },
      }),
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("theme-dark");
  });

  it("returns systemTheme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    });

    expect(result.current.systemTheme).toBeDefined();
    expect(["light", "dark"]).toContain(result.current.systemTheme);
  });

  it("uses custom storageKey", () => {
    mockStorage["my-theme"] = "dark";

    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper({ storageKey: "my-theme" }),
    });

    expect(result.current.theme).toBe("dark");
  });

  describe("class attribute mode", () => {
    it("adds theme as a class on <html>", () => {
      renderHook(() => useTheme(), {
        wrapper: createWrapper({ defaultTheme: "dark", attribute: "class" }),
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("only removes theme classes, preserving other classes", () => {
      // Add a non-theme class that should survive theme changes
      document.documentElement.classList.add("custom-app-class");

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper({ defaultTheme: "light", attribute: "class" }),
      });

      // Should have both the theme class and the custom class
      expect(document.documentElement.classList.contains("light")).toBe(true);
      expect(document.documentElement.classList.contains("custom-app-class")).toBe(true);

      // Switch theme
      act(() => {
        result.current.setTheme("dark");
      });

      // Old theme class removed, new one added, custom class preserved
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.classList.contains("light")).toBe(false);
      expect(document.documentElement.classList.contains("custom-app-class")).toBe(true);
    });

    it("handles class attribute with value mapping", () => {
      renderHook(() => useTheme(), {
        wrapper: createWrapper({
          defaultTheme: "dark",
          attribute: "class",
          value: { dark: "theme-dark", light: "theme-light" },
        }),
      });

      expect(document.documentElement.classList.contains("theme-dark")).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });
});
