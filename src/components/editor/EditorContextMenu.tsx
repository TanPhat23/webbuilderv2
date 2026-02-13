"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuPortal,
} from "@/components/ui/context-menu";
import { Copy, Trash2, Layers, ArrowUp, ArrowDown, Save } from "lucide-react";
import { KeyboardEvent as EditorKeyboardEvent } from "@/lib/utils/element/keyBoardEvents";
import { EditorElement } from "@/types/global.type";
import { useElementStore } from "@/globalstore/element-store";
import { useSelectionStore } from "@/globalstore/selection-store";

import { SaveElementDialog } from "./SaveElementDialog";
import { toast } from "sonner";

interface EditorContextMenuProps {
  children: React.ReactNode;
  element: EditorElement;
  isReadOnly?: boolean;
  isLocked?: boolean;
}

const keyboardEventHandler = new EditorKeyboardEvent();

export const EditorContextMenu: React.FC<EditorContextMenuProps> = ({
  children,
  element,
  isReadOnly = false,
  isLocked = false,
}) => {
  const { setSelectedElement } = useSelectionStore();
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  // Determine if operations are allowed
  const canEdit = !isReadOnly && !isLocked;
  const canDelete = !isReadOnly && !isLocked;
  const canReorder = !isReadOnly && !isLocked;

  const onCopy = () => {
    keyboardEventHandler.copyElement();
  };

  const onCut = () => {
    if (!canDelete) {
      toast.error("Cannot cut elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }
    keyboardEventHandler.cutElement();
  };

  const onPaste = () => {
    if (!canEdit) {
      toast.error("Cannot paste elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }
    keyboardEventHandler.pasteElement();
  };

  const onBringToFront = () => {
    if (!canReorder) {
      toast.error("Cannot reorder elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }
    keyboardEventHandler.bringToFront();
  };

  const onSendToBack = () => {
    if (!canReorder) {
      toast.error("Cannot reorder elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }
    keyboardEventHandler.sendToBack();
  };

  const onDelete = () => {
    if (!canDelete) {
      toast.error("Cannot delete elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }
    keyboardEventHandler.deleteElement();
  };

  const onSave = () => {
    if (!canEdit) {
      toast.error("Cannot save elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }
    setShowSaveDialog(true);
  };

  const triggerRef = React.useRef<HTMLDivElement | null>(null);

  const [portalContainer, setPortalContainer] =
    React.useState<HTMLElement | null>(null);

  return (
    <>
      <ContextMenu
        onOpenChange={(open: boolean) => {
          if (open) {
            const ownerDoc = triggerRef.current?.ownerDocument;
            const container =
              (ownerDoc && ownerDoc.body) ||
              (typeof document !== "undefined" ? document.body : null);

            setPortalContainer(container);

            setSelectedElement(element);
          } else {
            setPortalContainer(null);
          }
        }}
      >
        <ContextMenuTrigger asChild>
          <div
            ref={triggerRef}
            onContextMenu={(e) => e.stopPropagation()}
            style={{ width: "100%", height: "100%" }}
          >
            {children}
          </div>
        </ContextMenuTrigger>
        {portalContainer &&
          portalContainer !==
            (typeof document !== "undefined" ? document.body : null) && (
            <ContextMenuPortal container={portalContainer}>
              <ContextMenuPrimitive.Content
                data-slot="context-menu-content"
                className={
                  "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out " +
                  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 " +
                  "data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 " +
                  "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) " +
                  "min-w-32 origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md w-48"
                }
              >
                <ContextMenuItem asChild>
                  <div
                    onClick={onCopy}
                    className="flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                  >
                    <div className="flex">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-left mr-1">
                      ⌘C
                    </span>
                  </div>
                </ContextMenuItem>

                <ContextMenuItem
                  asChild
                  disabled={!canDelete}
                  onClick={(e) => {
                    if (!canDelete) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div
                    onClick={onCut}
                    className={`flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                      !canDelete ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex">
                      <Layers className="mr-2 h-4 w-4" />
                      Cut
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-left mr-1">
                      ⌘X
                    </span>
                  </div>
                </ContextMenuItem>

                <ContextMenuItem
                  asChild
                  disabled={!canEdit}
                  onClick={(e) => {
                    if (!canEdit) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div
                    onClick={onPaste}
                    className={`flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                      !canEdit ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex">
                      <Layers className="mr-2 h-4 w-4" />
                      Paste
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-left mr-1">
                      ⌘V
                    </span>
                  </div>
                </ContextMenuItem>

                <ContextMenuSeparator className="bg-border -mx-1 my-1 h-px" />

                <ContextMenuItem
                  asChild
                  disabled={!canReorder}
                  onClick={(e) => {
                    if (!canReorder) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div
                    onClick={onBringToFront}
                    className={`flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                      !canReorder ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Bring to Front
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-left mr-1">
                      ⌘↑
                    </span>
                  </div>
                </ContextMenuItem>

                <ContextMenuItem
                  asChild
                  disabled={!canReorder}
                  onClick={(e) => {
                    if (!canReorder) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div
                    onClick={onSendToBack}
                    className={`flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                      !canReorder ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex">
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Send to Back
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-left mr-1">
                      ⌘↓
                    </span>
                  </div>
                </ContextMenuItem>

                <ContextMenuSeparator className="bg-border -mx-1 my-1 h-px" />

                <ContextMenuItem
                  asChild
                  disabled={!canEdit}
                  onClick={(e) => {
                    if (!canEdit) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div
                    onClick={onSave}
                    className={`flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                      !canEdit ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex">
                      <Save className="mr-2 h-4 w-4" />
                      Save Element
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-left mr-1">
                      ⌘S
                    </span>
                  </div>
                </ContextMenuItem>

                <ContextMenuSeparator className="bg-border -mx-1 my-1 h-px" />

                <ContextMenuItem
                  asChild
                  disabled={!canDelete}
                  onClick={(e) => {
                    if (!canDelete) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div
                    onClick={onDelete}
                    className={`text-destructive flex justify-between cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                      !canDelete ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-left mr-1">
                      ⌘⌫
                    </span>
                  </div>
                </ContextMenuItem>
              </ContextMenuPrimitive.Content>
            </ContextMenuPortal>
          )}
      </ContextMenu>
      <SaveElementDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
      />
    </>
  );
};

export default EditorContextMenu;
