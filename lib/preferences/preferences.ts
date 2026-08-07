import type {
  ContentDensity,
  ResolvedAppearance,
} from "@/lib/domain/types";

export const DENSITY_STORAGE_KEY = "expense-ai-density";
export const DENSITY_COOKIE_NAME = "expense-ai-density";
export const PREFERENCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const CONTENT_DENSITIES = [
  "comfortable",
  "compact",
] as const satisfies readonly ContentDensity[];

/**
 * Density is a geometry-only presentation preference. Compact mode may reduce
 * gaps, padding, and passive row height; it must not change text sizes,
 * content, actions, statuses, or the 44px minimum for frequent controls.
 */
export const DENSITY_RULES = Object.freeze({
  geometryOnly: true,
  preservedSemantics: ["content", "labels", "actions", "statuses"] as const,
  minimumFrequentControlTargetPx: 44,
});

export function isContentDensity(value: unknown): value is ContentDensity {
  return CONTENT_DENSITIES.includes(value as ContentDensity);
}

export function readPreferenceCookie(
  cookieHeader: string,
  name: string,
): string | null {
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

export function serializePreferenceCookie(
  name: string,
  value: string,
): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${PREFERENCE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export const THEME_COLORS: Readonly<Record<ResolvedAppearance, string>> = {
  dark: "#000000",
};

// Runs in <head> before visible content. It deliberately has no dependencies so
// storage/cookie failures still resolve to a safe density. Appearance is
// always dark and never resolved client-side.
export const PREFERENCES_BOOTSTRAP_SCRIPT = String.raw`(function(){
  var root=document.documentElement;
  var validDensity=function(value){return value==='comfortable'||value==='compact'};
  var cookie=function(name){try{var parts=document.cookie.split(';');for(var index=0;index<parts.length;index++){var part=parts[index].trim();if(part.slice(0,name.length+1)===name+'=')return decodeURIComponent(part.slice(name.length+1))}return null}catch(error){return null}};
  var stored=function(key){try{return localStorage.getItem(key)}catch(error){return null}};
  var mirror=function(key,value){try{if(stored(key)!==value)localStorage.setItem(key,value)}catch(error){}};
  root.classList.remove('light');root.classList.add('dark');
  root.setAttribute('data-theme','dark');root.setAttribute('data-appearance-preference','dark');
  root.style.colorScheme='dark';
  var densityCookie=cookie('${DENSITY_COOKIE_NAME}');
  var densityStored=stored('${DENSITY_STORAGE_KEY}');
  /* Density follows the same cookie-first contract for SSR-stable geometry. */
  var density=validDensity(densityCookie)?densityCookie:(validDensity(densityStored)?densityStored:'comfortable');
  mirror('${DENSITY_STORAGE_KEY}',density);
  root.setAttribute('data-density',density);
  var meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content','${THEME_COLORS.dark}');
})();`;
