import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import ts from "typescript";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const SRC_ROOT = path.resolve(REPO_ROOT, "apps/editor/src");

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

test("editor element constants expose canonical @webbuilder/site-runtime exports", async () => {
  const canonical = await import("@webbuilder/site-runtime/types/elements");
  const editorElementsConst = await import("../apps/editor/src/features/editor/constants/elements");
  const eventConstants = await import("@webbuilder/site-runtime/types/elements/event-constants");

  assert.strictEqual(editorElementsConst.CONTAINER_ELEMENT_TYPES, canonical.CONTAINER_ELEMENT_TYPES);
  assert.strictEqual(editorElementsConst.EDITABLE_ELEMENT_TYPES, canonical.EDITABLE_ELEMENT_TYPES);
  assert.strictEqual(editorElementsConst.ALL_ELEMENT_TYPES, canonical.ALL_ELEMENT_TYPES);
  assert.strictEqual(eventConstants.EVENT_TYPES, canonical.EVENT_TYPES);
  assert.strictEqual(eventConstants.ACTION_TYPES, canonical.ACTION_TYPES);
});

test("boundary rule 2: src/features/elements/** never imports from any other src/features/<other>/**", () => {
  const violations = collectViolations("features/elements/", (resolved) =>
    resolved.startsWith("features/") &&
    resolved !== "features/elements" &&
    !resolved.startsWith("features/elements/"),
  );
  assert.deepEqual(violations, [], `Forbidden cross-feature imports from features/elements:\n${violations.join("\n")}`);
});

test("isolated loading of types, elements registry, and projects/components has no circular init errors", async () => {
  const globalTypes = await import("@webbuilder/site-runtime/types/global.type");
  const elementsDomain = await import("@webbuilder/site-runtime/types/elements");
  const registry = await import("@webbuilder/site-runtime/elements/registry");
  const projectsComponents = await import("@webbuilder/site-runtime/projects/components");
  const resolveMod = await import("@webbuilder/site-runtime/elements/lib/resolveContent");

  assert.ok(globalTypes);
  assert.ok(elementsDomain.ALL_ELEMENT_TYPES.length > 0);
  assert.equal(typeof registry.getView, "function");
  assert.equal(typeof projectsComponents.resolveComponents, "function");
  assert.equal(typeof resolveMod.resolveContent, "function");
});

test("boundary rule 4: src/features/editor/utils/** never imports store, hooks, services, or the editor barrel", () => {
  const forbidden = [
    "features/editor",
    "features/editor/index",
    "features/editor/store",
    "features/editor/hooks",
    "features/editor/services",
  ];
  const violations = collectViolations("features/editor/utils/", (resolved) =>
    forbidden.some((prefix) => resolved === prefix || (prefix !== "features/editor" && resolved.startsWith(`${prefix}/`))),
  );
  assert.deepEqual(violations, [], `Forbidden imports inside features/editor/utils:\n${violations.join("\n")}`);
});

export function findStronglyConnectedComponents(
  adjacency: ReadonlyMap<string, ReadonlySet<string>>,
): string[][] {
  let nextIndex = 0;
  const indices = new Map<string, number>();
  const lowLink = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const components: string[][] = [];

  function strongConnect(node: string): void {
    indices.set(node, nextIndex);
    lowLink.set(node, nextIndex);
    nextIndex += 1;
    stack.push(node);
    onStack.add(node);

    for (const neighbor of adjacency.get(node) ?? []) {
      if (!indices.has(neighbor)) {
        strongConnect(neighbor);
        lowLink.set(node, Math.min(lowLink.get(node)!, lowLink.get(neighbor)!));
      } else if (onStack.has(neighbor)) {
        lowLink.set(node, Math.min(lowLink.get(node)!, indices.get(neighbor)!));
      }
    }

    if (lowLink.get(node) === indices.get(node)) {
      const component: string[] = [];
      while (true) {
        const member = stack.pop()!;
        onStack.delete(member);
        component.push(member);
        if (member === node) break;
      }
      if (component.length > 1) {
        components.push(component.sort());
      }
    }
  }

  for (const node of adjacency.keys()) {
    if (!indices.has(node)) {
      strongConnect(node);
    }
  }

  return components.sort((a, b) => a[0].localeCompare(b[0]));
}

function resolveToFile(
  fileSet: ReadonlySet<string>,
  fromRel: string,
  specifier: string,
): string | null {
  const base = resolveImportToSrcRelative(fromRel, specifier);
  if (!base) return null;
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ]) {
    if (fileSet.has(candidate)) return candidate;
  }
  return null;
}

function addEdgesForFile(
  rel: string,
  fileSet: ReadonlySet<string>,
  generatedFiles: ReadonlySet<string>,
  topLevel: Map<string, Set<string>>,
  features: Map<string, Set<string>>,
  files: Map<string, Set<string>>,
): void {
  const fromTop = rel.split("/")[0];
  const fromFeat = fromTop === "features" ? rel.split("/")[1] : null;
  const full = path.join(SRC_ROOT, rel);
  const text = fs.readFileSync(full, "utf8");
  for (const specifier of extractModuleSpecifiers(text, full)) {
    const target = resolveToFile(fileSet, rel, specifier);
    if (!target || target === rel || generatedFiles.has(target)) continue;
    files.get(rel)!.add(target);
    const toTop = target.split("/")[0];
    if (fromTop !== toTop) topLevel.get(fromTop)!.add(toTop);
    const toFeat = toTop === "features" ? target.split("/")[1] : null;
    if (fromFeat && toFeat && fromFeat !== toFeat) {
      features.get(fromFeat)!.add(toFeat);
    }
  }
}

function buildSourceGraphs(): {
  topLevel: Map<string, Set<string>>;
  features: Map<string, Set<string>>;
  files: Map<string, Set<string>>;
} {
  const allFiles = walkSourceFiles(SRC_ROOT).map((full) =>
    toPosix(path.relative(SRC_ROOT, full)),
  );
  const fileSet = new Set(allFiles);
  const generatedFiles = new Set(["routeTree.gen.ts"]);
  const topLevel = new Map<string, Set<string>>();
  const features = new Map<string, Set<string>>();
  const files = new Map<string, Set<string>>();

  for (const rel of allFiles) {
    if (generatedFiles.has(rel)) continue;
    files.set(rel, new Set());
    const top = rel.split("/")[0];
    if (!topLevel.has(top)) topLevel.set(top, new Set());
    if (top === "features") {
      const feat = rel.split("/")[1];
      if (!features.has(feat)) features.set(feat, new Set());
    }
  }

  for (const rel of allFiles) {
    if (!generatedFiles.has(rel)) {
      addEdgesForFile(rel, fileSet, generatedFiles, topLevel, features, files);
    }
  }

  return { topLevel, features, files };
}

test("Tarjan SCC detector identifies cycles and returns empty on DAGs", () => {
  const dag = new Map<string, Set<string>>([
    ["a", new Set(["b", "c"])],
    ["b", new Set(["c"])],
    ["c", new Set()],
  ]);
  assert.deepEqual(findStronglyConnectedComponents(dag), []);

  const cyclic = new Map<string, Set<string>>([
    ["a", new Set(["b"])],
    ["b", new Set(["c"])],
    ["c", new Set(["a"])],
    ["d", new Set(["e"])],
    ["e", new Set(["d"])],
    ["f", new Set(["a"])],
  ]);
  assert.deepEqual(findStronglyConnectedComponents(cyclic), [
    ["a", "b", "c"],
    ["d", "e"],
  ]);
});

test("boundary rule 5: zero top-level layer cycles across src/*", () => {
  const { topLevel } = buildSourceGraphs();
  const cycles = findStronglyConnectedComponents(topLevel);
  assert.deepEqual(
    cycles,
    [],
    `Top-level layer cycles detected:\n${cycles.map((c) => c.join(" <-> ")).join("\n")}`,
  );
});

test("boundary rule 6: zero cross-feature cycles across src/features/*", () => {
  const { features } = buildSourceGraphs();
  const cycles = findStronglyConnectedComponents(features);
  assert.deepEqual(
    cycles,
    [],
    `Cross-feature cycles detected:\n${cycles.map((c) => c.join(" <-> ")).join("\n")}`,
  );
});

test("boundary rule 7: zero file-level cycles across handwritten src/**", () => {
  const { files } = buildSourceGraphs();
  const cycles = findStronglyConnectedComponents(files);
  assert.deepEqual(
    cycles,
    [],
    `File-level cycles detected:\n${cycles.map((c) => c.join(" <-> ")).join("\n")}`,
  );
});

const SITE_RUNTIME_ROOT = path.resolve(import.meta.dirname, "../packages/site-runtime/src");
const SITES_APP_ROOT = path.resolve(import.meta.dirname, "../apps/sites/src");

const FORBIDDEN_SITE_RUNTIME_PACKAGES = [
  "@clerk/",
  "@babel/",
  "@monaco-editor/",
  "@radix-ui/",
  "@base-ui/",
  "radix-ui",
  "prettier",
  "reactflow",
  "recharts",
  "xlsx",
  "cmdk",
  "vaul",
  "zustand",
  "framer-motion",
  "lenis",
  "moment",
  "react-colorful",
  "react-day-picker",
  "react-hook-form",
  "react-resizable-panels",
];

function collectSiteRuntimeViolations(
  rootDir: string,
  label: string,
  extraCheck?: (rel: string, specifier: string) => boolean,
): string[] {
  const violations: string[] = [];
  for (const fullPath of walkSourceFiles(rootDir)) {
    const rel = toPosix(path.relative(rootDir, fullPath));
    if (rel === "routeTree.gen.ts") continue;
    const text = fs.readFileSync(fullPath, "utf8");
    for (const specifier of extractModuleSpecifiers(text, fullPath)) {
      const forbiddenPkg = FORBIDDEN_SITE_RUNTIME_PACKAGES.some((pkg) =>
        pkg.endsWith("/") ? specifier.startsWith(pkg) : specifier === pkg || specifier.startsWith(`${pkg}/`),
      );
      const escapesIntoEditor =
        specifier.includes("features/editor") ||
        specifier.includes("features/collaboration") ||
        specifier.includes("apps/editor") ||
        specifier.includes("@webbuilder/editor");
      const extraForbidden = extraCheck ? extraCheck(rel, specifier) : false;
      if (forbiddenPkg || escapesIntoEditor || extraForbidden) {
        violations.push(`${label}/${rel} -> ${specifier}`);
      }
    }
  }
  return violations;
}

function isClientImportingServerTailwind(rel: string, specifier: string): boolean {
  return (
    !rel.startsWith("server/") &&
    (specifier.includes("tailwind-ssr") || specifier.includes("tailwind-jit") || specifier === "tailwindcss")
  );
}

test("boundary rule 8: packages/site-runtime/** and apps/sites/** stay strictly isolated from Clerk, Editor, Collaboration, and heavy builder deps", () => {
  const pkgViolations = collectSiteRuntimeViolations(
    SITE_RUNTIME_ROOT,
    "packages/site-runtime/src",
    (_rel, specifier) => specifier.startsWith("@/"),
  );
  const appViolations = collectSiteRuntimeViolations(
    SITES_APP_ROOT,
    "apps/sites/src",
    isClientImportingServerTailwind,
  );
  const allViolations = [...pkgViolations, ...appViolations];
  assert.deepEqual(
    allViolations,
    [],
    `Forbidden imports in Site Runtime:\n${allViolations.join("\n")}`,
  );
});

function isPureSiteRuntimeShim(filePath: string): boolean {
  const lines = fs
    .readFileSync(filePath, "utf8")
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return (
    lines.length > 0 &&
    lines.every((line) =>
      /^export\s+(?:\*|\{\s*default\s*\})\s+from\s+["']@webbuilder\/site-runtime(?:\/[^"']+)["'];?$/.test(
        line,
      ),
    )
  );
}

test("boundary rule 9: symmetric monorepo keeps root free of src/ and runtime deps, and apps/editor free of site-runtime shims", () => {
  assert.equal(
    fs.existsSync(path.join(REPO_ROOT, "src")),
    false,
    "Root src/ must not exist; Editor source lives under apps/editor/src",
  );

  const rootPkg = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"),
  ) as { dependencies?: Record<string, string> };
  assert.deepEqual(
    Object.keys(rootPkg.dependencies ?? {}),
    [],
    "Root package.json must not declare runtime dependencies; place app deps in apps/*/package.json",
  );

  const shims = walkSourceFiles(SRC_ROOT)
    .filter(isPureSiteRuntimeShim)
    .map((full) => toPosix(path.relative(REPO_ROOT, full)));
  assert.deepEqual(
    shims,
    [],
    `Pure @webbuilder/site-runtime re-export shims are forbidden:\n${shims.join("\n")}`,
  );

  for (const appName of ["editor", "sites"]) {
    const dockerfilePath = path.join(REPO_ROOT, "apps", appName, "Dockerfile");
    const dockerfileText = fs.readFileSync(dockerfilePath, "utf8");
    assert.match(
      dockerfileText,
      /^COPY\s+.*tsconfig\.base\.json/m,
      `apps/${appName}/Dockerfile must copy tsconfig.base.json for Vite/Rolldown builds`,
    );
  }
});

const LEGACY_CANVAS_FILES = [
  "features/editor/components/editor/PreviewContainer.tsx",
  "features/editor/components/editor/EditorCanvas.tsx",
  "features/editor/hooks/useIframePreview.ts",
  "features/editor/hooks/useCanvasRootDrop.ts",
  "features/editor/components/canvas/CanvasInteractionLayer.tsx",
  "features/editor/components/canvas/CanvasOverlay.tsx",
  "features/editor/components/canvas/useCanvasDragDrop.ts",
  "features/editor/components/canvas/useElementRect.ts",
];

const LEGACY_CANVAS_MODULE_NAMES = [
  "PreviewContainer",
  "EditorCanvas",
  "useIframePreview",
  "useCanvasRootDrop",
  "CanvasInteractionLayer",
  "CanvasOverlay",
  "useCanvasDragDrop",
  "useElementRect",
];

function lastSegment(specifier: string): string {
  return specifier.split("/").pop() ?? specifier;
}

test("boundary rule 10: legacy portal-in-iframe canvas modules are gone and the Editor never clones its host stylesheets into #preview-iframe", () => {
  const stillPresent = LEGACY_CANVAS_FILES.filter((rel) => fs.existsSync(path.join(SRC_ROOT, rel)));
  assert.deepEqual(stillPresent, [], `Legacy canvas files must be deleted:\n${stillPresent.join("\n")}`);

  const importers: string[] = [];
  for (const fullPath of walkSourceFiles(SRC_ROOT)) {
    const rel = toPosix(path.relative(SRC_ROOT, fullPath));
    for (const specifier of extractModuleSpecifiers(fs.readFileSync(fullPath, "utf8"), fullPath)) {
      if (LEGACY_CANVAS_MODULE_NAMES.includes(lastSegment(specifier))) {
        importers.push(`${rel} -> ${specifier}`);
      }
    }
  }
  assert.deepEqual(importers, [], `Nothing may import a deleted canvas module:\n${importers.join("\n")}`);

  const siteFrame = fs.readFileSync(
    path.join(SRC_ROOT, "features/editor/components/canvas/SiteFrame.tsx"),
    "utf8",
  );
  const sourceFile = ts.createSourceFile("SiteFrame.tsx", siteFrame, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
  const headQueries: string[] = [];
  function visit(node: ts.Node): void {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const callee = node.expression;
      const receiver = callee.expression.getText(sourceFile);
      if (
        (callee.name.text === "querySelectorAll" || callee.name.text === "querySelector") &&
        /(^|\.)head$/.test(receiver)
      ) {
        headQueries.push(node.getText(sourceFile));
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  assert.deepEqual(
    headQueries,
    [],
    `SiteFrame must not query document.head to clone Editor stylesheets into #preview-iframe:\n${headQueries.join("\n")}`,
  );
  assert.doesNotMatch(siteFrame, /document\.head\.querySelectorAll/);
});
