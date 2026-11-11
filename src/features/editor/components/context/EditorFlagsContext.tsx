
import React, { createContext, useContext, useMemo } from "react";
import type { CollaboratorRole } from "@/features/collaboration";

/**
 * Editor-wide flags provided once by the root ElementLoader and read by
 * element renderers and the canvas interaction layer.
 */
export interface EditorFlags {
  /** Whether the editor is in read-only mode (user cannot edit). */
  readonly isReadOnly: boolean;

  /** Whether the editor is locked (e.g. another user is editing). */
  readonly isLocked: boolean;

  /** The current collaborator's role, used for UI gating (e.g. hide context menu for viewers). */
  readonly permissionsRole: CollaboratorRole | null;

  /** Whether the current user may edit, move and resize elements. */
  readonly canEdit: boolean;

  /** Whether the current user may add new elements. */
  readonly canCreate: boolean;

  /** Ref to the iframe the canvas renders into, for cross-frame listeners. */
  readonly iframeRef?: React.RefObject<HTMLIFrameElement>;
}

const EditorFlagsContext = createContext<EditorFlags | null>(null);

/**
 * Hook to read the nearest {@link EditorFlags} from context.
 *
 * Throws if used outside of an `<EditorFlagsProvider>`.
 *
 * @example
 * ```tsx
 * const { canEdit, permissionsRole } = useEditorFlags();
 * ```
 */
export function useEditorFlags(): EditorFlags {
  const ctx = useContext(EditorFlagsContext);
  if (!ctx) {
    throw new Error(
      "useEditorFlags must be used within an <EditorFlagsProvider>",
    );
  }
  return ctx;
}

/**
 * Optional variant that returns `null` when no provider is present.
 * Useful for components that can render both inside and outside the editor.
 */
export function useEditorFlagsOptional(): EditorFlags | null {
  return useContext(EditorFlagsContext);
}

/**
 * Props for the {@link EditorFlagsProvider}.
 */
export interface EditorFlagsProviderProps extends EditorFlags {
  children: React.ReactNode;
}

/**
 * Provides editor-wide flags (read-only state, lock state, collaborator role,
 * and the iframe ref) to all descendants via context.
 *
 * The root `ElementLoader` wraps the canvas in it.
 */
export function EditorFlagsProvider({
  isReadOnly,
  isLocked,
  permissionsRole,
  canEdit,
  canCreate,
  iframeRef,
  children,
}: EditorFlagsProviderProps) {
  const value = useMemo<EditorFlags>(
    () => ({ isReadOnly, isLocked, permissionsRole, canEdit, canCreate, iframeRef }),
    [isReadOnly, isLocked, permissionsRole, canEdit, canCreate, iframeRef],
  );

  return (
    <EditorFlagsContext.Provider value={value}>
      {children}
    </EditorFlagsContext.Provider>
  );
}
