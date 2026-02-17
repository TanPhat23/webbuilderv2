"use client";

import React from "react";
import { useEventModeStore } from "@/globalstore/event-mode-store";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ZapOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const EventModeToggle = () => {
  const {
    isEventModeEnabled,
    toggleEventMode,
    setEventModeEnabled,
    clearDisabledElements,
  } = useEventModeStore();

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <Button
          variant={isEventModeEnabled ? "default" : "outline"}
          size="sm"
          className={cn(
            "gap-2",
            isEventModeEnabled && "bg-blue-600 hover:bg-blue-700"
          )}
          onClick={() => toggleEventMode()}
          title={`${isEventModeEnabled ? "Disable" : "Enable"} event mode`}
        >
          {isEventModeEnabled ? (
            <>
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Events On</span>
            </>
          ) : (
            <>
              <ZapOff className="h-4 w-4" />
              <span className="hidden sm:inline">Events Off</span>
            </>
          )}
        </Button>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Event Mode Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem
            checked={isEventModeEnabled}
            onCheckedChange={setEventModeEnabled}
            className="cursor-pointer flex flex-col items-start py-3"
          >
            <div className="font-medium">Enable Event Handlers</div>
            <p className="text-xs text-muted-foreground mt-1">
              When enabled, click/hover events on elements will execute their
              configured actions. When disabled, the editor is in normal mode
              allowing drag/drop and element selection.
            </p>
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={clearDisabledElements}
            className="text-xs cursor-pointer"
          >
            Clear All Disabled Elements
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className="px-2 py-2 text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Event Mode:</strong> {isEventModeEnabled ? "✓ ON" : "✗ OFF"}
            </p>
            <p className="mt-2">
              {isEventModeEnabled
                ? "Elements will respond to configured events"
                : "Editor is in selection/drag mode"}
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EventModeToggle;
