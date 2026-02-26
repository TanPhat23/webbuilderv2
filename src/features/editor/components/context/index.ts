/**
 * Editor Context — Barrel Export
 *
 * Re-exports all editor-level context providers and hooks.
 * Components should import from this module for convenience.
 *
 * @example
 * ```ts
 * import {
 *   useEditorFlags,
 *   EditorFlagsProvider,
 *   useDragContext,
 *   DragProvider,
 * } from "@/features/editor/components/context";
 * ```
 */

export {
  useEditorFlags,
  useEditorFlagsOptional,
  EditorFlagsProvider,
  type EditorFlags,
  type EditorFlagsProviderProps,
} from "./EditorFlagsContext";

export {
  useDragContext,
  useDragContextOptional,
  DragProvider,
  type DragContextValue,
  type DragProviderProps,
} from "./DragContext";
