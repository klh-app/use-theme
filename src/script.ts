import { createElement, type ReactElement } from "react";
import { DEFAULT_ATTRIBUTE, MEDIA_QUERY, STORAGE_KEY, SYSTEM_THEME } from "./constants.js";

export interface ThemeScriptProps {
  storageKey?: string;
  defaultTheme?: string;
  attribute?: string | string[];
  value?: Record<string, string>;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  nonce?: string;
}

/**
 * Returns a self-executing JS string that prevents FOUC by
 * reading the theme from localStorage and applying it to <html>
 * before paint.
 */
export function getThemeScript(props?: ThemeScriptProps): string {
  const {
    storageKey = STORAGE_KEY,
    defaultTheme = SYSTEM_THEME,
    attribute = DEFAULT_ATTRIBUTE,
    value,
    enableSystem = true,
    enableColorScheme = true,
  } = props ?? {};

  const attributes = Array.isArray(attribute) ? attribute : [attribute];

  // Safe stringify to prevent XSS via premature script tag closure
  const safeJsonStringify = (val: unknown) => JSON.stringify(val).replace(/</g, "\\u003c");

  const valueMap = value ? safeJsonStringify(value) : "undefined";

  // Build the inline script as a string
  return `(function(){try{var d=document.documentElement;var k=${safeJsonStringify(storageKey)};var df=${safeJsonStringify(defaultTheme)};var attrs=${safeJsonStringify(attributes)};var vm=${valueMap};var es=${JSON.stringify(enableSystem)};var ecs=${JSON.stringify(enableColorScheme)};var t=localStorage.getItem(k)||df;if(t==='system'&&es){t=window.matchMedia(${JSON.stringify(MEDIA_QUERY)}).matches?'dark':'light';}var v=vm&&vm[t]?vm[t]:t;attrs.forEach(function(a){if(a==='class'){d.classList.add(v);}else{d.setAttribute(a,v);}});if(ecs){d.style.colorScheme=(t==='light'||t==='dark')?t:'';}}catch(e){}})()`;
}

/**
 * React component that renders a <script> tag with the FOUC prevention
 * script using dangerouslySetInnerHTML.
 */
export function ThemeScript(props: ThemeScriptProps): ReactElement {
  const { nonce, ...scriptProps } = props;

  return createElement("script", {
    nonce,
    dangerouslySetInnerHTML: {
      __html: getThemeScript(scriptProps),
    },
  });
}
