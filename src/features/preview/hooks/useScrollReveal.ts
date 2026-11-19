import { useEffect } from "react";
import { REVEALED_CLASS, type RevealItem } from "../lib/reveal";

/** Reveals each target once, including nodes that mount after the first render. */
export function useScrollReveal(items: RevealItem[], enabled: boolean): void {
  const selector = items.map(({ id }) => `[data-element-id="${id}"]`).join(",");
  useEffect(() => {
    if (!enabled || !selector || typeof document === "undefined") return;
    const seen = new WeakSet<Element>();
    const pending = new Set<Element>();
    const observer = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(REVEALED_CLASS);
          observer?.unobserve(entry.target);
          pending.delete(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    const observeTargets = () => {
      for (const node of pending) {
        if (node.isConnected) continue;
        observer?.unobserve(node);
        pending.delete(node);
        seen.delete(node);
      }
      for (const node of document.querySelectorAll(selector)) {
        if (seen.has(node)) continue;
        seen.add(node);
        if (observer) {
          pending.add(node);
          observer.observe(node);
        } else {
          node.classList.add(REVEALED_CLASS);
        }
      }
    };

    const mutations = new MutationObserver(observeTargets);
    mutations.observe(document.body, { childList: true, subtree: true });
    observeTargets();
    return () => {
      mutations.disconnect();
      observer?.disconnect();
    };
  }, [selector, enabled]);
}
