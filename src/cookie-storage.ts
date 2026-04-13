import type { ThemeStorage } from "./types.js";

export interface CookieStorageOptions {
  /** Cookie name. @default 'theme' */
  key?: string;
  /** Cookie path. @default '/' */
  path?: string;
  /** Max-age in seconds. @default 31536000 (1 year) */
  maxAge?: number;
  /** SameSite attribute. @default 'Lax' */
  sameSite?: "Strict" | "Lax" | "None";
  /** Secure flag — required when sameSite is 'None'. @default false */
  secure?: boolean;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Creates a ThemeStorage adapter backed by cookies.
 * SSR-safe: get() returns null on the server, set() is a no-op.
 *
 * Useful when the server needs to read the theme (e.g. Next.js App Router)
 * to render the correct theme on the first response without a FOUC script.
 *
 * Cross-tab sync uses BroadcastChannel where available.
 */
export function createCookieStorageAdapter(
  options: CookieStorageOptions = {},
): ThemeStorage {
  const {
    key = "theme",
    path = "/",
    maxAge = 31536000,
    sameSite = "Lax",
    secure = false,
  } = options;

  const listeners = new Set<() => void>();
  const channelName = `use-theme:${key}`;
  let channel: BroadcastChannel | null = null;

  function emit() {
    for (const listener of listeners) {
      listener();
    }
  }

  function getChannel(): BroadcastChannel | null {
    if (channel) return channel;
    if (typeof BroadcastChannel === "undefined") return null;
    channel = new BroadcastChannel(channelName);
    return channel;
  }

  return {
    get() {
      return getCookie(key);
    },

    set(theme: string) {
      if (typeof document === "undefined") return;

      const parts = [
        `${encodeURIComponent(key)}=${encodeURIComponent(theme)}`,
        `path=${path}`,
        `max-age=${maxAge}`,
        `SameSite=${sameSite}`,
      ];
      if (secure) parts.push("Secure");

      document.cookie = parts.join(";");

      emit();
      getChannel()?.postMessage(theme);
    },

    subscribe(callback: () => void): () => void {
      if (typeof window === "undefined") return () => {};

      listeners.add(callback);

      // Cross-tab sync via BroadcastChannel
      const bc = getChannel();
      const handler = () => callback();
      bc?.addEventListener("message", handler);

      return () => {
        listeners.delete(callback);
        bc?.removeEventListener("message", handler);
        if (listeners.size === 0 && channel) {
          channel.close();
          channel = null;
        }
      };
    },
  };
}
