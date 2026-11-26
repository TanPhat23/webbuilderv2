import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@webbuilder/site-runtime/lib/utils";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import { RAIL_ITEMS, type RailItem } from "./railItems";

function RailButton({ item }: { item: RailItem }) {
  const active = useEditorChromeStore(
    (s) => s.panelOpen && s.activePanel === item.id,
  );
  const selectPanel = useEditorChromeStore((s) => s.selectPanel);
  const Icon = item.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={item.label}
          aria-pressed={active}
          onClick={() => selectPanel(item.id)}
          className={cn(
            "relative h-8 w-8 text-muted-foreground hover:text-foreground",
            active &&
              "bg-accent text-foreground before:absolute before:-left-[7px] before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

export default function EditorRail() {
  const { projectId } = useEditorContext();
  const settingsOpen = useEditorChromeStore((s) => s.settingsOpen);
  const setSettingsOpen = useEditorChromeStore((s) => s.setSettingsOpen);
  const main = RAIL_ITEMS.filter((i) => i.group === "main");
  const tools = RAIL_ITEMS.filter((i) => i.group === "tools");

  return (
    <nav
      aria-label="Editor panels"
      className="flex w-[46px] shrink-0 flex-col items-center gap-1 border-r border-border bg-card py-2"
    >
      {main.map((item) => (
        <RailButton key={item.id} item={item} />
      ))}
      <div className="my-1 h-px w-5 bg-border" />
      {tools.map((item) => (
        <RailButton key={item.id} item={item} />
      ))}
      <span className="flex-1" />
      {projectId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Project settings"
              aria-pressed={settingsOpen}
              onClick={() => setSettingsOpen(true)}
              className={cn(
                "relative h-8 w-8 text-muted-foreground hover:text-foreground",
                settingsOpen &&
                  "bg-accent text-foreground before:absolute before:-left-[7px] before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-foreground",
              )}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Project settings</TooltipContent>
        </Tooltip>
      )}
    </nav>
  );
}
