/** Delegates page events to the interaction interpreter. */
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { EditorElement } from "@/types/global.type";
import type { Step } from "../schema";
import {
  NATIVE_EVENTS,
  SELF_ONLY,
  chainIds,
  enteredIds,
  indexInteractions,
  plan,
  visibleTargets,
  createVisibleTracker,
  type ChainNode,
  type Planned,
} from "../runtime/dispatch";
import { runInteraction } from "../runtime/run";
import {
  browserPlatform,
  createExecutors,
  elementScope,
  type Platform,
} from "../runtime/executors";
import {
  createVariableStore,
  safeStorage,
  type VariableDef,
} from "../runtime/variables";
import { useRunLogStore } from "../runtime/run-log-store";
import RunLogPanel from "./RunLogPanel";

const NO_VARIABLES: Record<string, VariableDef> = {};
const NO_FLOWS: Record<string, { do: Step[] }> = {};
type PlatformFactory = (
  doc: Document,
  host: Element,
  isPageElement: (id: string) => boolean,
) => Platform;

interface InteractionHostProps {
  elements: EditorElement[];
  enabled: boolean;
  namespace: string;
  showLog?: boolean;
  platform?: PlatformFactory;
  variables?: Record<string, VariableDef>;
  flows?: Record<string, { do: Step[] }>;
  children: React.ReactNode;
}

function eventScope(e: Event | null) {
  if (!e) return null;
  const target = e.target as HTMLInputElement | null;
  return {
    type: e.type,
    value: target && "value" in target ? target.value : null,
    checked: target && "checked" in target ? target.checked : null,
    key: (e as KeyboardEvent).key ?? null,
  };
}

function formValues(target: EventTarget | null): Record<string, unknown> {
  const element = target as Element | null;
  const form = (
    element?.tagName === "FORM" ? element : element?.closest?.("form")
  ) as HTMLFormElement | null;
  const result: Record<string, unknown> = Object.create(null);
  if (!form) return result;
  for (const [key, value] of new FormData(form))
    result[key] = typeof value === "string" ? value : value.name;
  return result;
}

function pageIds(tree: EditorElement[]): Set<string> {
  const ids = new Set<string>();
  const visit = (nodes: EditorElement[]) => {
    for (const node of nodes) {
      ids.add(node.id);
      if ("elements" in node && Array.isArray(node.elements))
        visit(node.elements);
    }
  };
  visit(tree);
  return ids;
}

export function InteractionHost({
  elements,
  enabled,
  namespace,
  showLog = false,
  platform = browserPlatform,
  variables = NO_VARIABLES,
  flows = NO_FLOWS,
  children,
}: InteractionHostProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tracker = useRef(createVisibleTracker());
  const loadState = useRef({
    namespace,
    fired: new Map<string, Set<string>>(),
  });
  const imageErrors = useRef(new WeakMap<Element, string>());
  if (loadState.current.namespace !== namespace) {
    loadState.current = { namespace, fired: new Map() };
    imageErrors.current = new WeakMap();
  }
  const index = useMemo(() => indexInteractions(elements), [elements]);
  const ids = useMemo(() => pageIds(elements), [elements]);
  const indexRef = useRef(index);
  const idsRef = useRef(ids);
  indexRef.current = index;
  idsRef.current = ids;
  const vars = useMemo(
    () =>
      createVariableStore(variables, {
        namespace,
        session: safeStorage(() => window.sessionStorage),
        local: safeStorage(() => window.localStorage),
      }),
    [variables, namespace],
  );

  useLayoutEffect(() => {
    const fired = loadState.current.fired;
    for (const [elementId, seen] of fired) {
      const map = index.get(elementId);
      for (const ixId of seen)
        if (!map || map[ixId]?.on !== "load") seen.delete(ixId);
      if (!seen.size) fired.delete(elementId);
    }
    const root = ref.current;
    if (!enabled || !root) return;
    const p = platform(root.ownerDocument, root, (id) =>
      idsRef.current.has(id),
    );
    const executors = createExecutors(p);
    const el = elementScope((id) => p.byId(id));
    const pushLog = useRunLogStore.getState().push;
    const fire = (
      runs: Planned[],
      event: Event | null,
      form: Record<string, unknown> = {},
    ) => {
      const eventData = eventScope(event);
      void (async () => {
        for (const { elementId, ixId, ix } of runs) {
          try {
            await runInteraction(ix, {
              elementId,
              ixId,
              executors,
              flows,
              vars,
              el,
              log: (entry) => {
                const logged = { ...entry, event: ix.on };
                pushLog(logged);
              },
              event: eventData,
              form,
              steps: {},
            });
          } catch (error) {
            console.error("Interaction failed", ixId, error);
          }
        }
      })();
    };
    const onEvent = (event: Event) => {
      const on = NATIVE_EVENTS[event.type];
      if (!on) return;
      const self = SELF_ONLY.has(on);
      const chain = chainIds(event.target as unknown as ChainNode, root);
      const directId = (event.target as Element | null)?.getAttribute?.(
        "data-element-id",
      );
      const ids = self
        ? directId && chain[0] === directId
          ? [directId]
          : []
        : chain;
      const result = plan(indexRef.current, ids, on, {
        bubble: !self,
        key: (event as KeyboardEvent).key,
      });
      if (result.preventDefault) event.preventDefault();
      if (result.stopPropagation) event.stopPropagation();
      if (result.runs.length)
        fire(result.runs, event, formValues(event.target));
    };
    const onHover = (event: Event) => {
      const mouse = event as MouseEvent;
      const into = chainIds(mouse.target as unknown as ChainNode, root);
      const from = chainIds(mouse.relatedTarget as unknown as ChainNode, root);
      const on = event.type === "mouseover" ? "mouseenter" : "mouseleave";
      const result = plan(indexRef.current, enteredIds(into, from), on, {
        bubble: false,
      });
      if (result.preventDefault) event.preventDefault();
      if (result.stopPropagation) event.stopPropagation();
      fire(result.runs, event);
    };
    const imageKey = (target: Element) => {
      if (target.tagName !== "IMG") return "";
      const image = target as HTMLImageElement;
      const source =
        image.getAttribute("src")?.trim() ||
        image.getAttribute("srcset")?.trim();
      return source ? image.currentSrc || source : "";
    };
    const dispatchError = (target: Element | null, event: Event | null) => {
      const id = target?.getAttribute?.("data-element-id");
      if (
        !target ||
        !id ||
        chainIds(target as unknown as ChainNode, root)[0] !== id
      )
        return;
      const result = plan(indexRef.current, [id], "error", { bubble: false });
      if (!result.runs.length) return;
      const key = imageKey(target);
      if (key && imageErrors.current.get(target) === key) return;
      if (key) imageErrors.current.set(target, key);
      if (result.preventDefault) event?.preventDefault();
      if (result.stopPropagation) event?.stopPropagation();
      fire(result.runs, event);
    };
    const onError = (event: Event) =>
      dispatchError(event.target as Element | null, event);
    const dispatchPending = () => {
      for (const [elementId] of indexRef.current) {
        const node = p.byId(elementId) as unknown as Element | null;
        if (!node) continue;
        const load = plan(indexRef.current, [elementId], "load", {
          bubble: false,
        }).runs;
        let seen = fired.get(elementId);
        if (!seen) fired.set(elementId, (seen = new Set()));
        const pending = load.filter(({ ixId }) => {
          if (seen!.has(ixId)) return false;
          seen!.add(ixId);
          return true;
        });
        if (pending.length) fire(pending, null);
        if (node.tagName === "IMG") {
          const image = node as HTMLImageElement;
          if (imageKey(node) && image.complete && image.naturalWidth === 0)
            dispatchError(node, null);
        }
      }
    };
    const types = Object.keys(NATIVE_EVENTS);
    types.forEach((type) => root.addEventListener(type, onEvent));
    root.addEventListener("mouseover", onHover);
    root.addEventListener("mouseout", onHover);
    root.addEventListener("error", onError, true);
    dispatchPending();
    const mutations = new root.ownerDocument.defaultView!.MutationObserver(
      dispatchPending,
    );
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      types.forEach((type) => root.removeEventListener(type, onEvent));
      root.removeEventListener("mouseover", onHover);
      root.removeEventListener("mouseout", onHover);
      root.removeEventListener("error", onError, true);
    };
  }, [enabled, platform, flows, vars, index]);

  useLayoutEffect(() => {
    tracker.current.reconcile(index);
    const root = ref.current;
    const Observer = root?.ownerDocument.defaultView?.IntersectionObserver;
    if (!enabled || !root || !Observer) return;
    const targets = visibleTargets(index);
    if (!targets.size) return;
    const p = platform(root.ownerDocument, root, (id) =>
      idsRef.current.has(id),
    );
    const executors = createExecutors(p);
    const el = elementScope((id) => p.byId(id));
    const pushLog = useRunLogStore.getState().push;
    const observer = new Observer(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute("data-element-id");
          if (!id || !idsRef.current.has(id)) continue;
          for (const { elementId, ixId, ix } of tracker.current.take(
            indexRef.current,
            id,
          )) {
            void runInteraction(ix, {
              elementId,
              ixId,
              executors,
              flows,
              vars,
              el,
              log: (entry) => {
                const logged = { ...entry, event: ix.on };
                pushLog(logged);
              },
              steps: {},
            }).catch((error) =>
              console.error("Interaction failed", ixId, error),
            );
          }
        }
      },
      { threshold: 0.25 },
    );
    const observed = new Set<Element>();
    const updateTargets = () => {
      const current = new Set<Element>();
      for (const id of targets.keys()) {
        const node = p.byId(id) as unknown as Element | null;
        if (node) current.add(node);
      }
      for (const node of observed)
        if (!current.has(node)) {
          observer.unobserve(node);
          observed.delete(node);
        }
      for (const node of current)
        if (!observed.has(node)) {
          observer.observe(node);
          observed.add(node);
        }
    };
    updateTargets();
    const mutations = new root.ownerDocument.defaultView!.MutationObserver(
      updateTargets,
    );
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [enabled, index, platform, flows, vars]);

  return (
    <>
      <div ref={ref} style={{ display: "contents" }}>
        {children}
      </div>
      {showLog && enabled && typeof document !== "undefined"
        ? createPortal(<RunLogPanel />, document.body)
        : null}
    </>
  );
}

export default InteractionHost;
