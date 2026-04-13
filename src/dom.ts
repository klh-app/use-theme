const disableTransitionStyle =
  "*, *::before, *::after { transition: none !important; }";

export function disableTransitions(nonce?: string): () => void {
  if (typeof document === "undefined") return () => {};

  const style = document.createElement("style");
  if (nonce) style.setAttribute("nonce", nonce);
  style.appendChild(document.createTextNode(disableTransitionStyle));
  document.head.appendChild(style);

  // Force a synchronous layout calculation (reflow) so the disabled transitions take effect immediately.
  void document.documentElement.offsetHeight;

  return () => {
    // Re-enable transitions after a double-rAF so the browser has
    // painted with the new theme before transitions come back.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.head.removeChild(style);
      });
    });
  };
}

export function applyTheme(
  resolved: string,
  attribute: string | string[],
  valueMap: Record<string, string> | undefined,
  themes: string[],
  enableColorScheme: boolean,
) {
  if (typeof document === "undefined") return;

  const d = document.documentElement;
  const attrs = Array.isArray(attribute) ? attribute : [attribute];
  const mapped = valueMap?.[resolved] ?? resolved;

  for (const attr of attrs) {
    if (attr === "class") {
      // Only remove classes that correspond to known themes,
      // leaving all other classes on <html> untouched.
      const themeClasses = themes.map((t) => valueMap?.[t] ?? t);
      for (const cls of themeClasses) {
        if (cls) d.classList.remove(cls);
      }
      d.classList.add(mapped);
    } else {
      d.setAttribute(attr, mapped);
    }
  }

  if (enableColorScheme) {
    const isStandard = ["light", "dark"].includes(resolved);
    d.style.colorScheme = isStandard ? resolved : "";
  }
}
