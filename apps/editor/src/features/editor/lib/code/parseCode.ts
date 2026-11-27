import { generate } from "@babel/generator";
import { parse } from "@babel/parser";
import * as t from "@babel/types";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { cleanJsxText, type CodeDiagnostic, CodeError, diagnosticAt, unparen } from "./astLiterals";
import {
  EMPTY_COMPONENT_CATALOG,
  lucidePascalToKebab,
  type ComponentCatalog,
} from "./catalog";
import type { Preamble } from "./customCode";
import { extractPreamble, locatePage } from "./extractPreamble";
import { analyzeModuleScope, findUnboundIdentifier } from "./normalize/staticScope";
import { convertElement, indexById, keepUnsupported, type ParseContext } from "./parseElements";

export type { CodeDiagnostic } from "./astLiterals";

export interface ParseCodeOptions {
  readonly catalog?: ComponentCatalog;
  readonly mode?: "preview" | "commit";
  readonly pageMeta?: {
    readonly isComponentPage?: boolean;
    readonly componentName?: string;
  };
}

export type ParseCodeResult =
  | { ok: true; elements: EditorElement[]; preamble: Preamble }
  | { ok: false; diagnostic: CodeDiagnostic };

function readSyntaxError(err: unknown): { message: string; loc: t.SourceLocation | null } {
  const rawMessage =
    typeof err === "object" && err !== null && "message" in err && typeof err.message === "string"
      ? err.message
      : "Syntax error";
  const message = rawMessage.replace(/\s*\(\d+:\d+\)$/, "");

  if (
    typeof err === "object" &&
    err !== null &&
    "loc" in err &&
    typeof err.loc === "object" &&
    err.loc !== null &&
    "line" in err.loc &&
    "column" in err.loc &&
    typeof err.loc.line === "number" &&
    typeof err.loc.column === "number"
  ) {
    const pos = { line: err.loc.line, column: err.loc.column, index: 0 };
    return { message, loc: { start: pos, end: pos, filename: "", identifierName: undefined } };
  }
  return { message, loc: null };
}

function collectLucideImports(program: t.Program): Map<string, string> {
  const icons = new Map<string, string>();
  for (const stmt of program.body) {
    if (!t.isImportDeclaration(stmt) || stmt.source.value !== "lucide-react") continue;
    for (const spec of stmt.specifiers) {
      if (!t.isImportSpecifier(spec)) continue;
      const imported = t.isIdentifier(spec.imported)
        ? spec.imported.name
        : spec.imported.value;
      const local = spec.local.name;
      icons.set(local, lucidePascalToKebab(imported));
    }
  }
  return icons;
}

interface RootElementEntry {
  readonly node: t.JSXElement;
  readonly codeVisible?: string;
}

function collectRootElements(
  root: t.JSXElement | t.JSXFragment,
  boundIdentifiers: ReadonlySet<string>,
): RootElementEntry[] {
  if (!t.isJSXFragment(root)) return [{ node: root }];
  const entries: RootElementEntry[] = [];
  for (const child of root.children) {
    if (t.isJSXElement(child)) {
      entries.push({ node: child });
    } else if (t.isJSXText(child)) {
      if (cleanJsxText(child.value).trim() !== "") {
        throw new CodeError(
          "Text at the root must sit inside an element like <div> or <section>.",
          child.loc,
        );
      }
    } else if (t.isJSXExpressionContainer(child)) {
      if (t.isJSXEmptyExpression(child.expression)) continue;
      const expr = unparen(child.expression);
      if (expr && t.isLogicalExpression(expr) && expr.operator === "&&") {
        const right = unparen(expr.right);
        if (right && t.isJSXElement(right)) {
          const bad = findUnboundIdentifier(expr.left, boundIdentifiers);
          if (bad) {
            throw new CodeError(
              `'${bad.name}' is not defined in this component.`,
              bad.loc ?? expr.left.loc,
            );
          }
          entries.push({ node: right, codeVisible: generate(expr.left).code });
          continue;
        }
      }
      throw new CodeError(
        "Only elements are supported at the top level of the component.",
        child.loc,
      );
    } else {
      throw new CodeError(
        "Only elements are supported at the top level of the component.",
        child.loc,
      );
    }
  }
  return entries;
}

export function parseCode(
  code: string,
  current: EditorElement[],
  pageId: string | undefined,
  opts?: ParseCodeOptions,
): ParseCodeResult {
  let ast: t.File;
  try {
    ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  } catch (err) {
    const { message, loc } = readSyntaxError(err);
    return { ok: false, diagnostic: diagnosticAt(message, loc) };
  }

  const page = locatePage(ast.program);
  if (!page) {
    return {
      ok: false,
      diagnostic: diagnosticAt("No JSX found: the component should return the page's elements."),
    };
  }

  const scope = analyzeModuleScope(ast.program, page.fn);
  const ctx: ParseContext = {
    byId: indexById(current),
    pageId,
    claimed: new Set(),
    lucideImports: collectLucideImports(ast.program),
    catalog: opts?.catalog ?? EMPTY_COMPONENT_CATALOG,
    boundIdentifiers: scope.boundIdentifiers,
    staticConsts: scope.staticConsts,
  };
  try {
    const elements = collectRootElements(page.root, scope.boundIdentifiers).map((entry) =>
      convertElement(entry.node, undefined, ctx, entry.codeVisible),
    );
    return {
      ok: true,
      elements: keepUnsupported(elements, current),
      preamble: extractPreamble(code, ast.program, page),
    };
  } catch (err) {
    if (err instanceof CodeError) return { ok: false, diagnostic: diagnosticAt(err.message, err.loc) };
    throw err;
  }
}
