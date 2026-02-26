"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { CollaboratorRole } from "@/features/collaboration";

/**
 * Shared editor flags that are commonly prop-drilled through the
 * ElementLoader → ElementItem → ResizeHandler → EditorContextMenu chain.
 *
 * By placing these in a context, intermediate components no longer need to
 * accept and forward props they don't use themselves.
 */
export interface EditorFlags {
  /** Whether the editor is in read-only mode (user cannot edit). */
  readonly isReadOnly: boolean;

  /** Whether the editor is locked (e.g. another user is editing). */
  readonly isLocked: boolean;

  /** The current collaborator's role, used for UI gating (e.g. hide context menu for viewers). */
  readonly permissionsRole: CollaboratorRole | null;

  /** Ref to the iframe element, forwarded to ResizeHandler for cross-frame interactions. */
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
 * const { isReadOnly, isLocked, permissionsRole, iframeRef } = useEditorFlags();
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
 * Wrap this around the element tree that needs access to these flags — typically
 * at the `ElementLoader` level so that `ElementItem`, `ElementReorderList`,
 * `ResizeHandler`, and `EditorContextMenu` can all consume the values without
 * explicit prop drilling.
 *
 * @example
 * ```tsx
 * <EditorFlagsProvider
 *   isReadOnly={isReadOnly}
 *   isLocked={isLocked}
 *   permissionsRole={permissions?.role ?? null}
 *   iframeRef={iframeRef}
 * >
 *   <ElementItem element={element} renderElement={renderElement} ... />
 * </EditorFlagsProvider>
 * ```
 */
export function EditorFlagsProvider({
  isReadOnly,
  isLocked,
  permissionsRole,
  iframeRef,
  children,
}: EditorFlagsProviderProps) {
  const value = useMemo<EditorFlags>(
    () => ({ isReadOnly, isLocked, permissionsRole, iframeRef }),
    [isReadOnly, isLocked, permissionsRole, iframeRef],
  );

  return (
    <EditorFlagsContext.Provider value={value}>
      {children}
    </EditorFlagsContext.Provider>
  );
}
