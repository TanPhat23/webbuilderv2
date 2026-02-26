/**
 * Editor hooks
 * Hooks for managing the visual editor, elements, grid, and resize functionality
 */

export { useEditor } from "./useEditor";
export { useElementHandler } from "./element/useElementHandler";
export { useElementCreator } from "./element/useElementCreator";
export { useElementDnD } from "./element/useElementDnD";
export { useElementInteraction } from "./element/useElementInteraction";
export { useElementDragHandlers } from "./element/useElementDragHandlers";
export { useGridEditor } from "./useGridEditor";
export { useResizeHandler } from "./useResizeHandler";
export {
  useEditorPermissions,
  useCanEditElements,
  useCanManageProject,
  useCanCollaborate,
  useCanEditElement,
  useEditorUIState,
  useCanEditOwnComment,
  useCanDeleteOwnComment,
  type EditorPermissions,
  type EditorAction,
  type EditorResource,
} from "./useEditorPermissions";

export { useWorkflowCanvas } from "@/features/eventworkflows/hooks/useWorkflowCanvas";
