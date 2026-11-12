import React, { Suspense } from "react";
import { ChevronDown, PanelRightClose } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useSelectedElement } from "@/features/editor";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import PageProperties from "./PageProperties";

const Settings = React.lazy(() => import("./configurations/Settings"));
const Styles = React.lazy(() => import("./configurations/Styles"));
const CssTextareaImporter = React.lazy(
  () => import("../editor/CssTextareaImporter"),
);

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

  return (
    <aside
      aria-label="Inspector"
      className="flex h-full w-[280px] shrink-0 flex-col border-l border-border bg-card"
    >
      {selected ? (
        <Tabs defaultValue="style" className="flex min-h-0 flex-1 flex-col gap-0">
          <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border pl-2 pr-1.5">
            <TabsList className="h-7">
              <TabsTrigger value="style" className="px-2.5 text-xs">
                Style
              </TabsTrigger>
              <TabsTrigger value="settings" className="px-2.5 text-xs">
                Settings
              </TabsTrigger>
            </TabsList>
            <span className="flex-1" />
            <CollapseButton />
          </div>

          <TabsContent value="style" className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-3 pt-1 ${DENSE}`}>
            <Suspense fallback={<Fallback />}>
              <Styles />
              <Collapsible className="mt-4 border-t border-border pt-3">
                <CollapsibleTrigger className="group flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground">
                  Import CSS
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <CssTextareaImporter />
                </CollapsibleContent>
              </Collapsible>
            </Suspense>
          </TabsContent>

          <TabsContent value="settings" className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 ${DENSE}`}>
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
