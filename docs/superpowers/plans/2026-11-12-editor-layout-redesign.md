# Editor Layout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the editor's two nested shadcn sidebars and cluttered header with one layout: full-width top bar, icon rail + single panel on the left, canvas, contextual inspector on the right.

**Architecture:** A new `EditorLayout` (plain flex, no `SidebarProvider`) renders `EditorTopBar` above a row of `EditorRail` · `EditorPanel` · `<main>` · `Inspector`. Which panel is shown and whether panels are open lives in a small persisted zustand store (`useEditorChromeStore`). Existing panel contents (element picker, layers tree, pages, images, CMS, snapshots, workflows, AI chat, style/settings configurations) are reused unchanged, only re-homed.

**Tech Stack:** React 19, TanStack Start/Router, zustand 5 (`persist`), shadcn/ui (Tooltip, Tabs, Dialog, Collapsible, Button), lucide-react, Tailwind v4. Unit tests run with `bun test` (Bun 1.3, resolves the `@/` tsconfig alias).

**Spec:** `docs/superpowers/specs/2026-11-12-editor-layout-redesign-design.md`

All component paths below are relative to `src/features/editor/components/` unless they start with `src/`.

## Global Constraints

- No change to `EditorProvider`'s context API (`mode`, `setMode`, `editingMode`, `setEditingMode`).
- No new persisted backend fields; Publish uses `usePublishProject`.
- Panel widths: rail 46px, panel 240px (AI panel 360px), inspector 260px.
- Shortcuts: ⌘/Ctrl+`\` toggles panel, ⌘/Ctrl+`.` toggles inspector, `?` opens shortcuts dialog. Ignored while typing in an input, textarea, select or contenteditable.
- In Code mode the rail, panel and inspector are hidden (as today). Wireframe mode keeps rendering `WireframeView` (unchanged).
- Read-only users never see insert actions (empty-page starter hidden).
- Remove hardcoded `http://localhost:3000` from the editor chrome (Preview uses a relative link).
- `npx tsc --noEmit` and `bun run build` pass after every task.

## Review Focus

1. **SSR hydration** — the editor route is server-rendered; a store that rehydrates from localStorage during the first client render would mismatch. Store uses `skipHydration` and rehydrates in an effect. Test: store default state is `DEFAULT_CHROME` before `rehydrate()` (Task 1).
2. **Corrupt or stale localStorage** (e.g. `activePanel: "tools"` from an old build, or non-boolean flags) must fall back to defaults, not render an empty panel. Test: `sanitizeChrome` cases (Task 1).
3. **Shortcuts while typing** — pressing `?` or ⌘. inside the CSS importer textarea or an inspector input must type, not toggle UI. Test: `isTypingTarget` cases (Task 2).
4. **Re-clicking the active rail item** collapses the panel; clicking a different item while collapsed opens it on that item. Test: store transitions (Task 1).
5. **Publish without permission** — viewers/editors without `canPublishProject` must not see an enabled Publish button. Covered by rendering the button only when permitted (Task 3); verified in the browser checklist.

---

### Task 1: Chrome store and mode mapping (pure logic)

**Files:**
- Create: `src/features/editor/store/editor-chrome-store.ts`
- Create: `src/features/editor/lib/editor-surface.ts`
- Test: `src/features/editor/store/editor-chrome-store.test.ts`
- Test: `src/features/editor/lib/editor-surface.test.ts`

**Interfaces — Produces:**
- `RAIL_IDS`, `type RailId = "insert"|"layers"|"pages"|"assets"|"cms"|"workflows"|"history"|"ai"`
- `DEFAULT_CHROME: { activePanel: RailId; panelOpen: boolean; inspectorOpen: boolean }`
- `sanitizeChrome(value: unknown): typeof DEFAULT_CHROME`
- `useEditorChromeStore` with `activePanel, panelOpen, inspectorOpen, selectPanel(id), togglePanel(), closePanel(), toggleInspector()`
- `type EditorSurface = "design"|"wireframe"|"code"`, `toSurface(mode, editingMode)`, `fromSurface(surface) → { mode, editingMode }`

- [ ] **Step 1: Write failing tests**

`src/features/editor/lib/editor-surface.test.ts`:
```ts
import { describe, expect, test } from "bun:test";
import { fromSurface, toSurface } from "./editor-surface";

describe("editor surface mapping", () => {
  test("toSurface", () => {
    expect(toSurface("editor", "visual")).toBe("design");
    expect(toSurface("wireframe", "visual")).toBe("wireframe");
    expect(toSurface("editor", "code")).toBe("code");
    expect(toSurface("wireframe", "code")).toBe("code");
  });
  test("fromSurface round-trips", () => {
    for (const s of ["design", "wireframe", "code"] as const) {
      const { mode, editingMode } = fromSurface(s);
      expect(toSurface(mode, editingMode)).toBe(s);
    }
  });
});
```

`src/features/editor/store/editor-chrome-store.test.ts`:
```ts
import { beforeEach, describe, expect, test } from "bun:test";
import {
  DEFAULT_CHROME,
  sanitizeChrome,
  useEditorChromeStore,
} from "./editor-chrome-store";

const reset = () => useEditorChromeStore.setState({ ...DEFAULT_CHROME });

describe("useEditorChromeStore", () => {
  beforeEach(reset);

  test("starts at defaults before rehydration", () => {
    const { activePanel, panelOpen, inspectorOpen } = useEditorChromeStore.getState();
    expect({ activePanel, panelOpen, inspectorOpen }).toEqual(DEFAULT_CHROME);
  });

  test("selecting another item switches and opens", () => {
    useEditorChromeStore.setState({ panelOpen: false });
    useEditorChromeStore.getState().selectPanel("layers");
    const s = useEditorChromeStore.getState();
    expect(s.activePanel).toBe("layers");
    expect(s.panelOpen).toBe(true);
  });

  test("re-selecting the open item collapses; again re-opens", () => {
    const { selectPanel } = useEditorChromeStore.getState();
    selectPanel("insert");
    expect(useEditorChromeStore.getState().panelOpen).toBe(false);
    selectPanel("insert");
    expect(useEditorChromeStore.getState().panelOpen).toBe(true);
  });

  test("toggles", () => {
    const s = useEditorChromeStore.getState();
    s.togglePanel();
    s.toggleInspector();
    expect(useEditorChromeStore.getState().panelOpen).toBe(false);
    expect(useEditorChromeStore.getState().inspectorOpen).toBe(false);
    useEditorChromeStore.getState().closePanel();
    expect(useEditorChromeStore.getState().panelOpen).toBe(false);
  });
});

describe("sanitizeChrome", () => {
  test("garbage → defaults", () => {
    expect(sanitizeChrome(null)).toEqual(DEFAULT_CHROME);
    expect(sanitizeChrome("x")).toEqual(DEFAULT_CHROME);
    expect(sanitizeChrome({ activePanel: "tools", panelOpen: "yes" })).toEqual(DEFAULT_CHROME);
  });
  test("keeps valid fields", () => {
    expect(
      sanitizeChrome({ activePanel: "cms", panelOpen: false, inspectorOpen: false }),
    ).toEqual({ activePanel: "cms", panelOpen: false, inspectorOpen: false });
  });
});
```

- [ ] **Step 2: Run, verify FAIL** — `bun test src/features/editor` → "Cannot find module".

- [ ] **Step 3: Implement**

`src/features/editor/lib/editor-surface.ts`:
```ts
export type CanvasMode = "editor" | "wireframe";
export type EditingMode = "visual" | "code";
export type EditorSurface = "design" | "wireframe" | "code";

export function toSurface(mode: CanvasMode, editingMode: EditingMode): EditorSurface {
  if (editingMode === "code") return "code";
  return mode === "wireframe" ? "wireframe" : "design";
}

export function fromSurface(surface: EditorSurface): { mode: CanvasMode; editingMode: EditingMode } {
  switch (surface) {
    case "code":
      return { mode: "editor", editingMode: "code" };
    case "wireframe":
      return { mode: "wireframe", editingMode: "visual" };
    default:
      return { mode: "editor", editingMode: "visual" };
  }
}
```

`src/features/editor/store/editor-chrome-store.ts`:
```ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const RAIL_IDS = [
  "insert", "layers", "pages", "assets", "cms", "workflows", "history", "ai",
] as const;
export type RailId = (typeof RAIL_IDS)[number];

type ChromeLayout = { activePanel: RailId; panelOpen: boolean; inspectorOpen: boolean };

export const DEFAULT_CHROME: ChromeLayout = {
  activePanel: "insert",
  panelOpen: true,
  inspectorOpen: true,
};

/** Persisted values come from an older build or a user's devtools: trust nothing. */
export function sanitizeChrome(value: unknown): ChromeLayout {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const valid = (RAIL_IDS as readonly unknown[]).includes(v.activePanel);
  return {
    activePanel: valid ? (v.activePanel as RailId) : DEFAULT_CHROME.activePanel,
    panelOpen: typeof v.panelOpen === "boolean" ? v.panelOpen : DEFAULT_CHROME.panelOpen,
    inspectorOpen:
      typeof v.inspectorOpen === "boolean" ? v.inspectorOpen : DEFAULT_CHROME.inspectorOpen,
  };
}

interface EditorChromeState extends ChromeLayout {
  selectPanel: (id: RailId) => void;
  togglePanel: () => void;
  closePanel: () => void;
  toggleInspector: () => void;
}

export const useEditorChromeStore = create<EditorChromeState>()(
  persist(
    (set) => ({
      ...DEFAULT_CHROME,
      selectPanel: (id) =>
        set((s) =>
          s.activePanel === id && s.panelOpen
            ? { panelOpen: false }
            : { activePanel: id, panelOpen: true },
        ),
      togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
      closePanel: () => set({ panelOpen: false }),
      toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
    }),
    {
      name: "editor-chrome",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // SSR renders defaults; EditorLayout calls persist.rehydrate() after mount.
      skipHydration: true,
      partialize: ({ activePanel, panelOpen, inspectorOpen }) => ({
        activePanel, panelOpen, inspectorOpen,
      }),
      merge: (persisted, current) => ({ ...current, ...sanitizeChrome(persisted) }),
    },
  ),
);
```

- [ ] **Step 4: Run, verify PASS** — `bun test src/features/editor` → all pass.
- [ ] **Step 5: Commit** — `git add` both sources + tests; `git commit -m "feat(editor): chrome layout store and editor surface mapping"`.

---

### Task 2: Layout shell, rail, panel, inspector

Replaces `EditorShell` + both sidebars in one step (they share `SidebarProvider` state, so they cannot be swapped separately).

**Files:**
- Create: `layout/EditorLayout.tsx`, `layout/EditorRail.tsx`, `layout/EditorPanel.tsx`, `layout/railItems.tsx`, `layout/LayersPanel.tsx`, `layout/WorkflowsPanel.tsx`, `layout/useChromeShortcuts.ts`
- Create: `sidebar/Inspector.tsx`, `sidebar/PageProperties.tsx`
- Test: `layout/useChromeShortcuts.test.ts`
- Modify: `src/providers/editorprovider.tsx` (import `EditorLayout` instead of `EditorShell`)
- Modify: `src/features/ai/components/AiChatPanel.tsx` (drop `useSidebar`; accept `onClose`; fill its container)
- Modify: `src/app/_protected/editor.$id/-editor.tsx` (remove `EditorHeader`; Task 3 adds the top bar to the layout — until then the layout renders the existing `EditorHeader`)
- Delete: `editor/EditorShell.tsx`, `sidebar/EditorSideBar.tsx`, `sidebar/LayoutSideBar.tsx`, `sidebar/SidebarEmptyState.tsx`

**Interfaces:**
- Consumes: Task 1 store and `RailId`.
- Produces: `EditorLayout({ children })` (default export); `isTypingTarget(target: EventTarget | null): boolean`; `useChromeShortcuts({ onShowShortcuts?: () => void })`; `RAIL_ITEMS: RailItem[]` where `RailItem = { id: RailId; label: string; icon: LucideIcon; group: "main" | "tools"; width?: number; render: () => ReactNode }`.

- [ ] **Step 1: Failing test for the typing guard** — `layout/useChromeShortcuts.test.ts`:
```ts
import { describe, expect, test } from "bun:test";
import { isTypingTarget } from "./useChromeShortcuts";

const el = (tagName: string, extra: Record<string, unknown> = {}) =>
  ({ tagName, isContentEditable: false, ...extra }) as unknown as EventTarget;

describe("isTypingTarget", () => {
  test("form fields and contenteditable are typing targets", () => {
    expect(isTypingTarget(el("INPUT"))).toBe(true);
    expect(isTypingTarget(el("TEXTAREA"))).toBe(true);
    expect(isTypingTarget(el("SELECT"))).toBe(true);
    expect(isTypingTarget(el("DIV", { isContentEditable: true }))).toBe(true);
  });
  test("other targets are not", () => {
    expect(isTypingTarget(el("DIV"))).toBe(false);
    expect(isTypingTarget(el("BUTTON"))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});
```
Run `bun test src/features/editor` → FAIL (module missing).

- [ ] **Step 2: `layout/useChromeShortcuts.ts`**
```ts
import { useEffect } from "react";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target) return false;
  const t = target as { tagName?: string; isContentEditable?: boolean };
  return (
    t.isContentEditable === true ||
    t.tagName === "INPUT" ||
    t.tagName === "TEXTAREA" ||
    t.tagName === "SELECT"
  );
}

export function useChromeShortcuts({ onShowShortcuts }: { onShowShortcuts?: () => void } = {}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "\\") {
        e.preventDefault();
        useEditorChromeStore.getState().togglePanel();
      } else if (mod && e.key === ".") {
        e.preventDefault();
        useEditorChromeStore.getState().toggleInspector();
      } else if (!mod && e.key === "?" && onShowShortcuts) {
        e.preventDefault();
        onShowShortcuts();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onShowShortcuts]);
}
```
Run tests → PASS.

- [ ] **Step 3: Panel bodies.** `layout/LayersPanel.tsx` — the "layers" branch of `EditorSideBar` verbatim (ScrollArea + `useElements()` + `ElementTreeItem`, empty text "No elements yet. Add components to see them here."), key `element.id` (drop the `Math.random()` fallback; ids are always set). `layout/WorkflowsPanel.tsx` — the "workflows" branch verbatim (lazy `EventWorkflowManagerDialog`, local `open` state, "Open Workflow Editor" button, "Project not loaded" fallback), reading `projectId` from `useEditorContext()`.

- [ ] **Step 4: `layout/railItems.tsx`**
```tsx
import React from "react";
import type { LucideIcon } from "lucide-react";
import { Plus, Layers, FileText, ImageIcon, Database, Zap, History, Sparkles } from "lucide-react";
import type { RailId } from "@/features/editor/store/editor-chrome-store";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import { ElementSelector } from "../sidebar/ElementSelector";
import { ProjectPageCommand } from "../ProjectPageCommand";
import LayersPanel from "./LayersPanel";
import WorkflowsPanel from "./WorkflowsPanel";
import { AIChat } from "@/features/ai";

const CMSManager = React.lazy(() => import("@/features/cms/components/CMSManagerDialog"));
const SnapshotManager = React.lazy(() => import("../sidebar/SnapshotManager"));
const ImageSelector = React.lazy(() =>
  import("@/features/images/components/ImageSelector").then((m) => ({ default: m.ImageSelector })),
);

export type RailItem = {
  id: RailId;
  label: string;
  icon: LucideIcon;
  group: "main" | "tools";
  width?: number;
  /** Panel content renders its own padding unless `padded` is set. */
  padded?: boolean;
  render: () => React.ReactNode;
};

function CloseableAIChat() {
  const closePanel = useEditorChromeStore((s) => s.closePanel);
  return <AIChat onClose={closePanel} />;
}

export const RAIL_ITEMS: RailItem[] = [
  { id: "insert", label: "Insert", icon: Plus, group: "main", render: () => <ElementSelector /> },
  { id: "layers", label: "Layers", icon: Layers, group: "main", render: () => <LayersPanel /> },
  { id: "pages", label: "Pages", icon: FileText, group: "main", padded: true, render: () => <ProjectPageCommand /> },
  { id: "assets", label: "Assets", icon: ImageIcon, group: "main", padded: true, render: () => <ImageSelector /> },
  { id: "cms", label: "CMS", icon: Database, group: "main", padded: true, render: () => <CMSManager /> },
  { id: "workflows", label: "Workflows", icon: Zap, group: "tools", padded: true, render: () => <WorkflowsPanel /> },
  { id: "history", label: "History", icon: History, group: "tools", padded: true, render: () => <SnapshotManager /> },
  { id: "ai", label: "AI assistant", icon: Sparkles, group: "tools", width: 360, render: () => <CloseableAIChat /> },
];

export const railItem = (id: RailId) => RAIL_ITEMS.find((i) => i.id === id) ?? RAIL_ITEMS[0];
```

- [ ] **Step 5: `layout/EditorRail.tsx`** — vertical 46px column: `main` items, a divider, `tools` items, spacer, then a project-settings `Link` (`to="/projectsettings/$id"`, `params={{ id: projectId }}`, `Settings` icon). Each item is a `Button variant="ghost" size="icon"` (h-8 w-8) with `aria-label={label}`, `aria-pressed={active}`, active style `bg-accent text-foreground` plus a 2px left indicator, wrapped in `Tooltip` (`side="right"`) showing the label. `onClick={() => selectPanel(item.id)}`. Active = `panelOpen && activePanel === item.id`.

- [ ] **Step 6: `layout/EditorPanel.tsx`**
```tsx
import { Suspense } from "react";
import { PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import { railItem } from "./railItems";
import { cn } from "@/lib/utils";

function PanelFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}

export default function EditorPanel() {
  const activePanel = useEditorChromeStore((s) => s.activePanel);
  const closePanel = useEditorChromeStore((s) => s.closePanel);
  const item = railItem(activePanel);
  return (
    <aside
      aria-label={item.label}
      style={{ width: item.width ?? 240 }}
      className="flex h-full shrink-0 flex-col border-r border-border bg-card"
    >
      {item.id !== "ai" && (
        <div className="flex h-10 items-center justify-between border-b border-border px-3">
          <span className="text-xs font-semibold">{item.label}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Collapse panel" onClick={closePanel}>
            <PanelLeftClose className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      <div className={cn("min-h-0 flex-1 overflow-y-auto", item.padded && "p-3")}>
        <Suspense fallback={<PanelFallback />}>{item.render()}</Suspense>
      </div>
    </aside>
  );
}
```

- [ ] **Step 7: `sidebar/PageProperties.tsx`** — uses `useCurrentPage()`, `useCurrentProject()`. Renders a heading "Page", then key/value rows: Name (`page.Name || "Home"`), Type (`page.Type`), and for each string entry in `page.Styles` (if an object) a row `key → value` (max 8, monospace). Below: a `Link` button "Project settings" to `/projectsettings/$id`, and helper text "Select an element on the canvas to style it." If no page: "No page loaded."

- [ ] **Step 8: `sidebar/Inspector.tsx`**
```tsx
import React, { Suspense } from "react";
import { ChevronDown, PanelRightClose } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useSelectedElement } from "@/features/editor";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import PageProperties from "./PageProperties";

const Settings = React.lazy(() => import("./configurations/Settings"));
const Styles = React.lazy(() => import("./configurations/Styles"));
const CssTextareaImporter = React.lazy(() => import("../editor/CssTextareaImporter"));

const Fallback = () => <div className="py-8 text-center text-xs text-muted-foreground">Loading…</div>;

export default function Inspector() {
  const selected = useSelectedElement();
  const toggleInspector = useEditorChromeStore((s) => s.toggleInspector);

  return (
    <aside aria-label="Inspector" className="flex h-full w-[260px] shrink-0 flex-col border-l border-border bg-card">
      {selected ? (
        <Tabs defaultValue="style" className="flex min-h-0 flex-1 flex-col gap-0">
          <div className="flex h-10 items-center gap-1 border-b border-border px-2">
            <TabsList className="h-7">
              <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
            </TabsList>
            <span className="flex-1" />
            <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Collapse inspector" onClick={toggleInspector}>
              <PanelRightClose className="h-3.5 w-3.5" />
            </Button>
          </div>
          <TabsContent value="style" className="min-h-0 flex-1 overflow-y-auto p-3">
            <Suspense fallback={<Fallback />}>
              <Styles />
              <Collapsible className="mt-4 border-t border-border pt-3">
                <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-medium">
                  Import CSS <ChevronDown className="h-3.5 w-3.5" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <CssTextareaImporter />
                </CollapsibleContent>
              </Collapsible>
            </Suspense>
          </TabsContent>
          <TabsContent value="settings" className="min-h-0 flex-1 overflow-y-auto p-3">
            <Suspense fallback={<Fallback />}><Settings /></Suspense>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <div className="flex h-10 items-center justify-between border-b border-border px-3">
            <span className="text-xs font-semibold">Page</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Collapse inspector" onClick={toggleInspector}>
              <PanelRightClose className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3"><PageProperties /></div>
        </>
      )}
    </aside>
  );
}
```

- [ ] **Step 9: `layout/EditorLayout.tsx`**
```tsx
import React, { useEffect, useState } from "react";
import { PanelRightOpen } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/providers/editorprovider";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import { ElementCommentsPanel } from "../comments/ElementCommentsPanel";
import Inspector from "../sidebar/Inspector";
import EditorRail from "./EditorRail";
import EditorPanel from "./EditorPanel";
import { useChromeShortcuts } from "./useChromeShortcuts";
import EditorHeader from "../editor/EditorHeader"; // replaced by EditorTopBar in Task 3

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const { editingMode, projectId, editor } = useEditorContext();
  const panelOpen = useEditorChromeStore((s) => s.panelOpen);
  const inspectorOpen = useEditorChromeStore((s) => s.inspectorOpen);
  const toggleInspector = useEditorChromeStore((s) => s.toggleInspector);
  const [, setShortcutsOpen] = useState(false); // dialog added in Task 3

  useEffect(() => { useEditorChromeStore.persist.rehydrate(); }, []);
  useChromeShortcuts({ onShowShortcuts: () => setShortcutsOpen(true) });

  const showChrome = editingMode !== "code";

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
        <EditorHeader currentView={editor.currentView} setCurrentView={editor.setCurrentView} projectId={projectId ?? ""} />
        <div className="flex min-h-0 flex-1">
          {showChrome && <EditorRail />}
          {showChrome && panelOpen && <EditorPanel />}
          <main className="relative min-w-0 flex-1 overflow-hidden">
            {children}
            {showChrome && !inspectorOpen && (
              <Button variant="outline" size="icon" aria-label="Show inspector" onClick={toggleInspector}
                className="absolute right-3 top-3 z-30 h-7 w-7">
                <PanelRightOpen className="h-3.5 w-3.5" />
              </Button>
            )}
          </main>
          {showChrome && inspectorOpen && <Inspector />}
          <ElementCommentsPanel />
        </div>
      </div>
    </TooltipProvider>
  );
}
```
In `-editor.tsx`, delete the `<EditorHeader …/>` element and its import (the layout renders it now), and change the root to `flex-1 w-full h-full flex flex-col`.

- [ ] **Step 10: AI panel.** In `AiChatPanel.tsx`: remove the `useSidebar` import and `const { open: sidebarOpen, setOpen } = useSidebar();`; add prop `{ onClose }: { onClose?: () => void }` to `AnimatedAIChat`; the close button calls `closeChat(); onClose?.();` and gets `aria-label="Close AI assistant"`, `variant="ghost" size="icon"`, `absolute right-2 top-2`, content `<X className="h-4 w-4" />`; root `div` class `flex w-1/3 overflow-x-hidden` → `relative flex h-full w-full overflow-x-hidden`; inner `min-h-screen` → `min-h-full`.

- [ ] **Step 11: Wire in.** `editorprovider.tsx`: `import EditorLayout from "@/features/editor/components/layout/EditorLayout";` and render `<EditorLayout>{children}</EditorLayout>` in place of `EditorShell`. Delete `EditorShell.tsx`, `EditorSideBar.tsx`, `LayoutSideBar.tsx`, `SidebarEmptyState.tsx`. Run `rg -n "EditorShell|EditorSideBar|LayoutSideBar|SidebarEmptyState" src` → no matches.

- [ ] **Step 12: Verify** — `bun test src/features/editor` PASS; `npx tsc --noEmit` clean; `bun run build` succeeds.
- [ ] **Step 13: Commit** — `git add -A src/features/editor src/providers/editorprovider.tsx src/features/ai src/app/_protected/editor.\$id` ; `git commit -m "feat(editor): single rail + panel layout with contextual inspector"`.

---

### Task 3: Top bar, publish, shortcuts dialog

**Files:**
- Create: `topbar/EditorTopBar.tsx`, `topbar/ModeSwitch.tsx`, `topbar/PublishButton.tsx`, `topbar/CommentsToggle.tsx`, `editor/ShortcutsDialog.tsx`
- Modify: `layout/EditorLayout.tsx` (render `EditorTopBar` + `ShortcutsDialog`)
- Delete: `editor/EditorHeader.tsx`, `editor/header/CanvasModeControls.tsx`, `editor/header/HeaderActions.tsx`

**Interfaces:**
- Consumes: `toSurface`/`fromSurface` (Task 1); `useEditorPermissions(projectId).canPublishProject`; `usePublishProject()`; `useCurrentProject()`; existing `ProjectBreadcrumb({ onNavigate })`, `ViewportControls({ currentView, setCurrentView })`, `PageNavigationCommand({ open, setOpen })`, `EventModeToggle`, `CollaboratorIndicator({ projectId })`, `CollaborationButton({ projectId })`.
- Produces: `EditorTopBar({ projectId, onShowShortcuts })`, `ShortcutsDialog({ open, onOpenChange })`.

- [ ] **Step 1: `topbar/ModeSwitch.tsx`**
```tsx
import { useEditorContext } from "@/providers/editorprovider";
import { fromSurface, toSurface, type EditorSurface } from "@/features/editor/lib/editor-surface";
import { cn } from "@/lib/utils";

const SURFACES: { id: EditorSurface; label: string }[] = [
  { id: "design", label: "Design" },
  { id: "wireframe", label: "Wireframe" },
  { id: "code", label: "Code" },
];

export default function ModeSwitch() {
  const { mode, setMode, editingMode, setEditingMode } = useEditorContext();
  const current = toSurface(mode, editingMode);
  return (
    <div role="radiogroup" aria-label="Editor mode" className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
      {SURFACES.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={current === s.id}
          onClick={() => {
            const next = fromSurface(s.id);
            setEditingMode(next.editingMode);
            setMode(next.mode);
          }}
          className={cn(
            "h-7 rounded-md px-2.5 text-xs font-medium transition-colors",
            current === s.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: `topbar/CommentsToggle.tsx`** — the comments `Tooltip`+`Button` block from `CanvasModeControls` verbatim, as its own component.

- [ ] **Step 3: `topbar/PublishButton.tsx`**
```tsx
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentProject, usePublishProject } from "@/features/projects/hooks/useProjects";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";

export default function PublishButton({ projectId }: { projectId: string }) {
  const { data: project } = useCurrentProject();
  const { canPublishProject } = useEditorPermissions(projectId);
  const publish = usePublishProject();
  if (!project || !canPublishProject) return null;

  const published = project.published;
  return (
    <Button
      size="sm"
      variant={published ? "outline" : "default"}
      disabled={publish.isPending}
      onClick={() => publish.mutate({ projectId, publish: !published })}
      className="h-7 px-3 text-xs font-semibold"
    >
      {publish.isPending && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
      {published ? "Unpublish" : "Publish"}
    </Button>
  );
}
```

- [ ] **Step 4: `topbar/EditorTopBar.tsx`** — `header` `h-11 flex items-center gap-3 border-b border-border bg-background px-3`, three zones:
  - Left (`min-w-0 flex-1`): `ProjectBreadcrumb onNavigate={() => setNavOpen(true)}`; keep the ⌘K effect from `EditorHeader` (`useNavigationShortcut`) here.
  - Centre (`shrink-0`): `ModeSwitch`, `ViewportControls currentView setCurrentView` (from `useEditorContext().editor`).
  - Right (`flex flex-1 justify-end items-center gap-1.5`): `EventModeToggle`, `CommentsToggle`, a `?` ghost icon button (`HelpCircle`, `aria-label="Keyboard shortcuts"`, calls `onShowShortcuts`), `Separator vertical h-4`, `CollaboratorIndicator`, `CollaborationButton`, Preview (`<Button asChild variant="outline" size="sm" className="h-7 gap-1.5 text-xs"><a href={`/preview/${projectId}`} target="_blank" rel="noreferrer"><Play/>Preview</a></Button>`), `PublishButton`.
  - Renders `PageNavigationCommand open={navOpen} setOpen={setNavOpen}`.

- [ ] **Step 5: `editor/ShortcutsDialog.tsx`** — shadcn `Dialog` titled "Keyboard shortcuts", a two-column list of rows with `<kbd>` keys: Copy ⌘C · Paste ⌘V · Cut ⌘X · Undo ⌘Z · Redo ⌘Y · Delete element Delete · Deselect Esc · Go to page ⌘K · Toggle left panel ⌘\ · Toggle inspector ⌘. · Show shortcuts ?. (Matches `useEditorShortcuts.ts` cases c/v/x/z/y/Delete/Escape.)

- [ ] **Step 6: Wire into `EditorLayout`.** Replace the `EditorHeader` import/element with `<EditorTopBar projectId={projectId ?? ""} onShowShortcuts={() => setShortcutsOpen(true)} />`; change `const [, setShortcutsOpen]` to `const [shortcutsOpen, setShortcutsOpen]`; render `<ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />`. Delete `EditorHeader.tsx`, `header/CanvasModeControls.tsx`, `header/HeaderActions.tsx`; `rg -n "EditorHeader|CanvasModeControls|HeaderActions|localhost:3000" src/features/editor` → no matches.

- [ ] **Step 7: Verify** — tests, `npx tsc --noEmit`, `bun run build`.
- [ ] **Step 8: Commit** — `git commit -m "feat(editor): top bar with mode switch, preview, publish and shortcuts dialog"`.

---

### Task 4: Empty-page starter and distinct component icons

**Files:**
- Create: `editor/EmptyPageStarter.tsx`
- Modify: `editor/EditorCanvas.tsx` (render starter when page empty)
- Modify: `src/features/editor/utils/icons/iconMap.ts` (cover every icon name used in `constants/elements.ts`)
- Modify: `src/features/editor/constants/elements.ts` (de-duplicate icons: Section `RectangleHorizontal`, Frame `Frame`, Form `ClipboardList`, CMSContentList `ListTree`, CMSContentGrid `LayoutGrid`)

**Interfaces:** Consumes `useElements()`, `useAddElement()`, `ElementFactory.getInstance().createElementFromTemplate({ element, pageId })`, `customComps`, `useEditorChromeStore.selectPanel("ai")`.

- [ ] **Step 1: Icons.** Extend `IconName` and `iconMap` to include every `icon:` string in `ELEMENT_METADATA` (after the renames above): Type, TextCursorInput, Heading, Tag, Quote, Code, Minus, Smile, Image, Video, Volume2, Globe, MousePointerClick, Link, FormInput, AlignLeft, CheckSquare, Circle, TextSelection, ClipboardList, BarChart3, Table, Frame, RectangleHorizontal, Navigation, PanelTop, PanelBottom, FileText, PanelRight, SlidersHorizontal, List, ListTree, Database, LayoutGrid. Type `ELEMENT_METADATA`'s `icon` as `IconName` (import the type) so a missing mapping is a compile error.

  Verify: `npx tsc --noEmit` clean, and
  `rg -o 'icon: "[A-Za-z0-9]+"' src/features/editor/constants/elements.ts | sort | uniq -d` prints nothing.

- [ ] **Step 2: `editor/EmptyPageStarter.tsx`**
```tsx
import { Plus, Sparkles, LayoutTemplate } from "lucide-react";
import { useAddElement } from "@/features/editor";
import { useEditorContext } from "@/providers/editorprovider";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import { ElementFactory } from "@/features/editor/utils/element/create/ElementFactory";
import { customComps } from "@/features/editor/lib/customcomponents/customComponents";

const TEMPLATE_NAMES = ["Hero", "Features", "Navbar"];

export default function EmptyPageStarter({ onAddSection }: { onAddSection: () => void }) {
  const addElement = useAddElement();
  const { pageId } = useEditorContext();
  // Not selectPanel: re-selecting an open AI panel would collapse it.
  const openAI = () => useEditorChromeStore.setState({ activePanel: "ai", panelOpen: true });
  const templates = TEMPLATE_NAMES.map((n) => customComps.find((c) => c.name === n)).filter(
    (c): c is (typeof customComps)[number] => Boolean(c),
  );

  const insertTemplate = (template: (typeof customComps)[number]) => {
    const el = ElementFactory.getInstance().createElementFromTemplate({ element: template, pageId });
    if (el) addElement(el);
  };

  const tile =
    "flex w-32 flex-col items-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground";

  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div>
        <h2 className="text-base font-semibold text-foreground">Start this page</h2>
        <p className="mt-1 text-xs text-muted-foreground">Pick a starting block, or drag anything from Insert.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className={tile} onClick={onAddSection}><Plus className="h-4 w-4" />Blank section</button>
        {templates.map((t) => (
          <button key={t.name} type="button" className={tile} onClick={() => insertTemplate(t)}>
            <LayoutTemplate className="h-4 w-4" />{t.name}
          </button>
        ))}
        <button type="button" className={tile} onClick={openAI}><Sparkles className="h-4 w-4" />Generate with AI</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `EditorCanvas.tsx`** — `const elements = useElements();` `const isEmpty = !isLoading && elements.length === 0;`. Inside the scroll container render `isEmpty && !isReadOnly && !isLocked ? <EmptyPageStarter onAddSection={addNewSection} /> : <ElementLoader …/>` (keep `isLoading ? null`). Show `AddSectionDivider` only when `!isEmpty`.

- [ ] **Step 4: Verify** — tests, `npx tsc --noEmit`, `bun run build`.
- [ ] **Step 5: Commit** — `git commit -m "feat(editor): empty-page starter and distinct component icons"`.

---

### Task 5: Browser verification

Run `bun run dev` (with the Go API and realtime server reachable), open an editor URL, and check:

- [ ] Every rail item opens its panel; re-clicking collapses; panel choice survives reload.
- [ ] ⌘\ and ⌘. toggle panel/inspector; typing `?` or `.` in the CSS importer textarea types normally.
- [ ] Design → Wireframe → (WireframeView back) → Code → Design switch correctly; Code mode hides rail/panel/inspector.
- [ ] Inspector shows Page properties with nothing selected and Style/Settings with a selection; Import CSS works.
- [ ] Empty page shows the starter; Blank section / Hero / Features insert; Generate with AI opens the AI panel; AI close button collapses it.
- [ ] Publish toggles to Unpublish and back; Preview opens `/preview/<id>`.
- [ ] Mobile and tablet viewports still render inside the canvas.
- [ ] No hydration warnings in the console on first load.

Fix anything found, re-run checks, commit `fix(editor): …` per fix.
