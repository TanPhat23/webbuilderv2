import { parse } from "@babel/parser";
import * as t from "@babel/types";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { cleanJsxText, type CodeDiagnostic, CodeError, diagnosticAt } from "./astLiterals";
import type { Preamble } from "./customCode";
import { extractPreamble, locatePage } from "./extractPreamble";
import { convertElement, indexById, keepUnsupported, type ParseContext } from "./parseElements";

export type { CodeDiagnostic } from "./astLiterals";

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

function collectRootElements(root: t.JSXElement | t.JSXFragment): t.JSXElement[] {
  if (!t.isJSXFragment(root)) return [root];
  const nodes: t.JSXElement[] = [];
  for (const child of root.children) {
    if (t.isJSXElement(child)) {
      nodes.push(child);
    } else if (t.isJSXText(child)) {
      if (cleanJsxText(child.value).trim() !== "") {
        throw new CodeError("Text at the root must sit inside an element like <div> or <section>.", child.loc);
      }
    } else if (t.isJSXExpressionContainer(child) && t.isJSXEmptyExpression(child.expression)) {
      continue;
    } else {
      throw new CodeError("Only elements are supported at the top level of the component.", child.loc);
    }
  }
  return nodes;
}

export function parseCode(code: string, current: EditorElement[], pageId: string | undefined): ParseCodeResult {
  let ast: t.File;
  try {
    ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  } catch (err) {
    const { message, loc } = readSyntaxError(err);
    return { ok: false, diagnostic: diagnosticAt(message, loc) };
  }

  const page = locatePage(ast.program);
  if (!page) {
    return { ok: false, diagnostic: diagnosticAt("No JSX found: the component should return the page's elements.") };
  }

  const ctx: ParseContext = { byId: indexById(current), pageId, claimed: new Set() };
  try {
    const elements = collectRootElements(page.root).map((node) => convertElement(node, undefined, ctx));
    return { ok: true, elements: keepUnsupported(elements, current), preamble: extractPreamble(code, ast.program, page) };
  } catch (err) {
    if (err instanceof CodeError) return { ok: false, diagnostic: diagnosticAt(err.message, err.loc) };
    throw err;
  }
}
