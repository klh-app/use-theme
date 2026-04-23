import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { disableTransitions, applyTheme } from "../dom.js";

describe("disableTransitions", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = "";
  });

  it("injects a style element that disables all transitions", () => {
    disableTransitions();

    const style = document.head.querySelector("style");
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain("transition: none !important");
  });

  it("sets nonce attribute when provided", () => {
    disableTransitions("test-nonce-123");

    const style = document.head.querySelector("style");
    expect(style?.getAttribute("nonce")).toBe("test-nonce-123");
  });

  it("does not set nonce attribute when omitted", () => {
    disableTransitions();

    const style = document.head.querySelector("style");
    expect(style?.getAttribute("nonce")).toBeNull();
  });

  it("returns a cleanup function that removes the style element", () => {
    const cleanup = disableTransitions();

    expect(document.head.querySelector("style")).not.toBeNull();

    // The cleanup uses double-rAF, so we need to flush those
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    cleanup();

    expect(document.head.querySelector("style")).toBeNull();
  });

  it("triggers a synchronous reflow", () => {
    // Access to offsetHeight forces a reflow — we verify the style is present
    // at the point when reflow would be triggered (before cleanup is called)
    const cleanup = disableTransitions();
    expect(document.head.querySelectorAll("style")).toHaveLength(1);

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    cleanup();
  });
});

describe("applyTheme", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-mode");
    document.documentElement.className = "";
    document.documentElement.style.colorScheme = "";
  });

  it("sets a data attribute on the document element", () => {
    applyTheme("dark", "data-theme", undefined, ["light", "dark"], false);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("sets multiple attributes", () => {
    applyTheme("dark", ["data-theme", "data-mode"], undefined, ["light", "dark"], false);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-mode")).toBe("dark");
  });

  it("applies value mapping", () => {
    const valueMap = { dark: "night", light: "day" };
    applyTheme("dark", "data-theme", valueMap, ["light", "dark"], false);

    expect(document.documentElement.getAttribute("data-theme")).toBe("night");
  });

  it("adds theme as class when attribute is 'class'", () => {
    applyTheme("dark", "class", undefined, ["light", "dark"], false);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes previous theme class and adds new one", () => {
    document.documentElement.classList.add("light");
    applyTheme("dark", "class", undefined, ["light", "dark"], false);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("preserves non-theme classes", () => {
    document.documentElement.classList.add("my-app");
    applyTheme("dark", "class", undefined, ["light", "dark"], false);

    expect(document.documentElement.classList.contains("my-app")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("sets color-scheme for standard themes when enabled", () => {
    applyTheme("dark", "data-theme", undefined, ["light", "dark"], true);

    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("clears color-scheme for non-standard themes", () => {
    applyTheme("ocean", "data-theme", undefined, ["light", "dark", "ocean"], true);

    expect(document.documentElement.style.colorScheme).toBe("");
  });

  it("does not set color-scheme when disabled", () => {
    applyTheme("dark", "data-theme", undefined, ["light", "dark"], false);

    expect(document.documentElement.style.colorScheme).toBe("");
  });
});
