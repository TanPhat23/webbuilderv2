"use client";

import React from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import useToolbarStore from "@/globalstore/toolbarstore";

/**
 * ToolbarSettingsDialog
 *
 * A dialog that exposes toolbar visibility toggles and a reset button.
 * Accepts an optional `children` prop to use as the trigger (e.g. an icon
 * button wrapped in a Tooltip). If not provided, a default 'Settings' button
 * with a settings icon is rendered.
 *
 * The component binds directly to the `useToolbarStore` persisted store.
 */
type Props = {
  children?: React.ReactNode;
};

export function ToolbarSettingsDialog({ children }: Props) {
  const {
    showCss,
    showExport,
    showCollab,
    showViewports,
    setShowCss,
    setShowExport,
    setShowCollab,
    setShowViewports,
    resetPreferences,
  } = useToolbarStore();

  const trigger = React.isValidElement(children) ? (
    children
  ) : (
    <Button
      variant="ghost"
      size="sm"
      className="p-1"
      aria-label="Toolbar settings"
    >
      <Settings className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Toolbar Settings</DialogTitle>
          <DialogDescription>
            Choose which toolbar controls to show. These preferences are saved
            locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Show CSS Import</div>
              <div className="text-xs text-muted-foreground">
                Add or remove the CSS import button from the toolbar.
              </div>
            </div>
            <Switch
              checked={!!showCss}
              onCheckedChange={(v) => setShowCss(!!v)}
              aria-label="Toggle CSS importer visibility"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Show Export</div>
              <div className="text-xs text-muted-foreground">
                Add or remove the Export button from the toolbar.
              </div>
            </div>
            <Switch
              checked={!!showExport}
              onCheckedChange={(v) => setShowExport(!!v)}
              aria-label="Toggle Export button visibility"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Show Collaborators</div>
              <div className="text-xs text-muted-foreground">
                Show collaborator indicator and collaboration actions.
              </div>
            </div>
            <Switch
              checked={!!showCollab}
              onCheckedChange={(v) => setShowCollab(!!v)}
              aria-label="Toggle Collaboration visibility"
            />
          </div>

          {/* Event Mode preference removed from toolbar settings */}

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Show Viewports</div>
              <div className="text-xs text-muted-foreground">
                Display device viewport controls (mobile/tablet/desktop).
              </div>
            </div>
            <Switch
              checked={!!showViewports}
              onCheckedChange={(v) => setShowViewports(!!v)}
              aria-label="Toggle Viewport buttons visibility"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <div className="flex items-center gap-2 ml-auto">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resetPreferences()}
              title="Reset toolbar to defaults"
            >
              Reset
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ToolbarSettingsDialog;
