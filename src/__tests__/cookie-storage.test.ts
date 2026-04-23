import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createCookieStorageAdapter } from "../cookie-storage.js";

describe("createCookieStorageAdapter", () => {
  let cookieJar: string;

  beforeEach(() => {
    cookieJar = "";
    Object.defineProperty(document, "cookie", {
      get: vi.fn(() => cookieJar),
      set: vi.fn((value: string) => {
        // Simple cookie jar: parse name=value and store/replace
        const name = value.split("=")[0];
        const parts = cookieJar.split("; ").filter((c) => c && !c.startsWith(`${name}=`));
        parts.push(value.split(";")[0]);
        cookieJar = parts.join("; ");
      }),
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("get()", () => {
    it("returns null when no cookie is set", () => {
      const adapter = createCookieStorageAdapter();
      expect(adapter.get()).toBeNull();
    });

    it("returns the stored value", () => {
      cookieJar = "theme=dark";
      const adapter = createCookieStorageAdapter();
      expect(adapter.get()).toBe("dark");
    });

    it("uses a custom key", () => {
      cookieJar = "my-theme=ocean";
      const adapter = createCookieStorageAdapter({ key: "my-theme" });
      expect(adapter.get()).toBe("ocean");
    });

    it("handles multiple cookies", () => {
      cookieJar = "other=value; theme=dark; another=test";
      const adapter = createCookieStorageAdapter();
      expect(adapter.get()).toBe("dark");
    });

    it("handles encoded values", () => {
      cookieJar = "theme=dark%20mode";
      const adapter = createCookieStorageAdapter();
      expect(adapter.get()).toBe("dark mode");
    });
  });

  describe("set()", () => {
    it("writes a cookie", () => {
      const adapter = createCookieStorageAdapter();
      adapter.set("dark");
      expect(cookieJar).toContain("theme=dark");
    });

    it("includes path", () => {
      const setter = vi.fn();
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: setter,
        configurable: true,
      });

      const adapter = createCookieStorageAdapter({ path: "/app" });
      adapter.set("dark");

      expect(setter).toHaveBeenCalledWith(expect.stringContaining("path=/app"));
    });

    it("includes max-age", () => {
      const setter = vi.fn();
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: setter,
        configurable: true,
      });

      const adapter = createCookieStorageAdapter({ maxAge: 3600 });
      adapter.set("dark");

      expect(setter).toHaveBeenCalledWith(expect.stringContaining("max-age=3600"));
    });

    it("includes SameSite", () => {
      const setter = vi.fn();
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: setter,
        configurable: true,
      });

      const adapter = createCookieStorageAdapter({ sameSite: "Strict" });
      adapter.set("dark");

      expect(setter).toHaveBeenCalledWith(expect.stringContaining("SameSite=Strict"));
    });

    it("includes Secure flag when enabled", () => {
      const setter = vi.fn();
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: setter,
        configurable: true,
      });

      const adapter = createCookieStorageAdapter({ secure: true });
      adapter.set("dark");

      expect(setter).toHaveBeenCalledWith(expect.stringContaining("Secure"));
    });

    it("notifies same-tab subscribers", () => {
      const adapter = createCookieStorageAdapter();
      const callback = vi.fn();

      adapter.subscribe(callback);
      adapter.set("dark");

      expect(callback).toHaveBeenCalledOnce();
    });

    it("notifies multiple subscribers", () => {
      const adapter = createCookieStorageAdapter();
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      adapter.subscribe(cb1);
      adapter.subscribe(cb2);
      adapter.set("dark");

      expect(cb1).toHaveBeenCalledOnce();
      expect(cb2).toHaveBeenCalledOnce();
    });
  });

  describe("subscribe()", () => {
    it("returns an unsubscribe function", () => {
      const adapter = createCookieStorageAdapter();
      const callback = vi.fn();

      const unsub = adapter.subscribe(callback);
      unsub();
      adapter.set("dark");

      expect(callback).not.toHaveBeenCalled();
    });

    it("does not notify after unsubscribe", () => {
      const adapter = createCookieStorageAdapter();
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      adapter.subscribe(cb1);
      const unsub2 = adapter.subscribe(cb2);
      unsub2();
      adapter.set("dark");

      expect(cb1).toHaveBeenCalledOnce();
      expect(cb2).not.toHaveBeenCalled();
    });
  });
});
