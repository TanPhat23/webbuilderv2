import React, { useEffect, useState } from "react";
import { PanelRightOpen } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/providers/editorprovider";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import { ElementCommentsPanel } from "../comments/ElementCommentsPanel";
import Inspector from "../sidebar/Inspector";
import ShortcutsDialog from "../editor/ShortcutsDialog";
import EditorTopBar from "../topbar/EditorTopBar";
import EditorRail from "./EditorRail";
import EditorPanel from "./EditorPanel";
import { useChromeShortcuts } from "./useChromeShortcuts";

/**
 * Editor frame: top bar, then rail · panel · canvas · inspector.
 * Panel visibility lives in `useEditorChromeStore`.
 */
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { editingMode, projectId } = useEditorContext();
  const panelOpen = useEditorChromeStore((s) => s.panelOpen);
  const inspectorOpen = useEditorChromeStore((s) => s.inspectorOpen);
  const toggleInspector = useEditorChromeStore((s) => s.toggleInspector);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Rehydrate after mount so the first client render matches the server.
  // `persist` is absent when storage is unavailable (e.g. blocked cookies).
  useEffect(() => {
    void useEditorChromeStore.persist?.rehydrate();
  }, []);

  useChromeShortcuts({ onShowShortcuts: () => setShortcutsOpen(true) });

  const showChrome = editingMode !== "code";

  return (
    <TooltipProvider>
      {/* Pinned to the viewport: the document behind it may still scroll
          (global CSS sets body overflow-y: auto), which used to drag the
          editor up and leave an empty strip below it. */}
      <div className="fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground">
        <EditorTopBar
          projectId={projectId ?? ""}
          onShowShortcuts={() => setShortcutsOpen(true)}
        />
        <div className="flex min-h-0 flex-1">
          {showChrome && <EditorRail />}
          {showChrome && panelOpen && <EditorPanel />}
          <main className="relative min-w-0 flex-1 overflow-hidden">
            {children}
            {showChrome && !inspectorOpen && (
              <Button
                variant="outline"
                size="icon"
                aria-label="Show inspector"
                onClick={toggleInspector}
                className="absolute right-3 top-3 z-30 h-7 w-7 bg-card"
              >
                <PanelRightOpen className="h-3.5 w-3.5" />
              </Button>
            )}
          </main>
          {showChrome && inspectorOpen && <Inspector />}
          <ElementCommentsPanel />
        </div>
      </div>
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </TooltipProvider>
  );
}
