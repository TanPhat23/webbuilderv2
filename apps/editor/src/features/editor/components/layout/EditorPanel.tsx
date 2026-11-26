import { Suspense } from "react";
import { PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import { railItem } from "./railItems";

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
      {!item.bare && (
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-border pl-3 pr-1.5">
          <span className="flex items-center gap-2 text-xs font-semibold">
            <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
            {item.label}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            aria-label="Collapse panel"
            onClick={closePanel}
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      <div className={item.selfScroll ? "min-h-0 flex-1 overflow-hidden" : "min-h-0 flex-1 overflow-y-auto"}>
        <Suspense fallback={<PanelFallback />}>{item.render()}</Suspense>
      </div>
    </aside>
  );
}
