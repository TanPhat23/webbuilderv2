# One renderer for editor and preview — design

Status: approved, implement in `webbuilderv2` only.

## Problem

Every element type is drawn twice: `src/features/editor/components/elements/*` (editor, ~28 files, uses
`useCanvasElement` for root props) and `src/features/preview/components/Preview*` (preview, ~18 files, plus
`PreviewAdditionalComponent` as fallback). They have drifted (e.g. editor Button is always a `<button>` with an empty
default label; preview Button becomes `<a>` when it has a link and defaults to "Button"). Every feature is built twice
(scroll reveal, link props, shared sections, component instances). Resolution of shared sections / component instances
exists in both `editor/components/ElementLoader.tsx` and `preview/lib/preview-data.ts`.

## Target

1. **Shared views** — `src/features/elements/views/<Type>View.tsx`: pure components, no editor store/hooks, that draw the
   markup for one element type:

   ```ts
   interface ViewProps<E extends EditorElement = EditorElement> {
     element: E;
     rootProps: React.HTMLAttributes<HTMLElement> & Record<string, unknown>; // id, data-*, className, style, + editor extras
     children?: React.ReactNode;       // already-rendered children (container types)
     data?: Record<string, unknown>;   // CMS / runtime values
     mode: "edit" | "preview";         // only for behaviour that truly differs (e.g. CMS placeholder, links not navigating)
   }
   ```
   A view decides the tag, content (sanitized via DOMPurify, `resolveContent`), link/button tag choice
   (`preview/lib/link-props`), image `<img>` and `objectFit`, defaults. It never touches selection, drag or editing.
2. **Shared registry** — `src/features/elements/registry.ts`: `getView(type)`; one table type → View (lazy only where the
   editor lazy-loads heavy ones, e.g. Carousel/Code/Table, otherwise static). The preview map
   (`preview/constants/previewComponents.ts`) and `getComponentFactory` consumers collapse to this registry.
3. **Editor adapters** — each file in `editor/components/elements/*` becomes a thin adapter:
   `const { rootProps } = useCanvasElement(element); return <XView element rootProps={rootProps} mode="edit" …/>`.
   Editing-only behaviour (contentEditable, drop overlays, `useMediaDrop`, CMS empty states, shared wrappers like
   `TextElementShell`) stays in the adapter or `elements/shared`, not in the view.
4. **Preview adapters** — `PreviewElementLoader` renders via the registry with plain root props
   (`id`, `data-element-id`, `className=tailwindStyles`, safe styles), `mode="preview"`; remove the `Preview*Component`
   files whose logic moved to views.
5. **One resolve pipeline** — `src/features/projects/lib/resolve-elements.ts`:
   `resolveElements({ page, project, pageIds, componentIds }) → EditorElement[]` runs `resolveSharedSections` then
   `resolveComponents` (and anything else resolved at load). `ElementLoader.tsx` and `preview-data.ts` both call it;
   no other place may chain the two.

## Constraints

- Behaviour-preserving. Published/preview HTML for existing elements must not change except where the old editor/preview
  already disagreed — in that case the **preview** behaviour wins for markup, the **editor** wins for interaction. List each
  such case in your final message.
- Scroll reveal, component instances (`ComponentInstanceCanvas`), missing-component placeholder, interaction ids
  (`tests/interactions-preview-ids.test.ts`) must keep working.
- Do it in steps and keep `npx tsc --noEmit` and `node --import tsx --test tests/*.test.ts` green after each step:
  step 1 resolve pipeline; step 2 registry + views for Text, Button, Link, Image, Section/Header/Footer/Nav, Frame;
  step 3 the remaining types (Input, Textarea, Select, Form, List, Carousel, CMS*, and every type currently rendered by
  `PreviewAdditionalComponent` / present in `editor/components/elements`). If a type is too entangled to move safely,
  leave it as is and list it.
- **Parity test** (`tests/element-views.test.ts`): for each migrated type render the view with `mode:"edit"` using editor
  root props and `mode:"preview"` with preview props via `react-dom/server` and assert identical markup after removing the
  editor-only attributes (`draggable`, `contenteditable`, `data-element-type`, event styles). Also assert the preview loader
  and the registry cover every type in `ALL_ELEMENT_TYPES` that the preview supported before.
- Do not change the agent executor, MCP or API. Do not commit. Do not revert the user's uncommitted changes.
