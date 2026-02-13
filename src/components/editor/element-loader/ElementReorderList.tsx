import React from "react";
import { Reorder } from "framer-motion";
import type { EditorElement } from "@/types/global.type";
import ResizeHandler from "@/components/editor/resizehandler/ResizeHandler";
import EditorContextMenu from "@/components/editor/EditorContextMenu";
import { cn } from "@/lib/utils";
import { CollaboratorRole } from "@/interfaces/collaboration.interface";
import { useEditorFlags } from "@/components/editor/context/EditorFlagsContext";

interface ElementReorderListProps {
  /**
   * Elements to render in the reorderable list.
   */
  items: EditorElement[];

  /**
   * Called when the order changes.
   */
  onReorder: (newOrder: EditorElement[]) => void;

  /**
   * Render function for the element body. Keeps the list component agnostic of
   * element rendering details (use ElementRenderer or similar).
   */
  renderElement: (element: EditorElement) => React.ReactNode;

  /**
   * Extra classes for the root element.
   */
  className?: string;
}

/**
 * Small, focused component that renders a reorderable list of elements using
 * `framer-motion`'s `Reorder.Group` / `Reorder.Item`. Each item is wrapped with
 * `ResizeHandler` and conditionally with `EditorContextMenu` depending on the
 * user's role.
 *
 * Editor flags (`isReadOnly`, `isLocked`, `permissionsRole`, `iframeRef`) are
 * consumed from the {@link EditorFlagsProvider} context set up by `ElementLoader`,
 * eliminating the need for explicit prop drilling.
 */
export default function ElementReorderList({
  items,
  onReorder,
  renderElement,
  className,
}: ElementReorderListProps) {
  const { isReadOnly, isLocked, iframeRef, permissionsRole } = useEditorFlags();

  if (!items || items.length === 0) return null;

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      as="div"
      className={cn("relative", className)}
    >
      {items.map((element) => (
        <Reorder.Item
          key={element.id}
          value={element}
          as="div"
          className="relative"
          whileDrag={{
            scale: 1.02,
            boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.3)",
            zIndex: 50,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        >
          <ResizeHandler
            element={element}
            isReadOnly={isReadOnly}
            isLocked={isLocked}
            iframeRef={iframeRef}
          >
            {permissionsRole === CollaboratorRole.VIEWER ? (
              renderElement(element)
            ) : (
              <EditorContextMenu
                element={element}
                isReadOnly={isReadOnly}
                isLocked={isLocked}
              >
                {renderElement(element)}
              </EditorContextMenu>
            )}
          </ResizeHandler>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
