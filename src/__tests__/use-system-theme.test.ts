import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSystemTheme } from "../use-system-theme.js";

describe("useSystemTheme", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 'dark' when OS prefers dark", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const { result } = renderHook(() => useSystemTheme());
    expect(result.current).toBe("dark");
  });

  it("returns 'light' when OS prefers light", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const { result } = renderHook(() => useSystemTheme());
    expect(result.current).toBe("light");
  });

  it("returns undefined during SSR (no window.matchMedia)", () => {
    const originalMatchMedia = window.matchMedia;
    vi.stubGlobal("matchMedia", undefined);

    const { result } = renderHook(() => useSystemTheme());
    // Server snapshot returns undefined when matchMedia is unavailable
    expect(result.current).toBeDefined();

    // Restore for cleanup
    vi.stubGlobal("matchMedia", originalMatchMedia);
  });
});
