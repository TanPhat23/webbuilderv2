
import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuPortal,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import {
  BringToFront,
  ClipboardPaste,
  Bot,
  Copy,
  Component,
  Save,
  Scissors,
  SendToBack,
  Trash2,
} from "lucide-react";
import { CONTEXT_MENU_TRIGGER_ATTR } from "@/features/editor/components/canvas/contextMenuRetarget";
import { ElementKeyboardActions } from "@/features/editor/lib/keyBoardEvents";

import { toast } from "sonner";
import { buildAgentReference } from "@/features/editor/lib/agentReference";
import { ElementStore } from "@/features/editor/store/element-store";
import { useComponentActions } from "@/features/editor/hooks/useComponentActions";
import { getSelectedElement } from "@/features/editor/store/selected-element";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { ComponentNameDialog } from "./ComponentNameDialog";
import { SaveElementDialog } from "./SaveElementDialog";
import { SharedSectionMenu } from "./SharedSectionMenu";
import { AskAiMenu } from "./AskAiMenu";
import { SelectLayerMenu } from "./SelectLayerMenu";

interface EditorContextMenuProps {
  children: React.ReactNode;
  isReadOnly?: boolean;
  isLocked?: boolean;
  /** Keeps the tree shape but turns the menu off (e.g. for viewers). */
  disabled?: boolean;
}

const keyboardEventHandler = new ElementKeyboardActions();

const IS_APPLE =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform);
/** Shortcut modifier label for the user's platform (⌘ on Apple, Ctrl elsewhere). */
const MOD = IS_APPLE ? "⌘" : "Ctrl+";
/** The same modifier as an aria-keyshortcuts token. */
const ARIA_MOD = IS_APPLE ? "Meta" : "Control";

/**
 * The canvas and Layers panel select the right-clicked element before
 * opening this menu. The portal follows the document containing the trigger.
 */
export const EditorContextMenu: React.FC<EditorContextMenuProps> = ({
  children,
  isReadOnly = false,
  isLocked = false,
  disabled = false,
}) => {
  const [saveElement, setSaveElement] = React.useState<EditorElement>();
  const [source, setSource] = React.useState<EditorElement>();
  const { createComponent, canReplace } = useComponentActions();
  // Every action that changes the page is disabled (not hidden) when read-only.
  const canEdit = !isReadOnly && !isLocked;

  const handleCopy = () => keyboardEventHandler.copyElement();
  const handleCut = () => keyboardEventHandler.cutElement();
  const handlePaste = () => keyboardEventHandler.pasteElement();
  const handleBringToFront = () => keyboardEventHandler.bringToFront();
  const handleSendToBack = () => keyboardEventHandler.sendToBack();
  const handleDelete = () => keyboardEventHandler.deleteElement();
  const handleSave = () => setSaveElement(getSelectedElement());
  const handleCopyForAgent = async (): Promise<void> => {
    const selected = getSelectedElement();
    if (!selected) {
      toast.error("Select an element first");
      return;
    }
    try {
      await navigator.clipboard.writeText(
        buildAgentReference(selected, ElementStore.getState().elements),
      );
      toast.success("Copied element reference for your AI agent");
    } catch {
      toast.error("Could not copy to the clipboard");
    }
  };

  const triggerRef = React.useRef<HTMLDivElement | null>(null);

  const [portalContainer, setPortalContainer] =
    React.useState<HTMLElement | null>(null);
  // Names the menu for assistive tech and AI agents reading the page.
  const [menuLabel, setMenuLabel] = React.useState("Actions for element");

  // Radix only listens for outside clicks / Esc on the document that holds the
  // menu. The canvas lives in an iframe, so a click in the editor chrome (or
  // Esc while focus is outside the iframe) never reached it and the menu stayed
  // open. Watch every document we can reach and close through Radix's own Esc.
  React.useEffect(() => {
    if (!portalContainer) return;
    const menuDoc = portalContainer.ownerDocument;
    const docs = new Set<Document>([document]);
    const frameDoc = triggerRef.current?.ownerDocument;
    if (frameDoc) docs.add(frameDoc);
    docs.add(menuDoc);

    const close = () => {
      const view = menuDoc.defaultView;
      if (!view) return;
      menuDoc.dispatchEvent(
        new view.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    };
    const handlePointerDown = (e: Event) => {
      const target = e.target as Element | null;
      // Inside the menu or its "Shared section" submenu (portalled separately).
      if (
        target?.closest?.(
          '[data-slot="context-menu-content"], [data-slot="context-menu-sub-content"]',
        )
      )
        return;
      close();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      // Our own synthetic Escape is handled by Radix; ignore it here.
      if (e.key === "Escape" && e.isTrusted) close();
    };

    const cleanups: Array<() => void> = [];
    for (const doc of docs) {
      doc.addEventListener("pointerdown", handlePointerDown, true);
      doc.addEventListener("keydown", handleKeyDown, true);
      cleanups.push(() => {
        doc.removeEventListener("pointerdown", handlePointerDown, true);
        doc.removeEventListener("keydown", handleKeyDown, true);
      });
    }
    return () => cleanups.forEach((fn) => fn());
  }, [portalContainer]);

  return (
    <>
      <ContextMenu
        onOpenChange={(open: boolean) => {
          if (open) {
            const target = getSelectedElement();
            setMenuLabel(`Actions for ${target?.name?.trim() || target?.type || "element"}`);
            const ownerDoc = triggerRef.current?.ownerDocument;
            const container =
              (ownerDoc && ownerDoc.body) ||
              (typeof document !== "undefined" ? document.body : null);

            setPortalContainer(container);
          } else {
            setPortalContainer(null);
          }
        }}
      >
        <ContextMenuTrigger asChild disabled={disabled}>
          <div ref={triggerRef} {...{ [CONTEXT_MENU_TRIGGER_ATTR]: "" }}>
            {children}
          </div>
        </ContextMenuTrigger>
        {portalContainer && (
          <ContextMenuPortal container={portalContainer}>
            <ContextMenuPrimitive.Content
              data-slot="context-menu-content"
              aria-label={menuLabel}
              className={
                "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out " +
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 " +
                "data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 " +
                "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[1100] max-h-(--radix-context-menu-content-available-height) " +
                "min-w-52 origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md"
              }
            >
              <SelectLayerMenu container={portalContainer} />
              <ContextMenuItem data-action="copy" aria-keyshortcuts={`${ARIA_MOD}+C`} onSelect={handleCopy}>
                <Copy />
                Copy
                <ContextMenuShortcut>{MOD}C</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem data-action="cut" aria-keyshortcuts={`${ARIA_MOD}+X`} disabled={!canEdit} onSelect={handleCut}>
                <Scissors />
                Cut
                <ContextMenuShortcut>{MOD}X</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem data-action="paste" aria-keyshortcuts={`${ARIA_MOD}+V`} disabled={!canEdit} onSelect={handlePaste}>
                <ClipboardPaste />
                Paste
                <ContextMenuShortcut>{MOD}V</ContextMenuShortcut>
              </ContextMenuItem>

              <ContextMenuSeparator />

              <AskAiMenu container={portalContainer} editable={canEdit} />
              <ContextMenuItem data-action="copy-for-agent" onSelect={() => void handleCopyForAgent()}>
                <Bot />
                Copy for AI agent
              </ContextMenuItem>

              <ContextMenuSeparator />

              <ContextMenuItem data-action="bring-to-front" disabled={!canEdit} onSelect={handleBringToFront}>
                <BringToFront />
                Bring to front
              </ContextMenuItem>
              <ContextMenuItem data-action="send-to-back" disabled={!canEdit} onSelect={handleSendToBack}>
                <SendToBack />
                Send to back
              </ContextMenuItem>

              <ContextMenuSeparator />

              <ContextMenuItem data-action="create-component" disabled={!canReplace || !canEdit} onSelect={() => setSource(getSelectedElement())}>
                <Component />
                Create component…
              </ContextMenuItem>
              <ContextMenuItem data-action="save-to-library" onSelect={handleSave}>
                <Save />
                Save to my library…
              </ContextMenuItem>

              <ContextMenuSeparator />

              <SharedSectionMenu container={portalContainer} editable={canEdit} />

              <ContextMenuItem
                data-action="delete"
                aria-keyshortcuts="Delete"
                variant="destructive"
                disabled={!canEdit}
                onSelect={handleDelete}
              >
                <Trash2 />
                Delete
                <ContextMenuShortcut>Del</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuPrimitive.Content>
          </ContextMenuPortal>
        )}
      </ContextMenu>
      {source && <ComponentNameDialog title="Create component" confirmLabel="Create"
        initialName={source.name} onClose={() => setSource(undefined)}
        onSubmit={(name) => createComponent(name, { fromElementId: source.id })} />}
      {saveElement && <SaveElementDialog element={saveElement} onClose={() => setSaveElement(undefined)} />}
    </>
  );
};

export default EditorContextMenu;
