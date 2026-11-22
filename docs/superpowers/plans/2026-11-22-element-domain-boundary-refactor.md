# Element Domain & Editor Boundary Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the core circular dependencies in `webbuilderv2` (`types/` ↔ `features/editor` ↔ `features/elements` ↔ `features/preview` and `features/projects` ↔ `features/editor`) and remove stateful layer inversions from `src/features/editor/utils/`, backed by an AST-based boundary regression test.

**Architecture:** Extract pure element domain types, component-setting types, validation rules, event types/constants, and element-type lists into a zero-feature foundation layer under `src/types/elements/`. Relocate pure element rendering helpers (`replacePlaceholders`, `resolveContent`, `link-props`) into `src/features/elements/lib/` so `src/features/elements/` becomes a pure leaf feature, and move stateful editor orchestration (`componentDrop`, `keyBoardEvents`, `ElementFactory`) from `src/features/editor/utils/` into `src/features/editor/lib/`. Preserve compatibility via thin re-exports in `src/types/global.type.ts`, `src/features/projects/lib/components.ts`, `src/features/editor/constants/elements.ts`, `src/features/editor/constants/events.ts`, and `src/features/editor/interfaces/*.ts`.

**Tech Stack:** TypeScript 5.9 (`strict: true`), React 19, Vite 8 (Rolldown), TanStack Start, Node.js built-in test runner (`node --import tsx --test`), TypeScript Compiler API (`typescript`) for AST-based import scanning in tests.

**Spec:** [docs/superpowers/specs/2026-11-22-element-domain-boundary-refactor-design.md](../specs/2026-11-22-element-domain-boundary-refactor-design.md)

## Global Constraints

- Zero UI or runtime behavior changes — strictly structural refactoring.
- Zero `any` types in any newly created or modified TypeScript files (`unknown` + narrowing, and `Settings extends object = Record<string, unknown>` on `Element`).
- Preserve all existing public exports of `src/types/global.type.ts`, `src/features/editor/index.ts`, `src/features/editor/constants/elements.ts`, and `src/features/projects/lib/components.ts`.
- Do not modify unrelated cross-feature cycles (`collaboration ↔ editor`, `interactions ↔ editor`, `auth ↔ projects`).
- All three verification gates must pass before completion: `npx tsc --noEmit`, `npm run test:unit`, and `npm run build`.

## Review Focus

- **Comments & string literals in the boundary scanner:** A regex-based scanner can false-positive on comments or template strings containing `import ... from`; using `ts.createSourceFile` AST traversal plus an explicit fixture test pins this down (Task 1).
- **Dynamic `import(...)`, `export ... from`, and `import("...").T` type queries:** Boundary rules must catch all module-reference forms, not just top-level `import` declarations — pinned by unit tests on the AST extractor (Task 1).
- **Runtime circular initialization under `node --import tsx`:** Loading `src/types/global.type.ts`, `src/types/elements/index.ts`, `src/features/elements/registry.ts`, and `src/features/projects/lib/components.ts` directly must succeed without triggering editor store initialization or `ReferenceError` — pinned by an isolated-import test (Task 2).
- **Strict assignability of concrete Settings interfaces without index signatures:** `Element<Type, Settings extends object = Record<string, unknown>>` must accept interfaces like `HeadingSettings`, `FormSettings`, and `Partial<HTMLSelectElement>` without `any` — pinned by `npx tsc --noEmit` across all 34 element types and callers (Task 1).
- **Compatibility shim identity:** Re-exported runtime values (`CONTAINER_ELEMENT_TYPES`, `EDITABLE_ELEMENT_TYPES`, `ALL_ELEMENT_TYPES`, `EVENT_TYPES`, `ACTION_TYPES`, `resolveContent`) must remain reference-identical between canonical modules and compatibility paths — pinned by identity assertions (Tasks 1 & 2).

---

### Task 1: Extract Pure Element Domain Layer (`src/types/elements/*`) & Break `types/` and `projects/` Cycles

**Files:**
- Create: `tests/architecture-boundaries.test.ts`
- Create: `src/types/elements/component-setting.ts`
- Create: `src/types/elements/event-constants.ts`
- Create: `src/types/elements/events.ts`
- Create: `src/types/elements/validation.ts`
- Create: `src/types/elements/elements.ts`
- Create: `src/types/elements/element-types.ts`
- Create: `src/types/elements/index.ts`
- Modify: `src/types/global.type.ts:1-38`
- Modify: `src/features/projects/lib/components.ts:1-12`
- Modify: `src/features/editor/constants/elements.ts:1-117`
- Modify: `src/features/editor/constants/events.ts:1-360`
- Modify: `src/features/editor/interfaces/elements.interface.ts:1-424`
- Modify: `src/features/editor/interfaces/events.interface.ts:1-179`
- Modify: `src/features/editor/interfaces/validate.interface.ts:1-55`

**Interfaces:**
- Consumes: none (foundation layer).
- Produces:
  - `@/types/elements` exporting:
    - `ComponentOverride`, `ComponentOverrides`, `ComponentSetting`
    - `EVENT_TYPES`, `ACTION_TYPES`, `HTTP_METHODS`, `NAVIGATE_TARGETS`, `ANIMATION_TYPES`, `NOTIFICATION_TYPES`, `SCROLL_BEHAVIORS`, `SCROLL_TARGETS`, `MODAL_ACTIONS`, `DATA_VALUE_TYPES`, `EVENT_VALUE_SOURCES`, `CONDITION_TYPES`, `CONDITION_OPERATORS`, `BODY_TYPES`, label records, value getters, type guards
    - `EventType`, `ActionType`, `EventActionConfig`, `ConditionOperator`, `EventCondition`, `EventHandler`, `ElementEvents`, `EventExecutionContext`, `EventRegistry` (and all individual `*ActionConfig` interfaces)
    - `RuleType`, `ValidationRule` (and all concrete rule interfaces)
    - `CSSStyles`, `Breakpoint`, `ResponsiveStyles`, `Element`, all 34 concrete `*Element` & `*Settings` interfaces, `TableColumnDefinition`, `ElementTypeMap`, `ElementType`, `EditorElement`
    - `CONTAINER_ELEMENT_TYPES`, `EDITABLE_ELEMENT_TYPES`, `ALL_ELEMENT_TYPES`, `ContainerElementType`, `EditableElementType`, `isContainerElement`, `isEditableElement`
  - `tests/architecture-boundaries.test.ts` helper `extractModuleSpecifiers(sourceText: string, fileName: string): string[]` and `resolveImportToSrcRelative(sourceFileRel: string, specifier: string): string | null`.

- [ ] **Step 1: Write the failing boundary & AST-extractor tests in `tests/architecture-boundaries.test.ts`**

Create `tests/architecture-boundaries.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the boundary test to verify Rules 1 and 3 fail before refactoring**

Run: `node --import tsx --test tests/architecture-boundaries.test.ts`
Expected:
- AST extractor test PASSES.
- Rule 1 FAILS listing `types/global.type.ts -> @/features/editor` and `types/global.type.ts -> @/features/editor/interfaces/elements.interface`.
- Rule 3 FAILS listing `features/projects/lib/components.ts -> @/features/editor/constants/elements`.

- [ ] **Step 3: Create `src/types/elements/` modules**

1. Create `src/types/elements/component-setting.ts`:

```ts
export type ComponentOverride = {
  text?: string;
  src?: string;
  alt?: string;
  href?: string;
};

export type ComponentOverrides = Record<string, ComponentOverride>;

export type ComponentSetting = {
  pageId: string;
  rootId: string;
  overrides?: ComponentOverrides;
};
```

2. Create `src/types/elements/event-constants.ts` by moving the contents of `src/features/editor/constants/events.ts` verbatim (no `any` present, zero external imports).

3. Create `src/types/elements/events.ts` from `src/features/editor/interfaces/events.interface.ts`, importing `EventTypeEvent` and `ActionTypeEvent` from `./event-constants`, and replacing every `any` with `unknown`:
   - `ApiCallActionConfig.body?: Record<string, unknown>;`
   - `SetDataActionConfig.value?: unknown;`
   - `EventCondition.right?: unknown;`
   - `EventExecutionContext`:
     ```ts
     export interface EventExecutionContext {
       element: unknown;
       event?: Event | React.SyntheticEvent;
       elementState: Record<string, unknown>;
       globalState?: Record<string, unknown>;
       elementInstance?: unknown;
     }
     ```
   - Include `import type React from "react";` at the top so `React.SyntheticEvent` resolves cleanly under `isolatedModules`.

4. Create `src/types/elements/validation.ts` from `src/features/editor/interfaces/validate.interface.ts`, replacing every `T = any` with `T = unknown`:

```ts
export type RuleType =
  | "minLength"
  | "maxLength"
  | "pattern"
  | "required"
  | "min"
  | "max"
  | "custom";

interface BaseValidationRule<T = unknown> {
  rule: RuleType;
  message: string;
  readonly _typeBrand?: T;
}

interface ValueRule<T> extends BaseValidationRule<T> {
  value: T;
}

export interface MinLengthRule extends ValueRule<number> {
  rule: "minLength";
}

export interface MaxLengthRule extends ValueRule<number> {
  rule: "maxLength";
}

export interface PatternRule extends ValueRule<RegExp | string> {
  rule: "pattern";
}

export interface RequiredRule extends BaseValidationRule {
  rule: "required";
}

export interface MinRule extends ValueRule<number> {
  rule: "min";
}

export interface MaxRule extends ValueRule<number> {
  rule: "max";
}

export interface CustomRule<T = unknown> extends BaseValidationRule<T> {
  rule: "custom";
  validateFn: (value: T) => boolean;
}

export type ValidationRule<T = unknown> =
  | RequiredRule
  | MinLengthRule
  | MaxLengthRule
  | PatternRule
  | MinRule
  | MaxRule
  | CustomRule<T>;
```

5. Create `src/types/elements/elements.ts` from `src/features/editor/interfaces/elements.interface.ts`:
   - Replace the top imports with:
     ```ts
     import type React from "react";
     import type { CSSProperties } from "react";
     import type { EmblaOptionsType } from "embla-carousel";
     import type { ComponentSetting } from "./component-setting";
     import type { ElementEvents } from "./events";
     import type { ValidationRule } from "./validation";
     ```
   - Define `export type ElementType = keyof ElementTypeMap;` directly in this file (eliminating the `elements.ts` ↔ `global.type.ts` cycle).
   - Define `Element` with zero `any`:
     ```ts
     export interface Element<
       Type extends ElementType = ElementType,
       Settings extends object = Record<string, unknown>,
     > extends Partial<React.HTMLAttributes<HTMLElement>> {
     ```
   - Replace `CMSContentSettings.filterBy?: Record<string, any>;` with `filterBy?: Record<string, unknown>;`.
   - Keep all 34 concrete element interfaces, settings interfaces, `TableColumnDefinition`, `EditorElement`, and `ElementTypeMap`.

6. Create `src/types/elements/element-types.ts`:

```ts
import type { ElementType } from "./elements";

export const CONTAINER_ELEMENT_TYPES = [
  "Frame",
  "Form",
  "List",
  "Section",
  "Carousel",
  "CMSContentList",
  "CMSContentItem",
  "CMSContentGrid",
  "Table",
  "Nav",
  "Header",
  "Footer",
  "Article",
  "Aside",
] as const;

export const EDITABLE_ELEMENT_TYPES = [
  "Text",
  "Span",
  "Heading",
  "Label",
  "Blockquote",
  "Code",
  "Button",
  "Input",
  "Textarea",
  "Select",
  "Link",
] as const;

export const ALL_ELEMENT_TYPES = [
  ...CONTAINER_ELEMENT_TYPES,
  ...EDITABLE_ELEMENT_TYPES,
  "Image",
  "Video",
  "Audio",
  "IFrame",
  "Separator",
  "Icon",
  "Checkbox",
  "Radio",
  "Progress",
] as const satisfies readonly ElementType[];

export type ContainerElementType = (typeof CONTAINER_ELEMENT_TYPES)[number];
export type EditableElementType = (typeof EDITABLE_ELEMENT_TYPES)[number];

type AssertAllTypesListed<T extends true> = T;
type _AllElementTypesListed = AssertAllTypesListed<
  Exclude<ElementType, (typeof ALL_ELEMENT_TYPES)[number]> extends never ? true : false
>;

export const isContainerElement = (
  type: ElementType,
): type is ContainerElementType => {
  return (CONTAINER_ELEMENT_TYPES as readonly ElementType[]).includes(type);
};

export const isEditableElement = (
  type: ElementType,
): type is EditableElementType => {
  return (EDITABLE_ELEMENT_TYPES as readonly ElementType[]).includes(type);
};
```

7. Create `src/types/elements/index.ts`:

```ts
export * from "./component-setting";
export * from "./element-types";
export * from "./elements";
export * from "./event-constants";
export * from "./events";
export * from "./validation";
```

- [ ] **Step 4: Rewire `src/types/global.type.ts`, `src/features/projects/lib/components.ts`, and editor compatibility shims**

1. Update `src/types/global.type.ts`:

```ts
import type {
  ContainerElementType,
  EditableElementType,
  EditorElement,
  ElementType,
  ElementTypeMap,
} from "./elements";

type ContainerElement = Extract<EditorElement, { type: ContainerElementType }>;

type ExcludeType = "id" | "pageId" | "parentId";

type ContainerElementTemplate = Partial<Omit<EditorElement, ExcludeType>> & {
  type: ContainerElementType;
  elements?: ElementTemplate[];
};

type LeafElementTemplate = Partial<Omit<EditorElement, ExcludeType>> & {
  type: Exclude<ElementType, ContainerElementType>;
};

type ElementTemplate = ContainerElementTemplate | LeafElementTemplate;

export type {
  EditorElement,
  EditableElementType,
  ContainerElement,
  ElementType,
  ContainerElementType,
  ContainerElementTemplate,
  LeafElementTemplate,
  ElementTemplate,
  ElementTypeMap,
};
```

2. Update `src/features/projects/lib/components.ts` lines 1–10:

```ts
import { newEntityId } from "@/lib/entity-id";
import {
  CONTAINER_ELEMENT_TYPES,
  type ComponentOverride,
  type ComponentOverrides,
  type ComponentSetting,
} from "@/types/elements";
import type { EditorElement } from "@/types/global.type";

export type { ComponentOverride, ComponentOverrides, ComponentSetting };
```

3. Update `src/features/editor/constants/elements.ts` by replacing lines 1–54 (imports, array constants, `ElementType`, and exhaustiveness assertion) and deleting lines 105–115 (`isContainerElement`, `isEditableElement`), while keeping `ELEMENT_METADATA` (lines 55–90), `ElementHolder`, `elementHolders` (lines 92–103), and `export default elementHolders;` intact:

```ts
import {
  ALL_ELEMENT_TYPES,
  CONTAINER_ELEMENT_TYPES,
  EDITABLE_ELEMENT_TYPES,
  isContainerElement,
  isEditableElement,
  type ElementType,
} from "@/types/elements";
import type { IconName } from "@/features/editor/utils/icons/iconMap";

export {
  ALL_ELEMENT_TYPES,
  CONTAINER_ELEMENT_TYPES,
  EDITABLE_ELEMENT_TYPES,
  isContainerElement,
  isEditableElement,
  type ElementType,
};
```

4. Replace the four editor re-export shims:
   - `src/features/editor/interfaces/elements.interface.ts`: `export * from "@/types/elements/elements";`
   - `src/features/editor/interfaces/events.interface.ts`: `export * from "@/types/elements/events";`
   - `src/features/editor/interfaces/validate.interface.ts`: `export * from "@/types/elements/validation";`
   - `src/features/editor/constants/events.ts`: `export * from "@/types/elements/event-constants";`

- [ ] **Step 5: Add compatibility-identity assertions to `tests/architecture-boundaries.test.ts` and verify**

Append a test to `tests/architecture-boundaries.test.ts`:

```ts
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
```

Run: `npx tsc --noEmit && node --import tsx --test tests/architecture-boundaries.test.ts && npm run test:unit`
- If `npx tsc --noEmit` flags any existing caller relying on `any` in `EventExecutionContext`, `ApiCallActionConfig.body`, `SetDataActionConfig.value`, `EventCondition.right`, or `CMSContentSettings.filterBy`, tighten those callers with explicit narrowing (no `any`) and re-run.
Expected: `tsc --noEmit` exits 0, `architecture-boundaries.test.ts` PASSES, all 463+ unit tests PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/types/ src/features/projects/lib/components.ts src/features/editor/constants/ src/features/editor/interfaces/ tests/architecture-boundaries.test.ts
git commit -m "refactor(types): extract pure element domain layer and break types/projects cycles"
```

---

### Task 2: Make `src/features/elements/` a Pure Leaf Feature (Break `elements ↔ editor` & `elements ↔ preview`)

**Files:**
- Modify: `tests/architecture-boundaries.test.ts`
- Create: `src/features/elements/lib/replacePlaceholders.ts`
- Create: `src/features/elements/lib/resolveContent.ts`
- Create: `src/features/elements/lib/link-props.ts`
- Delete: `src/features/editor/utils/element/replacePlaceholders.ts`
- Delete: `src/features/editor/utils/element/resolveContent.ts`
- Delete: `src/features/preview/lib/link-props.ts`
- Modify (18 views):
  - `src/features/elements/views/ButtonView.tsx`
  - `src/features/elements/views/CMSCollectionView.tsx`
  - `src/features/elements/views/CarouselView.tsx`
  - `src/features/elements/views/ChoiceInputView.tsx`
  - `src/features/elements/views/CodeView.tsx`
  - `src/features/elements/views/FormView.tsx`
  - `src/features/elements/views/FrameView.tsx`
  - `src/features/elements/views/IFrameView.tsx`
  - `src/features/elements/views/IconView.tsx`
  - `src/features/elements/views/ImageView.tsx`
  - `src/features/elements/views/InputView.tsx`
  - `src/features/elements/views/LinkView.tsx`
  - `src/features/elements/views/ListView.tsx`
  - `src/features/elements/views/MediaView.tsx`
  - `src/features/elements/views/ProgressView.tsx`
  - `src/features/elements/views/SelectView.tsx`
  - `src/features/elements/views/TableView.tsx`
  - `src/features/elements/views/TextView.tsx`
  - `src/features/elements/views/TextareaView.tsx`
- Modify (direct callers of moved files / interfaces):
  - `src/features/preview/components/PreviewCMSContent.tsx`
  - `src/features/editor/utils/element/elementhelper.ts`
  - `src/features/editor/components/elements/shared/index.ts`
  - `tests/resolve-content.test.ts`

**Interfaces:**
- Consumes: `@/types/elements` from Task 1 (`ButtonElement`, `LinkElement`, all other concrete `*Element` interfaces, `ALL_ELEMENT_TYPES`, `ResponsiveStyles`).
- Produces:
  - `@/features/elements/lib/replacePlaceholders` → `replacePlaceholders(text: string, data: unknown): string`
  - `@/features/elements/lib/resolveContent` → `resolveContent(element: ContentElement, data: unknown, isEditing: boolean): string`
  - `@/features/elements/lib/link-props` → `previewLinkProps(element: LinkElement | ButtonElement): { href: string; target: string | undefined; rel: string | undefined } | undefined`

- [ ] **Step 1: Add Rule 2 and isolated-import check to `tests/architecture-boundaries.test.ts`**

Append to `tests/architecture-boundaries.test.ts`:

```ts
test("boundary rule 2: src/features/elements/** never imports from any other src/features/<other>/**", () => {
  const violations = collectViolations("features/elements/", (resolved) =>
    resolved.startsWith("features/") &&
    resolved !== "features/elements" &&
    !resolved.startsWith("features/elements/"),
  );
  assert.deepEqual(violations, [], `Forbidden cross-feature imports from features/elements:\n${violations.join("\n")}`);
});

test("isolated loading of types, elements registry, and projects/components has no circular init errors", async () => {
  const globalTypes = await import("../src/types/global.type");
  const elementsDomain = await import("../src/types/elements");
  const registry = await import("../src/features/elements/registry");
  const projectsComponents = await import("../src/features/projects/lib/components");
  const resolveMod = await import("../src/features/elements/lib/resolveContent");

  assert.ok(globalTypes);
  assert.ok(elementsDomain.ALL_ELEMENT_TYPES.length > 0);
  assert.equal(typeof registry.getView, "function");
  assert.equal(typeof projectsComponents.resolveComponents, "function");
  assert.equal(typeof resolveMod.resolveContent, "function");
});
```

- [ ] **Step 2: Run boundary test to verify Rule 2 fails**

Run: `node --import tsx --test tests/architecture-boundaries.test.ts`
Expected: FAIL reporting the 23 cross-feature imports from `src/features/elements/views/*` into `features/editor` and `features/preview`, and missing `src/features/elements/lib/resolveContent`.

- [ ] **Step 3: Move the 3 pure helpers into `src/features/elements/lib/`**

1. Create `src/features/elements/lib/replacePlaceholders.ts` (copy from `src/features/editor/utils/element/replacePlaceholders.ts` unchanged).
2. Create `src/features/elements/lib/resolveContent.ts`:

```ts
import { replacePlaceholders } from "./replacePlaceholders";

interface ContentElement {
  content?: unknown;
}

export function resolveContent(
  element: ContentElement,
  data: unknown,
  isEditing: boolean,
): string {
  const rawContent = typeof element.content === "string" ? element.content : "";
  const dataContent =
    typeof data === "string"
      ? data
      : data && typeof data === "object" && "content" in data && typeof data.content === "string"
        ? data.content
        : "";

  let content = dataContent || rawContent;

  if (rawContent && data && typeof data === "object") {
    content = replacePlaceholders(rawContent, data);
  }

  return isEditing ? rawContent : content;
}
```

3. Create `src/features/elements/lib/link-props.ts` (copy from `src/features/preview/lib/link-props.ts`, changing line 1):

```ts
import type { ButtonElement, LinkElement } from "@/types/elements";
```

4. Delete the 3 old files:
   - `src/features/editor/utils/element/replacePlaceholders.ts`
   - `src/features/editor/utils/element/resolveContent.ts`
   - `src/features/preview/lib/link-props.ts`

- [ ] **Step 4: Update all 19 view files in `src/features/elements/views/*` and the 4 direct callers**

1. In all 18 view files importing from `@/features/editor/interfaces/elements.interface` (`ButtonView.tsx`, `CMSCollectionView.tsx`, `CarouselView.tsx`, `ChoiceInputView.tsx`, `CodeView.tsx`, `FormView.tsx`, `FrameView.tsx`, `IFrameView.tsx`, `IconView.tsx`, `ImageView.tsx`, `InputView.tsx`, `LinkView.tsx`, `ListView.tsx`, `MediaView.tsx`, `ProgressView.tsx`, `SelectView.tsx`, `TableView.tsx`, `TextareaView.tsx`):
   - Replace `"@/features/editor/interfaces/elements.interface"` with `"@/types/elements"`.
2. In `CodeView.tsx`, `LinkView.tsx`, `TextView.tsx`:
   - Replace `"@/features/editor/utils/element/resolveContent"` with `"../lib/resolveContent"`.
3. In `ButtonView.tsx`, `LinkView.tsx`:
   - Replace `"@/features/preview/lib/link-props"` with `"../lib/link-props"`.
4. Update the 4 external callers:
   - `src/features/preview/components/PreviewCMSContent.tsx:2`:
     `import type { CMSContentGridElement, CMSContentItemElement, CMSContentListElement } from "@/types/elements";`
   - `src/features/editor/utils/element/elementhelper.ts:1-5`:
     ```ts
     import { replacePlaceholders } from "@/features/elements/lib/replacePlaceholders";
     import { EditorElement, ElementType } from "@/types/global.type";
     import { ElementTreeHelper } from "./element-tree-helper";
     import { ALL_ELEMENT_TYPES, type ResponsiveStyles } from "@/types/elements";
     ```
   - `src/features/editor/components/elements/shared/index.ts:3`:
     `export { resolveContent } from "@/features/elements/lib/resolveContent";`
   - `tests/resolve-content.test.ts:3`:
     `import { resolveContent } from "../src/features/elements/lib/resolveContent";`

- [ ] **Step 5: Verify TypeScript and tests pass**

Run: `npx tsc --noEmit && node --import tsx --test tests/architecture-boundaries.test.ts tests/resolve-content.test.ts tests/preview-links.test.ts tests/element-views.test.ts`
Expected: `tsc --noEmit` exits 0; all four test files PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/features/elements/ src/features/preview/ src/features/editor/ tests/architecture-boundaries.test.ts tests/resolve-content.test.ts
git commit -m "refactor(elements): make features/elements a pure leaf feature"
```

---

### Task 3: Clean Up `src/features/editor/utils/` Layer Inversions & Barrel Imports

**Files:**
- Modify: `tests/architecture-boundaries.test.ts`
- Create: `src/features/editor/lib/componentDrop.ts`
- Create: `src/features/editor/lib/keyBoardEvents.ts`
- Create: `src/features/editor/lib/ElementFactory.ts`
- Delete: `src/features/editor/utils/element/componentDrop.ts`
- Delete: `src/features/editor/utils/element/keyBoardEvents.ts`
- Delete: `src/features/editor/utils/element/create/ElementFactory.ts`
- Modify (pure utils cleaned of barrel/constants imports):
  - `src/features/editor/utils/element/computeTailwindFromStyles.ts:3`
  - `src/features/editor/utils/element/create/elementCreateStrategy.ts:1-21`
  - `src/features/editor/utils/element/element-tree-helper.ts:8-11`
- Modify (9 caller files of moved modules):
  - `src/features/editor/components/canvas/CanvasInteractionLayer.tsx:4,11`
  - `src/features/editor/hooks/useEditor.ts:6`
  - `src/features/editor/components/EditorContextMenu.tsx:22`
  - `src/features/editor/hooks/useEditorShortcuts.ts:2`
  - `src/features/editor/components/elements/SectionActions.tsx:5`
  - `src/features/editor/components/elements/FormComponent.tsx:3`
  - `src/features/editor/components/editor/EmptyPageStarter.tsx:5`
  - `src/features/editor/components/wireframe/useSectionActions.ts:9`

**Interfaces:**
- Consumes: `@/types/elements` from Task 1, `@/features/editor/utils/element/create/elementStrategyMap` & `elementCreateStrategy`, `@/features/editor/utils/element/dragPayload`, `@/features/editor/store/{element-store,selection-store,selected-element}`.
- Produces:
  - `@/features/editor/lib/componentDrop` → `componentFromDrop(...)` (identical signature)
  - `@/features/editor/lib/keyBoardEvents` → `ElementKeyboardActions` (identical public class API)
  - `@/features/editor/lib/ElementFactory` → `ElementFactory` (identical singleton class API)

- [ ] **Step 1: Add Rule 4 to `tests/architecture-boundaries.test.ts`**

Append to `tests/architecture-boundaries.test.ts`:

```ts
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
```

- [ ] **Step 2: Run boundary test to verify Rule 4 fails**

Run: `node --import tsx --test tests/architecture-boundaries.test.ts`
Expected: FAIL reporting `componentDrop.ts`, `keyBoardEvents.ts`, `create/ElementFactory.ts`, `computeTailwindFromStyles.ts`, and `create/elementCreateStrategy.ts`.

- [ ] **Step 3: Move `componentDrop.ts`, `keyBoardEvents.ts`, and `ElementFactory.ts` to `src/features/editor/lib/`**

1. Create `src/features/editor/lib/componentDrop.ts` (copy from `src/features/editor/utils/element/componentDrop.ts` and update its 3 relative imports):
   ```ts
   import { componentLibraryKey, isComponentSnapshot, type ComponentSnapshot } from "../services/component-library.service";
   import { getCachedComponentElements } from "../hooks/useProjectComponents";
   import type { DropPayload } from "../utils/element/dragPayload";
   ```

2. Create `src/features/editor/lib/keyBoardEvents.ts` (copy from `src/features/editor/utils/element/keyBoardEvents.ts`, drop the unused `elementHelper` import, and replace the `@/features/editor` barrel imports):
   ```ts
   import { getSelectedOrHoveredElement } from "../store/selected-element";
   import { ElementStore } from "../store/element-store";
   import { SelectionStore } from "../store/selection-store";
   import type { EditorElement } from "@/types/global.type";
   import { cloneComponentTree, componentSetting, visitComponentTree } from "@/features/projects/lib/components";
   import { toast } from "sonner";
   ```

3. Create `src/features/editor/lib/ElementFactory.ts` (copy from `src/features/editor/utils/element/create/ElementFactory.ts` and update imports):
   ```ts
   import type {
     ContainerElement,
     ContainerElementTemplate,
     ContainerElementType,
     EditorElement,
     ElementTemplate,
     ElementType,
   } from "@/types/global.type";
   import type { ResponsiveStyles, ElementTypeMap } from "@/types/elements";
   import { newEntityId } from "@/lib/entity-id";
   import { getElementStrategy } from "../utils/element/create/elementStrategyMap";
   import type { BuilderState } from "../utils/element/create/elementCreateStrategy";
   import { SelectionStore } from "../store/selection-store";
   ```

4. Delete the 3 old files:
   - `src/features/editor/utils/element/componentDrop.ts`
   - `src/features/editor/utils/element/keyBoardEvents.ts`
   - `src/features/editor/utils/element/create/ElementFactory.ts`

- [ ] **Step 4: Update remaining pure `utils/` files and all 8 caller files**

1. Pure `utils/` cleanup:
   - `src/features/editor/utils/element/computeTailwindFromStyles.ts:3`:
     `import type { ResponsiveStyles } from "@/types/elements";`
   - `src/features/editor/utils/element/create/elementCreateStrategy.ts:1-20`:
     change `from "@/features/editor";` → `from "@/types/elements";` (using `import type`).
   - `src/features/editor/utils/element/element-tree-helper.ts:8-11`:
     change `from "@/features/editor/constants/elements";` → `from "@/types/elements";`.

2. Caller import path updates:
   - `src/features/editor/components/canvas/CanvasInteractionLayer.tsx`:
     - `@/features/editor/utils/element/componentDrop` → `@/features/editor/lib/componentDrop`
     - `@/features/editor/utils/element/create/ElementFactory` → `@/features/editor/lib/ElementFactory`
   - `src/features/editor/hooks/useEditor.ts`:
     - `@/features/editor/utils/element/componentDrop` → `@/features/editor/lib/componentDrop`
   - `src/features/editor/components/EditorContextMenu.tsx`:
     - `@/features/editor/utils/element/keyBoardEvents` → `@/features/editor/lib/keyBoardEvents`
   - `src/features/editor/hooks/useEditorShortcuts.ts`:
     - `@/features/editor/utils/element/keyBoardEvents` → `@/features/editor/lib/keyBoardEvents`
   - `src/features/editor/components/elements/SectionActions.tsx`:
     - `@/features/editor/utils/element/create/ElementFactory` → `@/features/editor/lib/ElementFactory`
   - `src/features/editor/components/elements/FormComponent.tsx`:
     - `@/features/editor/utils/element/create/ElementFactory` → `@/features/editor/lib/ElementFactory`
   - `src/features/editor/components/editor/EmptyPageStarter.tsx`:
     - `@/features/editor/utils/element/create/ElementFactory` → `@/features/editor/lib/ElementFactory`
   - `src/features/editor/components/wireframe/useSectionActions.ts`:
     - `@/features/editor/utils/element/create/ElementFactory` → `@/features/editor/lib/ElementFactory`

- [ ] **Step 5: Run full verification suite (typecheck + all unit tests + production build)**

Run: `npx tsc --noEmit && npm run test:unit && npm run build`
Expected:
- `npx tsc --noEmit`: exit 0 (zero errors).
- `npm run test:unit`: all unit tests including all 4 boundary rules in `tests/architecture-boundaries.test.ts` PASS.
- `npm run build`: Vite 8 + TanStack Start production build exits 0.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/features/editor/ tests/architecture-boundaries.test.ts
git commit -m "refactor(editor): relocate stateful utils to lib and enforce utils purity"
```
