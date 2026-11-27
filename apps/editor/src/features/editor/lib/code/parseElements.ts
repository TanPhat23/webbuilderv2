import { generate } from "@babel/generator";
import * as t from "@babel/types";
import { isEqual } from "lodash-es";
import type { AuthVisibility } from "@webbuilder/site-runtime/lib/site-auth";
import { newEntityId } from "@webbuilder/site-runtime/lib/entity-id";
import { componentSetting, type ComponentSetting } from "@webbuilder/site-runtime/projects/components";
import type {
  AudioSettings,
  BlockquoteSettings,
  ButtonSettings,
  CarouselSettings,
  CheckboxSettings,
  CMSContentSettings,
  CodeSettings,
  ElementEvents,
  FormSettings,
  FrameElement,
  HeadingSettings,
  IconSettings,
  IFrameSettings,
  ImageSettings,
  InputSettings,
  LabelSettings,
  ProgressSettings,
  RadioSettings,
  ResponsiveStyles,
  SelectSettings,
  TableColumnDefinition,
  TableSettings,
  TextareaSettings,
  TextElement,
  VideoSettings,
} from "@webbuilder/site-runtime/types/elements";
import type { EditorElement, ElementType } from "@webbuilder/site-runtime/types/global.type";
import {
  attributeName,
  attributeValue,
  CodeError,
  isTag,
  splitChildren,
  type SplitChildrenOptions,
  stringAttribute,
  stringAttributeValue,
  tagName,
} from "./astLiterals";
import { EMPTY_COMPONENT_CATALOG, type ComponentCatalog } from "./catalog";
import { splitClasses, styleClasses } from "./classNames";
import {
  matchPropExpression,
  parseComponentInstance,
  type ComponentPropSlots,
  type ParamPropInfo,
} from "./codecs/componentCodec";
import { TAG_CANDIDATES } from "./codecs/registry";
import {
  type CodeTextSegment,
  HIDDEN_SETTINGS,
  readCodeText,
  readCodeVisible,
} from "./customCode";
import { generateStrategies } from "./generatestrategies";
import type { PendingComponentInstance } from "./normalize/extractComponents";
import {
  evaluateStaticExpression,
  findUnboundIdentifier,
  type StaticValue,
} from "./normalize/staticScope";

type LooseRecord = Record<string, unknown>;
type SettingsEnvelope<S extends object> = (S & {
  component?: ComponentSetting;
  authVisibility?: AuthVisibility;
}) | null;

const SETTINGS_ATTRIBUTE_TYPES: ReadonlySet<ElementType> = new Set([
  "Heading",
  "Label",
  "Blockquote",
  "Code",
  "Icon",
  "Image",
  "Video",
  "Audio",
  "IFrame",
  "Button",
  "Input",
  "Textarea",
  "Checkbox",
  "Radio",
  "Progress",
  "Select",
  "Form",
  "Table",
  "Carousel",
  "CMSContentList",
  "CMSContentItem",
  "CMSContentGrid",
]);

const LEAF_TYPES: ReadonlySet<ElementType> = new Set([
  "Text",
  "Span",
  "Heading",
  "Label",
  "Blockquote",
  "Code",
  "Separator",
  "Icon",
  "Image",
  "Video",
  "Audio",
  "IFrame",
  "Button",
  "Input",
  "Textarea",
  "Checkbox",
  "Radio",
  "Progress",
]);

const TABLE_MODELED_ATTRIBUTES: readonly string[] = [
  "data-bordered",
  "bordered",
  "data-striped",
  "striped",
  "data-hoverable",
  "hoverable",
  "data-compact",
  "compact",
];

const SUPPORTED_TAGS = Object.keys(TAG_CANDIDATES).join(", ");
const HIDDEN_SETTINGS_SET: ReadonlySet<string> = new Set(HIDDEN_SETTINGS);

const WRAPPED_CHILDREN: Readonly<
  Record<string, { wrapperTag: string; error: (childTag: string) => string }>
> = {
  ul: {
    wrapperTag: "li",
    error: (childTag) => `<${childTag}> can't be a direct child of a list; use <li>.`,
  },
  ol: {
    wrapperTag: "li",
    error: (childTag) => `<${childTag}> can't be a direct child of a list; use <li>.`,
  },
  Carousel: {
    wrapperTag: "div",
    error: () => "A carousel's children must be slide <div>s.",
  },
};

export interface ParseContext {
  readonly byId: ReadonlyMap<string, EditorElement>;
  readonly pageId: string | undefined;
  readonly claimed: Set<string>;
  readonly lucideImports?: ReadonlyMap<string, string>;
  readonly catalog?: ComponentCatalog;
  readonly uiImports?: ReadonlySet<string>;
  readonly projectImportAliases?: ReadonlyMap<string, string>;
  readonly pendingComponentNames?: ReadonlySet<string>;
  readonly pendingInstances?: PendingComponentInstance[];
  readonly componentPropSlots?: ComponentPropSlots;
  readonly boundIdentifiers?: ReadonlySet<string>;
  readonly staticConsts?: ReadonlyMap<string, StaticValue>;
}

const EMPTY_BOUND: ReadonlySet<string> = new Set();
const EMPTY_CONSTS: ReadonlyMap<string, StaticValue> = new Map();
const NO_DYNAMIC_TEXT_TAGS: ReadonlySet<string> = new Set([
  "img",
  "video",
  "audio",
  "iframe",
  "input",
  "hr",
  "progress",
  "select",
  "table",
  "ul",
  "ol",
  "Carousel",
]);

function boundSet(ctx: ParseContext): ReadonlySet<string> {
  return ctx.boundIdentifiers ?? EMPTY_BOUND;
}

function constsMap(ctx: ParseContext): ReadonlyMap<string, StaticValue> {
  return ctx.staticConsts ?? EMPTY_CONSTS;
}

function splitOpts(ctx: ParseContext, allowDynamicText: boolean): SplitChildrenOptions {
  return {
    boundIdentifiers: boundSet(ctx),
    staticConsts: constsMap(ctx),
    allowDynamicText,
  };
}

function assertAttributesScoped(
  node: t.JSXElement,
  bound: ReadonlySet<string>,
  staticConsts: ReadonlyMap<string, StaticValue>,
): void {
  for (const attr of node.openingElement.attributes) {
    if (t.isJSXSpreadAttribute(attr)) {
      const bad = findUnboundIdentifier(attr.argument, bound);
      if (bad) {
        throw new CodeError(
          `'${bad.name}' is not defined in this component.`,
          bad.loc ?? attr.loc,
        );
      }
      continue;
    }
    if (
      t.isJSXAttribute(attr) &&
      t.isJSXExpressionContainer(attr.value) &&
      !t.isJSXEmptyExpression(attr.value.expression)
    ) {
      if (evaluateStaticExpression(attr.value.expression, staticConsts).ok) {
        continue;
      }
      const bad = findUnboundIdentifier(attr.value.expression, bound);
      if (bad) {
        throw new CodeError(
          `'${bad.name}' is not defined in this component.`,
          bad.loc ?? attr.loc,
        );
      }
    }
  }
}

function isDynamicBoundAttr(
  attr: t.JSXAttribute | undefined,
  staticConsts: ReadonlyMap<string, StaticValue>,
): boolean {
  if (!attr || !t.isJSXExpressionContainer(attr.value)) return false;
  if (t.isJSXEmptyExpression(attr.value.expression)) return false;
  return !evaluateStaticExpression(attr.value.expression, staticConsts).ok;
}

function isPlainRecord(value: unknown): value is LooseRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasGenerateStrategy(type: string): boolean {
  return Object.hasOwn(generateStrategies, type) && Boolean(generateStrategies[type]);
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

export function indexById(
  tree: readonly EditorElement[],
  into = new Map<string, EditorElement>(),
): Map<string, EditorElement> {
  for (const el of tree) {
    if (!hasGenerateStrategy(el.type)) continue;
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
  const existing =
    found && candidates.includes(found.type) && !ctx.claimed.has(found.id)
      ? found
      : undefined;
  if (existing) ctx.claimed.add(existing.id);
  return existing;
}

function modeledAttributesFor(type: ElementType, tag: string): ReadonlySet<string> {
  if (tag === "img") return new Set(["src", "alt"]);
  if (tag === "a") return new Set(["href"]);
  if (tag === "video" || tag === "audio" || tag === "iframe") return new Set(["src"]);
  if (tag === "button") return new Set(["data-href"]);
  if (type === "Checkbox" || type === "Radio") return new Set(["type"]);
  if (type === "Heading") return new Set(["level"]);
  if (type === "Code") return new Set(["data-language", "language", "preformatted"]);
  if (type === "Icon") return new Set(["iconName"]);
  if (type === "Table") return new Set(TABLE_MODELED_ATTRIBUTES);
  return new Set();
}

function attributeRenameMapFor(type: ElementType): Readonly<Record<string, string>> | undefined {
  if (type === "Video" || type === "Audio") return { autoPlay: "autoplay" };
  if (type === "Button") return { type: "buttonType" };
  if (type === "Checkbox" || type === "Radio" || type === "Progress") {
    return { "data-label": "label" };
  }
  return undefined;
}

function resolveElementType(
  tag: string,
  candidates: readonly ElementType[],
  existing: EditorElement | undefined,
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  childNodes: readonly t.JSXElement[],
  text: string,
  node: t.JSXElement,
  isLucideIcon: boolean,
  ctx: ParseContext,
): ElementType {
  let type: ElementType;
  if (isLucideIcon) {
    type = "Icon";
  } else if (tag === "input") {
    const rawType = stringAttributeValue(attrs, "type", false, constsMap(ctx))?.toLowerCase();
    if (rawType === "checkbox") type = "Checkbox";
    else if (rawType === "radio") type = "Radio";
    else type = "Input";
  } else if (tag === "div") {
    type = existing?.type ?? (!childNodes.length && text ? "Text" : candidates[0]!);
    if (type === "Text" && childNodes.length) type = "Frame";
  } else {
    type = existing?.type ?? candidates[0]!;
  }

  if (type === "Code" && tag === "pre") {
    if (childNodes.length > 1 || (childNodes.length === 1 && !isTag(childNodes[0]!, "code"))) {
      throw new CodeError(
        "<pre> (Code) can only wrap a single <code> element.",
        childNodes[0]?.loc ?? node.loc,
      );
    }
    if (childNodes.length === 1) {
      const inner = splitChildren(childNodes[0]!, splitOpts(ctx, true));
      if (inner.elements.length > 0) {
        throw new CodeError(
          "<pre><code> (Code) can't contain other elements.",
          inner.elements[0]?.loc ?? childNodes[0]!.loc,
        );
      }
    }
    return type;
  }

  if ((type === "Video" || type === "Audio") && childNodes.length > 0) {
    const invalid = childNodes.find((c) => !isTag(c, "source") && !isTag(c, "track"));
    if (invalid) {
      throw new CodeError(
        `<${tag}> (${type}) can't contain <${tagName(invalid)}>.`,
        invalid.loc ?? node.loc,
      );
    }
    return type;
  }

  if (LEAF_TYPES.has(type) && childNodes.length) {
    throw new CodeError(
      `<${tag}> (${type}) can't contain other elements.`,
      childNodes[0]?.loc ?? node.loc,
    );
  }
  return type;
}

function ownClasses(
  written: readonly string[],
  existing: EditorElement | undefined,
): string | undefined {
  const derived = new Set(existing ? styleClasses(existing) : []);
  const own = written.filter((cls) => !derived.has(cls));
  const before = existing?.tailwindStyles;
  if (isEqual(own, splitClasses(before))) return before;
  return own.join(" ");
}

function settingsFromAttributes(
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  existing: EditorElement | undefined,
  modeled: ReadonlySet<string>,
  renameMap?: Readonly<Record<string, string>>,
  staticConsts?: ReadonlyMap<string, StaticValue>,
): LooseRecord | null {
  const before = isPlainRecord(existing?.settings) ? existing.settings : null;
  const next: LooseRecord = {};
  for (const key of HIDDEN_SETTINGS) {
    if (before && key in before) next[key] = before[key];
  }
  for (const [name, attr] of attrs) {
    if (
      name === "className" ||
      name === "data-element-id" ||
      HIDDEN_SETTINGS_SET.has(name) ||
      modeled.has(name)
    ) {
      continue;
    }
    const v = attributeValue(attr, staticConsts);
    if (v.ok && v.value !== undefined) {
      const targetKey = renameMap && Object.hasOwn(renameMap, name) ? renameMap[name]! : name;
      next[targetKey] = v.value;
    }
  }
  if (isEqual(stripUndefined(before ?? {}), stripUndefined(next))) return before;
  return next;
}

function collectCodeProps(
  node: t.JSXElement,
  type: ElementType,
  tag: string,
  staticConsts?: ReadonlyMap<string, StaticValue>,
  skipCodePropAttrs?: ReadonlySet<string>,
): string[] {
  const modeled = modeledAttributesFor(type, tag);
  const props: string[] = [];
  for (const attr of node.openingElement.attributes) {
    if (t.isJSXAttribute(attr)) {
      const name = attributeName(attr);
      if (name === "data-element-id" || skipCodePropAttrs?.has(name)) {
        continue;
      }
      const v = attributeValue(attr, staticConsts);
      if (name === "className") {
        if (v.ok) continue;
      } else if (modeled.has(name)) {
        if (v.ok) continue;
      } else if (SETTINGS_ATTRIBUTE_TYPES.has(type) && v.ok) {
        continue;
      }
    }
    props.push(generate(attr).code);
  }
  return props;
}

function applyCodeSettings(
  settings: LooseRecord | null | undefined,
  node: t.JSXElement,
  type: ElementType,
  tag: string,
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  codeText: readonly CodeTextSegment[] | undefined,
  codeVisible: string | undefined,
  staticConsts?: ReadonlyMap<string, StaticValue>,
  skipCodePropAttrs?: ReadonlySet<string>,
): LooseRecord | null {
  const props = collectCodeProps(node, type, tag, staticConsts, skipCodePropAttrs);
  const before = settings ?? null;
  const beforeProps = Array.isArray(before?.codeProps) ? before.codeProps : [];
  const beforeText = readCodeText(before);
  const beforeVisible = readCodeVisible(before);
  const hasOnSubmit = tag === "form" && attrs.has("onSubmit");

  const propsChanged = !isEqual(beforeProps, props);
  const textChanged = !isEqual(beforeText, codeText);
  const visibleChanged = beforeVisible !== codeVisible;
  const submitChanged = hasOnSubmit && before?.customSubmit !== true;

  if (!propsChanged && !textChanged && !visibleChanged && !submitChanged) {
    return before;
  }

  const next: LooseRecord = { ...before };
  if (props.length > 0) next.codeProps = props;
  else delete next.codeProps;

  if (codeText && codeText.length > 0) next.codeText = codeText;
  else delete next.codeText;

  if (codeVisible) next.codeVisible = codeVisible;
  else delete next.codeVisible;

  if (hasOnSubmit) next.customSubmit = true;

  return Object.keys(next).length > 0 ? next : null;
}

function headingLevelFromTag(tag: string): 1 | 2 | 3 | 4 | 5 | 6 {
  switch (tag) {
    case "h1":
      return 1;
    case "h2":
      return 2;
    case "h3":
      return 3;
    case "h4":
      return 4;
    case "h5":
      return 5;
    case "h6":
      return 6;
    default:
      return 2;
  }
}

function mergeStabilizedSettings(
  next: LooseRecord,
  existing: EditorElement | undefined,
): LooseRecord | null {
  const before = isPlainRecord(existing?.settings) ? existing.settings : null;
  if (isEqual(stripUndefined(before ?? {}), stripUndefined(next))) return before;
  return Object.keys(next).length > 0 ? next : before ? {} : null;
}

function resolveSettings(
  node: t.JSXElement,
  type: ElementType,
  tag: string,
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  existing: EditorElement | undefined,
  lucideIconName: string | undefined,
  codeText: readonly CodeTextSegment[] | undefined,
  codeVisible: string | undefined,
  staticConsts: ReadonlyMap<string, StaticValue>,
  skipCodePropAttrs?: ReadonlySet<string>,
): LooseRecord | null {
  const modeled = modeledAttributesFor(type, tag);
  const renameMap = attributeRenameMapFor(type);
  let settings: LooseRecord | null | undefined = isPlainRecord(existing?.settings)
    ? existing.settings
    : null;

  if (type === "Heading") {
    const base = settingsFromAttributes(attrs, existing, modeled, renameMap, staticConsts) ?? {};
    settings = mergeStabilizedSettings({ ...base, level: headingLevelFromTag(tag) }, existing);
  } else if (type === "Code") {
    const base = settingsFromAttributes(attrs, existing, modeled, renameMap, staticConsts) ?? {};
    const next: LooseRecord = { ...base };
    const lang =
      stringAttributeValue(attrs, "data-language", false, staticConsts) ??
      stringAttributeValue(attrs, "language", false, staticConsts);
    if (lang !== undefined) next.language = lang;
    if (tag === "pre") {
      next.preformatted = true;
    } else if (isPlainRecord(existing?.settings) && "preformatted" in existing.settings) {
      next.preformatted = false;
    }
    settings = mergeStabilizedSettings(next, existing);
  } else if (type === "Icon") {
    const base = settingsFromAttributes(attrs, existing, modeled, renameMap, staticConsts) ?? {};
    const iconName =
      lucideIconName ?? stringAttributeValue(attrs, "iconName", false, staticConsts) ?? "star";
    settings = mergeStabilizedSettings({ ...base, iconName }, existing);
  } else if (SETTINGS_ATTRIBUTE_TYPES.has(type) && type !== "Table") {
    settings = settingsFromAttributes(attrs, existing, modeled, renameMap, staticConsts);
  } else if (tag === "ol" || tag === "ul") {
    if (tag === "ol" && !settings?.ordered) settings = { ...settings, ordered: true };
    else if (tag === "ul" && settings?.ordered) settings = { ...settings, ordered: false };
  }
  return applyCodeSettings(
    settings,
    node,
    type,
    tag,
    attrs,
    codeText,
    codeVisible,
    staticConsts,
    skipCodePropAttrs,
  );
}

function createTextElement(
  pageId: string | undefined,
  parentId: string,
  content: string,
  loc?: t.SourceLocation | null,
  tailwindStyles?: string,
  codeText?: readonly CodeTextSegment[],
  codeVisible?: string,
): TextElement {
  if (!pageId) throw new CodeError("There's no active page to add elements to.", loc);
  const extraSettings: LooseRecord = {};
  if (codeText && codeText.length > 0) extraSettings.codeText = codeText;
  if (codeVisible) extraSettings.codeVisible = codeVisible;
  return {
    id: newEntityId(),
    type: "Text",
    pageId,
    parentId,
    content,
    styles: {},
    settings: Object.keys(extraSettings).length > 0 ? extraSettings : null,
    ...(tailwindStyles ? { tailwindStyles } : {}),
  };
}

function convertChildren(
  node: t.JSXElement,
  tag: string,
  parentId: string,
  ctx: ParseContext,
  elements: readonly t.JSXElement[],
  visibilityByElement: ReadonlyMap<t.JSXElement, string>,
  looseText: string,
): EditorElement[] {
  const wrapper = WRAPPED_CHILDREN[tag];
  if (wrapper && looseText.trim() !== "") {
    throw new CodeError(wrapper.error("#text"), node.loc);
  }
  const out: EditorElement[] = [];

  for (const child of elements) {
    const childCodeVisible = visibilityByElement.get(child);
    if (wrapper) {
      assertAttributesScoped(child, boundSet(ctx), constsMap(ctx));
      if (!isTag(child, wrapper.wrapperTag)) {
        throw new CodeError(wrapper.error(tagName(child)), child.loc);
      }
      const inner = splitChildren(child, splitOpts(ctx, true));
      if (inner.text.trim() !== "") {
        out.push(
          createTextElement(
            ctx.pageId,
            parentId,
            inner.text,
            child.loc,
            undefined,
            inner.codeText,
            childCodeVisible,
          ),
        );
      }
      for (const el of inner.elements) {
        const nestedVisible = inner.visibilityByElement.get(el) ?? childCodeVisible;
        out.push(convertElement(el, parentId, ctx, nestedVisible));
      }
    } else {
      out.push(convertElement(child, parentId, ctx, childCodeVisible));
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
  const { text: selectText, elements: optionNodes } = splitChildren(node, splitOpts(ctx, false));
  if (selectText.trim() !== "") {
    throw new CodeError("Text inside <select> must be placed inside <option>.", node.loc);
  }

  return optionNodes.map((option, i) => {
    assertAttributesScoped(option, boundSet(ctx), constsMap(ctx));
    if (!isTag(option, "option")) {
      throw new CodeError(
        `<${tagName(option)}> can't be inside a <select>; use <option>.`,
        option.loc,
      );
    }
    const { text } = splitChildren(option, splitOpts(ctx, false));
    const optionAttrs = readAttributes(option);
    const value = stringAttributeValue(optionAttrs, "value", false, constsMap(ctx));
    const old = before[i];
    const content = resolveOptionContent(text, value, old);

    if (old) {
      if (old.content === content && old.parentId === parentId) return old;
      return { ...old, parentId, content };
    }
    return createTextElement(ctx.pageId, parentId, content, option.loc);
  });
}

function readBooleanAttr(
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  primary: string,
  fallback: string,
  staticConsts?: ReadonlyMap<string, StaticValue>,
): boolean | undefined {
  const attr = attrs.get(primary) ?? attrs.get(fallback);
  if (!attr) return undefined;
  const val = attributeValue(attr, staticConsts);
  return val.ok && typeof val.value === "boolean" ? val.value : undefined;
}

function parseTableColumn(
  th: t.JSXElement,
  index: number,
  existingCol: TableColumnDefinition | undefined,
  ctx: ParseContext,
): TableColumnDefinition {
  assertAttributesScoped(th, boundSet(ctx), constsMap(ctx));
  const thAttrs = readAttributes(th);
  const consts = constsMap(ctx);
  const id =
    stringAttributeValue(thAttrs, "data-col-id", false, consts) ??
    existingCol?.id ??
    `col_${index + 1}`;
  const header = splitChildren(th, splitOpts(ctx, false)).text;

  let align: "left" | "center" | "right" | undefined;
  let width: number | string | undefined;

  const styleAttr = thAttrs.get("style");
  if (styleAttr) {
    const styleVal = attributeValue(styleAttr, consts);
    if (styleVal.ok && isPlainRecord(styleVal.value)) {
      const ta = styleVal.value.textAlign;
      if (ta === "left" || ta === "center" || ta === "right") align = ta;
      const w = styleVal.value.width;
      if (typeof w === "number" || typeof w === "string") width = w;
    }
  }
  const attrAlign =
    stringAttributeValue(thAttrs, "data-align", false, consts) ??
    stringAttributeValue(thAttrs, "align", false, consts);
  if (attrAlign === "left" || attrAlign === "center" || attrAlign === "right") {
    align = attrAlign;
  }
  const widthAttr = thAttrs.get("data-width") ?? thAttrs.get("width");
  if (width === undefined && widthAttr) {
    const wVal = attributeValue(widthAttr, consts);
    if (wVal.ok && (typeof wVal.value === "number" || typeof wVal.value === "string")) {
      width = wVal.value;
    }
  }

  const accessor =
    stringAttributeValue(thAttrs, "data-accessor", false, consts) ?? existingCol?.accessor;
  const sortableAttr = thAttrs.get("data-sortable");
  let sortable = existingCol?.sortable;
  if (sortableAttr) {
    const sVal = attributeValue(sortableAttr, consts);
    if (sVal.ok && typeof sVal.value === "boolean") sortable = sVal.value;
  }

  return {
    id,
    header,
    ...(accessor !== undefined ? { accessor } : {}),
    ...(width !== undefined ? { width } : {}),
    ...(align !== undefined ? { align } : {}),
    ...(sortable !== undefined ? { sortable } : {}),
  };
}

function convertHtmlTableRow(
  tr: t.JSXElement,
  pageId: string,
  tableId: string,
  ctx: ParseContext,
  codeVisible?: string,
): FrameElement {
  assertAttributesScoped(tr, boundSet(ctx), constsMap(ctx));
  const rowId = newEntityId();
  const trAttrs = readAttributes(tr);
  const consts = constsMap(ctx);
  const rowClasses = splitClasses(
    stringAttributeValue(trAttrs, "className", true, consts) ?? "",
  ).join(" ");
  const { elements: cellNodes } = splitChildren(tr, splitOpts(ctx, false));

  const cells: EditorElement[] = cellNodes
    .filter((cell) => isTag(cell, "td") || isTag(cell, "th"))
    .map((cell) => {
      assertAttributesScoped(cell, boundSet(ctx), constsMap(ctx));
      const cellSplit = splitChildren(cell, splitOpts(ctx, true));
      const cellAttrs = readAttributes(cell);
      const cellTw = splitClasses(
        stringAttributeValue(cellAttrs, "className", true, consts) ?? "",
      ).join(" ");
      if (cellSplit.elements.length === 0) {
        return createTextElement(
          pageId,
          rowId,
          cellSplit.text,
          cell.loc,
          cellTw || undefined,
          cellSplit.codeText,
        );
      }
      const cellId = newEntityId();
      const nestedChildren = cellSplit.elements.map((el) =>
        convertElement(el, cellId, ctx, cellSplit.visibilityByElement.get(el)),
      );
      const frameCell: FrameElement = {
        id: cellId,
        type: "Frame",
        pageId,
        parentId: rowId,
        content: cellSplit.text,
        styles: {},
        settings: cellSplit.codeText ? { codeText: cellSplit.codeText } : null,
        ...(cellTw ? { tailwindStyles: cellTw } : {}),
        elements: nestedChildren,
      };
      return frameCell;
    });

  return {
    id: rowId,
    type: "Frame",
    pageId,
    parentId: tableId,
    content: "",
    styles: {},
    settings: codeVisible ? { codeVisible } : null,
    ...(rowClasses ? { tailwindStyles: rowClasses } : {}),
    elements: cells,
  };
}

function parseTableStructure(
  node: t.JSXElement,
  pageId: string,
  tableId: string,
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  existing: EditorElement | undefined,
  ctx: ParseContext,
  codeVisible?: string,
): { settings: LooseRecord | null; elements: EditorElement[] } {
  const consts = constsMap(ctx);
  const modeled = modeledAttributesFor("Table", "table");
  const base = settingsFromAttributes(attrs, existing, modeled, undefined, consts) ?? {};
  const nextSettings: LooseRecord = { ...base };

  const bordered = readBooleanAttr(attrs, "data-bordered", "bordered", consts);
  const striped = readBooleanAttr(attrs, "data-striped", "striped", consts);
  const hoverable = readBooleanAttr(attrs, "data-hoverable", "hoverable", consts);
  const compact = readBooleanAttr(attrs, "data-compact", "compact", consts);
  if (bordered !== undefined) nextSettings.bordered = bordered;
  if (striped !== undefined) nextSettings.striped = striped;
  if (hoverable !== undefined) nextSettings.hoverable = hoverable;
  if (compact !== undefined) nextSettings.compact = compact;

  const existingColumns: readonly TableColumnDefinition[] =
    existing?.type === "Table" && Array.isArray(existing.settings?.columns)
      ? existing.settings.columns
      : [];

  const { text: looseText, elements: tableChildren } = splitChildren(node, splitOpts(ctx, false));
  if (looseText.trim() !== "") {
    throw new CodeError(
      "Text inside <table> must sit inside <caption>, <th>, or <td>.",
      node.loc,
    );
  }

  let caption: string | undefined;
  const headerCells: t.JSXElement[] = [];
  const bodyRows: Array<{ row: t.JSXElement; codeVisible?: string }> = [];

  for (const child of tableChildren) {
    assertAttributesScoped(child, boundSet(ctx), constsMap(ctx));
    const childTag = tagName(child);
    if (childTag === "caption") {
      caption = splitChildren(child, splitOpts(ctx, false)).text;
    } else if (childTag === "thead") {
      const headSplit = splitChildren(child, splitOpts(ctx, false));
      for (const rowOrCell of headSplit.elements) {
        assertAttributesScoped(rowOrCell, boundSet(ctx), constsMap(ctx));
        if (isTag(rowOrCell, "tr")) {
          for (const cell of splitChildren(rowOrCell, splitOpts(ctx, false)).elements) {
            if (isTag(cell, "th") || isTag(cell, "td")) headerCells.push(cell);
          }
        } else if (isTag(rowOrCell, "th")) {
          headerCells.push(rowOrCell);
        }
      }
    } else if (childTag === "tbody" || childTag === "tfoot") {
      const bodySplit = splitChildren(child, splitOpts(ctx, false));
      for (const row of bodySplit.elements) {
        if (isTag(row, "tr")) {
          bodyRows.push({ row, codeVisible: bodySplit.visibilityByElement.get(row) });
        }
      }
    } else if (childTag === "tr") {
      bodyRows.push({ row: child });
    }
  }

  if (caption !== undefined) {
    nextSettings.caption = caption;
  }
  if (headerCells.length > 0) {
    nextSettings.columns = headerCells.map((th, idx) =>
      parseTableColumn(th, idx, existingColumns[idx], ctx),
    );
  }

  let bodyElements: EditorElement[] = [];
  if (bodyRows.length === 1) {
    const singleRowCells = splitChildren(bodyRows[0]!.row, splitOpts(ctx, false)).elements.filter(
      (c) => isTag(c, "td") || isTag(c, "th"),
    );
    if (singleRowCells.length === 1) {
      const onlyCell = singleRowCells[0]!;
      const cellAttrs = readAttributes(onlyCell);
      const cellSplit = splitChildren(onlyCell, splitOpts(ctx, false));
      const isSlot =
        cellAttrs.has("data-wb-slot") ||
        (cellAttrs.has("colSpan") && cellSplit.text.trim() === "");
      if (isSlot) {
        bodyElements = cellSplit.elements.map((el) =>
          convertElement(el, tableId, ctx, cellSplit.visibilityByElement.get(el)),
        );
        const stabilized = mergeStabilizedSettings(nextSettings, existing);
        return {
          settings: applyCodeSettings(
            stabilized,
            node,
            "Table",
            "table",
            attrs,
            undefined,
            codeVisible,
            consts,
          ),
          elements: existing
            ? keepUnsupported(bodyElements, childrenOf(existing))
            : bodyElements,
        };
      }
    }
  }

  bodyElements = bodyRows.map(({ row, codeVisible: rowVisible }) =>
    convertHtmlTableRow(row, pageId, tableId, ctx, rowVisible),
  );
  const stabilized = mergeStabilizedSettings(nextSettings, existing);
  return {
    settings: applyCodeSettings(
      stabilized,
      node,
      "Table",
      "table",
      attrs,
      undefined,
      codeVisible,
      consts,
    ),
    elements: existing ? keepUnsupported(bodyElements, childrenOf(existing)) : bodyElements,
  };
}

export function keepUnsupported(
  next: readonly EditorElement[],
  before: readonly EditorElement[],
): EditorElement[] {
  const out = [...next];
  before.forEach((el, i) => {
    if (hasGenerateStrategy(el.type)) return;
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
    throw new CodeError(
      "Edit the component master to change its children.",
      childNodes[0]?.loc ?? node.loc,
    );
  }
  return { ...existing, parentId };
}

function wrapSettings<S extends object>(
  seed: S,
  raw: LooseRecord | null,
): SettingsEnvelope<S> {
  if (raw === null) return null;
  const target: S & { component?: ComponentSetting; authVisibility?: AuthVisibility } = {
    ...seed,
  };
  return Object.assign(target, raw);
}

interface BuiltElementFields {
  readonly id: string;
  readonly pageId: string;
  readonly parentId: string | undefined;
  readonly content: string;
  readonly name: string | undefined;
  readonly styles: ResponsiveStyles;
  readonly tailwindStyles: string | undefined;
  readonly hasTailwindKey: boolean;
  readonly href: string | undefined;
  readonly hasHrefKey: boolean;
  readonly src: string | undefined;
  readonly hasSrcKey: boolean;
  readonly order: number | undefined;
  readonly orderKey: string | undefined;
  readonly events: ElementEvents | undefined;
  readonly settings: LooseRecord | null;
  readonly elements: EditorElement[] | undefined;
}

function instantiateElement(type: ElementType, f: BuiltElementFields): EditorElement {
  const common = {
    id: f.id,
    pageId: f.pageId,
    parentId: f.parentId,
    content: f.content,
    styles: f.styles,
    ...(f.name !== undefined ? { name: f.name } : {}),
    ...(f.hasTailwindKey ? { tailwindStyles: f.tailwindStyles } : {}),
    ...(f.hasHrefKey ? { href: f.href } : {}),
    ...(f.hasSrcKey ? { src: f.src } : {}),
    ...(f.order !== undefined ? { order: f.order } : {}),
    ...(f.orderKey !== undefined ? { orderKey: f.orderKey } : {}),
    ...(f.events !== undefined ? { events: f.events } : {}),
  };
  const children = f.elements ?? [];

  switch (type) {
    case "Text":
      return { ...common, type: "Text", settings: wrapSettings({}, f.settings) };
    case "Span":
      return { ...common, type: "Span", settings: wrapSettings({}, f.settings) };
    case "Heading": {
      const rawLvl = f.settings?.level;
      const level: HeadingSettings["level"] =
        rawLvl === 1 ||
        rawLvl === 2 ||
        rawLvl === 3 ||
        rawLvl === 4 ||
        rawLvl === 5 ||
        rawLvl === 6
          ? rawLvl
          : 2;
      const seed: HeadingSettings & {
        component?: ComponentSetting;
        authVisibility?: AuthVisibility;
      } = { level };
      return {
        ...common,
        type: "Heading",
        settings: Object.assign(seed, f.settings ?? {}, { level }),
      };
    }
    case "Label":
      return { ...common, type: "Label", settings: wrapSettings<LabelSettings>({}, f.settings) };
    case "Blockquote":
      return {
        ...common,
        type: "Blockquote",
        settings: wrapSettings<BlockquoteSettings>({}, f.settings),
      };
    case "Code":
      return { ...common, type: "Code", settings: wrapSettings<CodeSettings>({}, f.settings) };
    case "Separator":
      return { ...common, type: "Separator", settings: wrapSettings({}, f.settings) };
    case "Icon":
      return { ...common, type: "Icon", settings: wrapSettings<IconSettings>({}, f.settings) };
    case "Image":
      return { ...common, type: "Image", settings: wrapSettings<ImageSettings>({}, f.settings) };
    case "Video":
      return { ...common, type: "Video", settings: wrapSettings<VideoSettings>({}, f.settings) };
    case "Audio":
      return { ...common, type: "Audio", settings: wrapSettings<AudioSettings>({}, f.settings) };
    case "IFrame":
      return { ...common, type: "IFrame", settings: wrapSettings<IFrameSettings>({}, f.settings) };
    case "Button":
      return { ...common, type: "Button", settings: wrapSettings<ButtonSettings>({}, f.settings) };
    case "Link":
      return {
        ...common,
        type: "Link",
        settings: wrapSettings({}, f.settings),
        ...(f.elements !== undefined ? { elements: f.elements } : {}),
      };
    case "Input":
      return { ...common, type: "Input", settings: wrapSettings<InputSettings>({}, f.settings) };
    case "Textarea":
      return {
        ...common,
        type: "Textarea",
        settings: wrapSettings<TextareaSettings>({}, f.settings),
      };
    case "Checkbox":
      return {
        ...common,
        type: "Checkbox",
        settings: wrapSettings<CheckboxSettings>({}, f.settings),
      };
    case "Radio":
      return { ...common, type: "Radio", settings: wrapSettings<RadioSettings>({}, f.settings) };
    case "Progress":
      return {
        ...common,
        type: "Progress",
        settings: wrapSettings<ProgressSettings>({}, f.settings),
      };
    case "List":
      return { ...common, type: "List", settings: wrapSettings({}, f.settings), elements: children };
    case "Select":
      return {
        ...common,
        type: "Select",
        settings: wrapSettings<SelectSettings>({}, f.settings),
        elements: children,
      };
    case "Form":
      return {
        ...common,
        type: "Form",
        settings: wrapSettings<FormSettings>({}, f.settings),
        elements: children,
      };
    case "Table":
      return {
        ...common,
        type: "Table",
        settings: wrapSettings<TableSettings>({}, f.settings),
        elements: children,
      };
    case "Frame":
      return { ...common, type: "Frame", settings: wrapSettings({}, f.settings), elements: children };
    case "Section":
      return {
        ...common,
        type: "Section",
        settings: wrapSettings({}, f.settings),
        elements: children,
      };
    case "Nav":
      return { ...common, type: "Nav", settings: wrapSettings({}, f.settings), elements: children };
    case "Header":
      return {
        ...common,
        type: "Header",
        settings: wrapSettings({}, f.settings),
        elements: children,
      };
    case "Footer":
      return {
        ...common,
        type: "Footer",
        settings: wrapSettings({}, f.settings),
        elements: children,
      };
    case "Article":
      return {
        ...common,
        type: "Article",
        settings: wrapSettings({}, f.settings),
        elements: children,
      };
    case "Aside":
      return { ...common, type: "Aside", settings: wrapSettings({}, f.settings), elements: children };
    case "CMSContentList":
      return {
        ...common,
        type: "CMSContentList",
        settings: wrapSettings<CMSContentSettings>({}, f.settings),
        elements: children,
      };
    case "CMSContentItem":
      return {
        ...common,
        type: "CMSContentItem",
        settings: wrapSettings<CMSContentSettings>({}, f.settings),
        elements: children,
      };
    case "CMSContentGrid":
      return {
        ...common,
        type: "CMSContentGrid",
        settings: wrapSettings<CMSContentSettings>({}, f.settings),
        elements: children,
      };
    case "Carousel":
      return {
        ...common,
        type: "Carousel",
        settings: wrapSettings<CarouselSettings>({}, f.settings),
        elements: children,
      };
  }
}

const ICON_CANDIDATES: readonly ElementType[] = ["Icon"];

const TEXT_OVERRIDE_TYPES: ReadonlySet<ElementType> = new Set([
  "Text",
  "Span",
  "Heading",
  "Label",
  "Blockquote",
  "Code",
  "Link",
  "Button",
]);

function matchSinglePropTextChild(
  node: t.JSXElement,
  slots: ComponentPropSlots | undefined,
): ParamPropInfo | null {
  if (!slots) return null;
  let exprMatch: ParamPropInfo | null = null;
  for (const child of node.children) {
    if (t.isJSXText(child)) {
      if (child.value.trim() !== "") return null;
      continue;
    }
    if (t.isJSXElement(child)) continue;
    if (t.isJSXExpressionContainer(child)) {
      if (t.isJSXEmptyExpression(child.expression)) continue;
      if (exprMatch) return null;
      const matched = matchPropExpression(child.expression, slots);
      if (!matched) return null;
      exprMatch = matched;
      continue;
    }
    return null;
  }
  return exprMatch;
}

function matchPropAttr(
  attr: t.JSXAttribute | undefined,
  slots: ComponentPropSlots | undefined,
): ParamPropInfo | null {
  if (!slots || !attr || !t.isJSXExpressionContainer(attr.value)) return null;
  if (t.isJSXEmptyExpression(attr.value.expression)) return null;
  return matchPropExpression(attr.value.expression, slots);
}

function recordPropSlotBinding(
  slots: ComponentPropSlots | undefined,
  info: ParamPropInfo,
  nodeId: string,
  field: "text" | "src" | "alt" | "href",
): void {
  if (!slots || slots.bindings.has(info.propName)) return;
  slots.bindings.set(info.propName, {
    nodeId,
    field,
    defaultValue: info.defaultValue,
  });
}

/** Returns a cloned `EditorElement` with `settings` transformed by `updater`. */
export function updateElementSettings(
  el: EditorElement,
  updater: (prev: LooseRecord | null) => LooseRecord | null,
): EditorElement {
  const prevSettings = isPlainRecord(el.settings) ? el.settings : null;
  const nextSettings = updater(prevSettings);
  return instantiateElement(el.type, {
    id: el.id,
    pageId: el.pageId,
    parentId: el.parentId,
    content: el.content,
    name: el.name,
    styles: el.styles ?? {},
    tailwindStyles: el.tailwindStyles,
    hasTailwindKey: "tailwindStyles" in el,
    href: el.href,
    hasHrefKey: "href" in el,
    src: el.src,
    hasSrcKey: "src" in el,
    order: el.order,
    orderKey: el.orderKey,
    events: el.events,
    settings: nextSettings,
    elements: "elements" in el && Array.isArray(el.elements) ? el.elements : undefined,
  });
}

export function convertElement(
  node: t.JSXElement,
  parentId: string | undefined,
  ctx: ParseContext,
  codeVisible?: string,
): EditorElement {
  const tag = tagName(node);
  const lucideIconName = ctx.lucideImports?.get(tag);
  if (lucideIconName === undefined && !ctx.uiImports?.has(tag)) {
    const resolvedName = ctx.projectImportAliases?.get(tag) ?? tag;
    const catalogEntry =
      ctx.catalog?.byPascalName.get(tag) ??
      ctx.catalog?.byPascalName.get(resolvedName);
    if (catalogEntry) {
      const isPending = ctx.pendingComponentNames?.has(catalogEntry.pascalName) ?? false;
      return parseComponentInstance(node, catalogEntry, parentId, ctx, codeVisible, {
        isPending,
      });
    }
  }

  const candidates =
    lucideIconName !== undefined
      ? ICON_CANDIDATES
      : Object.hasOwn(TAG_CANDIDATES, tag)
        ? TAG_CANDIDATES[tag]
        : undefined;

  if (!candidates) {
    throw new CodeError(
      `<${tag}> can't be turned into an element yet. Supported tags: ${SUPPORTED_TAGS}.`,
      node.openingElement.name.loc ?? node.loc,
    );
  }

  assertAttributesScoped(node, boundSet(ctx), constsMap(ctx));
  const attrs = readAttributes(node);
  const consts = constsMap(ctx);
  const existing = claimExisting(attrs, candidates, ctx);
  const allowDynamicText = !NO_DYNAMIC_TEXT_TAGS.has(tag);
  const { text, elements: childNodes, codeText: initialCodeText, visibilityByElement } =
    splitChildren(node, splitOpts(ctx, allowDynamicText));

  if (existing && componentSetting(existing)) {
    return toComponentInstance(existing, parentId, childNodes, node);
  }

  const type = resolveElementType(
    tag,
    candidates,
    existing,
    attrs,
    childNodes,
    text,
    node,
    lucideIconName !== undefined,
    ctx,
  );
  const pageId = existing ? existing.pageId : ctx.pageId;
  if (!pageId) {
    throw new CodeError("There's no active page to add elements to.", node.loc);
  }

  const id = existing ? existing.id : newEntityId();
  const dynamicClassName = isDynamicBoundAttr(attrs.get("className"), consts);
  const written = dynamicClassName
    ? []
    : splitClasses(stringAttributeValue(attrs, "className", true, consts) ?? "");
  const tailwindStyles = dynamicClassName ? existing?.tailwindStyles : ownClasses(written, existing);
  const hasTailwindKey = tailwindStyles !== undefined || Boolean(existing);

  let content = existing?.content ?? "";
  let codeText = initialCodeText;
  let src = existing?.src;
  let hasSrcKey = Boolean(existing && "src" in existing);
  let href = existing?.href;
  let hasHrefKey = Boolean(existing && "href" in existing);
  const skipCodePropAttrs = new Set<string>();

  if (tag === "img") {
    const altSlot = matchPropAttr(attrs.get("alt"), ctx.componentPropSlots);
    if (altSlot) {
      content = altSlot.defaultValue;
      skipCodePropAttrs.add("alt");
      recordPropSlotBinding(ctx.componentPropSlots, altSlot, id, "alt");
    } else {
      content = isDynamicBoundAttr(attrs.get("alt"), consts)
        ? (existing?.content ?? "")
        : (stringAttributeValue(attrs, "alt", true, consts) ?? "");
    }
    const srcSlot = matchPropAttr(attrs.get("src"), ctx.componentPropSlots);
    if (srcSlot) {
      src = srcSlot.defaultValue;
      skipCodePropAttrs.add("src");
      recordPropSlotBinding(ctx.componentPropSlots, srcSlot, id, "src");
    } else {
      src = isDynamicBoundAttr(attrs.get("src"), consts)
        ? (existing?.src ?? "")
        : stringAttribute(attrs, "src", existing?.src, consts);
    }
    hasSrcKey = true;
    codeText = undefined;
  } else if (tag === "video" || tag === "audio") {
    let mediaSrc = isDynamicBoundAttr(attrs.get("src"), consts)
      ? (existing?.src ?? "")
      : stringAttribute(attrs, "src", existing?.src, consts);
    if (!mediaSrc && childNodes.length > 0) {
      const sourceChild = childNodes.find((c) => isTag(c, "source"));
      if (sourceChild) {
        assertAttributesScoped(sourceChild, boundSet(ctx), constsMap(ctx));
        const sourceAttrs = readAttributes(sourceChild);
        if (!isDynamicBoundAttr(sourceAttrs.get("src"), consts)) {
          mediaSrc = stringAttributeValue(sourceAttrs, "src", true, consts) ?? mediaSrc;
        }
      }
    }
    src = mediaSrc;
    hasSrcKey = true;
    codeText = undefined;
  } else if (tag === "iframe") {
    src = isDynamicBoundAttr(attrs.get("src"), consts)
      ? (existing?.src ?? "")
      : stringAttribute(attrs, "src", existing?.src, consts);
    hasSrcKey = true;
    codeText = undefined;
  } else if (type === "Code" && tag === "pre" && childNodes.length === 1) {
    const textSlot = matchSinglePropTextChild(childNodes[0]!, ctx.componentPropSlots);
    if (textSlot) {
      content = textSlot.defaultValue;
      codeText = undefined;
      recordPropSlotBinding(ctx.componentPropSlots, textSlot, id, "text");
    } else {
      const preInner = splitChildren(childNodes[0]!, splitOpts(ctx, true));
      content = preInner.text;
      codeText = preInner.codeText;
    }
  } else if (tag !== "select" && tag !== "table") {
    const textSlot = TEXT_OVERRIDE_TYPES.has(type)
      ? matchSinglePropTextChild(node, ctx.componentPropSlots)
      : null;
    if (textSlot) {
      content = textSlot.defaultValue;
      codeText = undefined;
      recordPropSlotBinding(ctx.componentPropSlots, textSlot, id, "text");
    } else {
      content = text;
    }
  }

  if (tag === "a") {
    const hrefSlot = matchPropAttr(attrs.get("href"), ctx.componentPropSlots);
    if (hrefSlot) {
      href = hrefSlot.defaultValue;
      skipCodePropAttrs.add("href");
      recordPropSlotBinding(ctx.componentPropSlots, hrefSlot, id, "href");
    } else {
      href = isDynamicBoundAttr(attrs.get("href"), consts)
        ? (existing?.href ?? "")
        : stringAttribute(attrs, "href", existing?.href, consts);
    }
    hasHrefKey = true;
  } else if (tag === "button" && (attrs.has("data-href") || existing?.href !== undefined)) {
    const hrefSlot = matchPropAttr(attrs.get("data-href"), ctx.componentPropSlots);
    if (hrefSlot) {
      href = hrefSlot.defaultValue;
      skipCodePropAttrs.add("data-href");
      recordPropSlotBinding(ctx.componentPropSlots, hrefSlot, id, "href");
    } else {
      href = isDynamicBoundAttr(attrs.get("data-href"), consts)
        ? (existing?.href ?? "")
        : stringAttribute(attrs, "data-href", existing?.href, consts);
    }
    hasHrefKey = true;
  }

  let settings: LooseRecord | null;
  let elements: EditorElement[] | undefined;

  if (type === "Table") {
    const tableParsed = parseTableStructure(node, pageId, id, attrs, existing, ctx, codeVisible);
    settings = tableParsed.settings;
    elements = tableParsed.elements;
  } else {
    settings = resolveSettings(
      node,
      type,
      tag,
      attrs,
      existing,
      lucideIconName,
      codeText,
      codeVisible,
      consts,
      skipCodePropAttrs.size > 0 ? skipCodePropAttrs : undefined,
    );
    if (tag === "select") {
      elements = convertOptions(node, existing, id, ctx);
    } else if (!LEAF_TYPES.has(type)) {
      const children = convertChildren(
        node,
        tag,
        id,
        ctx,
        childNodes,
        visibilityByElement,
        text,
      );
      elements = existing ? keepUnsupported(children, childrenOf(existing)) : children;
    }
  }

  return instantiateElement(type, {
    id,
    pageId,
    parentId,
    content,
    name: existing?.name,
    styles: existing?.styles ?? {},
    tailwindStyles,
    hasTailwindKey,
    href,
    hasHrefKey,
    src,
    hasSrcKey,
    order: existing?.order,
    orderKey: existing?.orderKey,
    events: existing?.events,
    settings,
    elements,
  });
}

export { EMPTY_COMPONENT_CATALOG };
