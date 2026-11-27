# React-to-Components AST Compiler (Sub-project 1) — Design

Date: 2026-11-27
Status: drafted from the design discussion, awaiting written-spec review
Repos: `webbuilderv2` (primary), `webbuilder.mcp.go` (tool descriptions)
Part 1 of 3 in the Hybrid React Workspace roadmap:
1. **Sub-project 1 (this spec):** React-to-Components AST Compiler — all 34 element types, shadcn/Lucide JSX, component props & auto-extracting `"cp"` masters from code, and real React hook/expression round-tripping.
2. **Sub-project 2 (later):** Multi-File Virtual React Workspace (`src/pages/*.tsx`, `src/components/*.tsx`, `src/styles/globals.css`) in Monaco and MCP.
3. **Sub-project 3 (later):** Live Code Components Runtime — persisting `Preamble` on the backend and compiling/executing `useComponentBindings` (`useState`, `useEffect`, etc.) in Preview and `SitePageView`.

---

## 1. Intent

**What the user wants.** Flip the builder's code experience from "Components → synthetic `Generated.tsx`" into "normal React codebase → Builder elements and reusable components," while keeping real React hooks (`useState`, `useEffect`, `useRef`, `useForm`, etc.) as authentic React code instead of lossily mapping hooks into no-code variables.

**Why the current implementation falls short.**
- `parseElements.ts` accepts only 11 tags (`section`, `div`, `button`, `a`, `img`, `input`, `select`, `ul`, `ol`, `form`, `Carousel`), rejecting 20+ native `ElementType`s (`Heading`, `Nav`, `Header`, `Footer`, `Span`, `Icon`, `Table`, `Video`, etc.), `<p>`/`<main>`, Lucide icons, and shadcn UI tags (`<Card>`, `<Button>`, `<Badge>`) that `monaco/types.ts` already stubs.
- Reusable `"cp"` components (`packages/site-runtime/src/projects/components.ts`) cannot be imported as `<FeatureCard title="Fast" />` with named React props, nor can local helper components (`function FeatureCard(...)`) be ported from code into reusable `"cp"` masters.
- Dynamic JSX children (`Clicked {count} times`) and conditional blocks (`{open && <div />}`) throw hard parse errors (`astLiterals.ts`), blocking normal `useState` code from even being parsed and round-tripped.

**Success criteria.**
1. Every `ElementType` in `ALL_ELEMENT_TYPES` (all 34 types) has a paired, type-checked `generate` and `parse` codec and survives `element → generateToJSX → parseCode` with zero tree diff.
2. Normal React JSX — `<p>`, `<main>`, `<h1>`–`<h6>`, `lucide-react` icons, static `const` + `.map()` loops, `cn()`/`clsx()` class expressions, fragments, and `@/components/ui/*` shadcn primitives — compiles cleanly into native `EditorElement`s.
3. Project `"cp"` components emit `import { Name } from '@/components/Name'` and `<Name prop="..." />` mapped to `settings.component.overrides` via named props (`settings.componentProps` or deterministic camelCase fallbacks).
4. PascalCase helper components declared inside page code preview inline during live typing (500ms debounce) and port into persisted `"cp"` Component Masters + linked instances on explicit commit (`Cmd/Ctrl+S`, "Port & Save" button, or MCP `set_code`).
5. Real React hooks (`useState`, `useEffect`, `useMemo`, `useRef`, `useForm`) and their JSX expressions (`{count}`, `onClick={() => setCount(c => c + 1)}`, `{open && <div />}`) parse cleanly and round-trip intact across visual Canvas edits.
6. Strict TypeScript (`tsc --noEmit`) with zero `any`, full frontend unit test coverage, and green `webbuilder.mcp.go` tests.

## 2. Out of Scope (Sub-project 1)

- Multi-file explorer / tab bar in `EditorCodePanel` and multi-file MCP workspace tools (Sub-project 2).
- Backend database persistence of `Preamble` and runtime execution of `useState`/`useEffect` closures inside `SitePageView` / `PreviewElementLoader` (Sub-project 3).
- Runtime evaluation of dynamic `.map()` over mutable hook state (e.g. `todos.map(...)` where `todos` comes from `useState`); static `const` array `.map()` is supported here, dynamic state `.map()` waits for Sub-project 3.
- Style overrides per component instance (instances continue to follow `2026-11-18-reusable-components-design.md`: root placement styles + content/src/alt/href overrides).

---

## 3. Architecture Overview

Compilation is split into two pure, isolated stages in `apps/editor/src/features/editor/lib/code/`:

```
TSX Source + ComponentCatalog
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│ Stage 1: normalizeReactAst (normalize/)                      │
│  • Build static const scope & scope-bound identifier set     │
│  • Unroll static const .map() & fragments (preserving loc)   │
│  • Extract PascalCase helper components (preview vs commit)  │
│  • Lower @/components/ui/* shadcn tags → canonical HTML+tw   │
└───────────────────────────────┬──────────────────────────────┘
                                │ Canonical JSX AST + ExtractedComponentSpec[]
                                ▼
┌──────────────────────────────────────────────────────────────┐
│ Stage 2: elementCodecs (codecs/)                             │
│  • Exhaustive Readonly<Record<ElementType, ElementCodec>>    │
│  • Lucide icon imports ↔ Icon element (iconName kebab-case)  │
│  • <ProjectComponent prop="..." /> ↔ linked "cp" instances   │
│  • Preserve hooks (Preamble) + codeProps/codeText/codeVisible│
└───────────────────────────────┬──────────────────────────────┘
                                ▼
        EditorElement[] + Preamble + ExtractedComponentSpec[]
```

### Module Layout (`apps/editor/src/features/editor/lib/code/`)

- `catalog.ts` — `ComponentCatalog`, PascalCase component naming, and deterministic prop-name synthesis.
- `customCode.ts` — `Preamble`, `CodeTextSegment`, `HIDDEN_SETTINGS` (`interactions`, `migratedWorkflowLinks`, `customSubmit`, `codeProps`, `codeText`, `codeVisible`, `component`, `componentProps`), and storage helpers.
- `normalize/staticScope.ts` — Side-effect-free evaluator for `const` literals (primitives, arrays, objects, template strings, `cn`/`clsx`) and static `.map()` unrolling; collects declared hook/variable/param identifiers in scope.
- `normalize/shadcnLowering.ts` — Rewrites imported `@/components/ui/*` JSX elements into canonical HTML tags with merged Tailwind classes.
- `normalize/extractComponents.ts` — Locates local PascalCase JSX-returning functions/arrow components, checks for recursion/cycles, and either inlines (`mode: "preview"`) or extracts `ExtractedComponentSpec` (`mode: "commit"`).
- `codecs/types.ts` — `ElementCodec<T extends ElementType>` interface, `GenerateContext`, and `HydrateContext`.
- `codecs/registry.ts` — Exhaustive `Readonly<Record<ElementType, ElementCodec>>` across all 34 `ElementType`s, plus tag-to-type lookup table and Lucide/Component dispatch.
- `codecs/*.ts` — Grouped codec implementations (`layoutCodecs.ts`, `typographyCodecs.ts`, `mediaIconCodecs.ts`, `formDataCodecs.ts`, `componentCodec.ts`).
- `generator.ts` — Orchestrates `CodeGenerator.generateToJSX` and `generateInteractions` using `codecs/registry.ts` and `ComponentCatalog`.
- `parseCode.ts` — Orchestrates Babel parse → Stage 1 normalize → Stage 2 hydrate → `ParseCodeResult`.

---

## 4. Stage 1: React AST Normalizer & Component Extractor

### 4.1 Static Scope & `.map()` Unrolling (`normalize/staticScope.ts`)

- Walks top-level `Program` statements (excluding the page component) and statements in the component body before `return`.
- Evaluates `const` declarations whose initializers are pure literals: strings, numbers, booleans, `null`, `undefined`, unary `+/-`, template literals over static values, static arrays, plain objects, and `cn(...)`/`clsx(...)` calls over static strings/booleans.
- Tracks **runtime-bound identifiers** (destructured `useState` tuples, hook return values, function parameters, non-static `const`/`let` bindings, imported helpers) in `boundIdentifiers: ReadonlySet<string>` so Stage 2 can distinguish valid hook bindings (`{count}`, `src={avatarUrl}`) from typos/undeclared identifiers (`{nonExistentVar}`).
- **Static `.map()` unrolling:** When a JSX expression container matches `<staticArray>.map((item, index?) => <JSX>)` (expression body or block with single `return`), unrolls up to `MAX_UNROLLED_ITEMS = 100` iterations by substituting `item` and `index` into the body's static scope. Strips React-only `key={...}` attributes so `key` does not pollute `codeProps`. All cloned AST nodes retain the `.map()` body's `loc` for accurate diagnostics.
- Statements consumed purely as static `.map()` data are omitted from `Preamble` once unrolled so regenerating code does not leave unused dead arrays behind; statements also referenced by runtime expressions stay in `Preamble`.

### 4.2 Shadcn UI Lowering (`normalize/shadcnLowering.ts`)

When imported from `@/components/ui/*` (or matching unoccupied standard shadcn names), Stage 1 lowers JSX tags before Stage 2:

| Shadcn Tag | Lowered Canonical Tag | Default Tailwind Classes Merged (before `className`) |
| --- | --- | --- |
| `Button` (`variant`, `size`) | `<button>` | Variant (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) + size (`default`, `sm`, `lg`, `icon`) classes |
| `Card` | `<div>` (`Frame`) | `rounded-xl border bg-card text-card-foreground shadow-sm` |
| `CardHeader` | `<div>` (`Frame`) | `flex flex-col space-y-1.5 p-6` |
| `CardTitle` | `<h3>` (`Heading` l3) | `font-semibold leading-none tracking-tight` |
| `CardDescription` | `<p>` (`Text`) | `text-sm text-muted-foreground` |
| `CardContent` | `<div>` (`Frame`) | `p-6 pt-0` |
| `CardFooter` | `<div>` (`Frame`) | `flex items-center p-6 pt-0` |
| `Badge` (`variant`) | `<span>` (`Span`) | `inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold` + variant |
| `Alert` / `AlertTitle` / `AlertDescription` | `<div>` / `<h5>` / `<p>` | Standard alert border/padding/typography classes |
| `Separator` (`orientation`) | `<hr />` (`Separator`) | `shrink-0 bg-border h-[1px] w-full` (or vertical `h-full w-[1px]`) |
| `Input` / `Textarea` / `Label` / `Checkbox` / `Progress` | `<input>` / `<textarea>` / `<label>` / `<input type="checkbox">` / `<progress>` | Standard shadcn control classes |
| `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell` / `TableCaption` | `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<th>` / `<td>` / `<caption>` | Standard table classes |

*(Note: `<Carousel>` remains a first-class Stage 2 `Carousel` element codec rather than lowering to `<div>`.)*

### 4.3 Local Helper Component Extraction (`normalize/extractComponents.ts`)

A top-level non-page function (`function Card(props) { ... }` or `const Card = (props) => ...`) whose identifier starts with `[A-Z]` and returns a single root `JSXElement` is treated as a local helper component:

1. **Parameter analysis:** Supports destructured object parameter `({ title = "Default", ctaHref }: CardProps)` or `props` member access (`props.title`).
   - Only scalar content/attribute slots supported by Builder component overrides (`text` in JSX child position, `src`/`alt` on `<img>`, `href` on `<a>`/`<button>`) become `ComponentPropBinding` entries.
   - If a local component uses React hooks (`useState`, `useEffect`, etc.) in Sub-project 1:
     - In `preview` mode, if stateless it inlines; if stateful on a non-page helper, emit a clear diagnostic explaining stateful extracted components arrive in Sub-project 3 (hooks on the page component itself are fully supported).
2. **Cycle & root validation:** Direct or mutual recursion among local helper components (`A → B → A`) or fragment roots on a component master (`<>...</>`) raises a `CodeError` with the offending node's `loc`.
3. **Modes:**
   - **`mode: "preview"` (live 500ms typing):** Expands `<FeatureCard title="Fast" />` inline into cloned JSX with prop values substituted, producing ordinary preview elements without creating `"cp"` pages. Returns `pendingComponentNames: readonly string[]` so `EditorCodePanel` can offer **"Port & Save"**.
   - **`mode: "commit"` (`Cmd/Ctrl+S`, "Port & Save", or MCP `set_code`):** Compiles the helper body into an `ExtractedComponentSpec`:
     ```ts
     export interface ComponentPropBinding {
       readonly nodeId: string;
       readonly field: "text" | "src" | "alt" | "href";
       readonly defaultValue: string;
     }

     export interface ExtractedComponentSpec {
       readonly name: string; // e.g. "FeatureCard"
       readonly root: EditorElement; // with settings.componentProps populated
       readonly propBindings: Readonly<Record<string, ComponentPropBinding>>;
     }
     ```
     Call sites `<FeatureCard title="Fast" />` emit a linked instance placeholder referencing `pendingComponentName: "FeatureCard"` + computed `ComponentOverrides`, resolved to real `{ pageId, rootId }` once the host persists the `"cp"` master.

---

## 5. Stage 2: Symmetric Codec Registry (All 34 Element Types)

`codecs/registry.ts` exports `ELEMENT_CODECS: Readonly<Record<ElementType, ElementCodec>>` covering every key of `ElementTypeMap`:

| Category | `ElementType` | Generated JSX | Accepted JSX on Parse | Modeled Settings / Fields |
| --- | --- | --- | --- | --- |
| **Containers** | `Section` | `<section>` | `<section>`, `<main>` | children |
| | `Frame` | `<div>` | `<div>` (with element children, empty, or matched `Frame`) | children |
| | `Header` | `<header>` | `<header>` | children |
| | `Footer` | `<footer>` | `<footer>` | children |
| | `Nav` | `<nav>` | `<nav>` | children |
| | `Article` | `<article>` | `<article>` | children |
| | `Aside` | `<aside>` | `<aside>` | children |
| **Typography** | `Heading` | `<h1>`–`<h6>` | `<h1>`–`<h6>` | `content`, `settings.level` (`1`–`6`) |
| | `Text` | `<div>` | `<p>`, `<div>` (leaf text) | `content` |
| | `Span` | `<span>` | `<span>` | `content` |
| | `Label` | `<label>` | `<label>` | `content`, `settings.htmlFor` |
| | `Blockquote` | `<blockquote>` | `<blockquote>` | `content`, `settings.cite` |
| | `Code` | `<code>` or `<pre><code>` | `<code>`, `<pre><code>`, `<pre>` | `content`, `settings.preformatted`, `settings.language` |
| | `Separator` | `<hr />` | `<hr />` | — |
| **Media & Icons** | `Icon` | `<PascalIcon />` (`lucide-react`) | Imported `lucide-react` tag | `settings.iconName` (kebab-case), `size`, `strokeWidth`, `color`, `fill`, `absoluteStrokeWidth` |
| | `Image` | `<img />` | `<img />` | `src`, `alt` (`content`), `loading`, `decoding`, `sizes`, `srcset`, `objectFit` |
| | `Video` | `<video />` | `<video>` | `src`, `controls`, `autoPlay`↔`autoplay`, `loop`, `muted`, `poster`, `preload`, `playsInline`, `width`, `height` |
| | `Audio` | `<audio />` | `<audio>` | `src`, `controls`, `autoPlay`↔`autoplay`, `loop`, `muted`, `preload` |
| | `IFrame` | `<iframe />` | `<iframe>` | `src`, `sandbox`, `allow`, `loading`, `referrerPolicy`, `width`, `height` |
| **Interactive & Forms** | `Button` | `<button>` | `<button>` | `content`, `href` (`data-href` if set), `type`↔`settings.buttonType` |
| | `Link` | `<a>` | `<a>` | `href`, `content`, nested `elements` |
| | `Input` | `<input />` | `<input>` (non-checkbox/radio) | `InputSettings` (`type`, `name`, `placeholder`, `defaultValue`, `min`, `max`, `step`, `required`, `pattern`, `autoComplete`) |
| | `Checkbox` | `<input type="checkbox" />` | `<input type="checkbox">` | `CheckboxSettings` (`name`, `checked`, `defaultChecked`, `required`, `disabled`, `value`, `data-label`↔`label`) |
| | `Radio` | `<input type="radio" />` | `<input type="radio">` | `RadioSettings` (`name`, `checked`, `defaultChecked`, `required`, `disabled`, `value`, `data-label`↔`label`) |
| | `Textarea` | `<textarea />` | `<textarea>` | `TextareaSettings` (`name`, `placeholder`, `defaultValue`, `rows`, `cols`, `maxLength`, `minLength`, `required`, `readOnly`, `disabled`) |
| | `Select` | `<select><option>...` | `<select><option>...` | `SelectSettings` + child `Text` option elements |
| | `Progress` | `<progress />` | `<progress>` | `ProgressSettings` (`value`, `max`, `data-label`↔`label`) |
| | `Form` | `<form>` | `<form>` | `FormSettings` + children; `onSubmit` sets `customSubmit: true` |
| **Collections** | `List` | `<ul>`/`<ol>` + `<li>` | `<ul>`/`<ol>` + `<li>` | `settings.ordered` + child elements |
| | `Table` | `<table>` (`<caption>`, `<thead>`, `<tbody>`) | `<table>` | `settings.caption`, `settings.columns` (`<th>`), `bordered`/`striped`/`hoverable`/`compact`, body children |
| | `Carousel` | `<Carousel><div className="embla__slide">...` | `<Carousel>` | `CarouselSettings` + slide children |
| | `CMSContentList` | `<CMSContentList>` | `<CMSContentList>`, or matched `div` | `CMSContentSettings` + template children |
| | `CMSContentGrid` | `<CMSContentGrid>` | `<CMSContentGrid>`, or matched `div` | `CMSContentSettings` + template children |
| | `CMSContentItem` | `<CMSContentItem>` | `<CMSContentItem>`, or matched `div` | `CMSContentSettings` + template children |

### `Table` Children & Multi-Row HTML Lowering (`formDataCodecs.ts`)
- **Generate:** Emits `<table>`, optional `<caption>`, optional `<thead><tr><th ...>...</th></tr></thead>` from `settings.columns`, and `<tbody><tr><td colSpan={colCount}>{children}</td></tr></tbody>` (matching `TableView.tsx`) so `Table.elements` round-trips with zero tree diff.
- **Parse:** Reads `<caption>` into `settings.caption` and `<thead><tr><th>` cells into `settings.columns` (preserving existing column `id`/`accessor`/`sortable` by index). For `<tbody>`: if it matches the single-row `<td colSpan>` wrapper around child elements, unwraps `Table.elements` directly; if the author wrote multi-row HTML/shadcn `<tr><td>...</td></tr>` data rows, converts each `<tr>` into a row `Frame` element and each `<td>` into a `Text` (if text-only) or `Frame` (if containing elements) child inside `Table.elements`.

### Lucide Icon Conversion (`mediaIconCodecs.ts`)
- Tracks named imports from `'lucide-react'` (e.g. `import { Sparkles, ArrowUpRight as ExternalIcon } from 'lucide-react'`).
- Converts PascalCase Lucide export names (`ArrowUpRight`, `CheckCircle2`) ↔ kebab-case `IconSettings.iconName` (`"arrow-up-right"`, `"check-circle-2"`).
- `generateImports` emits a single consolidated `import { ... } from 'lucide-react';` line for all `Icon` elements on the page.

---

## 6. Component Props, Overrides & `"cp"` Master Round-Trip

### 6.1 `ComponentCatalog` & Naming (`catalog.ts`)
- Every active `"cp"` page in the project produces a catalog entry:
  ```ts
  export interface CatalogComponent {
    readonly pageId: string;
    readonly name: string;
    readonly pascalName: string; // e.g. "FeatureCard", deduplicated across project
    readonly root: EditorElement;
    readonly props: Readonly<Record<string, ComponentPropBinding>>;
  }
  ```
- **Prop resolution order:**
  1. Explicit `root.settings.componentProps` saved when the master was created or edited in code.
  2. Deterministic synthesis from overridable nodes (`componentOverrideFields(node)` in `@webbuilder/site-runtime/projects/components`): camelCase of `node.name || node.type` + field suffix when needed (`title`, `ctaText`, `ctaHref`, `heroImageSrc`, `heroImageAlt`), deduplicated with numeric suffixes (`title2`).

### 6.2 Generating & Parsing Component Instances on Pages
- **Generate:** An element with `componentSetting(el)` emits `<FeatureCard data-element-id={el.id} className={instancePlacementClass} title="Override" />` and adds `import { FeatureCard } from '@/components/FeatureCard';`. Only overrides differing from `binding.defaultValue` are emitted as attributes.
- **Parse:** When `convertElement` sees a PascalCase tag matching `catalog.byPascalName` (or imported from `@/components/<PascalName>`):
  - Rejects JSX children if the component takes none (`"Edit the FeatureCard component to change its children"`).
  - Maps string/literal attributes matching `catalogEntry.props` into `ComponentOverrides` (`overrides[binding.nodeId][binding.field] = value`); unknown non-modeled props go to `codeProps` if bound in scope, or raise a clear unknown-prop `CodeError` naming the available props.
  - Preserves existing instance `id` and placement `styles` when `data-element-id` matches.

### 6.3 Editing a `"cp"` Master Page Directly
- When `pageMeta.isComponentPage === true`:
  - `generateToJSX` emits `export interface <PascalName>Props { ... }` and `export function <PascalName>({ title = "Default", ... }: <PascalName>Props)` with `{title}` expressions in the bound nodes.
  - `parseCode` parses the component's parameters + JSX `{propName}` usages back into `root.settings.componentProps` and stores each parameter's default value onto the master element's `content` / `src` / `href` so the Canvas renders realistic default content.

---

## 7. Real React Hooks & Dynamic JSX Bindings Preservation

To keep `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, and `useForm` intact without mapping them to `logic.variables`:

1. **`Preamble` (`customCode.ts`):** Continues to hold `imports`, `top` (non-component types/consts/camelCase helpers), and `body` (all hook calls and handler declarations before `return`).
2. **Element-level dynamic bindings (stored in `element.settings`, hidden from plain settings attribute emission):**
   - `codeProps?: readonly string[]` — Event handlers (`onClick={() => setCount(c => c + 1)}`), spreads (`{...register("email")}`), and dynamic attributes (`src={avatarUrl}`, `disabled={isSubmitting}`) where referenced root identifiers exist in `boundIdentifiers` or module imports.
   - `codeText?: ReadonlyArray<string | { readonly expr: string }>` — Mixed text and dynamic JSX expressions inside text-bearing elements (e.g. `Clicked {count} times` → `["Clicked ", { expr: "count" }, " times"]`). `element.content` is set to `"Clicked {count} times"` so the visual Canvas shows readable text; if the user edits `element.content` visually on the Canvas to something different, `codeText` clears cleanly in favor of the new content.
   - `codeVisible?: string` — Conditional short-circuit wrapper `{isOpen && <div className="p-4">...</div>}` hydrates the inner `<div>` as a normal `EditorElement` with `settings.codeVisible = "isOpen"`, and `generateToJSX` wraps the generated JSX node back in `{isOpen && (...)}`.
3. **Validation of unbound identifiers:** If a JSX expression references a free identifier that is neither a JS global (`Math`, `JSON`, `Boolean`, `String`, `Number`, `Date`, `Array`, `Object`, `console`, `window`, `document`), nor an import, nor in `boundIdentifiers`, `parseCode` returns a `CodeDiagnostic` at that identifier (`"'logoUrl' is not defined in this component"`).

---

## 8. Editor, API, Monaco & MCP Integration

1. **`/api/generate-code` (`apps/editor/src/app/api/generate-code.ts`) & `elementService.generateCode`:**
   - Accept optional `components?: CatalogComponentInput[]` and `pageMeta?: { isComponentPage?: boolean; componentName?: string }` (validated for shape and bounded to ≤ 200 components).
2. **`useMonacoEditor.ts` & `EditorCodePanel.tsx`:**
   - Pass `useProjectComponents()` catalog and `isComponentPage` into `generateCode` and `parseCode`.
   - Live typing (`APPLY_DELAY_MS = 500`) calls `parseCode(..., { mode: "preview" })`.
   - Register `Mod+S` (`KeyMod.CtrlCmd | KeyCode.KeyS`) in Monaco and show a **"Port & Save (⌘S)"** action pill in `EditorCodePanel` whenever `pendingComponentNames.length > 0`. Running commit calls `parseCode(..., { mode: "commit" })`, creates `"cp"` masters via `useComponentActions` / `createComponentMaster`, links instances on the active page, and updates `replaceTree`.
3. **Monaco Type Definitions (`lib/monaco/types.ts`):**
   - Add `updateMonacoComponentTypes(monaco, catalog)` writing `file:///node_modules/@project-components/index.d.ts` with `declare module '@/components/<Name>'` + typed `Props`, plus a `declare module 'lucide-react'` wildcard `LucideIcon` stub.
4. **Agent Executor & MCP (`features/agent/executor.ts`, `AgentHost.tsx`, `webbuilder.mcp.go/internal/agent/tools_tab.go`):**
   - `AgentHost` exposes `createComponentFromElementTree(name: string, root: EditorElement): Promise<{ id: string; name: string; rootId: string }>` reusing `createComponentMaster`.
   - `executor.ts` `get_code` passes `host.getComponents()` catalog; `set_code` runs `parseCode` in `commit` mode, checks `host.canCreatePages()` if `extractedComponents.length > 0`, persists new `"cp"` masters (rolling back created masters via `deleteProjectPage` if a subsequent creation fails), resolves instance `{ pageId, rootId }` references, and applies the page tree as one undoable step.
   - Update `get_code` and `set_code` descriptions in `webbuilder.mcp.go/internal/agent/tools_tab.go` to document full HTML/shadcn/Lucide support, `@/components/<Name>` imports/props, local PascalCase component extraction, and hook preservation.

---

## 9. Error Handling & Safety Limits

| Condition | Behavior |
| --- | --- |
| Syntax error, unsupported HTML tag (e.g. `<marquee>`, `<canvas>`), or fragment root on `"cp"` page | `ok: false` with exact 1-based `line`, `column`, `endLine`, `endColumn`; nothing applied, zero `"cp"` pages created. |
| Local PascalCase component collides with existing `"cp"` component of different structure | `ok: false` diagnostic at component declaration: `"Component 'Navbar' already exists in this project. Import '@/components/Navbar' or choose a different name."` |
| Recursive local component (`A → A` or `A → B → A`) | `ok: false` diagnostic at recursive JSX tag. |
| Static `.map()` exceeds `MAX_UNROLLED_ITEMS` (100) | `ok: false` diagnostic on `.map()` call. |
| Extracted components in `set_code` when user lacks `canCreatePages` | `forbidden` tool error before any master is created. |
| Network failure partway through creating multiple `"cp"` masters | Best-effort `deleteProjectPage` rollback of masters created in that batch; open page tree untouched; error toast / tool error returned. |

---

## 10. Testing Plan

1. **`tests/code-codecs.test.ts`** — Iterates over `ALL_ELEMENT_TYPES` (34 types) asserting every codec exists, generates valid JSX, and round-trips (`diffTrees(before, after) === []`), plus `<p>` → `Text`, `<main>` → `Section`, and `lucide-react` `<Icon />` imports.
2. **`tests/code-normalize.test.ts`** — Static `const` arrays/objects + `.map()`, `key` stripping, `cn()`/`clsx()`, nested fragments, `.map()` limit error, and `@/components/ui/*` shadcn lowering (`Button` variants/sizes, `Card*`, `Badge`, `Alert*`, `Separator`, `Table*`, form controls).
3. **`tests/code-hooks-roundtrip.test.ts`** — `useState`, `useEffect`, `onClick={() => setCount(c => c + 1)}`, `Clicked {count} times` (`codeText`), `{open && <div />}` (`codeVisible`), visual Canvas class edits preserving all hooks/bindings, and undeclared identifier error check (`<img src={undeclaredUrl} />` still fails cleanly).
4. **`tests/code-components.test.ts`** — `"cp"` catalog prop synthesis, `<FeatureCard title="..." />` ↔ `overrides`, `"cp"` master page prop editing (`settings.componentProps`), `preview` inline unrolling vs `commit` `"cp"` extraction, name collision & cycle diagnostics, and `executor.ts` `set_code` transactional creation + rollback tests.
5. **Existing test suite compatibility** — Update `tests/code-editing.test.ts` where `Heading` (`"Not in code"`) and `<video>` specifically tested the old 11-tag limitation: `Heading` now round-trips as `<h2>`, `<video>` is replaced by `<marquee>` in the unsupported-tag test, and `keepUnsupported` preservation is tested with a synthetic unknown runtime element type so forward-compatible preservation of unknown future element types remains verified.
6. **Verification commands:** `bun run typecheck`, frontend test runner (`bun test` / `node --import tsx --test`), and `go vet ./... && go test ./...` in `webbuilder.mcp.go`.
