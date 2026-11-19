/**
 * The reverse of the code generator: reads the edited `Generated.tsx` and
 * rebuilds the element tree from it.
 *
 * Elements are matched to the existing ones by `data-element-id`, so a
 * rename, move or reorder in the code keeps the element's styles, interactions
 * and name. Anything the code cannot express stays as it was. Code that cannot
 * be read becomes a diagnostic and never a partial change.
 *
 * Pure: no React, no store.
 */
import { parse } from "@babel/parser";
import { generate } from "@babel/generator";
import * as t from "@babel/types";
import { isEqual } from "lodash-es";
import type { EditorElement } from "@/types/global.type";
import { componentSetting } from "@/features/projects/lib/components";
import { newEntityId } from "@/lib/entity-id";
import { generateStrategies } from "./generatestrategies";
import { splitClasses, styleClasses } from "./classNames";
import { HIDDEN_SETTINGS, type Preamble } from "./customCode";
import { getAvailableComponentImports } from "./generateImports";

export interface CodeDiagnostic {
  message: string;
  /** 1-based, as Monaco expects. */
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

export type ParseCodeResult =
  | { ok: true; elements: EditorElement[]; preamble: Preamble }
  | { ok: false; diagnostic: CodeDiagnostic };

type Loose = Record<string, unknown>;
const loose = (el: EditorElement | undefined) => el as unknown as Loose | undefined;

/** HTML tag (or `Carousel`) to the element types it can stand for. */
const TAG_TYPES: Record<string, string[]> = {
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

/** Types whose settings the generator writes out as attributes. */
const SETTINGS_ATTRIBUTE_TYPES = new Set([
  "Input",
  "Select",
  "Form",
  "Carousel",
  "CMSContentList",
  "CMSContentItem",
  "CMSContentGrid",
]);

/** Types that cannot hold child elements. */
const LEAF_TYPES = new Set(["Text", "Button", "Image", "Input"]);

const SUPPORTED_TAGS = Object.keys(TAG_TYPES).join(", ");

class CodeError extends Error {
  constructor(
    message: string,
    readonly loc?: t.SourceLocation | null,
  ) {
    super(message);
  }
}

interface Context {
  byId: Map<string, EditorElement>;
  pageId: string | undefined;
  /** Existing ids already claimed, so a pasted copy gets a new element. */
  claimed: Set<string>;
}

const childrenOf = (el: EditorElement): EditorElement[] => {
  const kids = loose(el)?.elements;
  return Array.isArray(kids) ? (kids as EditorElement[]) : [];
};

function indexById(tree: EditorElement[], into = new Map<string, EditorElement>()) {
  for (const el of tree) {
    into.set(el.id, el);
    indexById(childrenOf(el), into);
  }
  return into;
}

/** JSX whitespace rules: lines are trimmed and joined with single spaces. */
function cleanJsxText(value: string): string {
  const lines = value.split(/\r\n|\n|\r/);
  let lastNonEmpty = -1;
  lines.forEach((line, i) => {
    if (/[^ \t]/.test(line)) lastNonEmpty = i;
  });
  let out = "";
  lines.forEach((raw, i) => {
    let line = raw.replace(/\t/g, " ");
    if (i !== 0) line = line.replace(/^ +/, "");
    if (i !== lines.length - 1) line = line.replace(/ +$/, "");
    if (line) out += i === lastNonEmpty ? line : `${line} `;
  });
  return out;
}

type Literal = { ok: true; value: unknown } | { ok: false };

/** The value of a literal expression; anything computed is not a literal. */
function literalValue(node: t.Node): Literal {
  if (t.isStringLiteral(node) || t.isNumericLiteral(node) || t.isBooleanLiteral(node)) {
    return { ok: true, value: node.value };
  }
  if (t.isNullLiteral(node)) return { ok: true, value: null };
  if (t.isIdentifier(node, { name: "undefined" })) return { ok: true, value: undefined };
  if (t.isTemplateLiteral(node) && node.expressions.length === 0) {
    return { ok: true, value: node.quasis.map((q) => q.value.cooked ?? "").join("") };
  }
  if (t.isUnaryExpression(node) && (node.operator === "-" || node.operator === "+")) {
    const inner = literalValue(node.argument);
    if (inner.ok && typeof inner.value === "number") {
      return { ok: true, value: node.operator === "-" ? -inner.value : inner.value };
    }
    return { ok: false };
  }
  if (t.isArrayExpression(node)) {
    const out: unknown[] = [];
    for (const item of node.elements) {
      if (!item || t.isSpreadElement(item)) return { ok: false };
      const v = literalValue(item);
      if (!v.ok) return v;
      out.push(v.value);
    }
    return { ok: true, value: out };
  }
  if (t.isObjectExpression(node)) {
    const out: Loose = {};
    for (const prop of node.properties) {
      if (!t.isObjectProperty(prop) || prop.computed) return { ok: false };
      const key = t.isIdentifier(prop.key)
        ? prop.key.name
        : t.isStringLiteral(prop.key) || t.isNumericLiteral(prop.key)
          ? String(prop.key.value)
          : null;
      if (key === null) return { ok: false };
      const v = literalValue(prop.value);
      if (!v.ok) return v;
      out[key] = v.value;
    }
    return { ok: true, value: out };
  }
  return { ok: false };
}

/** An attribute's value: a string, a literal expression, or `true` when bare. */
function attributeValue(attr: t.JSXAttribute): Literal {
  const value = attr.value;
  if (value === null || value === undefined) return { ok: true, value: true };
  if (t.isStringLiteral(value)) return { ok: true, value: value.value };
  if (t.isJSXExpressionContainer(value) && !t.isJSXEmptyExpression(value.expression)) {
    return literalValue(value.expression);
  }
  return { ok: false };
}

const attributeName = (attr: t.JSXAttribute): string =>
  t.isJSXIdentifier(attr.name) ? attr.name.name : `${attr.name.namespace.name}:${attr.name.name.name}`;

const tagName = (node: t.JSXElement): string => {
  const name = node.openingElement.name;
  if (!t.isJSXIdentifier(name)) {
    throw new CodeError("Only plain tags are supported here.", node.loc);
  }
  return name.name;
};

const isTag = (node: t.Node, name: string): boolean =>
  t.isJSXElement(node) && t.isJSXIdentifier(node.openingElement.name, { name });

/** Text and element children of a JSX element, in order. */
function splitChildren(node: t.JSXElement) {
  const text: string[] = [];
  const elements: t.JSXElement[] = [];
  for (const child of node.children) {
    if (t.isJSXText(child)) {
      text.push(cleanJsxText(child.value));
    } else if (t.isJSXElement(child)) {
      elements.push(child);
    } else if (t.isJSXExpressionContainer(child) && !t.isJSXEmptyExpression(child.expression)) {
      const v = literalValue(child.expression);
      if (v.ok && (typeof v.value === "string" || typeof v.value === "number")) {
        text.push(String(v.value));
      }
    }
  }
  return { text: text.join(""), elements };
}

/** The element's own `tailwindStyles`: the written classes minus those its styles already produce. */
function ownClasses(written: string[], existing: EditorElement | undefined): string | undefined {
  const derived = new Set(existing ? styleClasses(existing) : []);
  const own = written.filter((cls) => !derived.has(cls));
  const before = existing?.tailwindStyles;
  if (isEqual(own, splitClasses(before))) return before;
  return own.join(" ");
}

function settingsFromAttributes(
  attrs: Map<string, t.JSXAttribute>,
  existing: EditorElement | undefined,
): Loose | null | undefined {
  const before = (loose(existing)?.settings ?? null) as Loose | null;
  const next: Loose = {};
  for (const key of HIDDEN_SETTINGS) {
    if (before && key in before) next[key] = before[key];
  }
  for (const [name, attr] of attrs) {
    if (name === "className" || name === "data-element-id" || name === "component") continue;
    const v = attributeValue(attr);
    if (v.ok && v.value !== undefined) next[name] = v.value;
  }
  const plainBefore = before ? (JSON.parse(JSON.stringify(before)) as Loose) : {};
  if (isEqual(plainBefore, next)) return before;
  return next;
}

function convertElement(node: t.JSXElement, parentId: string | undefined, ctx: Context): EditorElement {
  const tag = tagName(node);
  const candidates = TAG_TYPES[tag];
  if (!candidates) {
    throw new CodeError(
      `<${tag}> can't be turned into an element yet. Supported tags: ${SUPPORTED_TAGS}.`,
      node.openingElement.name.loc ?? node.loc,
    );
  }

  const attrs = new Map<string, t.JSXAttribute>();
  for (const attr of node.openingElement.attributes) {
    if (!t.isJSXSpreadAttribute(attr)) attrs.set(attributeName(attr), attr);
  }

  const idValue = attrs.get("data-element-id") ? attributeValue(attrs.get("data-element-id")!) : undefined;
  const wantedId = idValue?.ok && typeof idValue.value === "string" ? idValue.value : undefined;
  const found = wantedId ? ctx.byId.get(wantedId) : undefined;
  const existing = found && candidates.includes(found.type) && !ctx.claimed.has(found.id) ? found : undefined;
  if (existing) ctx.claimed.add(existing.id);

  const { text, elements: childNodes } = splitChildren(node);
  if (existing && componentSetting(existing)) {
    if (childNodes.length) throw new CodeError("Edit the component master to change its children.", childNodes[0].loc ?? node.loc);
    const { elements: _children, ...instance } = existing as EditorElement & { elements?: EditorElement[] };
    return { ...instance, parentId } as EditorElement;
  }

  let type: string = existing?.type ?? (tag === "div" && !childNodes.length && text ? "Text" : candidates[0]);
  // A text box that now contains elements is a frame.
  if (type === "Text" && childNodes.length) type = "Frame";
  if (LEAF_TYPES.has(type) && childNodes.length) {
    throw new CodeError(`<${tag}> (${type}) can't contain other elements.`, childNodes[0].loc ?? node.loc);
  }

  if (!existing && !ctx.pageId) {
    throw new CodeError("There's no active page to add elements to.", node.loc);
  }
  const base: Loose = existing
    ? { ...(existing as unknown as Loose) }
    : { id: newEntityId(), pageId: ctx.pageId, content: "", styles: {}, settings: null };
  const id = base.id as string;

  const classAttr = attrs.get("className");
  const classValue = classAttr ? attributeValue(classAttr) : undefined;
  const written = splitClasses(classValue?.ok && typeof classValue.value === "string" ? classValue.value : "");
  const result: Loose = { ...base, type, parentId };
  const tailwindStyles = ownClasses(written, existing);
  if (tailwindStyles !== undefined || existing) result.tailwindStyles = tailwindStyles;

  if (tag === "img") {
    const alt = attrs.get("alt") ? attributeValue(attrs.get("alt")!) : undefined;
    const content = alt?.ok && typeof alt.value === "string" ? alt.value : "";
    if (content !== (existing?.content ?? "")) result.content = content;
    result.src = stringAttribute(attrs, "src", existing?.src);
  } else if (tag !== "select") {
    if (text !== (existing?.content ?? "")) result.content = text;
  }
  if (tag === "a") result.href = stringAttribute(attrs, "href", existing?.href);

  if (SETTINGS_ATTRIBUTE_TYPES.has(type)) {
    result.settings = settingsFromAttributes(attrs, existing);
  } else if (tag === "ol" || tag === "ul") {
    const settings = (result.settings ?? null) as Loose | null;
    if (tag === "ol" && !settings?.ordered) result.settings = { ...settings, ordered: true };
    else if (tag === "ul" && settings?.ordered) result.settings = { ...settings, ordered: false };
  }

  result.settings = withCustomProps(result.settings as Loose | null | undefined, node, type, tag, attrs);

  if (tag === "select") {
    result.elements = convertOptions(node, existing, id, ctx);
  } else if (!LEAF_TYPES.has(type)) {
    result.elements = withUnsupportedKept(convertChildren(node, id, ctx), existing);
  }
  return result as unknown as EditorElement;
}

/** Attributes the element model carries itself; anything else is the user's own code. */
const MODELED_ATTRIBUTES: Record<string, string[]> = { img: ["src", "alt"], a: ["href"] };

/**
 * Props the model can't express (spreads, handlers, other expressions) are
 * kept as source text in `settings.codeProps`. A form given an `onSubmit` owns
 * its submit, so generated interactions stop handling it.
 */
function withCustomProps(
  settings: Loose | null | undefined,
  node: t.JSXElement,
  type: string,
  tag: string,
  attrs: Map<string, t.JSXAttribute>,
): Loose | null {
  const modeled = new Set(["className", "data-element-id", ...(MODELED_ATTRIBUTES[tag] ?? [])]);
  const props: string[] = [];
  for (const attr of node.openingElement.attributes) {
    if (t.isJSXAttribute(attr)) {
      if (modeled.has(attributeName(attr))) continue;
      // A literal on a type that keeps its settings as attributes is a setting.
      if (SETTINGS_ATTRIBUTE_TYPES.has(type) && attributeValue(attr).ok) continue;
    }
    props.push(generate(attr).code);
  }

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
  return next && !before && !Object.keys(next).length ? before : next;
}

/** A string attribute, `""` when it was removed, `undefined` when there never was one. */
function stringAttribute(attrs: Map<string, t.JSXAttribute>, name: string, before: string | undefined) {
  const attr = attrs.get(name);
  const v = attr ? attributeValue(attr) : undefined;
  if (v?.ok && typeof v.value === "string") return v.value;
  return before ? "" : before;
}

/** Child elements, unwrapping the `<li>` of lists and the slide `<div>` of carousels. */
function convertChildren(node: t.JSXElement, parentId: string, ctx: Context): EditorElement[] {
  const tag = tagName(node);
  const out: EditorElement[] = [];
  for (const child of node.children) {
    if (!t.isJSXElement(child)) continue;
    if (tag === "ul" || tag === "ol") {
      if (!isTag(child, "li")) throw new CodeError(`<${tagName(child)}> can't be a direct child of a list; use <li>.`, child.loc);
      for (const inner of splitChildren(child).elements) out.push(convertElement(inner, parentId, ctx));
    } else if (tag === "Carousel") {
      if (!isTag(child, "div")) throw new CodeError("A carousel's children must be slide <div>s.", child.loc);
      for (const inner of splitChildren(child).elements) out.push(convertElement(inner, parentId, ctx));
    } else {
      out.push(convertElement(child, parentId, ctx));
    }
  }
  return out;
}

/** `<option>`s, matched to the select's existing options by position. */
function convertOptions(
  node: t.JSXElement,
  existing: EditorElement | undefined,
  parentId: string,
  ctx: Context,
): EditorElement[] {
  const before = existing ? childrenOf(existing) : [];
  const out: EditorElement[] = [];
  splitChildren(node).elements.forEach((option, i) => {
    if (!isTag(option, "option")) throw new CodeError(`<${tagName(option)}> can't be inside a <select>; use <option>.`, option.loc);
    const { text } = splitChildren(option);
    const valueAttr = option.openingElement.attributes.find(
      (a): a is t.JSXAttribute => t.isJSXAttribute(a) && attributeName(a) === "value",
    );
    const v = valueAttr ? attributeValue(valueAttr) : undefined;
    const old = before[i];
    // The code carries the option twice (value and label); whichever was edited wins.
    const value = v?.ok && typeof v.value === "string" ? v.value : undefined;
    const content = value === undefined || (text !== "" && text !== (old?.content ?? "") && value === (old?.content ?? "")) ? text : value;
    if (old) {
      out.push(old.content === content ? old : ({ ...old, parentId, content } as EditorElement));
    } else {
      if (!ctx.pageId) throw new CodeError("There's no active page to add elements to.", option.loc);
      const sibling = before[0] as unknown as Loose | undefined;
      out.push({
        id: newEntityId(),
        type: (sibling?.type as string) ?? "Text",
        pageId: ctx.pageId,
        parentId,
        content,
        styles: {},
        settings: null,
      } as unknown as EditorElement);
    }
  });
  return out;
}

/**
 * Elements of a type the code view can't show were never in the code, so
 * editing it must not delete them: they go back where they were.
 */
function withUnsupportedKept(next: EditorElement[], parent: EditorElement | undefined): EditorElement[] {
  if (!parent) return next;
  return keepUnsupported(next, childrenOf(parent));
}

function keepUnsupported(next: EditorElement[], before: EditorElement[]): EditorElement[] {
  const out = [...next];
  before.forEach((el, i) => {
    if (generateStrategies[el.type]) return;
    out.splice(Math.min(i, out.length), 0, el);
  });
  return out;
}

function firstJsx(node: unknown): t.JSXElement | t.JSXFragment | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = firstJsx(item);
      if (found) return found;
    }
    return null;
  }
  const n = node as t.Node;
  if (t.isJSXElement(n) || t.isJSXFragment(n)) return n;
  if (t.isImportDeclaration(n)) return null;
  for (const key of t.VISITOR_KEYS[n.type] ?? []) {
    const found = firstJsx((n as unknown as Loose)[key]);
    if (found) return found;
  }
  return null;
}

type Fn = t.ArrowFunctionExpression | t.FunctionExpression | t.FunctionDeclaration;

const unparen = (node: t.Node | null | undefined): t.Node | null | undefined =>
  t.isParenthesizedExpression(node) ? unparen(node.expression) : node;

/** The function a top-level statement declares, when it is a component-shaped one. */
function functionOf(statement: t.Statement): { name: string; fn: Fn } | null {
  if (t.isFunctionDeclaration(statement) && statement.id) return { name: statement.id.name, fn: statement };
  if (t.isVariableDeclaration(statement)) {
    for (const d of statement.declarations) {
      const init = d.init;
      if (t.isIdentifier(d.id) && (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init))) {
        return { name: d.id.name, fn: init };
      }
    }
  }
  return null;
}

/** The JSX a function returns, and the return statement that holds it. */
function returnedJsx(fn: Fn): { root: t.JSXElement | t.JSXFragment; ret: t.ReturnStatement | null } | null {
  if (!t.isBlockStatement(fn.body)) {
    const expr = unparen(fn.body);
    return expr && (t.isJSXElement(expr) || t.isJSXFragment(expr)) ? { root: expr, ret: null } : null;
  }
  for (const statement of fn.body.body) {
    if (!t.isReturnStatement(statement)) continue;
    const expr = unparen(statement.argument);
    if (expr && (t.isJSXElement(expr) || t.isJSXFragment(expr))) return { root: expr, ret: statement };
  }
  return null;
}

interface Located {
  root: t.JSXElement | t.JSXFragment;
  /** The top-level statement holding the component. */
  statement: t.Statement;
  fn: Fn | null;
  ret: t.ReturnStatement | null;
}

/** The page component: the default export when it can be found, else the first JSX in the file. */
function locatePage(program: t.Program): Located | null {
  const exported = program.body.find(
    (s): s is t.ExportDefaultDeclaration => t.isExportDefaultDeclaration(s) && t.isIdentifier(s.declaration),
  );
  const name = exported && t.isIdentifier(exported.declaration) ? exported.declaration.name : undefined;
  for (const statement of program.body) {
    const target = t.isExportNamedDeclaration(statement) && statement.declaration ? statement.declaration : statement;
    const found = t.isStatement(target) ? functionOf(target) : null;
    if (!found || (name && found.name !== name)) continue;
    const jsx = returnedJsx(found.fn);
    if (jsx) return { root: jsx.root, statement, fn: found.fn, ret: jsx.ret };
  }
  const root = firstJsx(program.body);
  if (!root) return null;
  const statement = program.body.find((s) => (s.start ?? 0) <= (root.start ?? 0) && (s.end ?? 0) >= (root.end ?? 0));
  return statement ? { root, statement, fn: null, ret: null } : null;
}

const normalizeStatement = (source: string) =>
  source.replace(/\s+/g, "").replace(/"/g, "'").replace(/,}/g, "}").replace(/;$/, "");

let generatedImports: Set<string> | undefined;
/** Imports the generator writes itself, which are not the user's. */
function isGeneratedImport(source: string): boolean {
  generatedImports ??= new Set(
    [
      ...Object.values(getAvailableComponentImports()),
      "import React from 'react';",
      "import { bindInteractions } from './interactions';",
    ].map(normalizeStatement),
  );
  return generatedImports.has(normalizeStatement(source));
}

const GENERATED_EFFECT = normalizeStatement("React.useEffect(() => bindInteractions(), []);");

/** Code around the JSX that the generator did not write: the user's imports and hooks. */
function extractPreamble(code: string, program: t.Program, page: Located): Preamble {
  const slice = (n: t.Node, withComments = true) =>
    code.slice(withComments ? (n.leadingComments?.[0]?.start ?? n.start ?? 0) : (n.start ?? 0), n.end ?? 0);

  const imports: string[] = [];
  const top: string[] = [];
  for (const statement of program.body) {
    if (statement === page.statement) continue;
    if (t.isImportDeclaration(statement)) {
      const source = slice(statement, false);
      if (!isGeneratedImport(source)) imports.push(source);
    } else if (!(t.isExportDefaultDeclaration(statement) && t.isIdentifier(statement.declaration))) {
      top.push(slice(statement));
    }
  }

  const body: string[] = [];
  if (page.fn && t.isBlockStatement(page.fn.body)) {
    for (const statement of page.fn.body.body) {
      if (statement === page.ret) break;
      if (normalizeStatement(slice(statement, false)) === GENERATED_EFFECT) continue;
      body.push(slice(statement));
    }
  }
  return { imports: imports.join("\n"), top: top.join("\n\n"), body: body.join("\n\n") };
}

const diagnosticAt = (message: string, loc?: t.SourceLocation | null): CodeDiagnostic => ({
  message,
  line: loc?.start.line ?? 1,
  column: (loc?.start.column ?? 0) + 1,
  endLine: loc?.end.line ?? loc?.start.line ?? 1,
  endColumn: (loc?.end.column ?? loc?.start.column ?? 0) + 1,
});

/**
 * Rebuilds the element tree from edited code, using `current` to keep what the
 * code can't carry. `pageId` is the page new elements belong to.
 */
export function parseCode(code: string, current: EditorElement[], pageId: string | undefined): ParseCodeResult {
  let ast: t.File;
  try {
    ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  } catch (err) {
    const e = err as { message?: string; loc?: { line: number; column: number } };
    const message = (e.message ?? "Syntax error").replace(/\s*\(\d+:\d+\)$/, "");
    return {
      ok: false,
      diagnostic: diagnosticAt(message, e.loc && { start: e.loc, end: e.loc } as t.SourceLocation),
    };
  }

  const page = locatePage(ast.program);
  if (!page) {
    return { ok: false, diagnostic: diagnosticAt("No JSX found: the component should return the page's elements.") };
  }
  const root = page.root;

  const ctx: Context = { byId: indexById(current), pageId, claimed: new Set() };
  try {
    const rootNodes = t.isJSXFragment(root)
      ? root.children.filter((c): c is t.JSXElement => t.isJSXElement(c))
      : [root];
    const elements = rootNodes.map((node) => convertElement(node, undefined, ctx));
    return { ok: true, elements: keepUnsupported(elements, current), preamble: extractPreamble(code, ast.program, page) };
  } catch (err) {
    if (err instanceof CodeError) return { ok: false, diagnostic: diagnosticAt(err.message, err.loc) };
    throw err;
  }
}
