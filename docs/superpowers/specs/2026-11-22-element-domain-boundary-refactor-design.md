# Element Domain & Editor Boundary Refactor Design

**Date:** 2026-11-22  
**Target repository:** `webbuilderv2`  
**Status:** Draft for review

---

## 1. Purpose & Success Criteria

### Problem
Static import analysis of `webbuilderv2/src` shows four structural cycles rooted in element domain types and pure helpers living inside `src/features/editor`:

1. **`src/types/global.type.ts` ↔ `src/features/editor`**: `global.type.ts` imports `CONTAINER_ELEMENT_TYPES`, `EDITABLE_ELEMENT_TYPES`, `ElementType`, and `ElementTypeMap` from the `features/editor` barrel (which also re-exports Zustand stores and API services) and from `features/editor/interfaces/elements.interface.ts`, while `elements.interface.ts` imports back from `global.type.ts` and `@/features/editor`.
2. **`src/features/elements` ↔ `src/features/editor` (21/21 bidirectional cycle)**: All 21 edges from `elements` to `editor` are imports of `elements.interface.ts` (18 views) and pure `resolveContent.ts` (3 views), while 21 editor components import views/registry from `features/elements`.
3. **`src/features/elements` ↔ `src/features/preview`**: `ButtonView` and `LinkView` import `previewLinkProps` from `features/preview/lib/link-props.ts`, which in turn imports `ButtonElement` and `LinkElement` from `@/features/editor`, while `preview` renders `features/elements` views.
4. **`src/features/projects` ↔ `src/features/editor`**: `features/projects/lib/components.ts` imports `CONTAINER_ELEMENT_TYPES` from `features/editor/constants/elements.ts`, while `elements.interface.ts` imports `ComponentSetting` from `features/projects/lib/components.ts`.
5. **Layer inversions in `src/features/editor/utils/`**: Stateful orchestration modules (`componentDrop.ts`, `keyBoardEvents.ts`, `create/ElementFactory.ts`) live under `utils/` while importing Zustand stores, React Query hooks, services, and the `@/features/editor` barrel.

### Intended Outcome
Establish a strict acyclic dependency hierarchy for element types, pure element views/helpers, and editor utilities, without altering runtime behavior or breaking existing `@/types/global.type` and `@/features/editor` consumers.

### Success Criteria
- Zero imports from `src/types/**` into `src/features/**`, `src/components/**`, `src/providers/**`, or `src/services/**`.
- Zero imports from `src/features/elements/**` into any other `src/features/<other>/**`.
- Zero imports from `src/features/projects/**` into `src/features/editor/**`.
- Zero imports from `src/features/editor/utils/**` into `src/features/editor/(store|hooks|services)/**` or the `@/features/editor` barrel.
- Automated regression guard in `tests/architecture-boundaries.test.ts` running under `npm run test:unit`.
- `npx tsc --noEmit`, `npm run test:unit`, and `npm run build` all pass cleanly with zero new `any` types.

### Non-Goals
- No UI or behavioral changes.
- No hard cutover removing re-exports from `src/features/editor/index.ts` (~150 callers remain untouched).
- Cross-feature cycles outside this scope (`collaboration ↔ editor`, `interactions ↔ editor`, `auth ↔ projects`) are deferred to a separate pass.

---

## 2. Target Architecture

```text
src/types/                       Pure domain types & element-type constants (0 feature imports)
   ▲
src/features/elements/           Pure leaf views, registry, content & link helpers (0 sibling-feature imports)
   ▲
src/features/projects/           Component tree/resolution logic (0 editor imports)
src/features/preview/            Preview renderer & API
src/features/editor/             Editor UI, stores, hooks, services, lib/ (stateful orchestration), utils/ (pure)
```

---

## 3. Detailed Module Changes

### 3.1 Pure Element Domain Layer (`src/types/elements/`)

Create a zero-feature-dependency domain package under `src/types/elements/`:

| New File | Owns | Extracted From |
| --- | --- | --- |
| `src/types/elements/component-setting.ts` | `ComponentOverride`, `ComponentOverrides`, `ComponentSetting` | `src/features/projects/lib/components.ts` |
| `src/types/elements/event-constants.ts` | `EVENT_TYPES`, `ACTION_TYPES`, `HTTP_METHODS`, `NAVIGATE_TARGETS`, `ANIMATION_TYPES`, `NOTIFICATION_TYPES`, `SCROLL_BEHAVIORS`, `SCROLL_TARGETS`, `MODAL_ACTIONS`, `DATA_VALUE_TYPES`, `EVENT_VALUE_SOURCES`, `CONDITION_TYPES`, `CONDITION_OPERATORS`, `BODY_TYPES`, display label maps, value helpers, and type guards | `src/features/editor/constants/events.ts` |
| `src/types/elements/events.ts` | Event and action interfaces (`ElementEvents`, `EventHandler`, `EventActionConfig`, `EventCondition`, `EventExecutionContext`, `EventRegistry`, etc.), importing `EventTypeEvent`/`ActionTypeEvent` from `./event-constants` | `src/features/editor/interfaces/events.interface.ts` |
| `src/types/elements/validation.ts` | `RuleType`, `ValidationRule` (generic default `unknown` instead of `any`) and concrete rule interfaces | `src/features/editor/interfaces/validate.interface.ts` |
| `src/types/elements/elements.ts` | `CSSStyles`, `Breakpoint`, `ResponsiveStyles`, `Element<Type, Settings extends object = Record<string, unknown>>`, all 34 element interfaces & settings interfaces, `ElementTypeMap`, `ElementType`, `EditorElement` | `src/features/editor/interfaces/elements.interface.ts` |
| `src/types/elements/element-types.ts` | `CONTAINER_ELEMENT_TYPES`, `EDITABLE_ELEMENT_TYPES`, `ALL_ELEMENT_TYPES`, `ContainerElementType`, `EditableElementType`, `isContainerElement`, `isEditableElement`, compile-time exhaustiveness check | `src/features/editor/constants/elements.ts` |
| `src/types/elements/index.ts` | Public barrel re-exporting all 6 modules above | New |

**Type-safety tightening:**
- Replace `any` in the extracted domain files with `unknown` (and `Settings extends object = Record<string, unknown>` on `Element<Type, Settings>` so concrete interfaces without index signatures remain assignable).
- Any existing caller broken by tightening `Record<string, any>` → `Record<string, unknown>` (for example in `EventExecutionContext`, `ApiCallActionConfig.body`, `SetDataActionConfig.value`, `EventCondition.right`, or `CMSContentSettings.filterBy`) is updated with explicit narrowing during implementation so `tsc --noEmit` stays strict and `any`-free.

**`src/types/global.type.ts`:**
- Imports **only** from `./elements` (removing all `@/features/editor` imports).
- Preserves all existing exported types identically: `EditorElement`, `EditableElementType`, `ContainerElement`, `ElementType`, `ContainerElementType`, `ContainerElementTemplate`, `LeafElementTemplate`, `ElementTemplate`, `ElementTypeMap`.

### 3.2 Pure Leaf `src/features/elements/`

Move pure element rendering helpers into `src/features/elements/lib/`:
- `src/features/editor/utils/element/replacePlaceholders.ts` → `src/features/elements/lib/replacePlaceholders.ts`
- `src/features/editor/utils/element/resolveContent.ts` → `src/features/elements/lib/resolveContent.ts` (imports `./replacePlaceholders`)
- `src/features/preview/lib/link-props.ts` → `src/features/elements/lib/link-props.ts` (imports `type { ButtonElement, LinkElement } from "@/types/elements"`)

Update callers:
- All 18 view files in `src/features/elements/views/*`:
  - Replace `@/features/editor/interfaces/elements.interface` → `@/types/elements`
  - Replace `@/features/editor/utils/element/resolveContent` → `../lib/resolveContent` (in `CodeView.tsx`, `LinkView.tsx`, `TextView.tsx`)
  - Replace `@/features/preview/lib/link-props` → `../lib/link-props` (in `ButtonView.tsx`, `LinkView.tsx`)
- Direct callers of the moved files:
  - `src/features/editor/utils/element/elementhelper.ts` → imports `replacePlaceholders` from `@/features/elements/lib/replacePlaceholders`, `ALL_ELEMENT_TYPES` and `ResponsiveStyles` from `@/types/elements`
  - `src/features/editor/components/elements/shared/index.ts` → re-exports `resolveContent` from `@/features/elements/lib/resolveContent`
  - `tests/resolve-content.test.ts` → imports `resolveContent` from `../src/features/elements/lib/resolveContent`
- Delete the moved source files at their old paths (`features/editor/utils/element/resolveContent.ts`, `features/editor/utils/element/replacePlaceholders.ts`, `features/preview/lib/link-props.ts`) since every caller is updated directly.

### 3.3 Consumer Updates & Compatibility Re-exports

- **`src/features/projects/lib/components.ts`**:
  - Import `CONTAINER_ELEMENT_TYPES` and `type { ComponentOverride, ComponentOverrides, ComponentSetting }` from `@/types/elements`.
  - Re-export `type { ComponentOverride, ComponentOverrides, ComponentSetting }` so existing callers importing those types from `features/projects/lib/components` keep working.
- **`src/features/preview/components/PreviewCMSContent.tsx`**:
  - Import `CMSContentGridElement`, `CMSContentItemElement`, `CMSContentListElement` from `@/types/elements`.
- **`src/features/editor/constants/elements.ts`**:
  - Keep editor-only UI metadata (`ELEMENT_METADATA`, `ElementHolder`, `elementHolders` + icon mapping).
  - Re-export `CONTAINER_ELEMENT_TYPES`, `EDITABLE_ELEMENT_TYPES`, `ALL_ELEMENT_TYPES`, `type ElementType`, `isContainerElement`, `isEditableElement` from `@/types/elements`.
- **Thin compatibility shims (preserving `@/features/editor` barrel and any direct subpath imports):**
  - `src/features/editor/interfaces/elements.interface.ts` → `export * from "@/types/elements/elements";`
  - `src/features/editor/interfaces/events.interface.ts` → `export * from "@/types/elements/events";`
  - `src/features/editor/interfaces/validate.interface.ts` → `export * from "@/types/elements/validation";`
  - `src/features/editor/constants/events.ts` → `export * from "@/types/elements/event-constants";`

### 3.4 `src/features/editor/utils/` Purity & Layer Inversion Cleanup

Relocate stateful/store-coupled modules out of `src/features/editor/utils/` into `src/features/editor/lib/`:

1. **`componentDrop.ts`**:
   - Move `src/features/editor/utils/element/componentDrop.ts` → `src/features/editor/lib/componentDrop.ts`.
   - Update internal relative imports (`../services/component-library.service`, `../hooks/useProjectComponents`, `../utils/element/dragPayload`).
   - Update both callers:
     - `src/features/editor/components/canvas/CanvasInteractionLayer.tsx`
     - `src/features/editor/hooks/useEditor.ts`
2. **`keyBoardEvents.ts`**:
   - Move `src/features/editor/utils/element/keyBoardEvents.ts` → `src/features/editor/lib/keyBoardEvents.ts`.
   - Remove the unused `elementHelper` import.
   - Replace barrel imports (`ElementStore`, `SelectionStore` from `@/features/editor`) with direct store imports (`../store/element-store`, `../store/selection-store`, `../store/selected-element`).
   - Update both callers:
     - `src/features/editor/components/EditorContextMenu.tsx`
     - `src/features/editor/hooks/useEditorShortcuts.ts`
3. **`ElementFactory.ts`**:
   - Move `src/features/editor/utils/element/create/ElementFactory.ts` → `src/features/editor/lib/ElementFactory.ts` (keeping pure strategy builders `elementCreateStrategy.ts` and `elementStrategyMap.ts` in `utils/element/create/`).
   - Replace barrel imports: import `ResponsiveStyles`, `ElementTypeMap` from `@/types/elements`, and `SelectionStore` from `../store/selection-store`.
   - Update all 5 callers:
     - `src/features/editor/components/elements/SectionActions.tsx`
     - `src/features/editor/components/elements/FormComponent.tsx`
     - `src/features/editor/components/editor/EmptyPageStarter.tsx`
     - `src/features/editor/components/canvas/CanvasInteractionLayer.tsx`
     - `src/features/editor/components/wireframe/useSectionActions.ts`
4. **Remaining pure `src/features/editor/utils/` files**:
   - `computeTailwindFromStyles.ts` → import `type { ResponsiveStyles }` from `@/types/elements` (instead of `@/features/editor`).
   - `create/elementCreateStrategy.ts` → import element interfaces from `@/types/elements` (instead of `@/features/editor`).
   - `element-tree-helper.ts` → import element-type constants/guards from `@/types/elements` (instead of `@/features/editor/constants/elements`).

After these moves, every file under `src/features/editor/utils/` is pure and free of store, hook, service, or editor-barrel imports.

---

## 4. Boundary Verification & Test Strategy

### New Regression Guard: `tests/architecture-boundaries.test.ts`
Executed automatically by `npm run test:unit` (`node --import tsx --test tests/*.test.ts`). Statically scans every `.ts`/`.tsx` file under `src/`, resolves both `@/` alias and relative specifiers (handling static `import`/`export ... from` and dynamic `import(...)`), and asserts four rules:

1. **Foundation purity (`src/types/**`)**: No import resolves to `src/features/**`, `src/components/**`, `src/providers/**`, or `src/services/**`.
2. **Leaf feature isolation (`src/features/elements/**`)**: No import resolves to `src/features/<other>/**` where `<other> !== "elements"`.
3. **Projects independence (`src/features/projects/**`)**: No import resolves to `src/features/editor/**`.
4. **Editor utils purity (`src/features/editor/utils/**`)**: No import resolves to `src/features/editor/store/**`, `src/features/editor/hooks/**`, `src/features/editor/services/**`, or the barrel `src/features/editor` (`src/features/editor/index.ts`).

Each test prints all offending `source -> target` edges on failure so violations are immediately actionable.

### Verification Gates
After implementation, run all three gates in `webbuilderv2`:
1. `npx tsc --noEmit` — verifies strict TypeScript compilation across `src/` and `tests/`.
2. `npm run test:unit` — verifies all existing unit tests (including `resolve-content.test.ts`, `preview-links.test.ts`, `element-views.test.ts`, `element-categories.test.ts`, `refactor-verification.test.ts`) plus `architecture-boundaries.test.ts`.
3. `npm run build` — verifies Vite 8 (Rolldown) + TanStack Start production bundling succeeds with zero circular chunk or resolution errors.
