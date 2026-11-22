import type { EditorElement } from "@/types/global.type";
import type { Step } from "../schema";
import { type Planned } from "./dispatch";
import { createExecutors, elementScope, type Platform } from "./executors";
import { runInteraction } from "./run";
import { useRunLogStore } from "./run-log-store";
import type { VariableStore } from "./variables";

export type PlatformFactory = (
  doc: Document,
  host: Element,
  isPageElement: (id: string) => boolean,
) => Platform;

export function asOwnerElement(
  target: unknown,
  ownerDoc?: Document | null,
): Element | null {
  const viewElement = ownerDoc?.defaultView?.Element;
  if (viewElement && target instanceof viewElement) return target;
  if (typeof Element !== "undefined" && target instanceof Element) return target;
  return null;
}

export function extractEventScope(event: Event | null): {
  type: string;
  value: unknown;
  checked: unknown;
  key: unknown;
} | null {
  if (!event) return null;
  const target = event.target;
  const targetObj = target && typeof target === "object" ? target : null;
  return {
    type: event.type,
    value: targetObj && "value" in targetObj ? targetObj.value : null,
    checked: targetObj && "checked" in targetObj ? targetObj.checked : null,
    key: "key" in event ? event.key : null,
  };
}

export function extractFormValues(
  target: EventTarget | null,
  ownerDoc?: Document | null,
): Record<string, unknown> {
  const result: Record<string, unknown> = Object.create(null);
  const element = asOwnerElement(target, ownerDoc);
  const form = element?.tagName === "FORM" ? element : element?.closest?.("form");
  const FormCtor =
    ownerDoc?.defaultView?.HTMLFormElement ??
    (typeof HTMLFormElement !== "undefined" ? HTMLFormElement : null);
  if (!form || !FormCtor || !(form instanceof FormCtor)) return result;
  for (const [key, value] of new FormData(form)) {
    result[key] = typeof value === "string" ? value : value.name;
  }
  return result;
}

export function collectPageIds(tree: EditorElement[]): Set<string> {
  const ids = new Set<string>();
  const visit = (nodes: EditorElement[]) => {
    for (const node of nodes) {
      ids.add(node.id);
      if ("elements" in node && Array.isArray(node.elements)) {
        visit(node.elements);
      }
    }
  };
  visit(tree);
  return ids;
}

export function resolveImageErrorKey(target: Element): string {
  if (target.tagName !== "IMG") return "";
  const source =
    target.getAttribute("src")?.trim() || target.getAttribute("srcset")?.trim();
  if (!source) return "";
  if ("currentSrc" in target && typeof target.currentSrc === "string") {
    return target.currentSrc || source;
  }
  return source;
}

export function isBrokenLoadedImage(target: Element): boolean {
  return (
    target.tagName === "IMG" &&
    resolveImageErrorKey(target) !== "" &&
    "complete" in target &&
    target.complete === true &&
    "naturalWidth" in target &&
    target.naturalWidth === 0
  );
}

export interface HostRunner {
  platform: Platform;
  runOne: (
    planned: Planned,
    extra?: { event?: ReturnType<typeof extractEventScope>; form?: Record<string, unknown> },
  ) => Promise<void>;
  fireSequence: (
    runs: Planned[],
    event: Event | null,
    form?: Record<string, unknown>,
  ) => void;
}

export function createHostRunner({
  root,
  platformFactory,
  isPageElement,
  flows,
  vars,
}: {
  root: Element;
  platformFactory: PlatformFactory;
  isPageElement: (id: string) => boolean;
  flows: Record<string, { do: Step[] }>;
  vars: VariableStore;
}): HostRunner {
  const platform = platformFactory(root.ownerDocument, root, isPageElement);
  const executors = createExecutors(platform);
  const el = elementScope((id) => platform.byId(id));
  const pushLog = useRunLogStore.getState().push;

  const runOne: HostRunner["runOne"] = async ({ elementId, ixId, ix }, extra) => {
    try {
      await runInteraction(ix, {
        elementId,
        ixId,
        executors,
        flows,
        vars,
        el,
        log: (entry) => pushLog({ ...entry, event: ix.on }),
        ...(extra?.event !== undefined ? { event: extra.event } : {}),
        ...(extra?.form !== undefined ? { form: extra.form } : {}),
        steps: {},
      });
    } catch (error) {
      console.error("Interaction failed", ixId, error);
    }
  };

  const fireSequence: HostRunner["fireSequence"] = (runs, event, form = {}) => {
    if (!runs.length) return;
    const eventData = extractEventScope(event);
    void (async () => {
      for (const planned of runs) {
        await runOne(planned, { event: eventData, form });
      }
    })();
  };

  return { platform, runOne, fireSequence };
}
