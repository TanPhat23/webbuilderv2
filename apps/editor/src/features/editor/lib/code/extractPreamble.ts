import * as t from "@babel/types";
import { unparen } from "./astLiterals";
import type { Preamble } from "./customCode";
import { getAvailableComponentImports } from "./generateImports";

type ComponentFn = t.ArrowFunctionExpression | t.FunctionExpression | t.FunctionDeclaration;

export interface LocatedPage {
  root: t.JSXElement | t.JSXFragment;
  statement: t.Statement;
  fn: ComponentFn | null;
  ret: t.ReturnStatement | null;
}

function isAstNode(value: unknown): value is t.Node {
  return typeof value === "object" && value !== null && "type" in value && typeof value.type === "string";
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
  if (!isAstNode(node)) return null;
  if (t.isJSXElement(node) || t.isJSXFragment(node)) return node;
  if (t.isImportDeclaration(node)) return null;

  const visitorKeys = new Set(t.VISITOR_KEYS[node.type] ?? []);
  for (const [key, child] of Object.entries(node)) {
    if (!visitorKeys.has(key)) continue;
    const found = firstJsx(child);
    if (found) return found;
  }
  return null;
}

function functionOf(statement: t.Statement): { name: string; fn: ComponentFn } | null {
  if (t.isFunctionDeclaration(statement) && statement.id) return { name: statement.id.name, fn: statement };
  if (!t.isVariableDeclaration(statement)) return null;

  for (const decl of statement.declarations) {
    const init = decl.init;
    if (t.isIdentifier(decl.id) && (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init))) {
      return { name: decl.id.name, fn: init };
    }
  }
  return null;
}

function returnedJsx(fn: ComponentFn): { root: t.JSXElement | t.JSXFragment; ret: t.ReturnStatement | null } | null {
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

function isComponentFunction(node: t.Node): node is ComponentFn {
  return t.isArrowFunctionExpression(node) || t.isFunctionExpression(node) || t.isFunctionDeclaration(node);
}

function findNamedComponent(body: readonly t.Statement[], targetName?: string): LocatedPage | null {
  for (const statement of body) {
    const target = t.isExportNamedDeclaration(statement) && statement.declaration ? statement.declaration : statement;
    const found = t.isStatement(target) ? functionOf(target) : null;
    if (!found || (targetName && found.name !== targetName)) continue;
    const jsx = returnedJsx(found.fn);
    if (jsx) return { root: jsx.root, statement, fn: found.fn, ret: jsx.ret };
    if (targetName) return null;
  }
  return null;
}

export function locatePage(program: t.Program): LocatedPage | null {
  const defaultExport = program.body.find((s): s is t.ExportDefaultDeclaration => t.isExportDefaultDeclaration(s));
  if (defaultExport) {
    if (isComponentFunction(defaultExport.declaration)) {
      const jsx = returnedJsx(defaultExport.declaration);
      if (jsx) return { root: jsx.root, statement: defaultExport, fn: defaultExport.declaration, ret: jsx.ret };
      return null;
    }
    if (t.isIdentifier(defaultExport.declaration)) {
      return findNamedComponent(program.body, defaultExport.declaration.name);
    }
  }

  const named = findNamedComponent(program.body);
  if (named) return named;

  const root = firstJsx(program.body);
  if (!root) return null;
  const statement = program.body.find((s) => (s.start ?? 0) <= (root.start ?? 0) && (s.end ?? 0) >= (root.end ?? 0));
  return statement ? { root, statement, fn: null, ret: null } : null;
}

function normalizeStatement(source: string): string {
  return source.replace(/\s+/g, "").replace(/"/g, "'").replace(/,}/g, "}").replace(/;$/, "");
}

let generatedImports: Set<string> | undefined;

function isGeneratedImport(statement: t.ImportDeclaration, rawSource: string): boolean {
  const moduleName = statement.source.value;
  if (moduleName === "lucide-react") return true;
  if (moduleName.startsWith("@/components/") && !moduleName.startsWith("@/components/ui/")) {
    return true;
  }
  generatedImports ??= new Set(
    [
      ...Object.values(getAvailableComponentImports()),
      "import React from 'react';",
      "import { bindInteractions } from './interactions';",
    ].map(normalizeStatement),
  );
  return generatedImports.has(normalizeStatement(rawSource));
}

const GENERATED_EFFECT = normalizeStatement("React.useEffect(() => bindInteractions(), []);");

export function extractPreamble(code: string, program: t.Program, page: LocatedPage): Preamble {
  const slice = (n: t.Node, withComments = true): string =>
    code.slice(withComments ? (n.leadingComments?.[0]?.start ?? n.start ?? 0) : (n.start ?? 0), n.end ?? 0);

  const imports: string[] = [];
  const top: string[] = [];
  for (const statement of program.body) {
    if (statement === page.statement) continue;
    if (t.isImportDeclaration(statement)) {
      const source = slice(statement, false);
      if (!isGeneratedImport(statement, source)) imports.push(source);
    } else if (!t.isExportDefaultDeclaration(statement)) {
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
