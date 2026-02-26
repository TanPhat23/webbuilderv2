import { EditorElement } from "@/types/global.type";
import { useElementCreator } from "./useElementCreator";
import { useElementDnD } from "./useElementDnD";
import useElementInteraction from "./useElementInteraction";

export function useElementHandler(isReadOnly?: boolean, isLocked?: boolean) {
  // Compose behavior from focused hooks to keep this entry-point minimal and
  // easy to maintain / test.
  const elementCreator = useElementCreator();

  const dnd = useElementDnD({ isReadOnly, isLocked });
  const interaction = useElementInteraction({ isReadOnly, isLocked });

  const {
    handleDrop,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    canDrag,
    canReorder,
    canCreate: dndCanCreate,
  } = dnd;

  const {
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleTextChange,
    getTailwindStyles,
    getCommonProps,
    getStyles,
    canEdit,
    canDelete,
  } = interaction;

  // Delegate to the focused hooks we composed earlier. This keeps the public
  // API stable while moving implementation details into smaller, testable
  // units.
  return {
    handleDoubleClick,
    handleDrop,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleMouseEnter,
    handleMouseLeave,
    getTailwindStyles,
    getCommonProps,
    getStyles,
    // Export permission states for UI purposes
    canDrag,
    canDelete,
    canReorder,
    canCreate: dndCanCreate,
  };
}
