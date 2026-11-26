import { generate } from "@babel/generator";
import * as t from "@babel/types";
import { isEqual } from "lodash-es";
import type { TextElement } from "@webbuilder/site-runtime/types/elements";
import type { EditorElement, ElementType } from "@webbuilder/site-runtime/types/global.type";
import { componentSetting } from "@webbuilder/site-runtime/projects/components";
import { newEntityId } from "@webbuilder/site-runtime/lib/entity-id";
import {
  attributeName,
  attributeValue,
  cleanJsxText,
  CodeError,
  isTag,
  splitChildren,
  stringAttribute,
  stringAttributeValue,
  tagName,
} from "./astLiterals";
import { splitClasses, styleClasses } from "./classNames";
import { HIDDEN_SETTINGS } from "./customCode";
import { generateStrategies } from "./generatestrategies";

type LooseRecord = Record<string, unknown>;

const TAG_TYPES: Readonly<Record<string, readonly ElementType[]>> = {
  section: ["Section"],
  div: ["Frame", "Text", "CMSContentList", "CMSContentItem", "CMSContentGrid"],
  button: ["Button"],
  a: ["Link"],
  img: ["Image"],
  input: ["Input"],
  select: ["Select"],
  ul: ["List"],
  ol: ["List"],
  form: ["Form"],
  Carousel: ["Carousel"],
};

const SETTINGS_ATTRIBUTE_TYPES: ReadonlySet<string> = new Set([
  "Input",
  "Select",
  "Form",
  "Carousel",
  "CMSContentList",
  "CMSContentItem",
  "CMSContentGrid",
]);

const LEAF_TYPES: ReadonlySet<string> = new Set(["Text", "Button", "Image", "Input"]);
const MODELED_ATTRIBUTES: Readonly<Record<string, readonly string[]>> = { img: ["src", "alt"], a: ["href"] };
const SUPPORTED_TAGS = Object.keys(TAG_TYPES).join(", ");
const HIDDEN_SETTINGS_SET: ReadonlySet<string> = new Set(HIDDEN_SETTINGS);

const WRAPPED_CHILDREN: Readonly<Record<string, { wrapperTag: string; error: (childTag: string) => string }>> = {
  ul: { wrapperTag: "li", error: (childTag) => `<${childTag}> can't be a direct child of a list; use <li>.` },
  ol: { wrapperTag: "li", error: (childTag) => `<${childTag}> can't be a direct child of a list; use <li>.` },
  Carousel: { wrapperTag: "div", error: () => "A carousel's children must be slide <div>s." },
};

export interface ParseContext {
  readonly byId: ReadonlyMap<string, EditorElement>;
  readonly pageId: string | undefined;
  readonly claimed: Set<string>;
}

function isPlainRecord(value: unknown): value is LooseRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (!isPlainRecord(value)) return value;
  const out: LooseRecord = {};
  for (const [k, v] of Object.entries(value)) {
    if (v !== undefined) out[k] = stripUndefined(v);
  }
  return out;
}

function childrenOf(el: EditorElement): EditorElement[] {
  return "elements" in el && Array.isArray(el.elements) ? el.elements : [];
}

export function indexById(tree: readonly EditorElement[], into = new Map<string, EditorElement>()): Map<string, EditorElement> {
  for (const el of tree) {
    if (!generateStrategies[el.type]) continue;
    into.set(el.id, el);
    indexById(childrenOf(el), into);
  }
  return into;
}

function readAttributes(node: t.JSXElement): Map<string, t.JSXAttribute> {
  const attrs = new Map<string, t.JSXAttribute>();
  for (const attr of node.openingElement.attributes) {
    if (!t.isJSXSpreadAttribute(attr)) attrs.set(attributeName(attr), attr);
  }
  return attrs;
}

function claimExisting(
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  candidates: readonly ElementType[],
  ctx: ParseContext,
): EditorElement | undefined {
  const wantedId = stringAttributeValue(attrs, "data-element-id");
  const found = wantedId ? ctx.byId.get(wantedId) : undefined;
  const existing = found && candidates.includes(found.type) && !ctx.claimed.has(found.id) ? found : undefined;
  if (existing) ctx.claimed.add(existing.id);
  return existing;
}

function resolveElementType(
  tag: string,
  candidates: readonly ElementType[],
  existing: EditorElement | undefined,
  childNodes: readonly t.JSXElement[],
  text: string,
  node: t.JSXElement,
): ElementType {
  let type: ElementType = existing?.type ?? (tag === "div" && !childNodes.length && text ? "Text" : candidates[0]);
  if (type === "Text" && childNodes.length) type = "Frame";
  if (LEAF_TYPES.has(type) && childNodes.length) {
    throw new CodeError(`<${tag}> (${type}) can't contain other elements.`, childNodes[0].loc ?? node.loc);
  }
  return type;
}

function ownClasses(written: readonly string[], existing: EditorElement | undefined): string | undefined {
  const derived = new Set(existing ? styleClasses(existing) : []);
  const own = written.filter((cls) => !derived.has(cls));
  const before = existing?.tailwindStyles;
  if (isEqual(own, splitClasses(before))) return before;
  return own.join(" ");
}

function settingsFromAttributes(
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  existing: EditorElement | undefined,
): LooseRecord | null {
  const before = isPlainRecord(existing?.settings) ? existing.settings : null;
  const next: LooseRecord = {};
  for (const key of HIDDEN_SETTINGS) {
    if (before && key in before) next[key] = before[key];
  }
  for (const [name, attr] of attrs) {
    if (name === "className" || name === "data-element-id" || HIDDEN_SETTINGS_SET.has(name)) continue;
    const v = attributeValue(attr);
    if (v.ok && v.value !== undefined) next[name] = v.value;
  }
  if (isEqual(stripUndefined(before ?? {}), stripUndefined(next))) return before;
  return next;
}

function collectCodeProps(
  node: t.JSXElement,
  type: ElementType,
  tag: string,
): string[] {
  const modeled = new Set(["className", "data-element-id", ...(MODELED_ATTRIBUTES[tag] ?? [])]);
  const props: string[] = [];
  for (const attr of node.openingElement.attributes) {
    if (t.isJSXAttribute(attr)) {
      if (modeled.has(attributeName(attr))) continue;
      if (SETTINGS_ATTRIBUTE_TYPES.has(type) && attributeValue(attr).ok) continue;
    }
    props.push(generate(attr).code);
  }
  return props;
}

function applyCodeProps(
  settings: LooseRecord | null | undefined,
  node: t.JSXElement,
  type: ElementType,
  tag: string,
  attrs: ReadonlyMap<string, t.JSXAttribute>,
): LooseRecord | null {
  const props = collectCodeProps(node, type, tag);
  const before = settings ?? null;
  const beforeProps = Array.isArray(before?.codeProps) ? before.codeProps : [];
  let next = before;
  if (!isEqual(beforeProps, props)) {
    next = { ...before };
    if (props.length) next.codeProps = props;
    else delete next.codeProps;
  }
  if (tag === "form" && attrs.has("onSubmit") && next?.customSubmit !== true) {
    next = { ...next, customSubmit: true };
  }
  return next;
}

function resolveSettings(
  node: t.JSXElement,
  type: ElementType,
  tag: string,
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  existing: EditorElement | undefined,
): LooseRecord | null {
  let settings: LooseRecord | null | undefined = isPlainRecord(existing?.settings) ? existing.settings : null;
  if (SETTINGS_ATTRIBUTE_TYPES.has(type)) {
    settings = settingsFromAttributes(attrs, existing);
  } else if (tag === "ol" || tag === "ul") {
    if (tag === "ol" && !settings?.ordered) settings = { ...settings, ordered: true };
    else if (tag === "ul" && settings?.ordered) settings = { ...settings, ordered: false };
  }
  return applyCodeProps(settings, node, type, tag, attrs);
}

function createTextElement(pageId: string | undefined, parentId: string, content: string, loc?: t.SourceLocation | null): TextElement {
  if (!pageId) throw new CodeError("There's no active page to add elements to.", loc);
  return {
    id: newEntityId(),
    type: "Text",
    pageId,
    parentId,
    content,
    styles: {},
    settings: null,
  };
}

function convertChildren(node: t.JSXElement, tag: string, parentId: string, ctx: ParseContext): EditorElement[] {
  const wrapper = WRAPPED_CHILDREN[tag];
  const out: EditorElement[] = [];

  for (const child of node.children) {
    if (t.isJSXText(child)) {
      if (wrapper && cleanJsxText(child.value).trim() !== "") {
        throw new CodeError(wrapper.error("#text"), child.loc);
      }
      continue;
    }
    if (!t.isJSXElement(child)) continue;

    if (wrapper) {
      if (!isTag(child, wrapper.wrapperTag)) {
        throw new CodeError(wrapper.error(tagName(child)), child.loc);
      }
      const inner = splitChildren(child);
      if (inner.text.trim() !== "") {
        out.push(createTextElement(ctx.pageId, parentId, inner.text, child.loc));
      }
      for (const el of inner.elements) out.push(convertElement(el, parentId, ctx));
    } else {
      out.push(convertElement(child, parentId, ctx));
    }
  }
  return out;
}

function resolveOptionContent(
  text: string,
  value: string | undefined,
  old: EditorElement | undefined,
): string {
  if (!old) return value !== undefined && value !== "" ? value : text;
  const previous = old.content ?? "";
  if (value === undefined || (text !== "" && text !== previous && value === previous)) {
    return text;
  }
  return value;
}

function convertOptions(
  node: t.JSXElement,
  existing: EditorElement | undefined,
  parentId: string,
  ctx: ParseContext,
): EditorElement[] {
  const before = existing ? childrenOf(existing) : [];
  const { text: selectText, elements: optionNodes } = splitChildren(node);
  if (selectText.trim() !== "") {
    throw new CodeError("Text inside <select> must be placed inside <option>.", node.loc);
  }

  return optionNodes.map((option, i) => {
    if (!isTag(option, "option")) {
      throw new CodeError(`<${tagName(option)}> can't be inside a <select>; use <option>.`, option.loc);
    }
    const { text } = splitChildren(option);
    const optionAttrs = readAttributes(option);
    const value = stringAttributeValue(optionAttrs, "value");
    const old = before[i];
    const content = resolveOptionContent(text, value, old);

    if (old) {
      if (old.content === content) return old;
      return old.type === "Text"
        ? { ...old, parentId, content }
        : ({ ...old, parentId, content } as EditorElement);
    }
    return createTextElement(ctx.pageId, parentId, content, option.loc);
  });
}

export function keepUnsupported(next: readonly EditorElement[], before: readonly EditorElement[]): EditorElement[] {
  const out = [...next];
  before.forEach((el, i) => {
    if (generateStrategies[el.type]) return;
    out.splice(Math.min(i, out.length), 0, el);
  });
  return out;
}

function toComponentInstance(
  existing: EditorElement,
  parentId: string | undefined,
  childNodes: readonly t.JSXElement[],
  node: t.JSXElement,
): EditorElement {
  if (childNodes.length) {
    throw new CodeError("Edit the component master to change its children.", childNodes[0].loc ?? node.loc);
  }
  const entries = Object.entries(existing).filter(([key]) => key !== "elements");
  const rest = Object.fromEntries(entries);
  rest.parentId = parentId;
  return rest as unknown as EditorElement;
}

function assignElementContentAndUrls(
  result: LooseRecord,
  tag: string,
  text: string,
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  existing: EditorElement | undefined,
): void {
  if (tag === "img") {
    const content = stringAttributeValue(attrs, "alt", true) ?? "";
    if (content !== (existing?.content ?? "")) result.content = content;
    result.src = stringAttribute(attrs, "src", existing?.src);
  } else if (tag !== "select") {
    if (text !== (existing?.content ?? "")) result.content = text;
  }
  if (tag === "a") result.href = stringAttribute(attrs, "href", existing?.href);
}

function assignElementChildren(
  result: LooseRecord,
  node: t.JSXElement,
  tag: string,
  type: ElementType,
  id: string,
  existing: EditorElement | undefined,
  ctx: ParseContext,
): void {
  if (tag === "select") {
    result.elements = convertOptions(node, existing, id, ctx);
  } else if (!LEAF_TYPES.has(type)) {
    const children = convertChildren(node, tag, id, ctx);
    result.elements = existing ? keepUnsupported(children, childrenOf(existing)) : children;
  }
}

export function convertElement(node: t.JSXElement, parentId: string | undefined, ctx: ParseContext): EditorElement {
  const tag = tagName(node);
  const candidates = TAG_TYPES[tag];
  if (!candidates) {
    throw new CodeError(
      `<${tag}> can't be turned into an element yet. Supported tags: ${SUPPORTED_TAGS}.`,
      node.openingElement.name.loc ?? node.loc,
    );
  }

  const attrs = readAttributes(node);
  const existing = claimExisting(attrs, candidates, ctx);
  const { text, elements: childNodes } = splitChildren(node);

  if (existing && componentSetting(existing)) {
    return toComponentInstance(existing, parentId, childNodes, node);
  }

  const type = resolveElementType(tag, candidates, existing, childNodes, text, node);
  const pageId = existing ? existing.pageId : ctx.pageId;
  if (!pageId) {
    throw new CodeError("There's no active page to add elements to.", node.loc);
  }

  const id = existing ? existing.id : newEntityId();
  const written = splitClasses(stringAttributeValue(attrs, "className", true) ?? "");

  const result: LooseRecord = existing
    ? { ...existing, type, parentId }
    : { id, type, pageId, parentId, content: "", styles: {}, settings: null };

  const tailwindStyles = ownClasses(written, existing);
  if (tailwindStyles !== undefined || existing) result.tailwindStyles = tailwindStyles;

  assignElementContentAndUrls(result, tag, text, attrs, existing);
  result.settings = resolveSettings(node, type, tag, attrs, existing);
  assignElementChildren(result, node, tag, type, id, existing, ctx);

  return result as unknown as EditorElement;
}
