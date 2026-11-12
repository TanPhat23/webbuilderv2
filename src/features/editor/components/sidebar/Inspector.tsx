import React, { Suspense, useState } from "react";
import { PanelRightClose } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSelectedElement } from "@/features/editor";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import PageProperties from "./PageProperties";

import { BreakpointButtons } from "./style/BreakpointButtons";
import type { Breakpoint } from "./style/styleModel";

const Settings = React.lazy(() => import("./configurations/Settings"));
const StyleTab = React.lazy(() => import("./style/StyleTab"));

/**
 * The shared shadcn Input/Select carry `h-9` and `md:text-sm` (and Select's
 * `data-[size=default]:h-9` beats a plain `h-7`), so property controls came
 * out 36px tall in 14px text. Force one compact density inside the inspector.
 */
const DENSE =
  "[&_[data-slot=input]]:h-7! [&_[data-slot=input]]:text-[11px]! [&_[data-slot=input]]:px-2! " +
  "[&_[data-slot=select-trigger]]:h-7! [&_[data-slot=select-trigger]]:text-[11px]! [&_[data-slot=select-trigger]]:px-2! " +
  "[&_[data-slot=select-trigger]_svg]:size-3.5!";

function Fallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}

function CollapseButton() {
  const toggleInspector = useEditorChromeStore((s) => s.toggleInspector);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-muted-foreground"
      aria-label="Collapse inspector"
      onClick={toggleInspector}
    >
      <PanelRightClose className="h-3.5 w-3.5" />
    </Button>
  );
}

export default function Inspector() {
  const selected = useSelectedElement();
  const [tab, setTab] = useState("style");
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("default");

  return (
    <aside
      aria-label="Inspector"
      className="flex h-full w-[280px] shrink-0 flex-col border-l border-border bg-card"
    >
      {selected ? (
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border pl-2 pr-1.5">
            <TabsList variant="line" className="h-7! shrink-0 gap-0">
              <TabsTrigger value="style" className="px-1.5 text-[11px]">
                Style
              </TabsTrigger>
              <TabsTrigger value="settings" className="px-1.5 text-[11px]">
                Settings
              </TabsTrigger>
            </TabsList>
            <span className="flex-1" />
            {tab === "style" && (
              <BreakpointButtons value={breakpoint} onChange={setBreakpoint} />
            )}
            <CollapseButton />
          </div>

          <TabsContent
            value="style"
            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
          >
            <Suspense fallback={<Fallback />}>
              <StyleTab
                key={`${selected.id}:${breakpoint}`}
                breakpoint={breakpoint}
              />
            </Suspense>
          </TabsContent>

          <TabsContent
            value="settings"
            className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 ${DENSE}`}
          >
            <Suspense fallback={<Fallback />}>
              <Settings />
            </Suspense>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-border pl-3 pr-1.5">
            <span className="text-xs font-semibold">Page</span>
            <CollapseButton />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <PageProperties />
          </div>
        </>
      )}
    </aside>
  );
}
