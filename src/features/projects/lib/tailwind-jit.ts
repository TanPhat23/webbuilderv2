/**
 * Per-project Tailwind CSS, compiled from the classes the project's elements
 * actually use.
 *
 * The app's own stylesheet only contains classes Tailwind found in the app's
 * source at build time. Element classes live in the database (written by the
 * style panel, templates, the AI and the CLI), so any class the source does not
 * happen to contain would render unstyled. This compiles exactly the classes the
 * project uses, so every Tailwind class works in the canvas and the preview.
 */
import { compile } from "tailwindcss";

export interface TailwindSources {
  /** Contents of `tailwindcss/theme.css`. */
  theme: string;
  /** Contents of `tailwindcss/utilities.css`. */
  utilities: string;
}

/** The minimal shape of an editor element this module reads. */
export interface ClassNode {
  tailwindStyles?: string;
  elements?: unknown;
  children?: unknown;
}

const ENTRY = `
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
@custom-variant dark (&:is(.dark *));
`;

/** Every distinct class used by the element tree, sorted. */
export function collectClasses(elements: unknown): string[] {
  const found = new Set<string>();
  const walk = (list: unknown) => {
    if (!Array.isArray(list)) return;
    for (const node of list as ClassNode[]) {
      if (!node || typeof node !== "object") continue;
      if (typeof node.tailwindStyles === "string") {
        for (const cls of node.tailwindStyles.split(/\s+/)) {
          if (cls) found.add(cls);
        }
      }
      walk(node.elements ?? node.children);
    }
  };
  walk(elements);
  return [...found].sort();
}

export type TailwindBuilder = (classes: readonly string[]) => string;

/**
 * Compile once, then build for any class list. The result contains only the
 * theme variables and utilities those classes need (no preflight: the app
 * already ships its own).
 */
export async function createTailwindBuilder(
  sources: TailwindSources,
): Promise<TailwindBuilder> {
  const compiler = await compile(ENTRY, {
    loadStylesheet: async (id, base) => {
      if (id === "tailwindcss/theme.css") return { path: id, base, content: sources.theme };
      if (id === "tailwindcss/utilities.css") return { path: id, base, content: sources.utilities };
      throw new Error(`Unsupported stylesheet import: ${id}`);
    },
  });
  return (classes) => compiler.build([...classes]);
}
