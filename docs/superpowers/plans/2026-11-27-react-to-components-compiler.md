# React-to-Components AST Compiler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-stage React-to-Builder AST compiler and exhaustive 34-element codec registry so developers and CLI agents can author normal React/JSX (full HTML5, `lucide-react` icons, `@/components/ui/*` shadcn tags, static `.map()` loops, real React hooks like `useState`/`useEffect`, and named component props) and port PascalCase helper components directly into reusable `"cp"` Component Masters.

**Architecture:** Stage 1 (`lib/code/normalize/`) builds a side-effect-free static constant scope + runtime-bound identifier set, unrolls static `const` `.map()` loops and fragments, lowers `@/components/ui/*` shadcn tags into canonical HTML + Tailwind classes, and either previews (`mode: "preview"`) or extracts (`mode: "commit"`) local PascalCase helper components into `ExtractedComponentSpec[]`. Stage 2 (`lib/code/codecs/`) pairs `generate` and `parse` across an exhaustive `Readonly<Record<ElementType, ElementCodec>>` for all 34 `ElementType`s plus `lucide-react` icons and `<ProjectComponent prop="..." />` instances, while preserving `Preamble` and element-level `codeProps`, `codeText`, and `codeVisible` bindings across visual Canvas edits.

**Tech Stack:** TypeScript 5.9 (`strict`, zero `any`), `@babel/parser`, `@babel/types`, `@babel/generator`, Prettier (`babel-ts`), React 19, Monaco Editor (`@monaco-editor/react`), Bun `1.4.5` workspaces, `node:test` + `tsx`, Go 1.23 (`webbuilder.mcp.go`).

**Spec:** `docs/superpowers/specs/2026-11-27-react-to-components-compiler-design.md`

## Global Constraints

- Zero `any` policy across all TypeScript source and test files (`apps/`, `packages/`, `tests/`); use `unknown` with type predicates (`is`), discriminated unions, `Readonly<T>`, `Record<K, T>`, and explicit return types on all exported functions, methods, and hooks. Avoid `as` type assertions unless interfacing with an untyped third-party boundary.
- Every `ElementType` in `ALL_ELEMENT_TYPES` (all 34 types in `@webbuilder/site-runtime/types/elements`) must have a compile-time-verified entry in `ELEMENT_CODECS: Readonly<Record<ElementType, ElementCodec>>`.
- `HIDDEN_SETTINGS` in `apps/editor/src/features/editor/lib/code/customCode.ts` must exclude all internal bookkeeping keys (`interactions`, `migratedWorkflowLinks`, `customSubmit`, `codeProps`, `codeText`, `codeVisible`, `component`, `componentProps`) from plain JSX attribute emission.
- Static `.map()` unrolling is capped at `MAX_UNROLLED_ITEMS = 100`; component catalogs passed to `/api/generate-code` are capped at `MAX_CATALOG_COMPONENTS = 200`.
- Live typing in Monaco (`APPLY_DELAY_MS = 500`) must run `parseCode` in `mode: "preview"` with zero network calls or `"cp"` page creations; creating `"cp"` masters happens only on explicit commit (`Mod+S`, "Port & Save" button, or MCP `set_code`).
- Do not stage unrelated working-tree files (`apps/editor/src/app/__root.tsx`, `apps/editor/src/features/images/**`, `apps/sites/src/app/__root.tsx`, etc.) when committing task units.
- In `webbuilder.mcp.go`, never run `gofmt -w` on `internal/agent/verify_test.go`.

## Review Focus

- **Reserved / prototype-polluting component or prop names** (`__proto__`, `constructor`, `prototype`, `children`, `key`, `className`, `data-element-id`, or `"cp"` pages named `"123 Card"`, `"React"`, or `"Button"` colliding with built-in/shadcn imports) must be sanitized or renamed (`Component123Card`, `ButtonComponent`, skipping/suffixing reserved prop keys) so `Object.prototype` and JSX props are never corrupted (pinned in Task 1).
- **Canvas visual text edits after code-authored `{count}` expressions:** When an element has `settings.codeText` (`["Clicked ", { expr: "count" }, " times"]`) and `content: "Clicked {count} times"`, editing its text on the visual Canvas to `"Submit now"` must cause `generateToJSX` to emit `"Submit now"` rather than resurrecting stale `codeText` (pinned in Task 3).
- **Inline callback parameters inside JSX attributes:** Event handlers like `onChange={(e) => setQuery(e.target.value)}` or `onClick={(ev) => handleTap(ev)}` bind `e`/`ev` locally on the arrow/function expression; `boundIdentifiers` validation must recognize nested function parameters and local block bindings rather than falsely rejecting `e` as undeclared (pinned in Task 3).
- **Project `"cp"` component named `Button` or `Card` vs. shadcn `@/components/ui/*`:** When code explicitly imports `import { Button } from '@/components/Button'` (or `Button` is resolved from `@/components/*` rather than `@/components/ui/*`), `shadcnLowering` must leave `<Button />` untouched so Stage 2 resolves the project's `"cp"` `Button` instance (pinned in Task 4 and Task 5).
- **Mid-batch failure when committing multiple extracted `"cp"` masters in `set_code`:** If a file defines `HeaderBar` and `PricingCard`, and persisting `PricingCard` throws after `HeaderBar` succeeded, `executor.ts` must roll back `HeaderBar` via `deleteComponentMaster`, leave the open page's element tree unchanged, and return an error (pinned in Task 6).

---

### Task 1: Component Catalog, Prop Synthesis, Lucide Naming & Custom-Code Metadata

**Files:**
- Modify: `apps/editor/src/features/editor/lib/code/customCode.ts`
- Create: `apps/editor/src/features/editor/lib/code/catalog.ts`
- Modify: `tests/code-preamble.test.ts`
- Test: `tests/code-catalog.test.ts`

**Interfaces:**
- Consumes: `EditorElement` from `@webbuilder/site-runtime/types/global.type`; `componentOverrideFields`, `componentChildren`, `componentSetting`, `ComponentOverride` from `@webbuilder/site-runtime/projects/components`
- Produces:
  - In `customCode.ts`:
    - `HIDDEN_SETTINGS: readonly string[]` (`["interactions", "migratedWorkflowLinks", "customSubmit", "codeProps", "codeText", "codeVisible", "component", "componentProps"]`)
    - `CodeTextSegment = string | { readonly expr: string }`
    - `renderCodeTextPlaceholder(segments: readonly CodeTextSegment[]): string`
    - `readCodeText(settings: unknown): readonly CodeTextSegment[] | undefined`
    - `readCodeVisible(settings: unknown): string | undefined`
  - In `catalog.ts`:
    - `OverrideField = keyof ComponentOverride` (`"text" | "src" | "alt" | "href"`)
    - `ComponentPropBinding = { readonly nodeId: string; readonly field: OverrideField; readonly defaultValue: string }`
    - `CatalogComponentInput = { readonly pageId: string; readonly name: string; readonly root: EditorElement }`
    - `CatalogComponent = { readonly pageId: string; readonly name: string; readonly pascalName: string; readonly root: EditorElement; readonly props: Readonly<Record<string, ComponentPropBinding>> }`
    - `ComponentCatalog = { readonly list: readonly CatalogComponent[]; readonly byPageId: ReadonlyMap<string, CatalogComponent>; readonly byPascalName: ReadonlyMap<string, CatalogComponent> }`
    - `MAX_CATALOG_COMPONENTS = 200`
    - `toComponentPascalName(raw: string, used?: Set<string>): string`
    - `synthesizeComponentProps(root: EditorElement): Readonly<Record<string, ComponentPropBinding>>`
    - `buildComponentCatalog(inputs: readonly CatalogComponentInput[]): ComponentCatalog`
    - `lucideKebabToPascal(iconName: string): string`
    - `lucidePascalToKebab(exportName: string): string`

- [ ] **Step 1: Write the failing test in `tests/code-catalog.test.ts` and update `tests/code-preamble.test.ts`**

Create `tests/code-catalog.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import {
  buildComponentCatalog,
  lucideKebabToPascal,
  lucidePascalToKebab,
  synthesizeComponentProps,
  toComponentPascalName,
} from "../apps/editor/src/features/editor/lib/code/catalog";
import {
  readCodeText,
  readCodeVisible,
  renderCodeTextPlaceholder,
} from "../apps/editor/src/features/editor/lib/code/customCode";

function makeEl(id: string, type: EditorElement["type"], extra: Record<string, unknown> = {}): EditorElement {
  return {
    id,
    type,
    pageId: "cp_1",
    content: "",
    styles: {},
    settings: null,
    ...extra,
  } as unknown as EditorElement;
}

test("toComponentPascalName sanitizes digits, punctuation, and reserved React/shadcn names", () => {
  const used = new Set<string>();
  assert.equal(toComponentPascalName("feature card", used), "FeatureCard");
  assert.equal(toComponentPascalName("feature-card", used), "FeatureCard2");
  assert.equal(toComponentPascalName("123 pricing!", used), "Component123Pricing");
  assert.equal(toComponentPascalName("React", used), "ReactComponent");
  assert.equal(toComponentPascalName("Carousel", used), "CarouselComponent");
  assert.equal(toComponentPascalName("   ", used), "Component");
});

test("synthesizeComponentProps honors explicit settings.componentProps and strips prototype/reserved keys", () => {
  const root = makeEl("root", "Section", {
    settings: {
      componentProps: {
        title: { nodeId: "h1", field: "text", defaultValue: "Fast" },
        __proto__: { nodeId: "h1", field: "text", defaultValue: "bad" },
        constructor: { nodeId: "h1", field: "text", defaultValue: "bad" },
        className: { nodeId: "h1", field: "text", defaultValue: "bad" },
        key: { nodeId: "h1", field: "text", defaultValue: "bad" },
      },
    },
    elements: [makeEl("h1", "Heading", { content: "Fast", settings: { level: 2 } })],
  });
  const props = synthesizeComponentProps(root);
  assert.deepEqual(Object.keys(props), ["title"]);
  assert.deepEqual(props.title, { nodeId: "h1", field: "text", defaultValue: "Fast" });
});

test("synthesizeComponentProps derives deterministic camelCase names for Canvas-built masters", () => {
  const root = makeEl("root", "Section", {
    elements: [
      makeEl("n1", "Heading", { name: "Card Title", content: "Starter", settings: { level: 3 } }),
      makeEl("n2", "Heading", { name: "Card Title", content: "Sub", settings: { level: 4 } }),
      makeEl("n3", "Link", { name: "CTA", content: "Sign up", href: "/signup" }),
      makeEl("n4", "Image", { name: "Hero Banner", content: "Hero alt", src: "/hero.png" }),
      makeEl("n5", "Text", { name: "__proto__", content: "Safe" }),
    ],
  });
  const props = synthesizeComponentProps(root);
  assert.deepEqual(props.cardTitle, { nodeId: "n1", field: "text", defaultValue: "Starter" });
  assert.deepEqual(props.cardTitle2, { nodeId: "n2", field: "text", defaultValue: "Sub" });
  assert.deepEqual(props.ctaText, { nodeId: "n3", field: "text", defaultValue: "Sign up" });
  assert.deepEqual(props.ctaHref, { nodeId: "n3", field: "href", defaultValue: "/signup" });
  assert.deepEqual(props.heroBannerSrc, { nodeId: "n4", field: "src", defaultValue: "/hero.png" });
  assert.deepEqual(props.heroBannerAlt, { nodeId: "n4", field: "alt", defaultValue: "Hero alt" });
  assert.equal(Object.hasOwn(props, "__proto__"), false);
  assert.ok(props.text);
});

test("buildComponentCatalog indexes by pageId and deduplicated pascalName", () => {
  const r1 = makeEl("r1", "Section", { elements: [makeEl("t1", "Text", { name: "Title", content: "A" })] });
  const r2 = makeEl("r2", "Section", { elements: [makeEl("t2", "Text", { name: "Title", content: "B" })] });
  const catalog = buildComponentCatalog([
    { pageId: "cp_1", name: "Pricing Card", root: r1 },
    { pageId: "cp_2", name: "Pricing-Card", root: r2 },
  ]);
  assert.equal(catalog.byPageId.get("cp_1")?.pascalName, "PricingCard");
  assert.equal(catalog.byPageId.get("cp_2")?.pascalName, "PricingCard2");
  assert.equal(catalog.byPascalName.get("PricingCard")?.pageId, "cp_1");
});

test("Lucide PascalCase and kebab-case round-trip including numeric suffixes", () => {
  assert.equal(lucideKebabToPascal("arrow-up-right"), "ArrowUpRight");
  assert.equal(lucideKebabToPascal("check-circle-2"), "CheckCircle2");
  assert.equal(lucidePascalToKebab("ArrowUpRight"), "arrow-up-right");
  assert.equal(lucidePascalToKebab("CheckCircle2"), "check-circle-2");
});

test("customCode helpers validate codeText and codeVisible safely", () => {
  const segs = ["Clicked ", { expr: "count" }, " times"] as const;
  assert.equal(renderCodeTextPlaceholder(segs), "Clicked {count} times");
  assert.deepEqual(readCodeText({ codeText: segs }), segs);
  assert.equal(readCodeText({ codeText: [{ bad: 1 }] }), undefined);
  assert.equal(readCodeVisible({ codeVisible: "isOpen" }), "isOpen");
  assert.equal(readCodeVisible({ codeVisible: "" }), undefined);
});
```

Update `tests/code-preamble.test.ts` lines 35–39:

```ts
test('settings that must never become tag attributes are listed', () => {
  assert.deepEqual(HIDDEN_SETTINGS, [
    'interactions',
    'migratedWorkflowLinks',
    'customSubmit',
    'codeProps',
    'codeText',
    'codeVisible',
    'component',
    'componentProps',
  ]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/code-catalog.test.ts tests/code-preamble.test.ts`
Expected: FAIL (`Cannot find module .../catalog` and `HIDDEN_SETTINGS` mismatch).

- [ ] **Step 3: Implement `customCode.ts` extensions and `catalog.ts`**

Update `apps/editor/src/features/editor/lib/code/customCode.ts`:

```ts
/**
 * Code a user writes in the code view that the element tree cannot express
 * with plain static attributes alone: extra props on a tag, mixed JSX text
 * expressions, conditional visibility, and imports/hooks around the JSX.
 */

export const HIDDEN_SETTINGS: readonly string[] = [
  "interactions",
  "migratedWorkflowLinks",
  "customSubmit",
  "codeProps",
  "codeText",
  "codeVisible",
  "component",
  "componentProps",
];

export type CodeTextSegment = string | { readonly expr: string };

export interface Preamble {
  imports: string;
  top: string;
  body: string;
}

export const emptyPreamble = (): Preamble => ({ imports: "", top: "", body: "" });

export const isEmptyPreamble = (p: Preamble): boolean =>
  !p.imports.trim() && !p.top.trim() && !p.body.trim();

export const MAX_PREAMBLE_LENGTH = 50_000;
export const MAX_CODE_PROPS = 100;
export const MAX_CODE_PROP_LENGTH = 2_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCodeTextSegment(value: unknown): value is CodeTextSegment {
  if (typeof value === "string") return value.length <= MAX_CODE_PROP_LENGTH;
  return (
    isRecord(value) &&
    typeof value.expr === "string" &&
    value.expr.trim().length > 0 &&
    value.expr.length <= MAX_CODE_PROP_LENGTH
  );
}

export function readCodeText(settings: unknown): readonly CodeTextSegment[] | undefined {
  if (!isRecord(settings) || !Array.isArray(settings.codeText)) return undefined;
  if (settings.codeText.length === 0 || settings.codeText.length > MAX_CODE_PROPS) return undefined;
  return settings.codeText.every(isCodeTextSegment) ? settings.codeText : undefined;
}

export function renderCodeTextPlaceholder(segments: readonly CodeTextSegment[]): string {
  return segments.map((seg) => (typeof seg === "string" ? seg : `{${seg.expr}}`)).join("");
}

export function readCodeVisible(settings: unknown): string | undefined {
  if (!isRecord(settings) || typeof settings.codeVisible !== "string") return undefined;
  const trimmed = settings.codeVisible.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_CODE_PROP_LENGTH ? trimmed : undefined;
}

export function toPreamble(value: unknown): Preamble | null {
  if (!isRecord(value)) return null;
  const out = emptyPreamble();
  for (const key of ["imports", "top", "body"] as const) {
    const part = value[key] ?? "";
    if (typeof part !== "string" || part.length > MAX_PREAMBLE_LENGTH) return null;
    out[key] = part;
  }
  return out;
}

const storageKey = (pageId: string): string => `wb:code-preamble:${pageId}`;

export function readStoredPreamble(pageId: string | undefined): Preamble {
  if (!pageId) return emptyPreamble();
  try {
    const raw = globalThis.localStorage?.getItem(storageKey(pageId));
    return (raw && toPreamble(JSON.parse(raw))) || emptyPreamble();
  } catch {
    return emptyPreamble();
  }
}

export function savePreamble(pageId: string | undefined, preamble: Preamble): void {
  if (!pageId) return;
  try {
    if (isEmptyPreamble(preamble)) globalThis.localStorage?.removeItem(storageKey(pageId));
    else globalThis.localStorage?.setItem(storageKey(pageId), JSON.stringify(preamble));
  } catch {
    // Blocked or full: the preamble lasts for this session only.
  }
}
```

Create `apps/editor/src/features/editor/lib/code/catalog.ts`:

```ts
import {
  componentChildren,
  componentOverrideFields,
  componentSetting,
  type ComponentOverride,
} from "@webbuilder/site-runtime/projects/components";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

export type OverrideField = keyof ComponentOverride;

export interface ComponentPropBinding {
  readonly nodeId: string;
  readonly field: OverrideField;
  readonly defaultValue: string;
}

export interface CatalogComponentInput {
  readonly pageId: string;
  readonly name: string;
  readonly root: EditorElement;
}

export interface CatalogComponent {
  readonly pageId: string;
  readonly name: string;
  readonly pascalName: string;
  readonly root: EditorElement;
  readonly props: Readonly<Record<string, ComponentPropBinding>>;
}

export interface ComponentCatalog {
  readonly list: readonly CatalogComponent[];
  readonly byPageId: ReadonlyMap<string, CatalogComponent>;
  readonly byPascalName: ReadonlyMap<string, CatalogComponent>;
}

export const MAX_CATALOG_COMPONENTS = 200;

const RESERVED_COMPONENT_NAMES: ReadonlySet<string> = new Set([
  "React",
  "Fragment",
  "Generated",
  "Carousel",
  "CMSContentList",
  "CMSContentGrid",
  "CMSContentItem",
]);

const FORBIDDEN_PROP_NAMES: ReadonlySet<string> = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "children",
  "key",
  "ref",
  "className",
  "style",
  "id",
  "data-element-id",
]);

const VALID_OVERRIDE_FIELDS: ReadonlySet<string> = new Set(["text", "src", "alt", "href"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOverrideField(value: unknown): value is OverrideField {
  return typeof value === "string" && VALID_OVERRIDE_FIELDS.has(value);
}

function uniqueIdentifier(base: string, used: Set<string>): string {
  let candidate = base;
  for (let n = 2; used.has(candidate); n++) {
    candidate = `${base}${n}`;
  }
  used.add(candidate);
  return candidate;
}

export function toComponentPascalName(raw: string, used = new Set<string>()): string {
  const words = raw
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0]!.toUpperCase() + w.slice(1));
  let base = words.join("") || "Component";
  if (/^[0-9]/.test(base)) base = `Component${base}`;
  if (RESERVED_COMPONENT_NAMES.has(base)) base = `${base}Component`;
  return uniqueIdentifier(base, used);
}

function toCamelBase(raw: string, fallback: string): string {
  const words = raw
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w.length > 0);
  if (words.length === 0) return fallback;
  const first = words[0]!.toLowerCase();
  const rest = words.slice(1).map((w) => w[0]!.toUpperCase() + w.slice(1));
  const joined = [first, ...rest].join("");
  if (/^[0-9]/.test(joined) || FORBIDDEN_PROP_NAMES.has(joined)) return fallback;
  return joined;
}

function defaultFieldValue(element: EditorElement, field: OverrideField): string {
  if (field === "src") return element.src ?? "";
  if (field === "href") return element.href ?? "";
  return element.content ?? "";
}

export function readStoredComponentProps(
  settings: unknown,
): Readonly<Record<string, ComponentPropBinding>> | null {
  if (!isRecord(settings) || !isRecord(settings.componentProps)) return null;
  const out: Record<string, ComponentPropBinding> = Object.create(null) as Record<string, ComponentPropBinding>;
  let count = 0;
  for (const [propName, raw] of Object.entries(settings.componentProps)) {
    if (
      !propName ||
      FORBIDDEN_PROP_NAMES.has(propName) ||
      !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(propName) ||
      !isRecord(raw) ||
      typeof raw.nodeId !== "string" ||
      !raw.nodeId ||
      !isOverrideField(raw.field) ||
      typeof raw.defaultValue !== "string"
    ) {
      continue;
    }
    out[propName] = {
      nodeId: raw.nodeId,
      field: raw.field,
      defaultValue: raw.defaultValue,
    };
    count++;
  }
  return count > 0 ? out : null;
}

export function synthesizeComponentProps(
  root: EditorElement,
): Readonly<Record<string, ComponentPropBinding>> {
  const explicit = readStoredComponentProps(root.settings);
  if (explicit) return explicit;

  const used = new Set<string>(FORBIDDEN_PROP_NAMES);
  const out: Record<string, ComponentPropBinding> = Object.create(null) as Record<string, ComponentPropBinding>;

  const visit = (node: EditorElement): void => {
    const fields = componentOverrideFields(node);
    const fallback = node.type.toLowerCase();
    const base = toCamelBase(node.name ?? "", fallback);
    for (const field of fields) {
      const propBase =
        fields.length === 1 && field === "text"
          ? base
          : `${base}${field[0]!.toUpperCase()}${field.slice(1)}`;
      const safeBase = FORBIDDEN_PROP_NAMES.has(propBase) ? `${fallback}Value` : propBase;
      const name = uniqueIdentifier(safeBase, used);
      out[name] = {
        nodeId: node.id,
        field,
        defaultValue: defaultFieldValue(node, field),
      };
    }
    if (!componentSetting(node)) {
      for (const child of componentChildren(node) ?? []) visit(child);
    }
  };

  visit(root);
  return out;
}

export const EMPTY_COMPONENT_CATALOG: ComponentCatalog = {
  list: [],
  byPageId: new Map(),
  byPascalName: new Map(),
};

export function buildComponentCatalog(
  inputs: readonly CatalogComponentInput[],
): ComponentCatalog {
  if (inputs.length === 0) return EMPTY_COMPONENT_CATALOG;
  const usedNames = new Set<string>();
  const list: CatalogComponent[] = [];
  const byPageId = new Map<string, CatalogComponent>();
  const byPascalName = new Map<string, CatalogComponent>();

  for (const item of inputs.slice(0, MAX_CATALOG_COMPONENTS)) {
    if (!item.pageId || byPageId.has(item.pageId)) continue;
    const pascalName = toComponentPascalName(item.name, usedNames);
    const entry: CatalogComponent = {
      pageId: item.pageId,
      name: item.name,
      pascalName,
      root: item.root,
      props: synthesizeComponentProps(item.root),
    };
    list.push(entry);
    byPageId.set(entry.pageId, entry);
    byPascalName.set(entry.pascalName, entry);
  }

  return { list, byPageId, byPascalName };
}

export function lucideKebabToPascal(iconName: string): string {
  const cleaned = iconName
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter((part) => part.length > 0)
    .map((part) => (/^[0-9]+$/.test(part) ? part : part[0]!.toUpperCase() + part.slice(1).toLowerCase()))
    .join("");
  return cleaned && /^[A-Z]/.test(cleaned) ? cleaned : "Star";
}

export function lucidePascalToKebab(exportName: string): string {
  return exportName
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])([0-9]+)/g, "$1-$2")
    .toLowerCase();
}
```

- [ ] **Step 4: Run tests and typecheck to verify they pass**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/code-catalog.test.ts tests/code-preamble.test.ts && bun run --cwd apps/editor typecheck`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit Task 1**

```bash
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 add \
  apps/editor/src/features/editor/lib/code/customCode.ts \
  apps/editor/src/features/editor/lib/code/catalog.ts \
  tests/code-preamble.test.ts \
  tests/code-catalog.test.ts
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 commit -m "feat(code): add component catalog, prop synthesis, and customCode metadata"
```

---

### Task 2: Exhaustive 34-Element Codec Registry & Generator/Parser Integration

**Files:**
- Create: `apps/editor/src/features/editor/lib/code/codecs/types.ts`
- Create: `apps/editor/src/features/editor/lib/code/codecs/registry.ts`
- Modify: `apps/editor/src/features/editor/lib/code/generatestrategies.ts`
- Modify: `apps/editor/src/features/editor/lib/code/generateImports.ts`
- Modify: `apps/editor/src/features/editor/lib/code/generator.ts`
- Modify: `apps/editor/src/features/editor/lib/code/parseElements.ts`
- Modify: `apps/editor/src/features/editor/lib/code/parseCode.ts`
- Modify: `tests/code-editing.test.ts`
- Test: `tests/code-codecs.test.ts`

**Interfaces:**
- Consumes: `CatalogComponent`, `ComponentCatalog`, `EMPTY_COMPONENT_CATALOG`, `lucideKebabToPascal`, `lucidePascalToKebab` from `./catalog`; `HIDDEN_SETTINGS`, `MAX_CODE_PROPS`, `MAX_CODE_PROP_LENGTH` from `./customCode`; `ALL_ELEMENT_TYPES`, `ElementType` from `@webbuilder/site-runtime/types/elements`
- Produces:
  - `ELEMENT_CODECS: Readonly<Record<ElementType, ElementCodec>>` in `codecs/registry.ts`
  - `TAG_CANDIDATES: Readonly<Record<string, readonly ElementType[]>>` in `codecs/registry.ts`
  - `generateImports(jsx: string, extra?: { readonly lucideIcons?: readonly string[]; readonly projectComponents?: readonly string[] }): string`
  - `codeGenerator.generateToJSX(elements: EditorElement[], logic?: InteractionLogic, opts?: GenerateToJsxOptions): Promise<string>` where `GenerateToJsxOptions` accepts `{ tagIds?: boolean; preamble?: Preamble; catalog?: ComponentCatalog; pageMeta?: { isComponentPage?: boolean; componentName?: string } }`
  - `parseCode(code: string, current: EditorElement[], pageId: string | undefined, opts?: ParseCodeOptions): ParseCodeResult`

- [ ] **Step 1: Write the failing exhaustive round-trip test in `tests/code-codecs.test.ts` and update `tests/code-editing.test.ts`**

Create `tests/code-codecs.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { ALL_ELEMENT_TYPES, type ElementType } from "@webbuilder/site-runtime/types/elements";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { ELEMENT_CODECS } from "../apps/editor/src/features/editor/lib/code/codecs/registry";
import { codeGenerator } from "../apps/editor/src/features/editor/lib/code/generator";
import { parseCode } from "../apps/editor/src/features/editor/lib/code/parseCode";
import { diffTrees } from "../apps/editor/src/features/editor/utils/element/treeDiff";

const PAGE = "page_codecs";

function sampleFor(type: ElementType): EditorElement {
  const base = { id: `el_${type}`, type, pageId: PAGE, content: "", styles: {}, settings: null, tailwindStyles: "p-2" };
  switch (type) {
    case "Heading":
      return { ...base, content: "Main Heading", settings: { level: 3 } } as unknown as EditorElement;
    case "Text":
    case "Span":
    case "Button":
      return { ...base, content: `${type} copy` } as unknown as EditorElement;
    case "Label":
      return { ...base, content: "Email", settings: { htmlFor: "email-input" } } as unknown as EditorElement;
    case "Blockquote":
      return { ...base, content: "Quote text", settings: { cite: "https://example.com" } } as unknown as EditorElement;
    case "Code":
      return { ...base, content: "const x = 1;", settings: { preformatted: true } } as unknown as EditorElement;
    case "Separator":
      return { ...base } as unknown as EditorElement;
    case "Icon":
      return { ...base, settings: { iconName: "arrow-up-right", size: 20, strokeWidth: 1.5 } } as unknown as EditorElement;
    case "Image":
      return { ...base, content: "Alt text", src: "/pic.png", settings: { loading: "lazy" } } as unknown as EditorElement;
    case "Video":
      return { ...base, src: "/clip.mp4", settings: { controls: true, loop: true, poster: "/p.jpg" } } as unknown as EditorElement;
    case "Audio":
      return { ...base, src: "/track.mp3", settings: { controls: true, muted: true } } as unknown as EditorElement;
    case "IFrame":
      return { ...base, src: "https://example.com/embed", settings: { loading: "lazy", allow: "fullscreen" } } as unknown as EditorElement;
    case "Link":
      return { ...base, content: "Read more", href: "/docs", elements: [] } as unknown as EditorElement;
    case "Input":
      return { ...base, settings: { type: "email", placeholder: "you@example.com", required: true } } as unknown as EditorElement;
    case "Textarea":
      return { ...base, settings: { name: "bio", rows: 4, placeholder: "Bio" } } as unknown as EditorElement;
    case "Checkbox":
      return { ...base, settings: { name: "agree", value: "yes", defaultChecked: true } } as unknown as EditorElement;
    case "Radio":
      return { ...base, settings: { name: "plan", value: "pro", required: true } } as unknown as EditorElement;
    case "Progress":
      return { ...base, settings: { value: 65, max: 100 } } as unknown as EditorElement;
    case "Select":
      return {
        ...base,
        settings: { name: "tier" },
        elements: [{ id: "opt_1", type: "Text", pageId: PAGE, parentId: `el_${type}`, content: "Starter", styles: {}, settings: null }],
      } as unknown as EditorElement;
    case "List":
      return {
        ...base,
        settings: { ordered: false },
        elements: [{ id: "li_1", type: "Text", pageId: PAGE, parentId: `el_${type}`, content: "Bullet", styles: {}, settings: null }],
      } as unknown as EditorElement;
    case "Table":
      return {
        ...base,
        settings: {
          caption: "Plans",
          bordered: true,
          columns: [
            { id: "c1", header: "Plan", align: "left" },
            { id: "c2", header: "Price", align: "right" },
          ],
        },
        elements: [{ id: "tb_child", type: "Text", pageId: PAGE, parentId: `el_${type}`, content: "Row body", styles: {}, settings: null }],
      } as unknown as EditorElement;
    case "Carousel":
    case "Form":
    case "Frame":
    case "Section":
    case "Nav":
    case "Header":
    case "Footer":
    case "Article":
    case "Aside":
    case "CMSContentList":
    case "CMSContentGrid":
    case "CMSContentItem":
      return {
        ...base,
        ...(type.startsWith("CMS") ? { settings: { contentTypeId: "posts", limit: 6 } } : {}),
        elements: [{ id: `child_${type}`, type: "Span", pageId: PAGE, parentId: `el_${type}`, content: "Inner", styles: {}, settings: null }],
      } as unknown as EditorElement;
  }
}

test("every ElementType in ALL_ELEMENT_TYPES has a codec and round-trips with zero diff", async () => {
  assert.equal(ALL_ELEMENT_TYPES.length, 34);
  for (const type of ALL_ELEMENT_TYPES) {
    assert.ok(ELEMENT_CODECS[type], `missing codec for ${type}`);
    const tree = [sampleFor(type)];
    const code = await codeGenerator.generateToJSX(tree, undefined, { tagIds: true });
    const parsed = parseCode(code, tree, PAGE);
    assert.ok(parsed.ok, `${type} failed to parse: ${parsed.ok ? "" : parsed.diagnostic.message}\n${code}`);
    if (parsed.ok) {
      assert.deepEqual(diffTrees(tree, parsed.elements), [], `diff mismatch for ${type}\n${code}`);
    }
  }
});

test("<p>, <main>, multi-row HTML <table>, and aliased lucide-react icons compile into native elements", () => {
  const src = `
    import React from 'react';
    import { Sparkles as MagicIcon } from 'lucide-react';

    export default function Page() {
      return (
        <main className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="text-zinc-600">Paragraph body</p>
          <MagicIcon size={18} className="text-amber-500" />
          <table>
            <caption>Comparison</caption>
            <thead><tr><th>Tier</th><th>Cost</th></tr></thead>
            <tbody>
              <tr><td>Free</td><td>$0</td></tr>
              <tr><td>Pro</td><td>$29</td></tr>
            </tbody>
          </table>
        </main>
      );
    }
  `;
  const res = parseCode(src, [], PAGE);
  assert.ok(res.ok, res.ok ? "" : res.diagnostic.message);
  if (!res.ok) return;
  const main = res.elements[0]!;
  assert.equal(main.type, "Section");
  const children = (main as unknown as { elements: EditorElement[] }).elements;
  assert.deepEqual(children.map((c) => c.type), ["Heading", "Text", "Icon", "Table"]);
  assert.equal((children[0]?.settings as { level?: number })?.level, 1);
  assert.equal(children[1]?.content, "Paragraph body");
  assert.equal((children[2]?.settings as { iconName?: string })?.iconName, "sparkles");
  const table = children[3] as unknown as { settings: { caption?: string; columns?: { header: string }[] }; elements: EditorElement[] };
  assert.equal(table.settings.caption, "Comparison");
  assert.deepEqual(table.settings.columns?.map((c) => c.header), ["Tier", "Cost"]);
  assert.equal(table.elements.length, 2);
});
```

Update the two legacy 11-tag assertions in `tests/code-editing.test.ts`:
- Line 91–100: test `keepUnsupported` with a synthetic unknown element `el("future", "FutureWidget", { content: "Untouched" })` in a local tree while confirming `head` (`Heading`) now round-trips as `<h2>Not in code</h2>`.
- Line 144–146: replace `"<video"` / `"</video>"` with `"<marquee"` / `"</marquee>"` and `/<marquee>/`.

- [ ] **Step 2: Run tests to verify failure**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/code-codecs.test.ts`
Expected: FAIL (`Cannot find module .../codecs/registry`).

- [ ] **Step 3: Implement `codecs/types.ts`, `codecs/registry.ts`, and wire `generateImports.ts`, `generatestrategies.ts`, `generator.ts`, `parseElements.ts`, and `parseCode.ts`**

Create `apps/editor/src/features/editor/lib/code/codecs/types.ts`:

```ts
import type * as t from "@babel/types";
import type { ElementType } from "@webbuilder/site-runtime/types/elements";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import type { ComponentCatalog } from "../catalog";

export interface GenerateNodeContext {
  readonly catalog: ComponentCatalog;
  readonly tagElementIds: boolean;
  readonly usedLucideIcons: Set<string>;
  readonly usedProjectComponents: Set<string>;
  generateChild(element: EditorElement): t.JSXElement | t.JSXExpressionContainer | null;
}

export interface ElementCodec<T extends ElementType = ElementType> {
  readonly type: T;
  generate(element: Extract<EditorElement, { type: T }>, ctx: GenerateNodeContext): t.JSXElement;
}
```

Create `apps/editor/src/features/editor/lib/code/codecs/registry.ts` implementing all 34 codecs with compile-time exhaustiveness:

```ts
import * as t from "@babel/types";
import type { ElementType } from "@webbuilder/site-runtime/types/elements";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { classNameFor } from "../classNames";
import { HIDDEN_SETTINGS } from "../customCode";
import { lucideKebabToPascal } from "../catalog";
import type { ElementCodec, GenerateNodeContext } from "./types";

const HIDDEN_SET: ReadonlySet<string> = new Set(HIDDEN_SETTINGS);

export const TAG_CANDIDATES: Readonly<Record<string, readonly ElementType[]>> = {
  section: ["Section"],
  main: ["Section"],
  header: ["Header"],
  footer: ["Footer"],
  nav: ["Nav"],
  article: ["Article"],
  aside: ["Aside"],
  div: ["Frame", "Text", "CMSContentList", "CMSContentItem", "CMSContentGrid"],
  p: ["Text"],
  span: ["Span"],
  h1: ["Heading"],
  h2: ["Heading"],
  h3: ["Heading"],
  h4: ["Heading"],
  h5: ["Heading"],
  h6: ["Heading"],
  label: ["Label"],
  blockquote: ["Blockquote"],
  code: ["Code"],
  pre: ["Code"],
  hr: ["Separator"],
  img: ["Image"],
  video: ["Video"],
  audio: ["Audio"],
  iframe: ["IFrame"],
  button: ["Button"],
  a: ["Link"],
  input: ["Input", "Checkbox", "Radio"],
  textarea: ["Textarea"],
  select: ["Select"],
  progress: ["Progress"],
  ul: ["List"],
  ol: ["List"],
  form: ["Form"],
  table: ["Table"],
  Carousel: ["Carousel"],
  CMSContentList: ["CMSContentList"],
  CMSContentGrid: ["CMSContentGrid"],
  CMSContentItem: ["CMSContentItem"],
};

export const ELEMENT_CODECS: Readonly<{ [K in ElementType]: ElementCodec<K> }> = {
  Text: textCodec,
  Span: spanCodec,
  Heading: headingCodec,
  Label: labelCodec,
  Blockquote: blockquoteCodec,
  Code: codeCodec,
  Separator: separatorCodec,
  Icon: iconCodec,
  Image: imageCodec,
  Video: videoCodec,
  Audio: audioCodec,
  IFrame: iframeCodec,
  Button: buttonCodec,
  Link: linkCodec,
  Input: inputCodec,
  Textarea: textareaCodec,
  Checkbox: checkboxCodec,
  Radio: radioCodec,
  Progress: progressCodec,
  List: listCodec,
  Select: selectCodec,
  Form: formCodec,
  Table: tableCodec,
  Frame: frameCodec,
  Section: sectionCodec,
  Nav: navCodec,
  Header: headerCodec,
  Footer: footerCodec,
  Article: articleCodec,
  Aside: asideCodec,
  CMSContentList: cmsContentListCodec,
  CMSContentItem: cmsContentItemCodec,
  CMSContentGrid: cmsContentGridCodec,
  Carousel: carouselCodec,
};
```

Update `generateImports.ts`, `extractPreamble.ts`, `generatestrategies.ts`, `generator.ts`, `parseElements.ts`, and `parseCode.ts`:
- `generateImports(jsx, extra)` emits `import { ... } from 'lucide-react';` (sorted) when `extra?.lucideIcons` is non-empty and `import { Name } from '@/components/Name';` for each entry in `extra?.projectComponents`; `extractPreamble.ts` `isGeneratedImport` skips generated `lucide-react` and `@/components/*` imports so they do not duplicate into `Preamble.imports`.
- `generatestrategies.ts` delegates to `ELEMENT_CODECS` while retaining exported `generateStrategies`, `generationOptions`, `SelectGenerateStrategy`, `ListGenerateStrategy`, and `FrameGenerateStrategy` for `tests/code-generation-edges.test.ts` compatibility.
- `parseElements.ts` and `parseCode.ts` track named `lucide-react` imports (`Map<localName, kebabIconName>`), resolve `h1`–`h6`, `p`, `main`, `<pre><code>` / `<code>`, `<input type="checkbox"|"radio">`, `<table>` (`<caption>`, `<thead><tr><th>` → `settings.columns`, single `<td colSpan>` unwrap or multi-row `<tr><td>` → row `Frame` + cell `Text`/`Frame`), `video`/`audio` (`autoPlay` → `autoplay`), `Icon`, and `CMSContent*`.

- [ ] **Step 4: Run tests and typecheck**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/code-codecs.test.ts tests/code-editing.test.ts tests/code-generation-edges.test.ts tests/code-generation-format.test.ts && bun run --cwd apps/editor typecheck`
Expected: PASS across all 4 test files and `typecheck`.

- [ ] **Step 5: Commit Task 2**

```bash
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 add \
  apps/editor/src/features/editor/lib/code/codecs/types.ts \
  apps/editor/src/features/editor/lib/code/codecs/registry.ts \
  apps/editor/src/features/editor/lib/code/generatestrategies.ts \
  apps/editor/src/features/editor/lib/code/generateImports.ts \
  apps/editor/src/features/editor/lib/code/extractPreamble.ts \
  apps/editor/src/features/editor/lib/code/generator.ts \
  apps/editor/src/features/editor/lib/code/parseElements.ts \
  apps/editor/src/features/editor/lib/code/parseCode.ts \
  tests/code-editing.test.ts \
  tests/code-codecs.test.ts
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 commit -m "feat(code): add exhaustive 34-element codec registry and Lucide/HTML5 support"
```

---

### Task 3: Real React Hooks & Dynamic JSX Bindings (`codeText`, `codeVisible`, `codeProps`, Scoped Identifiers)

**Files:**
- Create: `apps/editor/src/features/editor/lib/code/normalize/staticScope.ts`
- Modify: `apps/editor/src/features/editor/lib/code/astLiterals.ts`
- Modify: `apps/editor/src/features/editor/lib/code/codecs/registry.ts`
- Modify: `apps/editor/src/features/editor/lib/code/generator.ts`
- Modify: `apps/editor/src/features/editor/lib/code/parseElements.ts`
- Modify: `apps/editor/src/features/editor/lib/code/parseCode.ts`
- Test: `tests/code-hooks-roundtrip.test.ts`

**Interfaces:**
- Consumes: `CodeTextSegment`, `readCodeText`, `readCodeVisible`, `renderCodeTextPlaceholder` from `../customCode`
- Produces:
  - In `normalize/staticScope.ts`:
    - `StaticValue = string | number | boolean | null | undefined | readonly StaticValue[] | { readonly [key: string]: StaticValue }`
    - `ModuleScope = { readonly staticConsts: ReadonlyMap<string, StaticValue>; readonly boundIdentifiers: ReadonlySet<string>; readonly pureStaticStatements: ReadonlySet<t.Statement> }`
    - `analyzeModuleScope(program: t.Program, pageFn: t.Function | null): ModuleScope`
    - `evaluateStaticExpression(node: t.Node, consts: ReadonlyMap<string, StaticValue>): { readonly ok: true; readonly value: StaticValue } | { readonly ok: false }`
    - `findUnboundIdentifier(node: t.Node, allowed: ReadonlySet<string>): t.Identifier | null`

- [ ] **Step 1: Write the failing test in `tests/code-hooks-roundtrip.test.ts`**

Create `tests/code-hooks-roundtrip.test.ts` testing:
1. `useState` + `useEffect` + `onClick={() => setCount((c) => c + 1)}` + `onChange={(e) => setQuery(e.target.value)}` (verifying Review Focus #3: local arrow param `e` is recognized as bound!) + `Clicked {count} times` (`settings.codeText`) + `{open && <div className="p-4">Secret</div>}` (`settings.codeVisible = "open"`) + `<img src={avatarUrl} alt="Avatar" />` (`avatarUrl` bound via `useState`).
2. Round-trip regeneration (`generateToJSX` → `parseCode`) producing identical `elements` and `preamble`.
3. **Review Focus #2:** Mutating `button.content = "Submit now"` on the visual Canvas causes `generateToJSX` to emit `>Submit now<` instead of stale `Clicked {count} times`, and re-parsing drops `settings.codeText`.
4. Undeclared identifier check: `<img src={undeclaredLogoUrl} alt="Logo" />` (with no `undeclaredLogoUrl` in scope) fails with `ok: false` naming `undeclaredLogoUrl`.

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { codeGenerator } from "../apps/editor/src/features/editor/lib/code/generator";
import { parseCode } from "../apps/editor/src/features/editor/lib/code/parseCode";
import { diffTrees } from "../apps/editor/src/features/editor/utils/element/treeDiff";

const PAGE = "page_hooks";

const statefulSource = `
import React, { useState, useEffect } from 'react';

export default function Generated() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [avatarUrl] = useState('/me.png');

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <section className="p-6">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count} times</button>
      <button onClick={() => setOpen((prev) => !prev)}>Toggle</button>
      <img src={avatarUrl} alt="Avatar" />
      {open && (
        <div className="mt-4 rounded border p-4">
          <span>Query: {query}</span>
        </div>
      )}
    </section>
  );
}
`;

test("useState, useEffect, arrow handler params, dynamic text, and conditional blocks round-trip", async () => {
  const first = parseCode(statefulSource, [], PAGE);
  assert.ok(first.ok, first.ok ? "" : `${first.diagnostic.message} @${first.diagnostic.line}:${first.diagnostic.column}`);
  if (!first.ok) return;

  assert.match(first.preamble.body, /useState\(0\)/);
  assert.match(first.preamble.body, /useEffect\(/);

  const generated = await codeGenerator.generateToJSX(first.elements, undefined, {
    tagIds: true,
    preamble: first.preamble,
  });
  assert.match(generated, /Clicked \{count\} times/);
  assert.match(generated, /\{open && \(/);
  assert.match(generated, /onChange=\{\(e\) => setQuery\(e\.target\.value\)\}/);
  assert.match(generated, /src=\{avatarUrl\}/);

  const second = parseCode(generated, first.elements, PAGE);
  assert.ok(second.ok, second.ok ? "" : second.diagnostic.message);
  if (!second.ok) return;
  assert.deepEqual(diffTrees(first.elements, second.elements), []);
});

test("editing element.content visually on the Canvas overrides stale codeText", async () => {
  const parsed = parseCode(statefulSource, [], PAGE);
  assert.ok(parsed.ok);
  if (!parsed.ok) return;

  const section = parsed.elements[0] as unknown as { elements: Array<{ content: string; type: string }> };
  const counterBtn = section.elements.find((e) => e.type === "Button" && e.content.includes("{count}"))!;
  counterBtn.content = "Submit now";

  const regenerated = await codeGenerator.generateToJSX(parsed.elements, undefined, {
    tagIds: true,
    preamble: parsed.preamble,
  });
  assert.match(regenerated, />Submit now<\/button>/);
  assert.doesNotMatch(regenerated, /Clicked \{count\} times/);
});

test("undeclared identifiers in JSX attributes or children fail with exact diagnostic", () => {
  const badAttr = parseCode('export default () => <img src={missingUrl} alt="x" />;', [], PAGE);
  assert.equal(badAttr.ok, false);
  if (!badAttr.ok) assert.match(badAttr.diagnostic.message, /missingUrl/);

  const badChild = parseCode('export default () => <div>Hello {missingName}</div>;', [], PAGE);
  assert.equal(badChild.ok, false);
  if (!badChild.ok) assert.match(badChild.diagnostic.message, /missingName/);
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/code-hooks-roundtrip.test.ts`
Expected: FAIL (`Dynamic expressions can't be converted to visual elements`).

- [ ] **Step 3: Implement `normalize/staticScope.ts` and wire dynamic `codeText`, `codeVisible`, and scoped `codeProps`**

Create `apps/editor/src/features/editor/lib/code/normalize/staticScope.ts`:
- Collects bound names from `ImportDeclaration` specifiers, top-level `VariableDeclaration` / `FunctionDeclaration` / `ClassDeclaration` patterns (recursively walking `Identifier`, `ObjectPattern`, `ArrayPattern`, `AssignmentPattern`, `RestElement`), and the page function's parameters + body declarations.
- `evaluateStaticExpression(node, consts)` evaluates literals, arrays, plain objects, template literals over static values, unary `+/-`/`!`, and `cn(...)`/`clsx(...)` calls over static arguments.
- `findUnboundIdentifier(node, allowed)` recursively walks an AST expression while maintaining a lexical scope stack for nested `ArrowFunctionExpression` / `FunctionExpression` parameters and block `VariableDeclaration`s (so `(e) => setQuery(e.target.value)` adds `e` to the inner scope and skips non-computed member properties like `.target` and `.value` as well as object property keys!). Allows standard JS globals (`Math`, `JSON`, `Number`, `String`, `Boolean`, `Array`, `Object`, `Date`, `Intl`, `Promise`, `RegExp`, `Error`, `Map`, `Set`, `URL`, `URLSearchParams`, `console`, `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `undefined`, `NaN`, `Infinity`, `encodeURIComponent`, `decodeURIComponent`, `parseInt`, `parseFloat`).

Update `astLiterals.ts`, `parseElements.ts`, `codecs/registry.ts`, and `generator.ts`:
- In child splitting (`splitChildren`): when a `JSXExpressionContainer` is encountered:
  - If `evaluateStaticExpression` succeeds with a string/number, append as static text.
  - If the expression is `LogicalExpression` with `operator === "&&"` and `t.isJSXElement(right)` (unparenthesized or parenthesized), verify `findUnboundIdentifier(left, ctx.boundIdentifiers)` is `null`, attach `codeVisible = generate(left).code` onto the converted `right` child element!
  - Otherwise, if the parent tag accepts text and `findUnboundIdentifier(expr, ctx.boundIdentifiers)` is `null`, record `{ expr: generate(expr).code }` in `codeText` segments and `{${exprCode}}` in `content`!
- In attribute handling (`parseElements.ts`): when a modeled attribute (`src`, `href`, `alt`, `value`, etc.) has a non-literal `JSXExpressionContainer`:
  - Check `findUnboundIdentifier(expr, ctx.boundIdentifiers)`. If non-null, throw `new CodeError(\`'${bad.name}' is not defined in this component.\`, bad.loc)`.
  - If bound in scope, allow `collectCodeProps` to capture `src={avatarUrl}` into `settings.codeProps` (leaving `element.src` as `existing?.src ?? ""`) and suppress emitting duplicate empty `src=""` when `codeProps` already supplies `src=`!
- In `codecs/registry.ts` / `generator.ts`:
  - When `readCodeText(element.settings)` is present **and** `renderCodeTextPlaceholder(segments) === element.content`, emit JSX text + `t.jsxExpressionContainer(parseExpression(seg.expr))` nodes; if `element.content` changed on the Canvas, emit `textChild(element.content)`!
  - When `readCodeVisible(element.settings)` is present, wrap the generated `t.JSXElement` in `t.jsxExpressionContainer(t.logicalExpression("&&", parseExpression(cond), jsxElement))`.

- [ ] **Step 4: Run tests and typecheck**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/code-hooks-roundtrip.test.ts tests/code-editing.test.ts tests/code-codecs.test.ts && bun run --cwd apps/editor typecheck`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit Task 3**

```bash
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 add \
  apps/editor/src/features/editor/lib/code/normalize/staticScope.ts \
  apps/editor/src/features/editor/lib/code/astLiterals.ts \
  apps/editor/src/features/editor/lib/code/codecs/registry.ts \
  apps/editor/src/features/editor/lib/code/generator.ts \
  apps/editor/src/features/editor/lib/code/parseElements.ts \
  apps/editor/src/features/editor/lib/code/parseCode.ts \
  tests/code-hooks-roundtrip.test.ts
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 commit -m "feat(code): preserve React hooks, dynamic text, and conditional visibility"
```

---

### Task 4: Stage 1 Normalizer — Static `.map()` Unrolling, Fragments & Shadcn UI Lowering

**Files:**
- Create: `apps/editor/src/features/editor/lib/code/normalize/shadcnLowering.ts`
- Create: `apps/editor/src/features/editor/lib/code/normalize/unrollStaticJsx.ts`
- Modify: `apps/editor/src/features/editor/lib/code/extractPreamble.ts`
- Modify: `apps/editor/src/features/editor/lib/code/parseCode.ts`
- Test: `tests/code-normalize.test.ts`

**Interfaces:**
- Consumes: `ModuleScope`, `StaticValue`, `evaluateStaticExpression` from `./staticScope`
- Produces:
  - `MAX_UNROLLED_ITEMS = 100`
  - `collectShadcnBindings(program: t.Program, projectComponentImports: ReadonlySet<string>): ReadonlySet<string>` in `shadcnLowering.ts`
  - `lowerShadcnElement(node: t.JSXElement, activeShadcnTags: ReadonlySet<string>, consts: ReadonlyMap<string, StaticValue>): t.JSXElement` in `shadcnLowering.ts`
  - `unrollStaticJsxRoot(root: t.JSXElement | t.JSXFragment, scope: ModuleScope, activeShadcnTags: ReadonlySet<string>): { readonly root: t.JSXElement | t.JSXFragment; readonly consumedConsts: ReadonlySet<string> }` in `unrollStaticJsx.ts`

- [ ] **Step 1: Write the failing test in `tests/code-normalize.test.ts`**

Create `tests/code-normalize.test.ts` testing:
1. Static `const features = [{ title: "Fast", desc: "Instant" }, { title: "Safe", desc: "Typed" }]` unrolled via `{features.map((f, idx) => <Card key={f.title}><CardHeader><CardTitle>{f.title}</CardTitle><CardDescription>{f.desc}</CardDescription></CardHeader><CardContent><Badge variant="secondary">#{idx + 1}</Badge><Button variant="outline" size="sm">Try</Button></CardContent></Card>)}`.
2. Verifying `key` prop is stripped, `features` (used only by the unrolled `.map()`) is omitted from `preamble.top`, `<CardTitle>` becomes `Heading` (`level: 3`), `<CardDescription>` becomes `Text`, `<Badge>` becomes `Span` with badge classes, and `<Button variant="outline" size="sm">` becomes `Button` with outline/sm Tailwind classes + caller `className` merged!
3. Nested JSX fragments (`<><div>A</div><><span>B</span></></>`) flatten cleanly.
4. `.map()` over > 100 items fails with `CodeError` mentioning `100`.
5. **Review Focus #4:** When `import { Button } from '@/components/Button'` is present, `collectShadcnBindings` excludes `Button` so `<Button />` is NOT lowered to `<button>`.

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { collectShadcnBindings } from "../apps/editor/src/features/editor/lib/code/normalize/shadcnLowering";
import { parseCode } from "../apps/editor/src/features/editor/lib/code/parseCode";
import { parse } from "@babel/parser";

const PAGE = "page_norm";

test("static const .map(), cn(), nested fragments, and shadcn Card/Button/Badge compile cleanly", () => {
  const code = `
    import React from 'react';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { Separator } from '@/components/ui/separator';

    const plans = [
      { name: 'Starter', desc: 'For individuals' },
      { name: 'Team', desc: 'For startups' },
    ];

    export default function PricingPage() {
      return (
        <section className={cn('py-12', true && 'px-6', false && 'hidden')}>
          <>
            <h2 className="text-2xl font-bold">Plans</h2>
            <Separator className="my-4" />
          </>
          <div className="grid grid-cols-2 gap-6">
            {plans.map((plan, idx) => (
              <Card key={plan.name} className="p-2">
                <CardHeader>
                  <Badge variant="secondary">Tier {idx + 1}</Badge>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm">Choose {plan.name}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      );
    }
  `;

  const res = parseCode(code, [], PAGE);
  assert.ok(res.ok, res.ok ? "" : `${res.diagnostic.message} @${res.diagnostic.line}:${res.diagnostic.column}`);
  if (!res.ok) return;

  assert.equal(res.preamble.top, "", "purely static unrolled data is removed from preamble");
  const section = res.elements[0]!;
  assert.equal(section.tailwindStyles, "py-12 px-6");
  const sectionKids = (section as unknown as { elements: EditorElement[] }).elements;
  assert.equal(sectionKids[0]?.type, "Heading");
  assert.equal(sectionKids[1]?.type, "Separator");
  const grid = sectionKids[2] as unknown as { elements: EditorElement[] };
  assert.equal(grid.elements.length, 2);
  assert.equal(grid.elements[0]?.type, "Frame");
  assert.match(grid.elements[0]?.tailwindStyles ?? "", /rounded-xl/);
  assert.equal((grid.elements[0]?.settings as { codeProps?: string[] } | null)?.codeProps, undefined, "key must be stripped");
});

test("static .map() exceeding MAX_UNROLLED_ITEMS (100) returns a diagnostic", () => {
  const items = JSON.stringify(Array.from({ length: 101 }, (_, i) => i));
  const code = `const nums = ${items};\nexport default () => <section>{nums.map((n) => <span>{n}</span>)}</section>;`;
  const res = parseCode(code, [], PAGE);
  assert.equal(res.ok, false);
  if (!res.ok) assert.match(res.diagnostic.message, /100/);
});

test("project component import from @/components/Button is not hijacked by shadcnLowering", () => {
  const ast = parse(
    `import { Button } from '@/components/Button';\nimport { Card } from '@/components/ui/card';`,
    { sourceType: "module", plugins: ["jsx", "typescript"] },
  );
  const bindings = collectShadcnBindings(ast.program, new Set(["Button"]));
  assert.equal(bindings.has("Button"), false);
  assert.equal(bindings.has("Card"), true);
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/code-normalize.test.ts`
Expected: FAIL (`Cannot find module .../normalize/shadcnLowering`).

- [ ] **Step 3: Implement `shadcnLowering.ts`, `unrollStaticJsx.ts`, and wire into `parseCode.ts` & `extractPreamble.ts`**

Create `apps/editor/src/features/editor/lib/code/normalize/shadcnLowering.ts`:
- Recognizes `@/components/ui/*` imports AND unimported/standard shadcn UI tag names **except** any identifier imported from `@/components/<Name>` (non-`ui/`) or declared locally in the file (`projectComponentImports`).
- Implements class tables for `Button` (`variant`: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`; `size`: `default`, `sm`, `lg`, `icon`), `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Badge` (`default`, `secondary`, `destructive`, `outline`), `Alert`, `AlertTitle`, `AlertDescription`, `Separator` (`orientation`), `Input`, `Textarea`, `Label`, `Checkbox`, `Progress`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`.
- Strips consumed variant/size/orientation props and merges base Tailwind classes before any caller `className`.

Create `apps/editor/src/features/editor/lib/code/normalize/unrollStaticJsx.ts`:
- Flattens nested `JSXFragment` children into parent `JSXElement` / root `JSXFragment`.
- Evaluates static `className={cn(...)}` / `className={\`...\`}` expressions to `StringLiteral` when `evaluateStaticExpression` succeeds.
- Detects `<ident>.map((itemParam, idxParam?) => ...)` where `<ident>` is an array in `scope.staticConsts`: enforces `arr.length <= MAX_UNROLLED_ITEMS` (`CodeError("Static .map() loops can unroll at most 100 items.", callExpr.loc)`), clones the callback JSX body per element with `itemParam` and `idxParam` bound in a child static scope, evaluates static `{item.title}` / `{idx + 1}` expressions inside the cloned subtree into literals, strips `key` attributes on the yielded JSX element, preserves original `loc` on cloned nodes, and records `<ident>` in `consumedConsts`.

Update `extractPreamble.ts` to skip `@/components/ui/*` imports whose tags were lowered and skip top-level/body `VariableDeclaration` statements whose declarators were solely consumed by static `.map()` unrolling (and not referenced elsewhere in runtime expressions).

- [ ] **Step 4: Run tests and typecheck**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/code-normalize.test.ts tests/code-hooks-roundtrip.test.ts tests/code-codecs.test.ts tests/code-editing.test.ts && bun run --cwd apps/editor typecheck`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit Task 4**

```bash
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 add \
  apps/editor/src/features/editor/lib/code/normalize/shadcnLowering.ts \
  apps/editor/src/features/editor/lib/code/normalize/unrollStaticJsx.ts \
  apps/editor/src/features/editor/lib/code/extractPreamble.ts \
  apps/editor/src/features/editor/lib/code/parseCode.ts \
  tests/code-normalize.test.ts
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 commit -m "feat(code): unroll static .map() loops, flatten fragments, and lower shadcn UI tags"
```

---

### Task 5: Component Props, `"cp"` Master Round-Trip & Local Helper Component Extraction

**Files:**
- Create: `apps/editor/src/features/editor/lib/code/codecs/componentCodec.ts`
- Create: `apps/editor/src/features/editor/lib/code/normalize/extractComponents.ts`
- Modify: `apps/editor/src/features/editor/lib/code/generator.ts`
- Modify: `apps/editor/src/features/editor/lib/code/parseElements.ts`
- Modify: `apps/editor/src/features/editor/lib/code/parseCode.ts`
- Test: `tests/code-components.test.ts`

**Interfaces:**
- Consumes: `CatalogComponent`, `ComponentCatalog`, `ComponentPropBinding` from `../catalog`; `makeComponentInstance`, `ComponentOverrides` from `@webbuilder/site-runtime/projects/components`
- Produces:
  - `ExtractedComponentSpec = { readonly name: string; readonly pascalName: string; readonly root: EditorElement; readonly propBindings: Readonly<Record<string, ComponentPropBinding>> }`
  - `PendingComponentInstance = { readonly instanceId: string; readonly pascalName: string; readonly overrides?: ComponentOverrides }`
  - `ParseCodeOptions = { readonly catalog?: ComponentCatalog; readonly mode?: "preview" | "commit"; readonly isComponentPage?: boolean; readonly componentName?: string }`
  - Extended `ParseCodeSuccess`:
    ```ts
    export interface ParseCodeSuccess {
      readonly ok: true;
      readonly elements: EditorElement[];
      readonly preamble: Preamble;
      readonly pendingComponentNames: readonly string[];
      readonly extractedComponents: readonly ExtractedComponentSpec[];
      readonly pendingInstances: readonly PendingComponentInstance[];
    }
    ```
  - `bindExtractedComponentInstances(elements: readonly EditorElement[], pending: readonly PendingComponentInstance[], createdByPascalName: ReadonlyMap<string, { readonly pageId: string; readonly rootId: string }>): EditorElement[]`

- [ ] **Step 1: Write the failing test in `tests/code-components.test.ts`**

Create `tests/code-components.test.ts` testing:
1. Generating and parsing `<FeatureCard title="Instant" ctaHref="/start" />` against a `ComponentCatalog`, verifying `settings.component.overrides` maps `title` and `ctaHref` to the master node IDs, preserves untouched overrides/placement styles, and omits default-valued props when generating TSX.
2. **Review Focus #4 (end-to-end):** A `"cp"` component named `"Button"` imported via `import { Button } from '@/components/Button'` parses into a linked `"cp"` instance rather than a plain HTML `<button>`.
3. Generating and parsing a `"cp"` master page (`isComponentPage: true`, `componentName: "FeatureCard"`): emits `export interface FeatureCardProps` + `export function FeatureCard({ title = "Fast", ctaHref = "/go" }: FeatureCardProps)` and updates `root.settings.componentProps` + master default values on edit.
4. Local PascalCase helper `function FeatureCard({ title = "Fast", description = "Desc" })`:
   - In `mode: "preview"`, unrolls `<FeatureCard title="Pro" description="Best" />` inline onto the page and returns `pendingComponentNames: ["FeatureCard"]`, `extractedComponents: []`.
   - In `mode: "commit"`, extracts `ExtractedComponentSpec` (`root` with `settings.componentProps` for `title` and `description`), creates placeholder instances resolved by `bindExtractedComponentInstances`, and removes `function FeatureCard` from `preamble.top` so regenerating emits `import { FeatureCard } from '@/components/FeatureCard'`.
5. Cycle (`function Card() { return <div><Card /></div>; }`), fragment root (`function Bad() { return <><div /></>; }`), and conflicting existing `"cp"` component name (`function FeatureCard()` when `catalog` already has a different `FeatureCard`) all return `ok: false` diagnostics with line numbers.

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { componentSetting } from "@webbuilder/site-runtime/projects/components";
import { buildComponentCatalog } from "../apps/editor/src/features/editor/lib/code/catalog";
import { codeGenerator } from "../apps/editor/src/features/editor/lib/code/generator";
import { bindExtractedComponentInstances, parseCode } from "../apps/editor/src/features/editor/lib/code/parseCode";

const PAGE = "page_main";

function makeMaster(): EditorElement {
  return {
    id: "m_root",
    type: "Article",
    pageId: "cp_card",
    content: "",
    tailwindStyles: "rounded-xl border p-6",
    styles: {},
    settings: null,
    elements: [
      { id: "m_title", type: "Heading", pageId: "cp_card", parentId: "m_root", name: "Title", content: "Default Title", styles: {}, settings: { level: 3 } },
      { id: "m_cta", type: "Link", pageId: "cp_card", parentId: "m_root", name: "CTA", content: "Learn more", href: "/learn", styles: {}, settings: null, elements: [] },
    ],
  } as unknown as EditorElement;
}

test("project component instances generate clean imports/props and parse back into overrides", async () => {
  const master = makeMaster();
  const catalog = buildComponentCatalog([{ pageId: "cp_card", name: "Feature Card", root: master }]);
  const instance: EditorElement = {
    id: "inst_1",
    type: "Article",
    pageId: PAGE,
    content: "",
    tailwindStyles: "mt-4",
    styles: {},
    settings: {
      component: {
        pageId: "cp_card",
        rootId: "m_root",
        overrides: {
          m_title: { text: "Custom Title" },
          m_cta: { href: "/signup" },
        },
      },
    },
  } as unknown as EditorElement;

  const code = await codeGenerator.generateToJSX([instance], undefined, { tagIds: true, catalog });
  assert.match(code, /import \{ FeatureCard \} from '@\/components\/FeatureCard';/);
  assert.match(code, /<FeatureCard[^>]*title="Custom Title"[^>]*ctaHref="\/signup"/);
  assert.doesNotMatch(code, /ctaText=/, "default prop values are omitted");

  const edited = code.replace('title="Custom Title"', 'title="Updated Title"');
  const parsed = parseCode(edited, [instance], PAGE, { catalog });
  assert.ok(parsed.ok, parsed.ok ? "" : parsed.diagnostic.message);
  if (!parsed.ok) return;
  const setting = componentSetting(parsed.elements[0]!);
  assert.deepEqual(setting, {
    pageId: "cp_card",
    rootId: "m_root",
    overrides: {
      m_title: { text: "Updated Title" },
      m_cta: { href: "/signup" },
    },
  });
});

test("project component named Button imported from @/components/Button is not lowered as shadcn", () => {
  const btnMaster: EditorElement = {
    id: "bm_root",
    type: "Button",
    pageId: "cp_btn",
    name: "Label",
    content: "Click",
    styles: {},
    settings: null,
  } as unknown as EditorElement;
  const catalog = buildComponentCatalog([{ pageId: "cp_btn", name: "Button", root: btnMaster }]);
  const src = `
    import { Button } from '@/components/Button';
    export default function Page() {
      return <section><Button labelText="Launch" /></section>;
    }
  `;
  const res = parseCode(src, [], PAGE, { catalog });
  assert.ok(res.ok, res.ok ? "" : res.diagnostic.message);
  if (!res.ok) return;
  const child = (res.elements[0] as unknown as { elements: EditorElement[] }).elements[0]!;
  assert.equal(componentSetting(child)?.pageId, "cp_btn");
});

test("local PascalCase component previews inline and ports to ExtractedComponentSpec on commit", async () => {
  const src = `
    import React from 'react';

    function PricingTier({ plan = 'Starter', price = '$0' }: { plan?: string; price?: string }) {
      return (
        <article className="rounded-xl border p-6">
          <h3 className="font-bold">{plan}</h3>
          <p className="text-2xl">{price}</p>
        </article>
      );
    }

    export default function PricingPage() {
      return (
        <section className="grid grid-cols-2 gap-6">
          <PricingTier plan="Pro" price="$29" />
          <PricingTier plan="Enterprise" price="$99" />
        </section>
      );
    }
  `;

  const preview = parseCode(src, [], PAGE, { mode: "preview" });
  assert.ok(preview.ok);
  if (!preview.ok) return;
  assert.deepEqual(preview.pendingComponentNames, ["PricingTier"]);
  assert.equal(preview.extractedComponents.length, 0);
  const previewCards = (preview.elements[0] as unknown as { elements: EditorElement[] }).elements;
  assert.equal(previewCards.length, 2);
  assert.equal(componentSetting(previewCards[0]!), undefined, "preview inlines without component setting");

  const committed = parseCode(src, [], PAGE, { mode: "commit" });
  assert.ok(committed.ok, committed.ok ? "" : committed.diagnostic.message);
  if (!committed.ok) return;
  assert.equal(committed.extractedComponents.length, 1);
  const spec = committed.extractedComponents[0]!;
  assert.equal(spec.name, "PricingTier");
  assert.ok(spec.propBindings.plan);
  assert.ok(spec.propBindings.price);
  assert.doesNotMatch(committed.preamble.top, /function PricingTier/);

  const bound = bindExtractedComponentInstances(
    committed.elements,
    committed.pendingInstances,
    new Map([["PricingTier", { pageId: "cp_new", rootId: spec.root.id }]]),
  );
  const instances = (bound[0] as unknown as { elements: EditorElement[] }).elements;
  assert.equal(componentSetting(instances[0]!)?.pageId, "cp_new");
  assert.equal(componentSetting(instances[0]!)?.overrides?.[spec.propBindings.plan.nodeId]?.text, "Pro");
  assert.equal(componentSetting(instances[1]!)?.overrides?.[spec.propBindings.price.nodeId]?.text, "$99");
});

test("recursive local components, stateful local helpers, and existing 'cp' name collisions fail with diagnostics", () => {
  const recursive = parseCode(
    `function Loop() { return <div><Loop /></div>; }\nexport default () => <section><Loop /></section>;`,
    [],
    PAGE,
    { mode: "commit" },
  );
  assert.equal(recursive.ok, false);

  const statefulHelper = parseCode(
    `import { useState } from 'react';\nfunction CounterCard() { const [n] = useState(0); return <div>{n}</div>; }\nexport default () => <section><CounterCard /></section>;`,
    [],
    PAGE,
    { mode: "commit" },
  );
  assert.equal(statefulHelper.ok, false);
  if (!statefulHelper.ok) assert.match(statefulHelper.diagnostic.message, /hooks/i);

  const catalog = buildComponentCatalog([{ pageId: "cp_card", name: "FeatureCard", root: makeMaster() }]);
  const colliding = parseCode(
    `function FeatureCard() { return <div>Different</div>; }\nexport default () => <section><FeatureCard /></section>;`,
    [],
    PAGE,
    { catalog, mode: "commit" },
  );
  assert.equal(colliding.ok, false);
  if (!colliding.ok) assert.match(colliding.diagnostic.message, /already exists/);
});

test("editing a 'cp' master page directly generates and parses typed component props", async () => {
  const master = makeMaster();
  const code = await codeGenerator.generateToJSX([master], undefined, {
    tagIds: true,
    pageMeta: { isComponentPage: true, componentName: "Feature Card" },
  });
  assert.match(code, /export interface FeatureCardProps/);
  assert.match(code, /export function FeatureCard\(/);
  assert.match(code, /\{title\}/);

  const parsed = parseCode(code.replace("Default Title", "Updated Default"), [master], "cp_card", {
    isComponentPage: true,
    componentName: "Feature Card",
  });
  assert.ok(parsed.ok, parsed.ok ? "" : parsed.diagnostic.message);
  if (!parsed.ok) return;
  const titleEl = (parsed.elements[0] as unknown as { elements: EditorElement[] }).elements[0]!;
  assert.equal(titleEl.content, "Updated Default");
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/code-components.test.ts`
Expected: FAIL (`bindExtractedComponentInstances` not exported / component props not generated).

- [ ] **Step 3: Implement `codecs/componentCodec.ts`, `normalize/extractComponents.ts`, and wire `"cp"` master & instance round-trip**

Create `apps/editor/src/features/editor/lib/code/codecs/componentCodec.ts`:
- `generateComponentInstance(element, catalogEntry, ctx)`: emits `<PascalName ... />` with `className` (if `element.tailwindStyles` or placement `styles` produce classes), non-default prop attributes mapped from `settings.component.overrides`, `codeProps`, and `data-element-id` when `ctx.tagElementIds` is true; records `catalogEntry.pascalName` in `ctx.usedProjectComponents`.
- `parseComponentInstance(node, catalogEntry, parentId, ctx)`: forbids JSX children (`CodeError("Edit the <Name> component to change its children.", ...)`), maps literal prop attributes matching `catalogEntry.props` into `ComponentOverrides` (omitting overrides equal to `binding.defaultValue` unless clearing), validates unknown props against `ctx.boundIdentifiers`, and returns `makeComponentInstance(catalogEntry.root, pageId, overrides, existing)` with `tailwindStyles` preserved.
- `generateComponentMasterModule(...)` & `parseComponentMasterModule(...)`: handles `isComponentPage === true`, emitting `export interface <PascalName>Props` + destructured defaults and parsing `{propName}` references back into `root.settings.componentProps` and default values on master nodes.

Create `apps/editor/src/features/editor/lib/code/normalize/extractComponents.ts`:
- Finds top-level PascalCase functions/arrow declarations (excluding the located page component).
- Rejects fragment roots (`<>...</>`), direct/indirect recursion (`visiting` DFS set), and React hook calls (`/^use[A-Z0-9]/` or `React.use*`) inside local extracted helper components (`CodeError("Local helper component '<Name>' uses React hooks. Keep hooks on the page component for now (stateful extracted components arrive in Sub-project 3).", callExpr.loc)`).
- Checks `catalog.byPascalName`: if a `"cp"` component with that PascalCase name already exists and its structure differs, throws `CodeError("Component '<Name>' already exists in this project. Import '@/components/<Name>' or choose a different name.", fn.loc)`.
- Extracts parameter names + defaults (`{ plan = "Starter" }` or `props.plan`).
- In `mode: "preview"`, substitutes call-site prop attributes into a cloned AST of the helper's root JSX element and records `pendingComponentNames`.
- In `mode: "commit"`, hydrates the helper's root JSX element into an `EditorElement` tree (`pageId: "$pending"`), records `{ nodeId, field, defaultValue }` in `root.settings.componentProps`, emits `ExtractedComponentSpec` + `PendingComponentInstance` descriptors, and marks the helper `Statement` as extracted so `extractPreamble` omits it from `preamble.top`.
- Implement `bindExtractedComponentInstances` in `parseCode.ts` to rewrite each pending instance's `pageId` (on master clone if needed) and `settings.component = { pageId, rootId, ...(overrides && { overrides }) }` using `elementUtils.mapUpdateById`.

- [ ] **Step 4: Run tests and typecheck**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/code-components.test.ts tests/code-normalize.test.ts tests/code-hooks-roundtrip.test.ts tests/code-codecs.test.ts tests/code-editing.test.ts && bun run --cwd apps/editor typecheck`
Expected: PASS across all test suites and `typecheck`.

- [ ] **Step 5: Commit Task 5**

```bash
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 add \
  apps/editor/src/features/editor/lib/code/codecs/componentCodec.ts \
  apps/editor/src/features/editor/lib/code/normalize/extractComponents.ts \
  apps/editor/src/features/editor/lib/code/generator.ts \
  apps/editor/src/features/editor/lib/code/parseElements.ts \
  apps/editor/src/features/editor/lib/code/parseCode.ts \
  tests/code-components.test.ts
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 commit -m "feat(code): support typed component props and port local React components to cp masters"
```

---

### Task 6: Editor UI (`Cmd+S` Port & Save), `/api/generate-code`, Monaco Types, Agent Executor & Go MCP Integration

**Files:**
- Modify: `apps/editor/src/app/api/generate-code.ts`
- Modify: `apps/editor/src/features/elements/services/element.service.ts`
- Modify: `apps/editor/src/features/editor/lib/monaco/types.ts`
- Modify: `apps/editor/src/features/editor/hooks/useMonacoEditor.ts`
- Modify: `apps/editor/src/features/editor/components/editor/EditorCodePanel.tsx`
- Modify: `apps/editor/src/features/agent/executor.ts`
- Modify: `apps/editor/src/features/agent/AgentHost.tsx`
- Modify: `tests/agent-executor.test.ts`
- Modify: `tests/editor-logic-monaco-lib.test.ts`
- Modify: `../webbuilder.mcp.go/internal/agent/tools_tab.go`

**Interfaces:**
- Consumes: `buildComponentCatalog`, `CatalogComponentInput`, `ComponentCatalog`, `MAX_CATALOG_COMPONENTS` from `@/features/editor/lib/code/catalog`; `bindExtractedComponentInstances`, `parseCode` from `@/features/editor/lib/code/parseCode`
- Produces:
  - `updateMonacoComponentTypes(monaco: Monaco, catalog: ComponentCatalog): void` in `lib/monaco/types.ts`
  - Extended `AgentHost` methods in `features/agent/executor.ts`:
    - `createComponentFromTree?(name: string, root: EditorElement): Promise<{ id: string; name: string; rootId: string }>`
    - `deleteComponentMaster?(pageId: string): Promise<void>`
  - `useMonacoEditor` returns `{ ..., pendingComponentNames: readonly string[]; commitComponents: () => Promise<void>; isCommitting: boolean }`

- [ ] **Step 1: Write failing tests in `tests/agent-executor.test.ts` and `tests/editor-logic-monaco-lib.test.ts`**

Append to `tests/agent-executor.test.ts`:

```ts
test("set_code commits local PascalCase helper components into 'cp' masters and links instances", async () => {
  const createdMasters: Array<{ id: string; name: string; root: EditorElement }> = [];
  const { h, calls } = host({
    createComponentFromTree: async (name, root) => {
      const id = `cp_${createdMasters.length + 1}`;
      createdMasters.push({ id, name, root });
      return { id, name, rootId: root.id };
    },
  });
  const code = `
    function BadgeCard({ label = 'New' }: { label?: string }) {
      return <article className="p-4"><h3>{label}</h3></article>;
    }
    export default function Page() {
      return <section data-element-id="sec"><BadgeCard label="Featured" /></section>;
    }
  `;
  const out = await createExecutor(h)(req("set_code", { code }));
  assert.equal(out.ok, true, JSON.stringify(out));
  assert.equal(createdMasters.length, 1);
  assert.equal(createdMasters[0]?.name, "BadgeCard");
  assert.equal(calls.replace.length, 1);
  const card = (calls.replace[0]![0] as unknown as { elements: EditorElement[] }).elements[0]!;
  assert.deepEqual((card.settings as { component?: { pageId: string } })?.component?.pageId, "cp_1");
});

test("set_code refuses local component extraction when canCreatePages is false", async () => {
  const { h, calls } = host({ canCreatePages: () => false });
  const code = `
    function Card() { return <div>Hi</div>; }
    export default function Page() { return <section><Card /></section>; }
  `;
  const out = await createExecutor(h)(req("set_code", { code }));
  assert.equal(out.ok, false);
  if (!out.ok) assert.equal(out.error.code, "forbidden");
  assert.equal(calls.replace.length, 0);
});

test("set_code rolls back earlier created 'cp' masters if a later master creation fails (Review Focus #5)", async () => {
  const deleted: string[] = [];
  let attempt = 0;
  const { h, calls } = host({
    createComponentFromTree: async (name, root) => {
      attempt += 1;
      if (attempt === 2) throw new Error("socket timeout");
      return { id: `cp_${attempt}`, name, rootId: root.id };
    },
    deleteComponentMaster: async (pageId) => {
      deleted.push(pageId);
    },
  });
  const code = `
    function HeaderBar() { return <header>Top</header>; }
    function PricingCard() { return <article>Tier</article>; }
    export default function Page() {
      return <section><HeaderBar /><PricingCard /></section>;
    }
  `;
  const out = await createExecutor(h)(req("set_code", { code }));
  assert.equal(out.ok, false);
  assert.deepEqual(deleted, ["cp_1"], "first created master must be rolled back");
  assert.equal(calls.replace.length, 0, "open page tree must remain untouched");
});
```

Append to `tests/editor-logic-monaco-lib.test.ts`:

```ts
test('updateMonacoComponentTypes registers typed @/components/* and lucide-react declarations', async () => {
  const { updateMonacoComponentTypes } = await import('../apps/editor/src/features/editor/lib/monaco/types');
  const { buildComponentCatalog } = await import('../apps/editor/src/features/editor/lib/code/catalog');
  const libs: Array<{ content: string; path: string }> = [];
  const fakeMonaco = {
    languages: {
      typescript: {
        typescriptDefaults: {
          addExtraLib: (content: string, path: string) => {
            libs.push({ content, path });
            return { dispose: () => {} };
          },
        },
      },
    },
  };
  const catalog = buildComponentCatalog([
    {
      pageId: 'cp_1',
      name: 'Feature Card',
      root: {
        id: 'r1',
        type: 'Section',
        pageId: 'cp_1',
        content: '',
        styles: {},
        settings: null,
        elements: [{ id: 'h1', type: 'Heading', pageId: 'cp_1', parentId: 'r1', name: 'Title', content: 'Fast', styles: {}, settings: { level: 3 } }],
      } as never,
    },
  ]);
  updateMonacoComponentTypes(fakeMonaco as never, catalog);
  assert.ok(libs.some((l) => l.content.includes("declare module '@/components/FeatureCard'") && l.content.includes('title?: string')));
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/agent-executor.test.ts tests/editor-logic-monaco-lib.test.ts`
Expected: FAIL (`updateMonacoComponentTypes is not a function` and `set_code` component extraction assertions fail).

- [ ] **Step 3: Implement API, Monaco, UI, Executor/AgentHost, and MCP description updates**

1. Update `apps/editor/src/app/api/generate-code.ts` and `apps/editor/src/features/elements/services/element.service.ts`:
   - Accept optional `components?: CatalogComponentInput[]` (validate array length ≤ `MAX_CATALOG_COMPONENTS`) and `pageMeta?: { isComponentPage?: boolean; componentName?: string }`, build `catalog = buildComponentCatalog(components ?? [])`, and pass `{ tagIds: true, preamble, catalog, pageMeta }` to `codeGenerator.generateToJSX`.
2. Update `apps/editor/src/features/editor/lib/monaco/types.ts`:
   - Add `lucide-react` module declaration (`export type LucideProps = { size?: number | string; strokeWidth?: number | string; color?: string; fill?: string; absoluteStrokeWidth?: boolean; className?: string }; export const Star: React.FC<LucideProps>; ...` via mapped export index / common icons + wildcard stub) to `UI_COMPONENT_STUBS`.
   - Export `updateMonacoComponentTypes(monaco: Monaco, catalog: ComponentCatalog): void`, disposing any prior `@project-components` `IDisposable` before registering `file:///node_modules/@project-components/types.d.ts` with `declare module '@/components/<pascalName>'` and typed optional string props + `className?: string`.
3. Update `apps/editor/src/features/editor/hooks/useMonacoEditor.ts` and `EditorCodePanel.tsx`:
   - Read `const projectComponents = useProjectComponents();` and `isComponentPage` + `activePageName`, building `catalog = useMemo(() => buildComponentCatalog(...), [...])`.
   - Call `updateMonacoComponentTypes(monacoRef.current, catalog)` when `catalog` updates.
   - Track `pendingComponentNames: readonly string[]` from `parseCode(..., { catalog, mode: "preview", isComponentPage, componentName })`.
   - Implement `commitComponents()` (also bound to `editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => void commitComponents())`): runs `parseCode(currentCode, elementsRef.current, activePageId, { catalog, mode: "commit", isComponentPage, componentName })`, persists each `spec` via `createComponentMaster({ projectId, name: spec.name, source: spec.root, session: { userId, getToken } })` (rolling back via `deleteProjectPage` on error), calls `bindExtractedComponentInstances`, updates query caches (`projectKeys.pages(projectId)`, `rememberPendingMaster`), and calls `replaceTree(boundElements)`.
   - In `EditorCodePanel.tsx`, render a top-right button when `pendingComponentNames.length > 0 && canEdit`:
     ```tsx
     <button
       type="button"
       disabled={isCommitting}
       onClick={() => void commitComponents()}
       className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
     >
       {isCommitting ? "Saving…" : `Port ${pendingComponentNames.length} component${pendingComponentNames.length === 1 ? "" : "s"} (⌘S)`}
     </button>
     ```
4. Update `apps/editor/src/features/agent/executor.ts` and `AgentHost.tsx`:
   - In `AgentHost.tsx`:
     - Update `generateCode` to fetch component masters and pass `components` + `pageMeta` to `elementService.generateCode`.
     - Provide `createComponentFromTree: async (name, root) => { const res = await createComponentMaster({ projectId, name, source: root, session: { userId: userId!, getToken } }); ... return { id: res.page.Id, name: res.page.Name, rootId: res.root!.id }; }` and `deleteComponentMaster: async (cpPageId) => { await deleteProjectPage({ data: { projectId: id!, pageId: cpPageId } }); }`.
   - In `executor.ts` `case "set_code":`:
     - Build `catalog` from `await host.getComponents()` (`componentRoots(source)` + `source.pages`).
     - Run `parseCode(args.code, before, pageId, { catalog, mode: "commit", isComponentPage: host.isComponentPage?.(), componentName: currentComponentName })`.
     - If `parsed.extractedComponents.length > 0`:
       - Check `if (!host.canCreatePages()) return error("forbidden", "The user cannot create components in this project.");`
       - Persist each `spec` sequentially with `host.createComponentFromTree`, tracking `createdIds: string[]`; inside `catch`, call `await Promise.allSettled(createdIds.map((cid) => host.deleteComponentMaster?.(cid)))` and rethrow / return internal error without calling `replaceTree`!
       - Resolve `finalElements = bindExtractedComponentInstances(parsed.elements, parsed.pendingInstances, createdMap)` and pass `finalElements` to `playTreeChange` / `replaceTree`.
5. Update `get_code` and `set_code` descriptions in `/home/ghug/Code/Go/webbuilder/webbuilder.mcp.go/internal/agent/tools_tab.go` to document full HTML5/shadcn/Lucide JSX, `@/components/<Name>` imports & named props, automatic porting of local PascalCase helper functions into reusable project components, and preservation of React hooks (`useState`, `useEffect`, etc.).

- [ ] **Step 4: Run full frontend + Go MCP verification suites**

Run:
```bash
cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && \
  bun run typecheck && \
  bun run test:unit && \
  cd /home/ghug/Code/Go/webbuilder/webbuilder.mcp.go && \
  go vet ./... && \
  go test ./...
```
Expected: All TypeScript workspace typechecks pass with 0 errors, all `tests/*.test.ts` unit tests pass, and `go vet` + `go test ./...` pass in `webbuilder.mcp.go`.

- [ ] **Step 5: Commit Task 6 in `webbuilderv2` and `webbuilder.mcp.go`**

```bash
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 add \
  apps/editor/src/app/api/generate-code.ts \
  apps/editor/src/features/elements/services/element.service.ts \
  apps/editor/src/features/editor/lib/monaco/types.ts \
  apps/editor/src/features/editor/hooks/useMonacoEditor.ts \
  apps/editor/src/features/editor/components/editor/EditorCodePanel.tsx \
  apps/editor/src/features/agent/executor.ts \
  apps/editor/src/features/agent/AgentHost.tsx \
  tests/agent-executor.test.ts \
  tests/editor-logic-monaco-lib.test.ts
git -C /home/ghug/Code/Go/webbuilder/webbuilderv2 commit -m "feat(editor,agent): wire component catalog, Cmd+S component porting, and transactional set_code"

git -C /home/ghug/Code/Go/webbuilder/webbuilder.mcp.go add internal/agent/tools_tab.go
git -C /home/ghug/Code/Go/webbuilder/webbuilder.mcp.go commit -m "docs(mcp): document React components, shadcn/Lucide JSX, and hooks in get_code/set_code"
```
