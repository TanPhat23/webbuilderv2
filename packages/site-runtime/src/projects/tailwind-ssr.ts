import fs from "node:fs";
import { createRequire } from "node:module";
import {
  collectClasses,
  createTailwindBuilder,
  type TailwindBuilder,
} from "./tailwind-jit";

const MAX_CACHE_ENTRIES = 256;

let builderPromise: Promise<TailwindBuilder> | null = null;
const cssCache = new Map<string, string>();

function loadTailwindSources(): { readonly theme: string; readonly utilities: string } {
  const req = createRequire(import.meta.url);
  const themePath = req.resolve("tailwindcss/theme.css");
  const utilitiesPath = req.resolve("tailwindcss/utilities.css");
  return {
    theme: fs.readFileSync(themePath, "utf8"),
    utilities: fs.readFileSync(utilitiesPath, "utf8"),
  };
}

function getServerTailwindBuilder(): Promise<TailwindBuilder> {
  builderPromise ??= Promise.resolve()
    .then(() => loadTailwindSources())
    .then((sources) => createTailwindBuilder(sources))
    .catch((err: unknown) => {
      builderPromise = null;
      throw err;
    });
  return builderPromise;
}

function readFromLru(key: string): string | undefined {
  const hit = cssCache.get(key);
  if (hit === undefined) return undefined;
  cssCache.delete(key);
  cssCache.set(key, hit);
  return hit;
}

function writeToLru(key: string, value: string): void {
  if (cssCache.has(key)) {
    cssCache.delete(key);
  } else if (cssCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cssCache.keys().next().value;
    if (oldestKey !== undefined) {
      cssCache.delete(oldestKey);
    }
  }
  cssCache.set(key, value);
}

/**
 * Compiles Tailwind utility CSS for all classes used by an element tree during
 * SSR, backed by a bounded in-memory LRU cache (max 256 entries).
 */
export async function compileProjectTailwindCss(
  elements: unknown,
): Promise<string> {
  const classes = collectClasses(elements);
  if (classes.length === 0) return "";

  const cacheKey = classes.join(" ");
  const cached = readFromLru(cacheKey);
  if (cached !== undefined) return cached;

  const build = await getServerTailwindBuilder();
  const compiled = build(classes);
  writeToLru(cacheKey, compiled);
  return compiled;
}

export function clearTailwindSsrCache(): void {
  cssCache.clear();
}

export function getTailwindSsrCacheSize(): number {
  return cssCache.size;
}
