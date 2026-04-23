import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLocalStorageAdapter } from "../storage.js";
import { createMockLocalStorage } from "./helpers.js";

describe("createLocalStorageAdapter", () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("get()", () => {
    it("returns null when no value is stored", () => {
      const adapter = createLocalStorageAdapter("theme");
      expect(adapter.get()).toBeNull();
    });

    it("returns the stored value", () => {
      mockStorage.theme = "dark";
      const adapter = createLocalStorageAdapter("theme");
      expect(adapter.get()).toBe("dark");
    });

    it("uses the correct key", () => {
      mockStorage["custom-key"] = "light";
      const adapter = createLocalStorageAdapter("custom-key");
      expect(adapter.get()).toBe("light");
      expect(localStorage.getItem).toHaveBeenCalledWith("custom-key");
    });

    it("returns null when localStorage throws", () => {
      vi.stubGlobal("localStorage", {
        getItem: vi.fn(() => {
          throw new Error("SecurityError");
        }),
      });
      const adapter = createLocalStorageAdapter("theme");
      expect(adapter.get()).toBeNull();
    });
  });

  describe("set()", () => {
    it("stores a value", () => {
      const adapter = createLocalStorageAdapter("theme");
      adapter.set("dark");
      expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
    });

    it("does not throw when localStorage throws", () => {
      vi.stubGlobal("localStorage", {
        getItem: vi.fn(),
        setItem: vi.fn(() => {
          throw new Error("QuotaExceeded");
        }),
      });
      const adapter = createLocalStorageAdapter("theme");
      expect(() => adapter.set("dark")).not.toThrow();
    });

    it("notifies same-tab subscribers on set()", () => {
      const adapter = createLocalStorageAdapter("theme");
      const callback = vi.fn();

      adapter.subscribe(callback);
      adapter.set("dark");

      expect(callback).toHaveBeenCalledOnce();
    });

    it("notifies multiple same-tab subscribers on set()", () => {
      const adapter = createLocalStorageAdapter("theme");
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      adapter.subscribe(cb1);
      adapter.subscribe(cb2);
      adapter.set("dark");

      expect(cb1).toHaveBeenCalledOnce();
      expect(cb2).toHaveBeenCalledOnce();
    });

    it("does not notify unsubscribed same-tab listeners on set()", () => {
      const adapter = createLocalStorageAdapter("theme");
      const callback = vi.fn();

      const unsub = adapter.subscribe(callback);
      unsub();
      adapter.set("dark");

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("subscribe()", () => {
    it("calls callback when a storage event fires for the matching key", () => {
      const adapter = createLocalStorageAdapter("theme");
      const callback = vi.fn();

      adapter.subscribe(callback);

      window.dispatchEvent(new StorageEvent("storage", { key: "theme" }));

      expect(callback).toHaveBeenCalledOnce();
    });

    it("ignores storage events for different keys", () => {
      const adapter = createLocalStorageAdapter("theme");
      const callback = vi.fn();

      adapter.subscribe(callback);

      window.dispatchEvent(new StorageEvent("storage", { key: "other-key" }));

      expect(callback).not.toHaveBeenCalled();
    });

    it("returns an unsubscribe function", () => {
      const adapter = createLocalStorageAdapter("theme");
      const callback = vi.fn();

      const unsubscribe = adapter.subscribe(callback);
      unsubscribe();

      window.dispatchEvent(new StorageEvent("storage", { key: "theme" }));

      expect(callback).not.toHaveBeenCalled();
    });

    it("supports multiple subscribers", () => {
      const adapter = createLocalStorageAdapter("theme");
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      adapter.subscribe(cb1);
      adapter.subscribe(cb2);

      window.dispatchEvent(new StorageEvent("storage", { key: "theme" }));

      expect(cb1).toHaveBeenCalledOnce();
      expect(cb2).toHaveBeenCalledOnce();
    });
  });
});
