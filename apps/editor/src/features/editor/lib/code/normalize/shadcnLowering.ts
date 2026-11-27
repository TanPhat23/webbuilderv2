import * as t from "@babel/types";
import { attributeName, attributeValue, unparen } from "../astLiterals";
import { collectPatternNames, evaluateStaticExpression, type StaticValue } from "./staticScope";

interface ShadcnTagSpec {
  readonly htmlTag: string;
  readonly baseClasses: string;
  readonly variants?: Readonly<Record<string, string>>;
  readonly defaultVariant?: string;
  readonly sizes?: Readonly<Record<string, string>>;
  readonly defaultSize?: string;
  readonly orientations?: Readonly<Record<string, string>>;
  readonly defaultOrientation?: string;
  readonly consumedProps: ReadonlySet<string>;
  readonly defaultTypeAttr?: string;
}

const BUTTON_VARIANTS: Readonly<Record<string, string>> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
  outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const BUTTON_SIZES: Readonly<Record<string, string>> = {
  default: "h-9 px-4 py-2",
  xs: "h-6 gap-1 rounded-md px-2 text-xs",
  sm: "h-8 rounded-md gap-1.5 px-3",
  lg: "h-10 rounded-md px-6",
  icon: "size-9",
  "icon-xs": "size-6 rounded-md",
  "icon-sm": "size-8",
  "icon-lg": "size-10",
};

const BADGE_VARIANTS: Readonly<Record<string, string>> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-white",
  outline: "border-border text-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const ALERT_VARIANTS: Readonly<Record<string, string>> = {
  default: "bg-card text-card-foreground",
  destructive: "text-destructive bg-card",
};

const SEPARATOR_ORIENTATIONS: Readonly<Record<string, string>> = {
  horizontal: "h-px w-full",
  vertical: "h-full w-px",
};

const EMPTY_PROPS: ReadonlySet<string> = new Set();
const VARIANT_SIZE_PROPS: ReadonlySet<string> = new Set(["variant", "size"]);
const VARIANT_PROPS: ReadonlySet<string> = new Set(["variant"]);
const ORIENTATION_PROPS: ReadonlySet<string> = new Set(["orientation"]);

const SHADCN_SPECS: Readonly<Record<string, ShadcnTagSpec>> = {
  Button: {
    htmlTag: "button",
    baseClasses:
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none",
    variants: BUTTON_VARIANTS,
    defaultVariant: "default",
    sizes: BUTTON_SIZES,
    defaultSize: "default",
    consumedProps: VARIANT_SIZE_PROPS,
  },
  Card: {
    htmlTag: "div",
    baseClasses:
      "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
    consumedProps: EMPTY_PROPS,
  },
  CardHeader: {
    htmlTag: "div",
    baseClasses:
      "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6",
    consumedProps: EMPTY_PROPS,
  },
  CardTitle: {
    htmlTag: "h3",
    baseClasses: "leading-none font-semibold",
    consumedProps: EMPTY_PROPS,
  },
  CardDescription: {
    htmlTag: "p",
    baseClasses: "text-muted-foreground text-sm",
    consumedProps: EMPTY_PROPS,
  },
  CardContent: {
    htmlTag: "div",
    baseClasses: "px-6",
    consumedProps: EMPTY_PROPS,
  },
  CardFooter: {
    htmlTag: "div",
    baseClasses: "flex items-center px-6",
    consumedProps: EMPTY_PROPS,
  },
  Badge: {
    htmlTag: "span",
    baseClasses:
      "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 overflow-hidden",
    variants: BADGE_VARIANTS,
    defaultVariant: "default",
    consumedProps: VARIANT_PROPS,
  },
  Alert: {
    htmlTag: "div",
    baseClasses:
      "relative w-full rounded-lg border px-4 py-3 text-sm grid gap-0.5 items-start",
    variants: ALERT_VARIANTS,
    defaultVariant: "default",
    consumedProps: VARIANT_PROPS,
  },
  AlertTitle: {
    htmlTag: "h5",
    baseClasses: "font-medium tracking-tight leading-none",
    consumedProps: EMPTY_PROPS,
  },
  AlertDescription: {
    htmlTag: "p",
    baseClasses: "text-muted-foreground text-sm",
    consumedProps: EMPTY_PROPS,
  },
  Separator: {
    htmlTag: "hr",
    baseClasses: "bg-border shrink-0",
    orientations: SEPARATOR_ORIENTATIONS,
    defaultOrientation: "horizontal",
    consumedProps: ORIENTATION_PROPS,
  },
  Input: {
    htmlTag: "input",
    baseClasses:
      "border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm",
    consumedProps: EMPTY_PROPS,
  },
  Textarea: {
    htmlTag: "textarea",
    baseClasses:
      "border-input min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none md:text-sm",
    consumedProps: EMPTY_PROPS,
  },
  Label: {
    htmlTag: "label",
    baseClasses:
      "flex items-center gap-2 text-sm leading-none font-medium select-none",
    consumedProps: EMPTY_PROPS,
  },
  Checkbox: {
    htmlTag: "input",
    baseClasses:
      "border-input size-4 shrink-0 rounded-[4px] border shadow-xs outline-none",
    consumedProps: EMPTY_PROPS,
    defaultTypeAttr: "checkbox",
  },
  Progress: {
    htmlTag: "progress",
    baseClasses:
      "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
    consumedProps: EMPTY_PROPS,
  },
  Table: {
    htmlTag: "table",
    baseClasses: "w-full caption-bottom text-sm",
    consumedProps: EMPTY_PROPS,
  },
  TableHeader: {
    htmlTag: "thead",
    baseClasses: "[&_tr]:border-b",
    consumedProps: EMPTY_PROPS,
  },
  TableBody: {
    htmlTag: "tbody",
    baseClasses: "[&_tr:last-child]:border-0",
    consumedProps: EMPTY_PROPS,
  },
  TableRow: {
    htmlTag: "tr",
    baseClasses: "hover:bg-muted/50 border-b transition-colors",
    consumedProps: EMPTY_PROPS,
  },
  TableHead: {
    htmlTag: "th",
    baseClasses:
      "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap",
    consumedProps: EMPTY_PROPS,
  },
  TableCell: {
    htmlTag: "td",
    baseClasses: "p-2 align-middle whitespace-nowrap",
    consumedProps: EMPTY_PROPS,
  },
  TableCaption: {
    htmlTag: "caption",
    baseClasses: "text-muted-foreground mt-4 text-sm",
    consumedProps: EMPTY_PROPS,
  },
};

export const SHADCN_UI_TAG_NAMES: ReadonlySet<string> = new Set(Object.keys(SHADCN_SPECS));

function isKnownShadcnTag(name: string): boolean {
  return Object.hasOwn(SHADCN_SPECS, name);
}

function collectBodyDeclarations(fn: t.Node | null | undefined, target: Set<string>): void {
  if (
    !fn ||
    (!t.isFunctionDeclaration(fn) &&
      !t.isFunctionExpression(fn) &&
      !t.isArrowFunctionExpression(fn))
  ) {
    return;
  }
  if (!t.isBlockStatement(fn.body)) return;
  for (const bodyStmt of fn.body.body) {
    if (t.isVariableDeclaration(bodyStmt)) {
      for (const decl of bodyStmt.declarations) {
        collectPatternNames(decl.id, target);
      }
    } else if (
      (t.isFunctionDeclaration(bodyStmt) ||
        t.isClassDeclaration(bodyStmt) ||
        t.isTSEnumDeclaration(bodyStmt)) &&
      bodyStmt.id
    ) {
      target.add(bodyStmt.id.name);
    }
  }
}

function collectLocalDeclarations(stmt: t.Statement, target: Set<string>): void {
  const inner =
    t.isExportNamedDeclaration(stmt) && stmt.declaration ? stmt.declaration : stmt;

  if (t.isVariableDeclaration(inner)) {
    for (const decl of inner.declarations) {
      collectPatternNames(decl.id, target);
      collectBodyDeclarations(decl.init, target);
    }
    return;
  }
  if (
    (t.isFunctionDeclaration(inner) ||
      t.isClassDeclaration(inner) ||
      t.isTSEnumDeclaration(inner)) &&
    inner.id
  ) {
    target.add(inner.id.name);
    collectBodyDeclarations(inner, target);
  }
}

/**
 * Collects the set of shadcn/ui component tag names eligible for lowering in `program`,
 * excluding project components, `lucide-react` icons, non-`ui/` imports, locally declared
 * bindings, and `Carousel` (reserved for Stage 2's Carousel codec).
 */
export function collectShadcnBindings(
  program: t.Program,
  projectComponentImports: ReadonlySet<string>,
): ReadonlySet<string> {
  const blocked = new Set<string>(projectComponentImports);
  blocked.add("Carousel");

  const uiImported = new Set<string>();

  for (const stmt of program.body) {
    if (t.isImportDeclaration(stmt)) {
      if (stmt.importKind === "type") continue;
      const source = stmt.source.value;
      const isUiImport = source.startsWith("@/components/ui/");
      const isReact = source === "react";
      for (const spec of stmt.specifiers) {
        if (t.isImportSpecifier(spec) && spec.importKind === "type") continue;
        const localName = spec.local.name;
        if (isUiImport) {
          if (isKnownShadcnTag(localName)) {
            uiImported.add(localName);
          }
        } else if (!isReact) {
          blocked.add(localName);
        }
      }
      continue;
    }

    if (t.isExportDefaultDeclaration(stmt)) {
      const decl = stmt.declaration;
      if ((t.isFunctionDeclaration(decl) || t.isClassDeclaration(decl)) && decl.id) {
        blocked.add(decl.id.name);
      }
      collectBodyDeclarations(decl, blocked);
      continue;
    }

    collectLocalDeclarations(stmt, blocked);
  }

  const active = new Set<string>();
  for (const tag of SHADCN_UI_TAG_NAMES) {
    if (!blocked.has(tag)) {
      active.add(tag);
    }
  }
  for (const tag of uiImported) {
    if (!blocked.has(tag)) {
      active.add(tag);
    }
  }
  return active;
}

function readStaticStringProp(
  attrs: readonly (t.JSXAttribute | t.JSXSpreadAttribute)[],
  propName: string,
  consts: ReadonlyMap<string, StaticValue>,
): string | undefined {
  for (const attr of attrs) {
    if (!t.isJSXAttribute(attr) || attributeName(attr) !== propName) continue;
    const val = attributeValue(attr, consts);
    if (val.ok && typeof val.value === "string") return val.value;
  }
  return undefined;
}

function lookupVariantClass(
  map: Readonly<Record<string, string>> | undefined,
  key: string | undefined,
  fallbackKey: string | undefined,
): string {
  if (!map) return "";
  if (key && Object.hasOwn(map, key)) {
    return map[key] ?? "";
  }
  if (fallbackKey && Object.hasOwn(map, fallbackKey)) {
    return map[fallbackKey] ?? "";
  }
  return "";
}

function mergeClassString(parts: readonly (string | undefined)[]): string {
  return parts
    .flatMap((part) => (part ?? "").split(/\s+/))
    .filter(Boolean)
    .join(" ");
}

function buildClassNameAttribute(
  baseClassString: string,
  existingClassAttr: t.JSXAttribute | undefined,
  consts: ReadonlyMap<string, StaticValue>,
): t.JSXAttribute {
  const attrLoc = existingClassAttr?.loc ?? null;
  const makeAttr = (value: t.JSXAttribute["value"]): t.JSXAttribute => {
    const out = t.jsxAttribute(t.jsxIdentifier("className"), value);
    out.loc = attrLoc;
    return out;
  };

  if (!existingClassAttr || existingClassAttr.value === null || existingClassAttr.value === undefined) {
    return makeAttr(t.stringLiteral(baseClassString));
  }

  if (t.isStringLiteral(existingClassAttr.value)) {
    const merged = mergeClassString([baseClassString, existingClassAttr.value.value]);
    const lit = t.stringLiteral(merged);
    lit.loc = existingClassAttr.value.loc;
    return makeAttr(lit);
  }

  if (
    t.isJSXExpressionContainer(existingClassAttr.value) &&
    !t.isJSXEmptyExpression(existingClassAttr.value.expression)
  ) {
    const evaluated = evaluateStaticExpression(existingClassAttr.value.expression, consts);
    if (evaluated.ok && typeof evaluated.value === "string") {
      const merged = mergeClassString([baseClassString, evaluated.value]);
      const lit = t.stringLiteral(merged);
      lit.loc = existingClassAttr.value.loc;
      return makeAttr(lit);
    }
    const expr = unparen(existingClassAttr.value.expression);
    if (expr && t.isExpression(expr)) {
      const cnCall = t.callExpression(t.identifier("cn"), [
        t.stringLiteral(baseClassString),
        expr,
      ]);
      cnCall.loc = existingClassAttr.value.expression.loc;
      const container = t.jsxExpressionContainer(cnCall);
      container.loc = existingClassAttr.value.loc;
      return makeAttr(container);
    }
  }

  return makeAttr(t.stringLiteral(baseClassString));
}

/**
 * Lowers a matched shadcn/ui JSX element into its canonical HTML element with merged Tailwind classes
 * and consumed `variant`/`size`/`orientation` props stripped.
 */
export function lowerShadcnElement(
  node: t.JSXElement,
  activeShadcnTags: ReadonlySet<string>,
  consts: ReadonlyMap<string, StaticValue>,
): t.JSXElement {
  if (!t.isJSXIdentifier(node.openingElement.name)) return node;
  const tag = node.openingElement.name.name;
  if (!activeShadcnTags.has(tag) || !Object.hasOwn(SHADCN_SPECS, tag)) return node;
  const spec = SHADCN_SPECS[tag];
  if (!spec) return node;

  const rawAttrs = node.openingElement.attributes;
  const variantVal = spec.variants
    ? readStaticStringProp(rawAttrs, "variant", consts)
    : undefined;
  const sizeVal = spec.sizes
    ? readStaticStringProp(rawAttrs, "size", consts)
    : undefined;
  const orientationVal = spec.orientations
    ? readStaticStringProp(rawAttrs, "orientation", consts)
    : undefined;

  const baseClassString = mergeClassString([
    spec.baseClasses,
    lookupVariantClass(spec.variants, variantVal, spec.defaultVariant),
    lookupVariantClass(spec.sizes, sizeVal, spec.defaultSize),
    lookupVariantClass(spec.orientations, orientationVal, spec.defaultOrientation),
  ]);

  let existingClassAttr: t.JSXAttribute | undefined;
  let hasTypeAttr = false;
  const preservedAttrs: (t.JSXAttribute | t.JSXSpreadAttribute)[] = [];

  for (const attr of rawAttrs) {
    if (t.isJSXSpreadAttribute(attr)) {
      preservedAttrs.push(attr);
      continue;
    }
    const name = attributeName(attr);
    if (spec.consumedProps.has(name)) continue;
    if (name === "className") {
      existingClassAttr = attr;
      continue;
    }
    if (name === "type") {
      hasTypeAttr = true;
    }
    preservedAttrs.push(attr);
  }

  const nextAttrs: (t.JSXAttribute | t.JSXSpreadAttribute)[] = [
    buildClassNameAttribute(baseClassString, existingClassAttr, consts),
  ];
  if (spec.defaultTypeAttr && !hasTypeAttr) {
    nextAttrs.push(t.jsxAttribute(t.jsxIdentifier("type"), t.stringLiteral(spec.defaultTypeAttr)));
  }
  nextAttrs.push(...preservedAttrs);

  const openId = t.jsxIdentifier(spec.htmlTag);
  openId.loc = node.openingElement.name.loc;
  const opening = t.jsxOpeningElement(openId, nextAttrs, node.openingElement.selfClosing);
  opening.loc = node.openingElement.loc;

  let closing: t.JSXClosingElement | null = null;
  if (node.closingElement) {
    const closeId = t.jsxIdentifier(spec.htmlTag);
    closeId.loc = node.closingElement.name.loc;
    closing = t.jsxClosingElement(closeId);
    closing.loc = node.closingElement.loc;
  }

  const lowered = t.jsxElement(opening, closing, node.children, node.openingElement.selfClosing);
  lowered.loc = node.loc;
  return lowered;
}
