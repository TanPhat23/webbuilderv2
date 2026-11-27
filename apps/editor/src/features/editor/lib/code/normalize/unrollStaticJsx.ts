import * as t from "@babel/types";
import { attributeName, CodeError, unparen } from "../astLiterals";
import { lowerShadcnElement } from "./shadcnLowering";
import {
  collectPatternNames,
  evaluateStaticExpression,
  type ModuleScope,
  type StaticValue,
} from "./staticScope";

export const MAX_UNROLLED_ITEMS = 100;

type JsxChild =
  | t.JSXText
  | t.JSXExpressionContainer
  | t.JSXSpreadChild
  | t.JSXElement
  | t.JSXFragment;

const SKIP_KEYS: ReadonlySet<string> = new Set([
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

function isStaticObject(
  value: StaticValue,
): value is { readonly [key: string]: StaticValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function staticValueToAst(
  value: StaticValue,
  loc?: t.SourceLocation | null,
): t.Expression | null {
  if (typeof value === "string") {
    const node = t.stringLiteral(value);
    node.loc = loc ?? null;
    return node;
  }
  if (typeof value === "number") {
    if (value < 0) {
      const node = t.unaryExpression("-", t.numericLiteral(-value));
      node.loc = loc ?? null;
      return node;
    }
    const node = t.numericLiteral(value);
    node.loc = loc ?? null;
    return node;
  }
  if (typeof value === "boolean") {
    const node = t.booleanLiteral(value);
    node.loc = loc ?? null;
    return node;
  }
  if (value === null) {
    const node = t.nullLiteral();
    node.loc = loc ?? null;
    return node;
  }
  if (value === undefined) {
    const node = t.identifier("undefined");
    node.loc = loc ?? null;
    return node;
  }
  if (Array.isArray(value)) {
    const elements: t.Expression[] = [];
    for (const item of value) {
      const expr = staticValueToAst(item, loc);
      if (!expr) return null;
      elements.push(expr);
    }
    const node = t.arrayExpression(elements);
    node.loc = loc ?? null;
    return node;
  }
  if (isStaticObject(value)) {
    const props: t.ObjectProperty[] = [];
    for (const [k, v] of Object.entries(value)) {
      const valExpr = staticValueToAst(v, loc);
      if (!valExpr) return null;
      const keyNode = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k)
        ? t.identifier(k)
        : t.stringLiteral(k);
      props.push(t.objectProperty(keyNode, valExpr));
    }
    const node = t.objectExpression(props);
    node.loc = loc ?? null;
    return node;
  }
  return null;
}

function bindPattern(
  pattern: t.Node,
  value: StaticValue,
  target: Map<string, StaticValue>,
): boolean {
  if (t.isIdentifier(pattern)) {
    target.set(pattern.name, value);
    return true;
  }
  if (t.isAssignmentPattern(pattern)) {
    let resolved = value;
    if (resolved === undefined) {
      const def = evaluateStaticExpression(pattern.right, target);
      if (!def.ok) return false;
      resolved = def.value;
    }
    return bindPattern(pattern.left, resolved, target);
  }
  if (t.isObjectPattern(pattern)) {
    if (!isStaticObject(value)) return false;
    const consumedKeys = new Set<string>();
    for (const prop of pattern.properties) {
      if (t.isRestElement(prop)) {
        const rest: Record<string, StaticValue> = {};
        for (const [k, v] of Object.entries(value)) {
          if (!consumedKeys.has(k)) rest[k] = v;
        }
        if (!bindPattern(prop.argument, rest, target)) return false;
        continue;
      }
      if (!t.isObjectProperty(prop)) return false;
      let key: string | null = null;
      if (!prop.computed) {
        if (t.isIdentifier(prop.key)) key = prop.key.name;
        else if (t.isStringLiteral(prop.key) || t.isNumericLiteral(prop.key)) {
          key = String(prop.key.value);
        }
      } else {
        const evalKey = evaluateStaticExpression(prop.key, target);
        if (
          evalKey.ok &&
          (typeof evalKey.value === "string" || typeof evalKey.value === "number")
        ) {
          key = String(evalKey.value);
        }
      }
      if (key === null) return false;
      consumedKeys.add(key);
      const propVal = Object.hasOwn(value, key) ? value[key] : undefined;
      if (!bindPattern(prop.value, propVal, target)) return false;
    }
    return true;
  }
  if (t.isArrayPattern(pattern)) {
    if (!Array.isArray(value)) return false;
    for (let i = 0; i < pattern.elements.length; i++) {
      const elem = pattern.elements[i];
      if (!elem) continue;
      if (t.isRestElement(elem)) {
        return bindPattern(elem.argument, value.slice(i), target);
      }
      const itemVal = i < value.length ? value[i] : undefined;
      if (!bindPattern(elem, itemVal, target)) return false;
    }
    return true;
  }
  return false;
}

function stripKeyAttribute(node: t.JSXElement): t.JSXElement {
  const nextAttrs = node.openingElement.attributes.filter(
    (attr) => !(t.isJSXAttribute(attr) && attributeName(attr) === "key"),
  );
  if (nextAttrs.length === node.openingElement.attributes.length) return node;
  const opening = t.jsxOpeningElement(
    node.openingElement.name,
    nextAttrs,
    node.openingElement.selfClosing,
  );
  opening.loc = node.openingElement.loc;
  const out = t.jsxElement(
    opening,
    node.closingElement,
    node.children,
    node.openingElement.selfClosing,
  );
  out.loc = node.loc;
  return out;
}

function extractCallbackJsxBody(
  fn: t.ArrowFunctionExpression | t.FunctionExpression,
): t.JSXElement | t.JSXFragment | null {
  if (!t.isBlockStatement(fn.body)) {
    const expr = unparen(fn.body);
    return expr && (t.isJSXElement(expr) || t.isJSXFragment(expr)) ? expr : null;
  }
  if (fn.body.body.length !== 1) return null;
  const stmt = fn.body.body[0];
  if (!stmt || !t.isReturnStatement(stmt) || !stmt.argument) return null;
  const expr = unparen(stmt.argument);
  return expr && (t.isJSXElement(expr) || t.isJSXFragment(expr)) ? expr : null;
}

interface NormalizeEnv {
  readonly scope: ModuleScope;
  readonly activeShadcnTags: ReadonlySet<string>;
  readonly unrolledConstCandidates: Set<string>;
}

function evaluateElementAttributes(
  node: t.JSXElement,
  consts: ReadonlyMap<string, StaticValue>,
): t.JSXElement {
  let changed = false;
  const nextAttrs = node.openingElement.attributes.map((attr) => {
    if (!t.isJSXAttribute(attr)) return attr;
    if (
      !t.isJSXExpressionContainer(attr.value) ||
      t.isJSXEmptyExpression(attr.value.expression)
    ) {
      return attr;
    }
    const evaluated = evaluateStaticExpression(attr.value.expression, consts);
    if (!evaluated.ok) return attr;

    let nextValue: t.JSXAttribute["value"];
    if (typeof evaluated.value === "string") {
      const lit = t.stringLiteral(evaluated.value);
      lit.loc = attr.value.loc;
      nextValue = lit;
    } else {
      const astExpr = staticValueToAst(evaluated.value, attr.value.expression.loc);
      if (!astExpr) return attr;
      const container = t.jsxExpressionContainer(astExpr);
      container.loc = attr.value.loc;
      nextValue = container;
    }
    changed = true;
    const clonedAttr = t.jsxAttribute(attr.name, nextValue);
    clonedAttr.loc = attr.loc;
    return clonedAttr;
  });

  if (!changed) return node;
  const opening = t.jsxOpeningElement(
    node.openingElement.name,
    nextAttrs,
    node.openingElement.selfClosing,
  );
  opening.loc = node.openingElement.loc;
  const out = t.jsxElement(
    opening,
    node.closingElement,
    node.children,
    node.openingElement.selfClosing,
  );
  out.loc = node.loc;
  return out;
}

function tryUnrollMapCall(
  expr: t.CallExpression,
  consts: ReadonlyMap<string, StaticValue>,
  shadowed: ReadonlySet<string>,
  env: NormalizeEnv,
): JsxChild[] | null {
  if (
    !t.isMemberExpression(expr.callee) ||
    expr.callee.computed ||
    !t.isIdentifier(expr.callee.property, { name: "map" })
  ) {
    return null;
  }

  const arrResult = evaluateStaticExpression(expr.callee.object, consts);
  if (!arrResult.ok || !Array.isArray(arrResult.value)) return null;

  const callback = expr.arguments[0];
  if (
    !callback ||
    (!t.isArrowFunctionExpression(callback) && !t.isFunctionExpression(callback))
  ) {
    return null;
  }

  const jsxBody = extractCallbackJsxBody(callback);
  if (!jsxBody) return null;

  const items = arrResult.value;
  if (items.length > MAX_UNROLLED_ITEMS) {
    throw new CodeError(
      `Static .map() loops can unroll at most ${MAX_UNROLLED_ITEMS} items.`,
      expr.loc,
    );
  }

  const unrolledRootId = unparen(expr.callee.object);
  if (
    unrolledRootId &&
    t.isIdentifier(unrolledRootId) &&
    env.scope.staticConsts.has(unrolledRootId.name) &&
    !shadowed.has(unrolledRootId.name)
  ) {
    env.unrolledConstCandidates.add(unrolledRootId.name);
  }

  const nextShadowed = new Set(shadowed);
  for (const param of callback.params) {
    collectPatternNames(param, nextShadowed);
  }

  const out: JsxChild[] = [];
  for (let i = 0; i < items.length; i++) {
    const iterConsts = new Map(consts);
    const itemParam = callback.params[0];
    if (itemParam && !bindPattern(itemParam, items[i], iterConsts)) {
      return null;
    }
    const idxParam = callback.params[1];
    if (idxParam && !bindPattern(idxParam, i, iterConsts)) {
      return null;
    }
    const arrParam = callback.params[2];
    if (arrParam && !bindPattern(arrParam, items, iterConsts)) {
      return null;
    }

    const cloned = t.cloneNode(jsxBody, true, false);
    if (t.isJSXFragment(cloned)) {
      const normalized = normalizeChildren(cloned.children, iterConsts, nextShadowed, env, true);
      out.push(...normalized);
    } else {
      const normalizedEl = normalizeElement(cloned, iterConsts, nextShadowed, env, true);
      out.push(normalizedEl);
    }
  }
  return out;
}

function normalizeExpressionChild(
  child: t.JSXExpressionContainer,
  consts: ReadonlyMap<string, StaticValue>,
  shadowed: ReadonlySet<string>,
  env: NormalizeEnv,
  insideUnrolled: boolean,
): JsxChild[] {
  if (t.isJSXEmptyExpression(child.expression)) {
    return [child];
  }

  const expr = unparen(child.expression);
  if (!expr) return [child];

  if (t.isCallExpression(expr)) {
    const unrolled = tryUnrollMapCall(expr, consts, shadowed, env);
    if (unrolled !== null) return unrolled;
  }

  if (t.isLogicalExpression(expr) && expr.operator === "&&") {
    const leftStatic = evaluateStaticExpression(expr.left, consts);
    if (leftStatic.ok) {
      if (!leftStatic.value) return [];
      const right = unparen(expr.right);
      if (right && t.isJSXElement(right)) {
        return [normalizeElement(right, consts, shadowed, env, insideUnrolled)];
      }
      if (right && t.isJSXFragment(right)) {
        return normalizeChildren(right.children, consts, shadowed, env, insideUnrolled);
      }
    } else {
      const right = unparen(expr.right);
      if (right && t.isJSXElement(right)) {
        const normalizedRight = normalizeElement(right, consts, shadowed, env, insideUnrolled);
        const nextLogical = t.logicalExpression("&&", expr.left, normalizedRight);
        nextLogical.loc = expr.loc;
        const container = t.jsxExpressionContainer(nextLogical);
        container.loc = child.loc;
        return [container];
      }
    }
  }

  if (t.isConditionalExpression(expr)) {
    const testStatic = evaluateStaticExpression(expr.test, consts);
    if (testStatic.ok) {
      const branch = unparen(testStatic.value ? expr.consequent : expr.alternate);
      if (!branch) return [];
      if (t.isJSXElement(branch)) {
        return [normalizeElement(branch, consts, shadowed, env, insideUnrolled)];
      }
      if (t.isJSXFragment(branch)) {
        return normalizeChildren(branch.children, consts, shadowed, env, insideUnrolled);
      }
      const branchVal = evaluateStaticExpression(branch, consts);
      if (branchVal.ok) {
        if (
          typeof branchVal.value === "string" ||
          typeof branchVal.value === "number"
        ) {
          const lit = staticValueToAst(branchVal.value, branch.loc);
          if (lit) {
            const container = t.jsxExpressionContainer(lit);
            container.loc = child.loc;
            return [container];
          }
        }
        return [];
      }
      if (t.isExpression(branch)) {
        const container = t.jsxExpressionContainer(branch);
        container.loc = child.loc;
        return [container];
      }
    }
  }

  const staticVal = evaluateStaticExpression(child.expression, consts);
  if (staticVal.ok) {
    if (typeof staticVal.value === "string" || typeof staticVal.value === "number") {
      const lit = staticValueToAst(staticVal.value, child.expression.loc);
      if (lit) {
        const container = t.jsxExpressionContainer(lit);
        container.loc = child.loc;
        return [container];
      }
    }
    if (
      insideUnrolled ||
      (t.isLogicalExpression(expr) && (expr.operator === "&&" || expr.operator === "||"))
    ) {
      return [];
    }
  }

  return [child];
}

function normalizeChildren(
  children: readonly JsxChild[],
  consts: ReadonlyMap<string, StaticValue>,
  shadowed: ReadonlySet<string>,
  env: NormalizeEnv,
  stripTopKeys = false,
): JsxChild[] {
  const out: JsxChild[] = [];
  for (const child of children) {
    if (t.isJSXFragment(child)) {
      out.push(...normalizeChildren(child.children, consts, shadowed, env, stripTopKeys));
      continue;
    }
    if (t.isJSXElement(child)) {
      out.push(normalizeElement(child, consts, shadowed, env, stripTopKeys));
      continue;
    }
    if (t.isJSXExpressionContainer(child)) {
      out.push(...normalizeExpressionChild(child, consts, shadowed, env, stripTopKeys));
      continue;
    }
    out.push(child);
  }
  return out;
}

function normalizeElement(
  node: t.JSXElement,
  consts: ReadonlyMap<string, StaticValue>,
  shadowed: ReadonlySet<string>,
  env: NormalizeEnv,
  stripKey = false,
): t.JSXElement {
  const withoutKey = stripKey ? stripKeyAttribute(node) : node;
  const withStaticAttrs = evaluateElementAttributes(withoutKey, consts);
  const lowered = lowerShadcnElement(withStaticAttrs, env.activeShadcnTags, consts);
  const nextChildren = normalizeChildren(lowered.children, consts, shadowed, env, false);
  const out = t.jsxElement(
    lowered.openingElement,
    lowered.closingElement,
    nextChildren,
    lowered.openingElement.selfClosing,
  );
  out.loc = lowered.loc;
  return out;
}

function collectFromNode(
  node: t.Node,
  into: Set<string>,
): void {
  if (
    t.isTSAsExpression(node) ||
    t.isTSSatisfiesExpression(node) ||
    t.isTSNonNullExpression(node) ||
    t.isTSTypeAssertion(node) ||
    t.isTSInstantiationExpression(node)
  ) {
    collectFromNode(node.expression, into);
    return;
  }
  if (node.type.startsWith("TS")) return;

  if (t.isIdentifier(node)) {
    into.add(node.name);
    return;
  }
  if (
    t.isJSXIdentifier(node) ||
    t.isJSXNamespacedName(node) ||
    t.isMetaProperty(node) ||
    t.isBreakStatement(node) ||
    t.isContinueStatement(node) ||
    t.isPrivateName(node)
  ) {
    return;
  }
  if (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) {
    collectFromNode(node.object, into);
    if (node.computed) collectFromNode(node.property, into);
    return;
  }
  if (t.isObjectProperty(node)) {
    if (node.computed) collectFromNode(node.key, into);
    collectFromNode(node.value, into);
    return;
  }

  const keys = t.VISITOR_KEYS[node.type] ?? [];
  for (const key of keys) {
    if (SKIP_KEYS.has(key)) continue;
    const child = Reflect.get(node, key);
    if (Array.isArray(child)) {
      for (const item of child) {
        if (isAstNode(item)) collectFromNode(item, into);
      }
    } else if (isAstNode(child)) {
      collectFromNode(child, into);
    }
  }
}

/** Collects all runtime identifier names referenced within an AST node. */
export function collectReferencedIdentifiers(
  node: t.Node,
  into = new Set<string>(),
): Set<string> {
  collectFromNode(node, into);
  return into;
}

/**
 * Normalizes a component's root JSX tree: lowers shadcn/ui tags, unrolls static `.map()`
 * loops, evaluates static expressions and attributes, and flattens nested fragments.
 */
export function unrollStaticJsxRoot(
  root: t.JSXElement | t.JSXFragment,
  scope: ModuleScope,
  activeShadcnTags: ReadonlySet<string>,
): {
  readonly root: t.JSXElement | t.JSXFragment;
  readonly consumedConsts: ReadonlySet<string>;
} {
  const unrolledConstCandidates = new Set<string>();
  const env: NormalizeEnv = {
    scope,
    activeShadcnTags,
    unrolledConstCandidates,
  };
  const emptyShadowed: ReadonlySet<string> = new Set();

  let normalizedRoot: t.JSXElement | t.JSXFragment;
  if (t.isJSXFragment(root)) {
    const children = normalizeChildren(
      root.children,
      scope.staticConsts,
      emptyShadowed,
      env,
      false,
    );
    const frag = t.jsxFragment(root.openingFragment, root.closingFragment, children);
    frag.loc = root.loc;
    normalizedRoot = frag;
  } else {
    normalizedRoot = normalizeElement(root, scope.staticConsts, emptyShadowed, env, false);
  }

  const remainingRefs = collectReferencedIdentifiers(normalizedRoot);
  const consumedConsts = new Set<string>();
  for (const name of unrolledConstCandidates) {
    if (!remainingRefs.has(name)) {
      consumedConsts.add(name);
    }
  }

  return {
    root: normalizedRoot,
    consumedConsts,
  };
}
