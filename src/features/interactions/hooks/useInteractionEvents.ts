import type React from "react";
import { useLayoutEffect } from "react";
import type { InteractionMap, Step } from "../schema";
import {
  NATIVE_EVENTS,
  SELF_ONLY,
  chainIds,
  enteredIds,
  plan,
} from "../runtime/dispatch";
import {
  asOwnerElement,
  createHostRunner,
  extractFormValues,
  isBrokenLoadedImage,
  resolveImageErrorKey,
  type HostRunner,
  type PlatformFactory,
} from "../runtime/hostDom";
import type { VariableStore } from "../runtime/variables";

export type ImageErrorState = { key: string; pendingNative: boolean };

export function pruneStaleLoadHistory(
  fired: Map<string, Set<string>>,
  index: Map<string, InteractionMap>,
): void {
  for (const [elementId, seen] of fired) {
    const map = index.get(elementId);
    for (const ixId of seen) {
      if (!map || map[ixId]?.on !== "load") seen.delete(ixId);
    }
    if (!seen.size) fired.delete(elementId);
  }
}

export function resolveNativeTargetIds(
  eventTarget: EventTarget | null,
  root: Element,
  selfOnly: boolean,
): string[] {
  const targetElement = asOwnerElement(eventTarget, root.ownerDocument);
  const chain = chainIds(targetElement, root);
  if (!selfOnly) return chain;
  const directId = targetElement?.getAttribute("data-element-id");
  return directId && chain[0] === directId ? [directId] : [];
}

export function handleNativeEvent(
  event: Event,
  root: Element,
  index: Map<string, InteractionMap>,
  runner: HostRunner,
): void {
  const on = NATIVE_EVENTS[event.type];
  if (!on) return;
  const self = SELF_ONLY.has(on);
  const targetIds = resolveNativeTargetIds(event.target, root, self);
  const key = "key" in event && typeof event.key === "string" ? event.key : undefined;
  const result = plan(index, targetIds, on, { bubble: !self, key });
  if (result.preventDefault) event.preventDefault();
  if (result.stopPropagation) event.stopPropagation();
  if (result.runs.length) {
    runner.fireSequence(result.runs, event, extractFormValues(event.target, root.ownerDocument));
  }
}

export function handleHoverEvent(
  event: Event,
  root: Element,
  index: Map<string, InteractionMap>,
  runner: HostRunner,
): void {
  const into = chainIds(asOwnerElement(event.target, root.ownerDocument), root);
  const related = "relatedTarget" in event ? event.relatedTarget : null;
  const from = chainIds(asOwnerElement(related, root.ownerDocument), root);
  const on = event.type === "mouseover" ? "mouseenter" : "mouseleave";
  const result = plan(index, enteredIds(into, from), on, { bubble: false });
  if (result.preventDefault) event.preventDefault();
  if (result.stopPropagation) event.stopPropagation();
  if (result.runs.length) runner.fireSequence(result.runs, event);
}

export function dispatchImageError(
  target: Element | null,
  event: Event | null,
  root: Element,
  index: Map<string, InteractionMap>,
  imageErrors: WeakMap<Element, ImageErrorState>,
  runner: HostRunner,
): void {
  const id = target?.getAttribute("data-element-id");
  if (!target || !id || chainIds(target, root)[0] !== id) return;
  const result = plan(index, [id], "error", { bubble: false });
  if (!result.runs.length) return;
  if (result.preventDefault) event?.preventDefault();
  if (result.stopPropagation) event?.stopPropagation();
  const key = resolveImageErrorKey(target);
  if (key) {
    const previous = imageErrors.get(target);
    if (previous?.key === key) {
      if (!event) return;
      if (previous.pendingNative) {
        previous.pendingNative = false;
        return;
      }
    }
    imageErrors.set(target, { key, pendingNative: !event });
  }
  runner.fireSequence(result.runs, event);
}

function dispatchPendingLoads(
  root: Element,
  index: Map<string, InteractionMap>,
  fired: Map<string, Set<string>>,
  imageErrors: WeakMap<Element, ImageErrorState>,
  runner: HostRunner,
): void {
  for (const [elementId] of index) {
    const node = asOwnerElement(runner.platform.byId(elementId), root.ownerDocument);
    if (!node) continue;
    const loadRuns = plan(index, [elementId], "load", { bubble: false }).runs;
    if (loadRuns.length) {
      let seen = fired.get(elementId);
      if (!seen) {
        seen = new Set();
        fired.set(elementId, seen);
      }
      const pending = loadRuns.filter(({ ixId }) => {
        if (seen.has(ixId)) return false;
        seen.add(ixId);
        return true;
      });
      if (pending.length) runner.fireSequence(pending, null);
    }
    if (isBrokenLoadedImage(node)) {
      dispatchImageError(node, null, root, index, imageErrors, runner);
    }
  }
}

export function useInteractionEvents({
  rootRef,
  enabled,
  platform,
  flows,
  vars,
  index,
  idsRef,
  fired,
  imageErrors,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>;
  enabled: boolean;
  platform: PlatformFactory;
  flows: Record<string, { do: Step[] }>;
  vars: VariableStore;
  index: Map<string, InteractionMap>;
  idsRef: React.RefObject<Set<string>>;
  fired: Map<string, Set<string>>;
  imageErrors: WeakMap<Element, ImageErrorState>;
}): void {
  useLayoutEffect(() => {
    pruneStaleLoadHistory(fired, index);
    const root = rootRef.current;
    const view = root?.ownerDocument.defaultView;
    if (!enabled || !root || !view) return;

    const runner = createHostRunner({
      root,
      platformFactory: platform,
      isPageElement: (id) => idsRef.current.has(id),
      flows,
      vars,
    });

    const onEvent = (event: Event) => handleNativeEvent(event, root, index, runner);
    const onHover = (event: Event) => handleHoverEvent(event, root, index, runner);
    const onError = (event: Event) =>
      dispatchImageError(
        asOwnerElement(event.target, root.ownerDocument),
        event,
        root,
        index,
        imageErrors,
        runner,
      );

    const nativeTypes = Object.keys(NATIVE_EVENTS);
    nativeTypes.forEach((type) => root.addEventListener(type, onEvent));
    root.addEventListener("mouseover", onHover);
    root.addEventListener("mouseout", onHover);
    root.addEventListener("error", onError, true);

    const runPending = () =>
      dispatchPendingLoads(root, index, fired, imageErrors, runner);
    runPending();

    const mutations = new view.MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "attributes" && record.target instanceof view.Element) {
          imageErrors.delete(record.target);
        }
      }
      runPending();
    });
    mutations.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "srcset"],
    });

    return () => {
      mutations.disconnect();
      nativeTypes.forEach((type) => root.removeEventListener(type, onEvent));
      root.removeEventListener("mouseover", onHover);
      root.removeEventListener("mouseout", onHover);
      root.removeEventListener("error", onError, true);
    };
  }, [enabled, platform, flows, vars, index, rootRef, idsRef, fired, imageErrors]);
}
