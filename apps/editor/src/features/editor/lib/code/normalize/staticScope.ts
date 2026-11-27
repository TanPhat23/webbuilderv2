import * as t from "@babel/types";

export type StaticValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly StaticValue[]
  | { readonly [key: string]: StaticValue };

export interface ModuleScope {
  readonly staticConsts: ReadonlyMap<string, StaticValue>;
  readonly boundIdentifiers: ReadonlySet<string>;
  readonly pureStaticStatements: ReadonlySet<t.Statement>;
}

export type StaticEvalResult =
  | { readonly ok: true; readonly value: StaticValue }
  | { readonly ok: false };

const STANDARD_GLOBALS: readonly string[] = [
  "Math",
  "JSON",
  "Number",
  "String",
  "Boolean",
  "Array",
  "Object",
  "Date",
  "Intl",
  "Promise",
  "RegExp",
  "Error",
  "Map",
  "Set",
  "URL",
  "URLSearchParams",
  "console",
  "window",
  "document",
  "navigator",
  "localStorage",
  "sessionStorage",
  "undefined",
  "NaN",
  "Infinity",
  "encodeURIComponent",
  "decodeURIComponent",
  "parseInt",
  "parseFloat",
  "isNaN",
  "isFinite",
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
  "fetch",
  "FormData",
  "Event",
  "globalThis",
];

function isStaticArray(value: StaticValue): value is readonly StaticValue[] {
  return Array.isArray(value);
}

function isStaticObject(
  value: StaticValue,
): value is { readonly [key: string]: StaticValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAstNode(value: unknown): value is t.Node {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof value.type === "string"
  );
}

/** Recursively collects bound variable names from an LValue / destructuring pattern. */
export function collectPatternNames(pattern: t.Node, into: Set<string>): void {
  if (t.isIdentifier(pattern)) {
    into.add(pattern.name);
    return;
  }
  if (t.isObjectPattern(pattern)) {
    for (const prop of pattern.properties) {
      if (t.isRestElement(prop)) {
        collectPatternNames(prop.argument, into);
      } else if (t.isObjectProperty(prop)) {
        collectPatternNames(prop.value, into);
      }
    }
    return;
  }
  if (t.isArrayPattern(pattern)) {
    for (const item of pattern.elements) {
      if (item) collectPatternNames(item, into);
    }
    return;
  }
  if (t.isAssignmentPattern(pattern)) {
    collectPatternNames(pattern.left, into);
    return;
  }
  if (t.isRestElement(pattern)) {
    collectPatternNames(pattern.argument, into);
    return;
  }
  if (t.isTSParameterProperty(pattern)) {
    collectPatternNames(pattern.parameter, into);
  }
}

function unwrapStaticNode(node: t.Node): t.Node {
  let current = node;
  while (
    t.isParenthesizedExpression(current) ||
    t.isTSAsExpression(current) ||
    t.isTSSatisfiesExpression(current) ||
    t.isTSNonNullExpression(current) ||
    t.isTSTypeAssertion(current)
  ) {
    current = current.expression;
  }
  return current;
}

function objectKeyName(
  prop: t.ObjectProperty,
  consts: ReadonlyMap<string, StaticValue>,
): string | null {
  if (!prop.computed) {
    if (t.isIdentifier(prop.key)) return prop.key.name;
    if (t.isStringLiteral(prop.key) || t.isNumericLiteral(prop.key)) {
      return String(prop.key.value);
    }
    return null;
  }
  const evaluated = evaluateStaticExpression(prop.key, consts);
  if (
    evaluated.ok &&
    (typeof evaluated.value === "string" || typeof evaluated.value === "number")
  ) {
    return String(evaluated.value);
  }
  return null;
}

function appendClassTokens(value: StaticValue, out: string[]): void {
  if (typeof value === "string") {
    if (value) out.push(value);
    return;
  }
  if (typeof value === "number") {
    if (value) out.push(String(value));
    return;
  }
  if (isStaticArray(value)) {
    for (const item of value) appendClassTokens(item, out);
    return;
  }
  if (isStaticObject(value)) {
    for (const [key, flag] of Object.entries(value)) {
      if (flag) out.push(key);
    }
  }
}

function evaluateCallExpression(
  node: t.CallExpression,
  consts: ReadonlyMap<string, StaticValue>,
): StaticEvalResult {
  if (
    !t.isIdentifier(node.callee) ||
    (node.callee.name !== "cn" && node.callee.name !== "clsx")
  ) {
    return { ok: false };
  }
  const tokens: string[] = [];
  for (const arg of node.arguments) {
    if (t.isSpreadElement(arg)) {
      const spreadVal = evaluateStaticExpression(arg.argument, consts);
      if (!spreadVal.ok || !isStaticArray(spreadVal.value)) return { ok: false };
      for (const item of spreadVal.value) appendClassTokens(item, tokens);
      continue;
    }
    const evaluated = evaluateStaticExpression(arg, consts);
    if (!evaluated.ok) return { ok: false };
    appendClassTokens(evaluated.value, tokens);
  }
  return { ok: true, value: tokens.join(" ") };
}

/**
 * Evaluates a pure static AST expression against known compile-time `const` bindings.
 */
export function evaluateStaticExpression(
  rawNode: t.Node,
  consts: ReadonlyMap<string, StaticValue>,
): StaticEvalResult {
  const node = unwrapStaticNode(rawNode);

  if (
    t.isStringLiteral(node) ||
    t.isNumericLiteral(node) ||
    t.isBooleanLiteral(node)
  ) {
    return { ok: true, value: node.value };
  }
  if (t.isNullLiteral(node)) {
    return { ok: true, value: null };
  }
  if (t.isIdentifier(node)) {
    if (consts.has(node.name)) {
      return { ok: true, value: consts.get(node.name) };
    }
    if (node.name === "undefined") {
      return { ok: true, value: undefined };
    }
    return { ok: false };
  }
  if (t.isTemplateLiteral(node)) {
    let out = "";
    for (let i = 0; i < node.quasis.length; i++) {
      out += node.quasis[i]?.value.cooked ?? "";
      if (i < node.expressions.length) {
        const expr = node.expressions[i];
        if (!expr) return { ok: false };
        const evaluated = evaluateStaticExpression(expr, consts);
        if (!evaluated.ok) return { ok: false };
        out += String(evaluated.value);
      }
    }
    return { ok: true, value: out };
  }
  if (t.isUnaryExpression(node)) {
    const inner = evaluateStaticExpression(node.argument, consts);
    if (!inner.ok) return { ok: false };
    if (node.operator === "!") {
      return { ok: true, value: !inner.value };
    }
    if (node.operator === "+" || node.operator === "-") {
      const val = inner.value;
      if (
        typeof val !== "number" &&
        typeof val !== "string" &&
        typeof val !== "boolean" &&
        val !== null
      ) {
        return { ok: false };
      }
      const num = Number(val);
      return { ok: true, value: node.operator === "-" ? -num : num };
    }
    return { ok: false };
  }
  if (t.isArrayExpression(node)) {
    const out: StaticValue[] = [];
    for (const item of node.elements) {
      if (!item) return { ok: false };
      if (t.isSpreadElement(item)) {
        const spreadVal = evaluateStaticExpression(item.argument, consts);
        if (!spreadVal.ok || !isStaticArray(spreadVal.value)) return { ok: false };
        out.push(...spreadVal.value);
      } else {
        const evaluated = evaluateStaticExpression(item, consts);
        if (!evaluated.ok) return { ok: false };
        out.push(evaluated.value);
      }
    }
    return { ok: true, value: out };
  }
  if (t.isObjectExpression(node)) {
    const out: Record<string, StaticValue> = {};
    for (const prop of node.properties) {
      if (t.isSpreadElement(prop)) {
        const spreadVal = evaluateStaticExpression(prop.argument, consts);
        if (!spreadVal.ok || !isStaticObject(spreadVal.value)) return { ok: false };
        Object.assign(out, spreadVal.value);
        continue;
      }
      if (!t.isObjectProperty(prop)) return { ok: false };
      const key = objectKeyName(prop, consts);
      if (key === null) return { ok: false };
      const val = evaluateStaticExpression(prop.value, consts);
      if (!val.ok) return { ok: false };
      out[key] = val.value;
    }
    return { ok: true, value: out };
  }
  if (t.isBinaryExpression(node)) {
    if (t.isPrivateName(node.left)) return { ok: false };
    const left = evaluateStaticExpression(node.left, consts);
    const right = evaluateStaticExpression(node.right, consts);
    if (!left.ok || !right.ok) return { ok: false };

    if (node.operator === "===") return { ok: true, value: left.value === right.value };
    if (node.operator === "!==") return { ok: true, value: left.value !== right.value };
    if (node.operator === "-") {
      if (typeof left.value === "number" && typeof right.value === "number") {
        return { ok: true, value: left.value - right.value };
      }
      return { ok: false };
    }
    if (node.operator === "+") {
      if (typeof left.value === "number" && typeof right.value === "number") {
        return { ok: true, value: left.value + right.value };
      }
      if (
        (typeof left.value === "string" || typeof right.value === "string") &&
        !isStaticObject(left.value) &&
        !isStaticObject(right.value) &&
        !isStaticArray(left.value) &&
        !isStaticArray(right.value)
      ) {
        return { ok: true, value: String(left.value) + String(right.value) };
      }
      return { ok: false };
    }
    return { ok: false };
  }
  if (t.isLogicalExpression(node)) {
    const left = evaluateStaticExpression(node.left, consts);
    if (!left.ok) return { ok: false };
    if (node.operator === "&&") {
      return left.value
        ? evaluateStaticExpression(node.right, consts)
        : { ok: true, value: left.value };
    }
    if (node.operator === "||") {
      return left.value
        ? { ok: true, value: left.value }
        : evaluateStaticExpression(node.right, consts);
    }
    if (node.operator === "??") {
      return left.value !== null && left.value !== undefined
        ? { ok: true, value: left.value }
        : evaluateStaticExpression(node.right, consts);
    }
    return { ok: false };
  }
  if (t.isMemberExpression(node)) {
    const obj = evaluateStaticExpression(node.object, consts);
    if (!obj.ok) return { ok: false };
    if (!node.computed) {
      if (!t.isIdentifier(node.property)) return { ok: false };
      const propName = node.property.name;
      if (isStaticArray(obj.value) && propName === "length") {
        return { ok: true, value: obj.value.length };
      }
      if (isStaticObject(obj.value) && Object.hasOwn(obj.value, propName)) {
        return { ok: true, value: obj.value[propName] };
      }
      return { ok: false };
    }
    const prop = evaluateStaticExpression(node.property, consts);
    if (!prop.ok) return { ok: false };
    if (
      isStaticArray(obj.value) &&
      typeof prop.value === "number" &&
      Number.isInteger(prop.value) &&
      prop.value >= 0 &&
      prop.value < obj.value.length
    ) {
      return { ok: true, value: obj.value[prop.value] };
    }
    if (
      isStaticObject(obj.value) &&
      (typeof prop.value === "string" || typeof prop.value === "number")
    ) {
      const key = String(prop.value);
      if (Object.hasOwn(obj.value, key)) {
        return { ok: true, value: obj.value[key] };
      }
    }
    return { ok: false };
  }
  if (t.isCallExpression(node)) {
    return evaluateCallExpression(node, consts);
  }

  return { ok: false };
}

function processDeclarationStatement(
  stmt: t.Statement,
  boundIdentifiers: Set<string>,
  staticConsts: Map<string, StaticValue>,
  pureStaticStatements: Set<t.Statement>,
): void {
  const inner = t.isExportNamedDeclaration(stmt) && stmt.declaration ? stmt.declaration : stmt;

  if (t.isVariableDeclaration(inner)) {
    let allStatic = inner.kind === "const" && inner.declarations.length > 0;
    for (const decl of inner.declarations) {
      collectPatternNames(decl.id, boundIdentifiers);
      if (inner.kind === "const" && t.isIdentifier(decl.id) && decl.init) {
        const res = evaluateStaticExpression(decl.init, staticConsts);
        if (res.ok) {
          staticConsts.set(decl.id.name, res.value);
        } else {
          allStatic = false;
        }
      } else {
        allStatic = false;
      }
    }
    if (allStatic) pureStaticStatements.add(stmt);
    return;
  }

  if (t.isFunctionDeclaration(inner) && inner.id) {
    boundIdentifiers.add(inner.id.name);
    return;
  }

  if (t.isClassDeclaration(inner) && inner.id) {
    boundIdentifiers.add(inner.id.name);
    return;
  }

  if (t.isTSEnumDeclaration(inner)) {
    boundIdentifiers.add(inner.id.name);
  }
}

/**
 * Collects module-level and component-level bound identifiers and static `const` values.
 */
export function analyzeModuleScope(
  program: t.Program,
  pageFn: t.Function | null,
): ModuleScope {
  const staticConsts = new Map<string, StaticValue>();
  const boundIdentifiers = new Set<string>(STANDARD_GLOBALS);
  const pureStaticStatements = new Set<t.Statement>();

  for (const stmt of program.body) {
    if (t.isImportDeclaration(stmt)) {
      if (stmt.importKind === "type") continue;
      for (const spec of stmt.specifiers) {
        if (t.isImportSpecifier(spec) && spec.importKind === "type") continue;
        boundIdentifiers.add(spec.local.name);
      }
      continue;
    }

    if (t.isExportDefaultDeclaration(stmt)) {
      const decl = stmt.declaration;
      if ((t.isFunctionDeclaration(decl) || t.isClassDeclaration(decl)) && decl.id) {
        boundIdentifiers.add(decl.id.name);
      }
      continue;
    }

    processDeclarationStatement(stmt, boundIdentifiers, staticConsts, pureStaticStatements);
  }

  if (pageFn) {
    for (const param of pageFn.params) {
      collectPatternNames(param, boundIdentifiers);
    }
    if (t.isBlockStatement(pageFn.body)) {
      for (const stmt of pageFn.body.body) {
        processDeclarationStatement(stmt, boundIdentifiers, staticConsts, pureStaticStatements);
      }
    }
  }

  return {
    staticConsts,
    boundIdentifiers,
    pureStaticStatements,
  };
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

function checkPatternDefaults(
  pattern: t.Node,
  scope: Set<string>,
): t.Identifier | null {
  if (t.isIdentifier(pattern)) {
    scope.add(pattern.name);
    return null;
  }
  if (t.isAssignmentPattern(pattern)) {
    const bad = findUnboundIdentifier(pattern.right, scope);
    if (bad) return bad;
    return checkPatternDefaults(pattern.left, scope);
  }
  if (t.isObjectPattern(pattern)) {
    for (const prop of pattern.properties) {
      if (t.isRestElement(prop)) {
        const bad = checkPatternDefaults(prop.argument, scope);
        if (bad) return bad;
      } else if (t.isObjectProperty(prop)) {
        if (prop.computed) {
          const badKey = findUnboundIdentifier(prop.key, scope);
          if (badKey) return badKey;
        }
        const badVal = checkPatternDefaults(prop.value, scope);
        if (badVal) return badVal;
      }
    }
    return null;
  }
  if (t.isArrayPattern(pattern)) {
    for (const item of pattern.elements) {
      if (item) {
        const bad = checkPatternDefaults(item, scope);
        if (bad) return bad;
      }
    }
    return null;
  }
  if (t.isRestElement(pattern)) {
    return checkPatternDefaults(pattern.argument, scope);
  }
  if (t.isTSParameterProperty(pattern)) {
    return checkPatternDefaults(pattern.parameter, scope);
  }
  return null;
}

function findUnboundInChildren(
  value: unknown,
  allowed: ReadonlySet<string>,
): t.Identifier | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const bad = findUnboundInChildren(item, allowed);
      if (bad) return bad;
    }
    return null;
  }
  if (!isAstNode(value)) return null;
  return findUnboundIdentifier(value, allowed);
}

/**
 * Finds the first runtime `t.Identifier` reference in `node` that is not bound in `allowed`
 * (tracking nested lexical scopes for functions, catch clauses, loops, and blocks).
 */
export function findUnboundIdentifier(
  node: t.Node,
  allowed: ReadonlySet<string>,
): t.Identifier | null {
  if (
    t.isTSAsExpression(node) ||
    t.isTSSatisfiesExpression(node) ||
    t.isTSNonNullExpression(node) ||
    t.isTSTypeAssertion(node) ||
    t.isTSInstantiationExpression(node)
  ) {
    return findUnboundIdentifier(node.expression, allowed);
  }
  if (node.type.startsWith("TS")) {
    return null;
  }

  if (t.isIdentifier(node)) {
    return allowed.has(node.name) ? null : node;
  }

  if (
    t.isJSXIdentifier(node) ||
    t.isJSXNamespacedName(node) ||
    t.isMetaProperty(node) ||
    t.isBreakStatement(node) ||
    t.isContinueStatement(node) ||
    t.isPrivateName(node)
  ) {
    return null;
  }

  if (t.isLabeledStatement(node)) {
    return findUnboundIdentifier(node.body, allowed);
  }

  if (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) {
    const badObj = findUnboundIdentifier(node.object, allowed);
    if (badObj) return badObj;
    return node.computed ? findUnboundIdentifier(node.property, allowed) : null;
  }

  if (t.isObjectProperty(node)) {
    if (node.computed) {
      const badKey = findUnboundIdentifier(node.key, allowed);
      if (badKey) return badKey;
    }
    return findUnboundIdentifier(node.value, allowed);
  }

  if (t.isClassProperty(node) || t.isClassAccessorProperty(node)) {
    if (node.computed) {
      const badKey = findUnboundIdentifier(node.key, allowed);
      if (badKey) return badKey;
    }
    return node.value ? findUnboundIdentifier(node.value, allowed) : null;
  }

  if (
    t.isArrowFunctionExpression(node) ||
    t.isFunctionExpression(node) ||
    t.isFunctionDeclaration(node) ||
    t.isObjectMethod(node) ||
    t.isClassMethod(node)
  ) {
    const inner = new Set(allowed);
    if (
      (t.isFunctionExpression(node) || t.isFunctionDeclaration(node)) &&
      node.id
    ) {
      inner.add(node.id.name);
    }
    if ((t.isObjectMethod(node) || t.isClassMethod(node)) && node.computed) {
      const badKey = findUnboundIdentifier(node.key, allowed);
      if (badKey) return badKey;
    }
    for (const param of node.params) {
      const badParam = checkPatternDefaults(param, inner);
      if (badParam) return badParam;
    }
    return findUnboundIdentifier(node.body, inner);
  }

  if (t.isCatchClause(node)) {
    const inner = new Set(allowed);
    if (node.param) {
      const badParam = checkPatternDefaults(node.param, inner);
      if (badParam) return badParam;
    }
    return findUnboundIdentifier(node.body, inner);
  }

  if (t.isBlockStatement(node)) {
    const inner = new Set(allowed);
    for (const stmt of node.body) {
      if (t.isFunctionDeclaration(stmt) && stmt.id) {
        inner.add(stmt.id.name);
      } else if (t.isVariableDeclaration(stmt) && stmt.kind === "var") {
        for (const decl of stmt.declarations) {
          collectPatternNames(decl.id, inner);
        }
      }
    }
    for (const stmt of node.body) {
      if (t.isVariableDeclaration(stmt)) {
        for (const decl of stmt.declarations) {
          if (decl.init) {
            const badInit = findUnboundIdentifier(decl.init, inner);
            if (badInit) return badInit;
          }
          const badPat = checkPatternDefaults(decl.id, inner);
          if (badPat) return badPat;
        }
        continue;
      }
      const badStmt = findUnboundIdentifier(stmt, inner);
      if (badStmt) return badStmt;
    }
    return null;
  }

  if (t.isForStatement(node)) {
    const inner = new Set(allowed);
    if (node.init) {
      if (t.isVariableDeclaration(node.init)) {
        for (const decl of node.init.declarations) {
          if (decl.init) {
            const badInit = findUnboundIdentifier(decl.init, inner);
            if (badInit) return badInit;
          }
          const badPat = checkPatternDefaults(decl.id, inner);
          if (badPat) return badPat;
        }
      } else {
        const badInit = findUnboundIdentifier(node.init, inner);
        if (badInit) return badInit;
      }
    }
    if (node.test) {
      const badTest = findUnboundIdentifier(node.test, inner);
      if (badTest) return badTest;
    }
    if (node.update) {
      const badUpdate = findUnboundIdentifier(node.update, inner);
      if (badUpdate) return badUpdate;
    }
    return findUnboundIdentifier(node.body, inner);
  }

  if (t.isForInStatement(node) || t.isForOfStatement(node)) {
    const inner = new Set(allowed);
    if (t.isVariableDeclaration(node.left)) {
      for (const decl of node.left.declarations) {
        const badPat = checkPatternDefaults(decl.id, inner);
        if (badPat) return badPat;
      }
    } else {
      const badLeft = findUnboundIdentifier(node.left, inner);
      if (badLeft) return badLeft;
    }
    const badRight = findUnboundIdentifier(node.right, allowed);
    if (badRight) return badRight;
    return findUnboundIdentifier(node.body, inner);
  }

  const visitorKeys = t.VISITOR_KEYS[node.type] ?? [];
  for (const key of visitorKeys) {
    if (SKIP_VISITOR_KEYS.has(key)) continue;
    const child = Reflect.get(node, key);
    if (child === null || child === undefined) continue;
    const bad = findUnboundInChildren(child, allowed);
    if (bad) return bad;
  }

  return null;
}
