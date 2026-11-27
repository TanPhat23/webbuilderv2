import * as t from "@babel/types";
import type { ComponentOverrides } from "@webbuilder/site-runtime/projects/components";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import {
  attributeName,
  attributeValue,
  CodeError,
  unparen,
} from "../astLiterals";
import type { CatalogComponent, ComponentCatalog, ComponentPropBinding } from "../catalog";
import {
  extractComponentParamDefaults,
  toNullProtoPropBindings,
  type ComponentPropSlots,
  type ExtractedParamDefaults,
} from "../codecs/componentCodec";
import type { LocatedPage } from "../extractPreamble";
import { convertElement, updateElementSettings, type ParseContext } from "../parseElements";
import {
  analyzeModuleScope,
  collectPatternNames,
  evaluateStaticExpression,
  type ModuleScope,
  type StaticValue,
} from "./staticScope";
import { unrollStaticJsxRoot } from "./unrollStaticJsx";

export interface ExtractedComponentSpec {
  readonly name: string;
  readonly pascalName: string;
  readonly root: EditorElement;
  readonly propBindings: Readonly<Record<string, ComponentPropBinding>>;
}

export interface PendingComponentInstance {
  readonly instanceId: string;
  readonly pascalName: string;
  readonly overrides?: ComponentOverrides;
}

type ComponentFn =
  | t.ArrowFunctionExpression
  | t.FunctionExpression
  | t.FunctionDeclaration;

interface HelperDecl {
  readonly name: string;
  readonly fn: ComponentFn;
  readonly statement: t.Statement;
  readonly root: t.JSXElement;
}

interface NormalizedHelper {
  readonly decl: HelperDecl;
  readonly normalizedRoot: t.JSXElement;
  readonly paramDefaults: ExtractedParamDefaults;
  readonly hydratedSpec: ExtractedComponentSpec;
  readonly matchesExistingCatalog: boolean;
}

export interface LocalComponentsResult {
  readonly root: t.JSXElement | t.JSXFragment;
  readonly pendingComponentNames: readonly string[];
  readonly extractedComponents: readonly ExtractedComponentSpec[];
  readonly extraCatalogEntries: readonly CatalogComponent[];
  readonly pendingCatalogNames: ReadonlySet<string>;
  readonly omittedHelperStatements: ReadonlySet<t.Statement>;
}

const SKIP_VISITOR_KEYS: ReadonlySet<string> = new Set([
  "typeParameters",
  "typeAnnotation",
  "returnType",
  "typeArguments",
  "superTypeParameters",
  "superTypeArguments",
  "implements",
]);

function isAstNode(value: unknown): value is t.Node {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof value.type === "string"
  );
}

function isPascalCaseName(name: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function extractHelperBindings(
  stmt: t.Statement,
): Array<{ readonly name: string; readonly fn: ComponentFn }> {
  const inner =
    t.isExportNamedDeclaration(stmt) && stmt.declaration ? stmt.declaration : stmt;
  if (t.isFunctionDeclaration(inner) && inner.id) {
    return [{ name: inner.id.name, fn: inner }];
  }
  if (!t.isVariableDeclaration(inner)) return [];
  const out: Array<{ readonly name: string; readonly fn: ComponentFn }> = [];
  for (const decl of inner.declarations) {
    if (
      t.isIdentifier(decl.id) &&
      (t.isArrowFunctionExpression(decl.init) || t.isFunctionExpression(decl.init))
    ) {
      out.push({ name: decl.id.name, fn: decl.init });
    }
  }
  return out;
}

function returnedJsx(
  fn: ComponentFn,
): t.JSXElement | t.JSXFragment | null {
  if (!t.isBlockStatement(fn.body)) {
    const expr = unparen(fn.body);
    return expr && (t.isJSXElement(expr) || t.isJSXFragment(expr)) ? expr : null;
  }
  for (const stmt of fn.body.body) {
    if (!t.isReturnStatement(stmt)) continue;
    const expr = unparen(stmt.argument);
    if (expr && (t.isJSXElement(expr) || t.isJSXFragment(expr))) return expr;
  }
  return null;
}

function isHookCallee(callee: t.Expression | t.V8IntrinsicIdentifier): boolean {
  if (t.isIdentifier(callee)) {
    return /^use[A-Z0-9]/.test(callee.name);
  }
  if (
    t.isMemberExpression(callee) &&
    !callee.computed &&
    t.isIdentifier(callee.object, { name: "React" }) &&
    t.isIdentifier(callee.property)
  ) {
    return /^use[A-Z0-9]/.test(callee.property.name);
  }
  return false;
}

function findHookCallInNode(node: t.Node): t.CallExpression | null {
  if (t.isCallExpression(node) && isHookCallee(node.callee)) {
    return node;
  }
  const keys = t.VISITOR_KEYS[node.type] ?? [];
  for (const key of keys) {
    if (SKIP_VISITOR_KEYS.has(key)) continue;
    const child = Reflect.get(node, key);
    if (Array.isArray(child)) {
      for (const item of child) {
        if (isAstNode(item)) {
          const found = findHookCallInNode(item);
          if (found) return found;
        }
      }
    } else if (isAstNode(child)) {
      const found = findHookCallInNode(child);
      if (found) return found;
    }
  }
  return null;
}

function collectJsxTagsInNode(
  node: t.Node,
  into: Array<{ readonly name: string; readonly loc: t.SourceLocation | null | undefined }>,
): void {
  if (t.isJSXOpeningElement(node) && t.isJSXIdentifier(node.name)) {
    into.push({ name: node.name.name, loc: node.name.loc ?? node.loc });
  }
  const keys = t.VISITOR_KEYS[node.type] ?? [];
  for (const key of keys) {
    if (SKIP_VISITOR_KEYS.has(key)) continue;
    const child = Reflect.get(node, key);
    if (Array.isArray(child)) {
      for (const item of child) {
        if (isAstNode(item)) collectJsxTagsInNode(item, into);
      }
    } else if (isAstNode(child)) {
      collectJsxTagsInNode(child, into);
    }
  }
}

function sortHelpersAndCheckCycles(
  helpersByName: ReadonlyMap<string, HelperDecl>,
): HelperDecl[] {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const ordered: HelperDecl[] = [];

  const dfs = (name: string): void => {
    if (visited.has(name)) return;
    const helper = helpersByName.get(name);
    if (!helper) return;
    visiting.add(name);

    const tags: Array<{
      readonly name: string;
      readonly loc: t.SourceLocation | null | undefined;
    }> = [];
    collectJsxTagsInNode(helper.fn.body, tags);
    for (const tagRef of tags) {
      if (!helpersByName.has(tagRef.name)) continue;
      if (visiting.has(tagRef.name)) {
        throw new CodeError(
          `Recursive component '${tagRef.name}' is not supported.`,
          tagRef.loc ?? helper.fn.loc,
        );
      }
      dfs(tagRef.name);
    }

    visiting.delete(name);
    visited.add(name);
    ordered.push(helper);
  };

  for (const name of helpersByName.keys()) {
    dfs(name);
  }
  return ordered;
}

function childrenOfElement(el: EditorElement): readonly EditorElement[] {
  return "elements" in el && Array.isArray(el.elements) ? el.elements : [];
}

function sanitizedSettingsForComparison(settings: unknown): Record<string, unknown> {
  if (typeof settings !== "object" || settings === null || Array.isArray(settings)) {
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(settings)) {
    if (k === "componentProps" || v === undefined) continue;
    out[k] = v;
  }
  return out;
}

function areComponentTreesStructurallyEqual(a: EditorElement, b: EditorElement): boolean {
  if (a.type !== b.type) return false;
  if ((a.content ?? "") !== (b.content ?? "")) return false;
  if ((a.src ?? "") !== (b.src ?? "")) return false;
  if ((a.href ?? "") !== (b.href ?? "")) return false;
  if ((a.tailwindStyles ?? "") !== (b.tailwindStyles ?? "")) return false;
  if (
    JSON.stringify(sanitizedSettingsForComparison(a.settings)) !==
    JSON.stringify(sanitizedSettingsForComparison(b.settings))
  ) {
    return false;
  }
  const aKids = childrenOfElement(a);
  const bKids = childrenOfElement(b);
  if (aKids.length !== bKids.length) return false;
  return aKids.every((kid, idx) => areComponentTreesStructurallyEqual(kid, bKids[idx]!));
}

function hydrateHelperRoot(
  helper: HelperDecl,
  normalizedRoot: t.JSXElement,
  helperScope: ModuleScope,
  paramDefaults: ExtractedParamDefaults,
  lucideImports: ReadonlyMap<string, string>,
  catalog: ComponentCatalog,
  uiImports: ReadonlySet<string>,
  projectImportAliases: ReadonlyMap<string, string>,
): ExtractedComponentSpec {
  const slots: ComponentPropSlots = {
    paramsByLocalName: paramDefaults.paramsByLocalName,
    propsObjectName: paramDefaults.propsObjectName,
    bindings: new Map(),
  };

  const helperCtx: ParseContext = {
    byId: new Map(),
    pageId: "$pending",
    claimed: new Set(),
    lucideImports,
    catalog,
    uiImports,
    projectImportAliases,
    componentPropSlots: slots,
    boundIdentifiers: helperScope.boundIdentifiers,
    staticConsts: helperScope.staticConsts,
  };

  const convertedRoot = convertElement(normalizedRoot, undefined, helperCtx);
  const propBindings = toNullProtoPropBindings(slots.bindings);

  const rootWithProps =
    Object.keys(propBindings).length > 0
      ? updateElementSettings(convertedRoot, (prev) => ({
          ...(prev ?? {}),
          componentProps: propBindings,
        }))
      : convertedRoot;

  return {
    name: helper.name,
    pascalName: helper.name,
    root: rootWithProps,
    propBindings,
  };
}

function hasDisallowedCallChildren(node: t.JSXElement): t.Node | null {
  for (const child of node.children) {
    if (t.isJSXText(child) && child.value.trim() === "") continue;
    if (t.isJSXExpressionContainer(child) && t.isJSXEmptyExpression(child.expression)) {
      continue;
    }
    return child;
  }
  return null;
}

function buildCallSiteSubstitutions(
  callNode: t.JSXElement,
  paramDefaults: ExtractedParamDefaults,
  pageStaticConsts: ReadonlyMap<string, StaticValue>,
): {
  readonly byLocalName: ReadonlyMap<string, t.Expression>;
  readonly byPropName: ReadonlyMap<string, t.Expression>;
  readonly classAttr: t.JSXAttribute | undefined;
} {
  const providedByProp = new Map<string, t.Expression>();
  let classAttr: t.JSXAttribute | undefined;

  for (const attr of callNode.openingElement.attributes) {
    if (t.isJSXSpreadAttribute(attr)) continue;
    const name = attributeName(attr);
    if (name === "key" || name === "data-element-id") continue;
    if (name === "className") {
      classAttr = attr;
      continue;
    }
    const evaluated = attributeValue(attr, pageStaticConsts);
    if (evaluated.ok && typeof evaluated.value === "string") {
      providedByProp.set(name, t.stringLiteral(evaluated.value));
    } else if (evaluated.ok && typeof evaluated.value === "number") {
      providedByProp.set(
        name,
        evaluated.value < 0
          ? t.unaryExpression("-", t.numericLiteral(-evaluated.value))
          : t.numericLiteral(evaluated.value),
      );
    } else if (evaluated.ok && typeof evaluated.value === "boolean") {
      providedByProp.set(name, t.booleanLiteral(evaluated.value));
    } else if (
      t.isJSXExpressionContainer(attr.value) &&
      !t.isJSXEmptyExpression(attr.value.expression)
    ) {
      providedByProp.set(name, t.cloneNode(attr.value.expression, true, false));
    } else if (attr.value === null) {
      providedByProp.set(name, t.booleanLiteral(true));
    }
  }

  const byLocalName = new Map<string, t.Expression>();
  for (const [localName, info] of paramDefaults.paramsByLocalName) {
    const provided = providedByProp.get(info.propName);
    byLocalName.set(
      localName,
      provided ? t.cloneNode(provided, true, false) : t.stringLiteral(info.defaultValue),
    );
  }

  return { byLocalName, byPropName: providedByProp, classAttr };
}

function substituteExpressionProps(
  node: t.Node,
  subs: {
    readonly byLocalName: ReadonlyMap<string, t.Expression>;
    readonly byPropName: ReadonlyMap<string, t.Expression>;
    readonly propsObjectName: string | undefined;
  },
  shadowed: ReadonlySet<string>,
): t.Node {
  if (t.isIdentifier(node) && !shadowed.has(node.name)) {
    const replacement = subs.byLocalName.get(node.name);
    if (replacement) return t.cloneNode(replacement, true, false);
    return node;
  }

  if (
    subs.propsObjectName &&
    !shadowed.has(subs.propsObjectName) &&
    t.isMemberExpression(node) &&
    !node.computed &&
    t.isIdentifier(node.object, { name: subs.propsObjectName }) &&
    t.isIdentifier(node.property)
  ) {
    const replacement = subs.byPropName.get(node.property.name);
    return replacement ? t.cloneNode(replacement, true, false) : t.stringLiteral("");
  }

  if (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) {
    const nextObj = substituteExpressionProps(node.object, subs, shadowed);
    if (t.isExpression(nextObj)) node.object = nextObj;
    if (node.computed) {
      const nextProp = substituteExpressionProps(node.property, subs, shadowed);
      if (t.isExpression(nextProp)) node.property = nextProp;
    }
    return node;
  }

  if (t.isObjectProperty(node)) {
    if (node.computed) {
      const nextKey = substituteExpressionProps(node.key, subs, shadowed);
      if (t.isExpression(nextKey)) node.key = nextKey;
    }
    const nextVal = substituteExpressionProps(node.value, subs, shadowed);
    if (t.isExpression(nextVal) || t.isPatternLike(nextVal)) {
      node.value = nextVal;
    }
    return node;
  }

  if (
    t.isArrowFunctionExpression(node) ||
    t.isFunctionExpression(node) ||
    t.isFunctionDeclaration(node)
  ) {
    const inner = new Set(shadowed);
    for (const param of node.params) {
      collectPatternNames(param, inner);
    }
    substituteExpressionProps(node.body, subs, inner);
    return node;
  }

  const keys = t.VISITOR_KEYS[node.type] ?? [];
  for (const key of keys) {
    if (SKIP_VISITOR_KEYS.has(key)) continue;
    const child = Reflect.get(node, key);
    if (Array.isArray(child)) {
      for (let i = 0; i < child.length; i++) {
        const item = child[i];
        if (isAstNode(item)) {
          child[i] = substituteExpressionProps(item, subs, shadowed);
        }
      }
    } else if (isAstNode(child)) {
      Reflect.set(node, key, substituteExpressionProps(child, subs, shadowed));
    }
  }
  return node;
}

function substituteJsxNodeProps(
  node: t.JSXElement,
  subs: {
    readonly byLocalName: ReadonlyMap<string, t.Expression>;
    readonly byPropName: ReadonlyMap<string, t.Expression>;
    readonly propsObjectName: string | undefined;
  },
): t.JSXElement {
  const emptyShadowed: ReadonlySet<string> = new Set();

  for (const attr of node.openingElement.attributes) {
    if (t.isJSXSpreadAttribute(attr)) {
      const nextArg = substituteExpressionProps(attr.argument, subs, emptyShadowed);
      if (t.isExpression(nextArg)) attr.argument = nextArg;
      continue;
    }
    if (
      t.isJSXAttribute(attr) &&
      t.isJSXExpressionContainer(attr.value) &&
      !t.isJSXEmptyExpression(attr.value.expression)
    ) {
      const nextExpr = substituteExpressionProps(
        attr.value.expression,
        subs,
        emptyShadowed,
      );
      if (t.isStringLiteral(nextExpr)) {
        attr.value = nextExpr;
      } else if (t.isExpression(nextExpr)) {
        attr.value.expression = nextExpr;
      }
    }
  }

  for (const child of node.children) {
    if (t.isJSXElement(child)) {
      substituteJsxNodeProps(child, subs);
    } else if (
      t.isJSXExpressionContainer(child) &&
      !t.isJSXEmptyExpression(child.expression)
    ) {
      const nextExpr = substituteExpressionProps(child.expression, subs, emptyShadowed);
      if (t.isExpression(nextExpr)) {
        child.expression = nextExpr;
      }
    }
  }

  return node;
}

function mergeCallSiteClassName(
  root: t.JSXElement,
  callClassAttr: t.JSXAttribute | undefined,
): void {
  if (!callClassAttr || callClassAttr.value === null || callClassAttr.value === undefined) {
    return;
  }
  const attrs = root.openingElement.attributes;
  const idx = attrs.findIndex(
    (attr) => t.isJSXAttribute(attr) && attributeName(attr) === "className",
  );
  if (idx < 0) {
    attrs.unshift(t.cloneNode(callClassAttr, true, false));
    return;
  }
  const existing = attrs[idx];
  if (!existing || !t.isJSXAttribute(existing)) return;
  if (t.isStringLiteral(existing.value) && t.isStringLiteral(callClassAttr.value)) {
    const merged = [existing.value.value, callClassAttr.value.value]
      .join(" ")
      .trim();
    attrs[idx] = t.jsxAttribute(t.jsxIdentifier("className"), t.stringLiteral(merged));
    return;
  }
  const leftExpr = t.isStringLiteral(existing.value)
    ? existing.value
    : t.isJSXExpressionContainer(existing.value) &&
        t.isExpression(existing.value.expression)
      ? existing.value.expression
      : null;
  const rightExpr = t.isStringLiteral(callClassAttr.value)
    ? callClassAttr.value
    : t.isJSXExpressionContainer(callClassAttr.value) &&
        t.isExpression(callClassAttr.value.expression)
      ? callClassAttr.value.expression
      : null;
  if (leftExpr && rightExpr) {
    attrs[idx] = t.jsxAttribute(
      t.jsxIdentifier("className"),
      t.jsxExpressionContainer(
        t.callExpression(t.identifier("cn"), [leftExpr, rightExpr]),
      ),
    );
  }
}

function collectReachableHelperNames(
  root: t.JSXElement | t.JSXFragment,
  helpersByName: ReadonlyMap<string, NormalizedHelper>,
): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = [];

  const scanNode = (node: t.Node): void => {
    const tags: Array<{
      readonly name: string;
      readonly loc: t.SourceLocation | null | undefined;
    }> = [];
    collectJsxTagsInNode(node, tags);
    for (const tagRef of tags) {
      if (helpersByName.has(tagRef.name) && !reachable.has(tagRef.name)) {
        reachable.add(tagRef.name);
        queue.push(tagRef.name);
      }
    }
  };

  scanNode(root);
  while (queue.length > 0) {
    const name = queue.shift()!;
    const helper = helpersByName.get(name);
    if (helper) scanNode(helper.normalizedRoot);
  }
  return reachable;
}

/**
 * Discovers, validates, and either previews-inline or commits-extracts top-level
 * PascalCase helper React components in `program`.
 */
export function processLocalComponents(input: {
  readonly program: t.Program;
  readonly page: LocatedPage;
  readonly normalizedPageRoot: t.JSXElement | t.JSXFragment;
  readonly mode: "preview" | "commit";
  readonly scope: ModuleScope;
  readonly activeShadcnTags: ReadonlySet<string>;
  readonly catalog: ComponentCatalog;
  readonly lucideImports: ReadonlyMap<string, string>;
  readonly uiImports: ReadonlySet<string>;
  readonly projectImportAliases: ReadonlyMap<string, string>;
}): LocalComponentsResult {
  const helpersByName = new Map<string, HelperDecl>();

  for (const stmt of input.program.body) {
    if (stmt === input.page.statement) continue;
    for (const { name, fn } of extractHelperBindings(stmt)) {
      if (!isPascalCaseName(name)) continue;
      const hookCall = findHookCallInNode(fn.body);
      const jsxRoot = returnedJsx(fn);
      if (hookCall) {
        throw new CodeError(
          `Local helper component '${name}' uses React hooks. Keep hooks on the page component for now (stateful extracted components arrive in Sub-project 3).`,
          hookCall.loc ?? fn.loc,
        );
      }
      if (!jsxRoot) continue;
      if (t.isJSXFragment(jsxRoot)) {
        throw new CodeError(
          `Local helper component '${name}' must return a single root element, not a fragment.`,
          jsxRoot.loc ?? fn.loc,
        );
      }
      helpersByName.set(name, { name, fn, statement: stmt, root: jsxRoot });
    }
  }

  if (helpersByName.size === 0) {
    return {
      root: input.normalizedPageRoot,
      pendingComponentNames: [],
      extractedComponents: [],
      extraCatalogEntries: [],
      pendingCatalogNames: new Set(),
      omittedHelperStatements: new Set(),
    };
  }

  const orderedDecls = sortHelpersAndCheckCycles(helpersByName);
  const normalizedByName = new Map<string, NormalizedHelper>();

  for (const decl of orderedDecls) {
    const helperScope = analyzeModuleScope(input.program, decl.fn);
    const { root: normRoot } = unrollStaticJsxRoot(
      decl.root,
      helperScope,
      input.activeShadcnTags,
    );
    if (t.isJSXFragment(normRoot)) {
      throw new CodeError(
        `Local helper component '${decl.name}' must return a single root element, not a fragment.`,
        normRoot.loc ?? decl.fn.loc,
      );
    }

    const paramDefaults = extractComponentParamDefaults(
      decl.fn,
      helperScope.staticConsts,
    );
    const hydratedSpec = hydrateHelperRoot(
      decl,
      normRoot,
      helperScope,
      paramDefaults,
      input.lucideImports,
      input.catalog,
      input.uiImports,
      input.projectImportAliases,
    );

    const existingEntry = input.catalog.byPascalName.get(decl.name);
    let matchesExistingCatalog = false;
    if (existingEntry) {
      if (!areComponentTreesStructurallyEqual(hydratedSpec.root, existingEntry.root)) {
        throw new CodeError(
          `Component '${decl.name}' already exists in this project. Import '@/components/${decl.name}' or choose a different name.`,
          decl.fn.loc,
        );
      }
      matchesExistingCatalog = true;
    }

    normalizedByName.set(decl.name, {
      decl,
      normalizedRoot: normRoot,
      paramDefaults,
      hydratedSpec,
      matchesExistingCatalog,
    });
  }

  const reachableNames = collectReachableHelperNames(
    input.normalizedPageRoot,
    normalizedByName,
  );

  if (input.mode === "preview") {
    const pendingNames: string[] = [];
    const seenPending = new Set<string>();

    const inlineElement = (node: t.JSXElement): t.JSXElement => {
      const tag = t.isJSXIdentifier(node.openingElement.name)
        ? node.openingElement.name.name
        : null;
      const helper = tag ? normalizedByName.get(tag) : undefined;
      if (helper) {
        const badChild = hasDisallowedCallChildren(node);
        if (badChild) {
          throw new CodeError(
            `Edit the ${helper.decl.name} component to change its children.`,
            badChild.loc ?? node.loc,
          );
        }
        if (!seenPending.has(helper.decl.name)) {
          seenPending.add(helper.decl.name);
          pendingNames.push(helper.decl.name);
        }
        const { byLocalName, byPropName, classAttr } = buildCallSiteSubstitutions(
          node,
          helper.paramDefaults,
          input.scope.staticConsts,
        );
        const cloned = t.cloneNode(helper.normalizedRoot, true, false);
        substituteJsxNodeProps(cloned, {
          byLocalName,
          byPropName,
          propsObjectName: helper.paramDefaults.propsObjectName,
        });
        mergeCallSiteClassName(cloned, classAttr);
        return inlineElement(cloned);
      }

      const nextChildren = inlineChildren(node.children);
      const out = t.jsxElement(
        node.openingElement,
        node.closingElement,
        nextChildren,
        node.openingElement.selfClosing,
      );
      out.loc = node.loc;
      return out;
    };

    const inlineChildren = (
      children: readonly t.JSXElement["children"][number][],
    ): t.JSXElement["children"][number][] =>
      children.map((child) => {
        if (t.isJSXElement(child)) return inlineElement(child);
        if (
          t.isJSXExpressionContainer(child) &&
          !t.isJSXEmptyExpression(child.expression)
        ) {
          const expr = unparen(child.expression);
          if (expr && t.isLogicalExpression(expr) && expr.operator === "&&") {
            const right = unparen(expr.right);
            if (right && t.isJSXElement(right)) {
              const inlinedRight = inlineElement(right);
              const nextLogical = t.logicalExpression("&&", expr.left, inlinedRight);
              nextLogical.loc = expr.loc;
              const container = t.jsxExpressionContainer(nextLogical);
              container.loc = child.loc;
              return container;
            }
          }
        }
        return child;
      });

    let nextRoot: t.JSXElement | t.JSXFragment;
    if (t.isJSXFragment(input.normalizedPageRoot)) {
      const frag = t.jsxFragment(
        input.normalizedPageRoot.openingFragment,
        input.normalizedPageRoot.closingFragment,
        inlineChildren(input.normalizedPageRoot.children),
      );
      frag.loc = input.normalizedPageRoot.loc;
      nextRoot = frag;
    } else {
      nextRoot = inlineElement(input.normalizedPageRoot);
    }

    return {
      root: nextRoot,
      pendingComponentNames: pendingNames,
      extractedComponents: [],
      extraCatalogEntries: [],
      pendingCatalogNames: new Set(),
      omittedHelperStatements: new Set(),
    };
  }

  // mode === "commit"
  const extractedComponents: ExtractedComponentSpec[] = [];
  const extraCatalogEntries: CatalogComponent[] = [];
  const pendingCatalogNames = new Set<string>();
  const omittedHelperStatements = new Set<t.Statement>();

  for (const decl of orderedDecls) {
    if (!reachableNames.has(decl.name)) continue;
    const helper = normalizedByName.get(decl.name);
    if (!helper) continue;

    omittedHelperStatements.add(decl.statement);
    if (helper.matchesExistingCatalog) continue;

    extractedComponents.push(helper.hydratedSpec);
    extraCatalogEntries.push({
      pageId: `$pending:${helper.hydratedSpec.pascalName}`,
      name: helper.hydratedSpec.name,
      pascalName: helper.hydratedSpec.pascalName,
      root: helper.hydratedSpec.root,
      props: helper.hydratedSpec.propBindings,
    });
    pendingCatalogNames.add(helper.hydratedSpec.pascalName);
  }

  return {
    root: input.normalizedPageRoot,
    pendingComponentNames: [],
    extractedComponents,
    extraCatalogEntries,
    pendingCatalogNames,
    omittedHelperStatements,
  };
}
