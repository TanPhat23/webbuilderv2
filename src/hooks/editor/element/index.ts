/**
 * Element hooks barrel
 *
 * Central place to export hooks that operate on editor elements (creation,
 * drag/drop, interaction, and higher-level handlers). This keeps imports
 * consistent and groups element-related logic together under:
 *
 *   @/hooks/editor/element
 *
 * NOTE: Prefer named exports so consumers can import via the editor index or
 * directly from this folder, depending on preference.
 */

// Core handlers
export { useElementHandler } from "./useElementHandler";

// Creation helpers
export { useElementCreator } from "./useElementCreator";

// Drag & Drop helpers
export { useElementDnD } from "./useElementDnD";
export { useElementDragHandlers } from "./useElementDragHandlers";

// Interaction & selection helpers
export { useElementInteraction } from "./useElementInteraction";

// Re-export types where useful for consumers
export type { UseElementDnDOptions, UseElementDnDReturn } from "./useElementDnD";
export type {
  UseElementDragHandlersOptions,
  UseElementDragHandlersReturn,
} from "./useElementDragHandlers";
export type {
  UseElementInteractionOptions,
  UseElementInteractionReturn,
} from "./useElementInteraction";
