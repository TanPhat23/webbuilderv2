
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
  Copy,
  Component,
  Save,
  Scissors,
  SendToBack,
  Trash2,
} from "lucide-react";
import { ElementKeyboardActions } from "@/features/editor/lib/keyBoardEvents";

import { useComponentActions } from "@/features/editor/hooks/useComponentActions";
import { getSelectedOrHoveredElement } from "@/features/editor/store/selected-element";
import type { EditorElement } from "@/types/global.type";
import { ComponentNameDialog } from "./ComponentNameDialog";
import { SaveElementDialog } from "./SaveElementDialog";
import { SharedSectionMenu } from "./SharedSectionMenu";

interface EditorContextMenuProps {
  children: React.ReactNode;
  isReadOnly?: boolean;
  isLocked?: boolean;
}

const keyboardEventHandler = new ElementKeyboardActions();

/** Shortcut modifier label for the user's platform (⌘ on Apple, Ctrl elsewhere). */
const MOD =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform)
    ? "⌘"
    : "Ctrl+";

/**
 * The canvas and Layers panel select the right-clicked element before
 * opening this menu. The portal follows the document containing the trigger.
 */
export const EditorContextMenu: React.FC<EditorContextMenuProps> = ({
  children,
  isReadOnly = false,
  isLocked = false,
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
  const handleSave = () => setSaveElement(getSelectedOrHoveredElement());

  const triggerRef = React.useRef<HTMLDivElement | null>(null);

  const [portalContainer, setPortalContainer] =
    React.useState<HTMLElement | null>(null);

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
        <ContextMenuTrigger asChild>
          <div ref={triggerRef}>{children}</div>
        </ContextMenuTrigger>
        {portalContainer && (
          <ContextMenuPortal container={portalContainer}>
            <ContextMenuPrimitive.Content
              data-slot="context-menu-content"
              className={
                "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out " +
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 " +
                "data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 " +
                "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) " +
                "min-w-52 origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md"
              }
            >
              <ContextMenuItem onSelect={handleCopy}>
                <Copy />
                Copy
                <ContextMenuShortcut>{MOD}C</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem disabled={!canEdit} onSelect={handleCut}>
                <Scissors />
                Cut
                <ContextMenuShortcut>{MOD}X</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem disabled={!canEdit} onSelect={handlePaste}>
                <ClipboardPaste />
                Paste
                <ContextMenuShortcut>{MOD}V</ContextMenuShortcut>
              </ContextMenuItem>

              <ContextMenuSeparator />

              <ContextMenuItem disabled={!canEdit} onSelect={handleBringToFront}>
                <BringToFront />
                Bring to front
              </ContextMenuItem>
              <ContextMenuItem disabled={!canEdit} onSelect={handleSendToBack}>
                <SendToBack />
                Send to back
              </ContextMenuItem>

              <ContextMenuSeparator />

              <ContextMenuItem disabled={!canReplace || !canEdit} onSelect={() => setSource(getSelectedOrHoveredElement())}>
                <Component />
                Create component…
              </ContextMenuItem>
              <ContextMenuItem onSelect={handleSave}>
                <Save />
                Save to my library…
              </ContextMenuItem>

              <ContextMenuSeparator />

              <SharedSectionMenu container={portalContainer} editable={canEdit} />

              <ContextMenuItem
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
