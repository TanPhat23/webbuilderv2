import React, { useCallback, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/tanstack-react-start";
import {
  CollaborationContext,
  useCollaboration,
  useCollaborationOptional,
} from "@/features/collaboration/context/CollaborationContext";
import { useCanvasCursorBroadcast } from "@/features/collaboration/hooks/useCanvasCursorBroadcast";
import type {
  CollaborationContextValue,
  WSCollaborationConfig,
} from "@/features/collaboration/interfaces/websocket";
import type { EditorElement } from "@/types/global.type";
import { useCollabRoom } from "./collaboration/useCollabRoom";

const DEFAULT_WS_URL = "ws://localhost:8080";

export { useCollaboration, useCollaborationOptional };

interface CollaborationProviderProps {
  children: React.ReactNode;
  config: WSCollaborationConfig;
}

export default function CollaborationProvider({
  children,
  config,
}: CollaborationProviderProps) {
  const { wsUrl = DEFAULT_WS_URL, enabled = true } = config;
  const { userId, getToken, isLoaded } = useAuth();
  const canvasRef = useRef<HTMLElement | null>(null);
  const [canvasElement, setCanvasElementState] = useState<HTMLElement | null>(null);

  const setCanvasElement = useCallback((element: HTMLElement | null) => {
    canvasRef.current = element;
    setCanvasElementState(element);
  }, []);

  const { state, providerRef } = useCollabRoom({
    config,
    wsUrl,
    enabled,
    userId,
    getToken,
    isLoaded,
  });

  useCanvasCursorBroadcast(canvasElement, providerRef, state.roomState);

  const createElement = useCallback(
    async (
      el: EditorElement,
      parentId?: string | null,
      position?: number,
    ): Promise<void> => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      await providerRef.current.createElement(el, parentId, position);
    },
    [providerRef],
  );

  const updateElement = useCallback(
    async (id: string, updates: Partial<EditorElement>): Promise<void> => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      await providerRef.current.updateElement(id, updates);
    },
    [providerRef],
  );

  const deleteElement = useCallback(
    async (id: string): Promise<void> => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      await providerRef.current.deleteElement(id);
    },
    [providerRef],
  );

  const moveElement = useCallback(
    async (
      id: string,
      newParentId?: string | null,
      newPosition?: number,
    ): Promise<void> => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      await providerRef.current.moveElement(id, newParentId ?? null, newPosition ?? 0);
    },
    [providerRef],
  );

  const reconnect = useCallback(async () => {
    await providerRef.current?.reconnect();
  }, [providerRef]);

  const contextValue = useMemo<CollaborationContextValue>(
    () => ({
      isConnected: state.roomState === "connected",
      isSynced: state.isSynced,
      roomState: state.roomState,
      error: state.error,
      pendingUpdates: state.pendingUpdates,
      collabType: "websocket" as const,
      canvasRef,
      setCanvasElement,
      createElement,
      updateElement,
      deleteElement,
      moveElement,
      reconnect,
    }),
    [
      state.roomState,
      state.isSynced,
      state.error,
      state.pendingUpdates,
      setCanvasElement,
      createElement,
      updateElement,
      deleteElement,
      moveElement,
      reconnect,
    ],
  );

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}
