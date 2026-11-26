import { useEffect, useMemo, useState } from "react";
import {
  collectClasses,
  createTailwindBuilder,
  type TailwindBuilder,
} from "@webbuilder/site-runtime/projects/tailwind-jit";

let builder: Promise<TailwindBuilder> | null = null;

/** Loads the compiler and Tailwind's theme once, only when first needed. */
function getBuilder(): Promise<TailwindBuilder> {
  builder ??= Promise.all([
    import("tailwindcss/theme.css?raw"),
    import("tailwindcss/utilities.css?raw"),
  ])
    .then(([theme, utilities]) =>
      createTailwindBuilder({ theme: theme.default, utilities: utilities.default }),
    )
    .catch((err) => {
      builder = null; // allow a retry on the next change
      throw err;
    });
  return builder;
}

const DEBOUNCE_MS = 150;

/**
 * CSS for every Tailwind class the given elements use, so classes the app's own
 * stylesheet never saw (anything stored in the database) still render. Rebuilds
 * only when the set of classes changes, debounced; returns "" until ready.
 */
export function useProjectTailwindCss(elements: unknown): string {
  const classKey = useMemo(() => collectClasses(elements).join(" "), [elements]);
  const [css, setCss] = useState("");

  useEffect(() => {
    if (!classKey) {
      setCss("");
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      getBuilder()
        .then((build) => {
          if (!cancelled) setCss(build(classKey.split(" ")));
        })
        .catch((err) => console.warn("[tailwind-jit] could not build CSS", err));
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [classKey]);

  return css;
}
