import computeTailwindFromStyles from "../../utils/element/computeTailwindFromStyles";
import type { EditorElement } from "@/types/global.type";

/** Class names in a `className` string, in order. */
export const splitClasses = (value: string | undefined): string[] =>
  (value ?? "").split(/\s+/).filter(Boolean);

/** Classes derived from the element's Style panel values. */
export const styleClasses = (element: Pick<EditorElement, "styles">): string[] =>
  splitClasses(computeTailwindFromStyles(element.styles));

/**
 * The `className` the code view shows for an element: its own classes first,
 * then the ones derived from its styles.
 */
export function classNameFor(element: EditorElement): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const cls of [...splitClasses(element.tailwindStyles), ...styleClasses(element)]) {
    if (seen.has(cls)) continue;
    seen.add(cls);
    out.push(cls);
  }
  return out.join(" ");
}
