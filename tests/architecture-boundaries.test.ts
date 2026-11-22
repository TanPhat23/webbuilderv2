import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import ts from "typescript";

const SRC_ROOT = path.resolve(import.meta.dirname, "../src");

function walkSourceFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkSourceFiles(full));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      results.push(full);
    }
  }
  return results.sort();
}

export function extractModuleSpecifiers(sourceText: string, fileName: string): string[] {
  const kind = fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, false, kind);
  const specifiers: string[] = [];

  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      specifiers.push(node.argument.literal.text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

export function resolveImportToSrcRelative(sourceFileRel: string, specifier: string): string | null {
  if (specifier.startsWith("@/")) {
    return toPosix(path.posix.normalize(specifier.slice(2)));
  }
  if (specifier.startsWith(".")) {
    const dir = path.posix.dirname(sourceFileRel);
    const normalized = path.posix.normalize(path.posix.join(dir, specifier));
    return normalized.startsWith("..") ? null : normalized;
  }
  return null;
}

function collectViolations(
  scopePrefix: string,
  isForbiddenTarget: (resolvedSrcRel: string, rawSpecifier: string) => boolean,
): string[] {
  const violations: string[] = [];
  for (const fullPath of walkSourceFiles(SRC_ROOT)) {
    const rel = toPosix(path.relative(SRC_ROOT, fullPath));
    if (!rel.startsWith(scopePrefix)) continue;
    const text = fs.readFileSync(fullPath, "utf8");
    for (const specifier of extractModuleSpecifiers(text, fullPath)) {
      const resolved = resolveImportToSrcRelative(rel, specifier);
      if (resolved && isForbiddenTarget(resolved, specifier)) {
        violations.push(`${rel} -> ${specifier} (resolved: ${resolved})`);
      }
    }
  }
  return violations;
}

test("AST specifier extractor catches static, re-export, dynamic, and type imports while ignoring comments and strings", () => {
  const sample = `
    // import { Ghost } from "@/features/editor";
    /* export * from "@/features/projects"; */
    const text = 'import foo from "@/features/editor"';
    import type { A } from "@/types/elements";
    export { B } from "./local";
    const lazyMod = () => import("@/features/elements/views/CodeView");
    type Inline = import("@/features/preview/lib/reveal").RevealConfig;
  `;
  assert.deepEqual(extractModuleSpecifiers(sample, "sample.ts"), [
    "@/types/elements",
    "./local",
    "@/features/elements/views/CodeView",
    "@/features/preview/lib/reveal",
  ]);
});

test("boundary rule 1: src/types/** has zero imports from features, components, providers, or services", () => {
  const forbiddenPrefixes = ["features/", "components/", "providers/", "services/"];
  const violations = collectViolations("types/", (resolved) =>
    forbiddenPrefixes.some((prefix) => resolved === prefix.slice(0, -1) || resolved.startsWith(prefix)),
  );
  assert.deepEqual(violations, [], `Forbidden imports from src/types/:\n${violations.join("\n")}`);
});

test("boundary rule 3: src/features/projects/** never imports from src/features/editor/**", () => {
  const violations = collectViolations("features/projects/", (resolved) =>
    resolved === "features/editor" || resolved.startsWith("features/editor/"),
  );
  assert.deepEqual(violations, [], `Forbidden imports from features/projects -> features/editor:\n${violations.join("\n")}`);
});

test("compatibility shims expose identical runtime exports to @/types/elements", async () => {
  const canonical = await import("../src/types/elements");
  const editorElementsConst = await import("../src/features/editor/constants/elements");
  const editorEventsConst = await import("../src/features/editor/constants/events");

  assert.strictEqual(editorElementsConst.CONTAINER_ELEMENT_TYPES, canonical.CONTAINER_ELEMENT_TYPES);
  assert.strictEqual(editorElementsConst.EDITABLE_ELEMENT_TYPES, canonical.EDITABLE_ELEMENT_TYPES);
  assert.strictEqual(editorElementsConst.ALL_ELEMENT_TYPES, canonical.ALL_ELEMENT_TYPES);
  assert.strictEqual(editorEventsConst.EVENT_TYPES, canonical.EVENT_TYPES);
  assert.strictEqual(editorEventsConst.ACTION_TYPES, canonical.ACTION_TYPES);
});
