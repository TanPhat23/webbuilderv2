import type React from "react";
import { useLayoutEffect } from "react";
import type { InteractionMap, Step } from "../schema";
import { createVisibleTracker, visibleTargets } from "../runtime/dispatch";
import {
  asOwnerElement,
  createHostRunner,
  type PlatformFactory,
} from "../runtime/hostDom";
import type { VariableStore } from "../runtime/variables";

function syncObservedTargets(
  observer: IntersectionObserver,
  observed: Set<Element>,
  targets: ReadonlyMap<string, unknown>,
  root: Element,
  byId: (id: string) => unknown,
): void {
  const current = new Set<Element>();
  for (const id of targets.keys()) {
    const node = asOwnerElement(byId(id), root.ownerDocument);
    if (node) current.add(node);
  }
  for (const node of observed) {
    if (!current.has(node)) {
      observer.unobserve(node);
      observed.delete(node);
    }
  }
  for (const node of current) {
    if (!observed.has(node)) {
      observer.observe(node);
      observed.add(node);
    }
  }
}

export function useVisibleInteractions({
  rootRef,
  tracker,
  enabled,
  index,
  idsRef,
  platform,
  flows,
  vars,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>;
  tracker: ReturnType<typeof createVisibleTracker>;
  enabled: boolean;
  index: Map<string, InteractionMap>;
  idsRef: React.RefObject<Set<string>>;
  platform: PlatformFactory;
  flows: Record<string, { do: Step[] }>;
  vars: VariableStore;
}): void {
  useLayoutEffect(() => {
    tracker.reconcile(index);
    const root = rootRef.current;
    const view = root?.ownerDocument.defaultView;
    const Observer = view?.IntersectionObserver;
    if (!enabled || !root || !view || !Observer) return;
    const targets = visibleTargets(index);
    if (!targets.size) return;

    const runner = createHostRunner({
      root,
      platformFactory: platform,
      isPageElement: (id) => idsRef.current.has(id),
      flows,
      vars,
    });

    const observer = new Observer(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute("data-element-id");
          if (!id || !idsRef.current.has(id)) continue;
          for (const planned of tracker.take(index, id)) {
            void runner.runOne(planned);
          }
        }
      },
      { threshold: 0.25 },
    );

    const observed = new Set<Element>();
    const updateTargets = () =>
      syncObservedTargets(observer, observed, targets, root, (id) => runner.platform.byId(id));
    updateTargets();

    const mutations = new view.MutationObserver(updateTargets);
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [enabled, index, platform, flows, vars, rootRef, tracker, idsRef]);
}
