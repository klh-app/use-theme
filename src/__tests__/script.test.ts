import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getThemeScript } from "../script.js";
import { createMockLocalStorage, createMockMatchMedia, cleanupDOM } from "./helpers.js";

describe("getThemeScript", () => {
  it("returns a non-empty string", () => {
    const script = getThemeScript();
    expect(script).toBeTruthy();
    expect(typeof script).toBe("string");
  });

  it("is a self-executing function", () => {
    const script = getThemeScript();
    expect(script).toMatch(/^\(function\(\)\{/);
    expect(script).toMatch(/\}\)\(\)$/);
  });

  it("includes the default storage key", () => {
    const script = getThemeScript();
    expect(script).toContain('"theme"');
  });

  it("uses a custom storage key", () => {
    const script = getThemeScript({ storageKey: "my-theme" });
    expect(script).toContain('"my-theme"');
  });

  it("includes the default theme", () => {
    const script = getThemeScript();
    expect(script).toContain('"system"');
  });

  it("uses a custom default theme", () => {
    const script = getThemeScript({ defaultTheme: "dark" });
    expect(script).toContain('"dark"');
  });

  it("includes the default attribute", () => {
    const script = getThemeScript();
    expect(script).toContain('"data-theme"');
  });

  it("uses a custom attribute", () => {
    const script = getThemeScript({ attribute: "class" });
    expect(script).toContain('"class"');
  });

  it("handles array attributes", () => {
    const script = getThemeScript({ attribute: ["data-theme", "class"] });
    expect(script).toContain('"data-theme"');
    expect(script).toContain('"class"');
  });

  it("includes value mapping when provided", () => {
    const script = getThemeScript({
      value: { dark: "theme-dark", light: "theme-light" },
    });
    expect(script).toContain("theme-dark");
    expect(script).toContain("theme-light");
  });

  it("includes media query for system theme detection", () => {
    const script = getThemeScript();
    expect(script).toContain("prefers-color-scheme: dark");
  });

  it("reads from localStorage", () => {
    const script = getThemeScript();
    expect(script).toContain("localStorage.getItem");
  });

  it("sets attribute on document.documentElement", () => {
    const script = getThemeScript();
    expect(script).toContain("document.documentElement");
  });

  // --- Script evaluation tests ---

  describe("evaluated output", () => {
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

    it("sets data-theme from stored value", () => {
      mockStorage["theme"] = "dark";
      const script = getThemeScript();

      // eslint-disable-next-line no-eval
      eval(script);

      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it("falls back to defaultTheme when nothing is stored", () => {
      const script = getThemeScript({ defaultTheme: "light" });

      eval(script);

      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("resolves system theme to dark when OS prefers dark", () => {
      createMockMatchMedia(true);

      const script = getThemeScript({ defaultTheme: "system" });

      eval(script);

      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it("resolves system theme to light when OS prefers light", () => {
      createMockMatchMedia(false);

      const script = getThemeScript({ defaultTheme: "system" });

      eval(script);

      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("applies value mapping", () => {
      mockStorage["theme"] = "dark";
      const script = getThemeScript({
        value: { dark: "theme-dark", light: "theme-light" },
      });

      eval(script);

      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "theme-dark",
      );
    });

    it("sets class attribute instead of data attribute", () => {
      mockStorage["theme"] = "dark";
      const script = getThemeScript({ attribute: "class" });

      eval(script);

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("sets multiple attributes", () => {
      mockStorage["theme"] = "dark";
      const script = getThemeScript({
        attribute: ["data-theme", "data-mode"],
      });

      eval(script);

      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(document.documentElement.getAttribute("data-mode")).toBe("dark");
    });

    it("does not throw when localStorage is unavailable", () => {
      vi.stubGlobal("localStorage", {
        getItem: vi.fn(() => {
          throw new Error("SecurityError");
        }),
      });
      const script = getThemeScript();

      expect(() => eval(script)).not.toThrow();
    });

    it("does not resolve system when enableSystem is false", () => {
      const script = getThemeScript({
        defaultTheme: "system",
        enableSystem: false,
      });

      eval(script);

      // Should set the literal string "system" rather than resolving
      expect(document.documentElement.getAttribute("data-theme")).toBe("system");
    });
  });
});
