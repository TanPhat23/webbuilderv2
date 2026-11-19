import { newEntityId } from "@/lib/entity-id";
import { CONTAINER_ELEMENT_TYPES } from "@/features/editor/constants/elements";
import type { EditorElement } from "@/types/global.type";

export type ComponentOverride = { text?: string; src?: string; alt?: string; href?: string };
export type ComponentOverrides = Record<string, ComponentOverride>;
export type ComponentSetting = { pageId: string; rootId: string; overrides?: ComponentOverrides };

export interface ComponentSource {
  elements: EditorElement[];
  pageIds: ReadonlySet<string>;
}

const MAX_DEPTH = 8;
const overrideFields = ["text", "src", "alt", "href"] as const;
const containerTypes = new Set<string>([...CONTAINER_ELEMENT_TYPES, "Select"]);
const textTypes = new Set(["Text", "Span", "Heading", "Label", "Blockquote", "Code", "Link", "Button"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function validComponentOverrides(value: unknown): value is ComponentOverrides {
  if (!isRecord(value)) return false;
  const entries = Object.entries(value);
  if (entries.length > 200) return false;
  return entries.every(([id, fields]) =>
    id.length > 0 && id.length <= 255 && !["__proto__", "constructor", "prototype"].includes(id) &&
    isRecord(fields) && Object.entries(fields).every(([key, val]) =>
      overrideFields.some((field) => field === key) && typeof val === "string" && val.length <= 20_000,
    ),
  ) && JSON.stringify(value).length <= 20_000;
}

export function componentSetting(element: EditorElement): ComponentSetting | undefined {
  const value = (element.settings as { component?: unknown } | null)?.component;
  if (!isRecord(value) || typeof value.pageId !== "string" || !value.pageId ||
      typeof value.rootId !== "string" || !value.rootId) return;
  return { pageId: value.pageId, rootId: value.rootId, ...(isRecord(value.overrides) && { overrides: value.overrides as ComponentOverrides }) };
}

export function componentChildren(element: EditorElement): EditorElement[] | undefined {
  const elements = (element as { elements?: unknown }).elements;
  return Array.isArray(elements) ? elements as EditorElement[] : undefined;
}

/** A master must be the single root of a component page in this project. */
export function componentRoots({ elements, pageIds }: ComponentSource) {
  const roots = new Map<string, EditorElement>();
  const multiple = new Set<string>();
  for (const element of elements) {
    if (!pageIds.has(element.pageId)) continue;
    if (roots.has(element.pageId)) multiple.add(element.pageId);
    roots.set(element.pageId, element);
  }
  for (const pageId of multiple) roots.delete(pageId);
  return roots;
}

export function componentOverrideFields(element: EditorElement): (keyof ComponentOverride)[] {
  if (element.type === "Image") return ["src", "alt"];
  if (element.type === "Link" || element.type === "Button") return ["text", "href"];
  return textTypes.has(element.type) ? ["text"] : [];
}

function applyOverrides(element: EditorElement, override?: ComponentOverride) {
  if (!override) return element;
  for (const field of componentOverrideFields(element)) {
    const value = override[field];
    if (typeof value === "string") {
      if (field === "text") element.content = value;
      else if (field === "alt") {
        element.content = value;
        element.name = value;
      }
      else element[field] = value;
    }
  }
  return element;
}

const missingComponent = Symbol("missing component");
type MissingComponent = EditorElement & { [missingComponent]?: true };

export function isMissingComponent(element: EditorElement): boolean {
  return (element as MissingComponent)[missingComponent] === true;
}

const placementProperty = /^(?:margin.*|(?:min|max)?(?:Width|Height)|width|height|position|inset.*|top|right|bottom|left|zIndex|alignSelf|justifySelf|order|flexBasis|flexGrow|flexShrink|gridArea|gridRow.*|gridColumn.*)$/;

function placementStyles(styles: EditorElement["styles"]): EditorElement["styles"] {
  return Object.fromEntries(Object.entries(styles ?? {}).map(([breakpoint, declarations]) => [
    breakpoint, Object.fromEntries(Object.entries(declarations ?? {}).filter(([key]) => placementProperty.test(key))),
  ]));
}

function mergeRootStyles(master: EditorElement["styles"], instance: EditorElement["styles"]) {
  if (!instance) return master;
  const styles = { ...master };
  for (const [breakpoint, properties] of Object.entries(instance)) {
    styles[breakpoint] = { ...styles[breakpoint], ...properties };
  }
  return styles;
}

export function resolveComponents(
  pageElements: EditorElement[],
  projectElements: EditorElement[],
  componentPageIds: ReadonlySet<string>,
  { showMissing = false } = {},
): EditorElement[] {
  const roots = componentRoots({ elements: projectElements, pageIds: componentPageIds });

  function resolve(instance: EditorElement, path: ReadonlySet<string>, depth: number): EditorElement | undefined {
    const setting = componentSetting(instance);
    if (!setting) {
      const children = componentChildren(instance);
      if (!children?.length) return instance;
      const resolved = resolveList(children, path, depth);
      return resolved === children ? instance : { ...instance, elements: resolved } as EditorElement;
    }

    const master = roots.get(setting.pageId);
    if (!master || master.id !== setting.rootId || path.has(setting.pageId) || depth >= MAX_DEPTH) {
      return showMissing ? { ...instance, [missingComponent]: true } as MissingComponent : undefined;
    }

    const nextPath = new Set([...path, setting.pageId]);
    const overrides = setting.overrides;
    function copy(node: EditorElement, id: string, parentId?: string, isRoot = false): EditorElement | undefined {
      const clone = { ...node, id, pageId: instance.pageId, parentId } as EditorElement;
      if (isRoot) {
        clone.order = instance.order;
        clone.orderKey = instance.orderKey;
        clone.styles = mergeRootStyles(clone.styles, instance.styles);
      }
      if (componentSetting(node)) {
        const nested = resolve(clone, nextPath, depth + 1);
        return nested && applyOverrides(nested, overrides?.[node.id]);
      }
      const children = componentChildren(node);
      const elements = children?.flatMap((child) => copy(child, `${instance.id}~${child.id}`, id) ?? []);
      return applyOverrides({ ...clone, ...(elements && { elements }) }, overrides?.[node.id]);
    }

    return copy(structuredClone(master), instance.id, instance.parentId, true);
  }

  function resolveList(list: EditorElement[], path: ReadonlySet<string>, depth: number) {
    const output = list.flatMap((element) => resolve(element, path, depth) ?? []);
    return output.length === list.length && output.every((element, index) => element === list[index]) ? list : output;
  }

  // The open master counts for cycle detection, but not as an expansion.
  return pageElements.flatMap((element) => resolve(
    element,
    componentPageIds.has(element.pageId) ? new Set([element.pageId]) : new Set(),
    0,
  ) ?? []);
}

/** Counts stored links once each, including those inside other masters. */
export function usageCount(elements: EditorElement[], pageId: string): number {
  let count = 0;
  visitComponentTree(elements, (element) => { if (componentSetting(element)?.pageId === pageId) count++; });
  return count;
}

export function visitComponentTree(elements: EditorElement[], visit: (element: EditorElement) => void) {
  for (const element of elements) {
    visit(element);
    if (!componentSetting(element)) visitComponentTree(componentChildren(element) ?? [], visit);
  }
}

/** A new link must not close a dependency path back to its containing master. */
export function wouldCreateComponentCycle(pageId: string, targetId: string, source: ComponentSource): boolean {
  if (!source.pageIds.has(pageId)) return false;
  const roots = componentRoots(source);
  const visited = new Set<string>();
  const pending = [targetId];
  while (pending.length) {
    const id = pending.pop()!;
    if (id === pageId) return true;
    if (visited.has(id)) continue;
    visited.add(id);
    const root = roots.get(id);
    if (!root) continue;
    visitComponentTree([root], (element) => {
      const link = componentSetting(element);
      if (link) pending.push(link.pageId);
    });
  }
  return false;
}

export function makeComponentInstance(
  root: EditorElement, pageId: string, overrides?: ComponentOverrides, original?: EditorElement,
): EditorElement {
  return {
    id: original?.id ?? newEntityId(),
    pageId,
    type: root.type,
    name: original?.name ?? root.name,
    content: original?.content ?? "",
    styles: placementStyles(original?.styles),
    parentId: original?.parentId,
    order: original?.order,
    orderKey: original?.orderKey,
    settings: { component: { pageId: root.pageId, rootId: root.id, ...(overrides && { overrides }) } },
  } as EditorElement;
}

export function cloneComponentTree(element: EditorElement, pageId: string, rootId = newEntityId()): EditorElement {
  function rekey(node: EditorElement, id: string, parentId?: string): EditorElement {
    const children = componentChildren(node);
    return {
      ...node, id, pageId, parentId,
      ...(children && { elements: children.map((child) => rekey(child, newEntityId(), id)) }),
    } as EditorElement;
  }
  return rekey(structuredClone(element), rootId);
}

export function detach(
  instance: EditorElement, projectElements: EditorElement[], componentPageIds: ReadonlySet<string>,
): EditorElement {
  if (!componentSetting(instance)) return instance;
  const [resolved] = resolveComponents([instance], projectElements, componentPageIds);
  if (resolved) {
    const rootId = resolved.type === instance.type ? instance.id : newEntityId();
    return { ...cloneComponentTree(resolved, instance.pageId, rootId), parentId: instance.parentId };
  }
  const { component: _component, ...settings } = instance.settings as Record<string, unknown>;
  return { ...instance, settings, ...((componentChildren(instance) || containerTypes.has(instance.type)) && { elements: [] }) } as EditorElement;
}
