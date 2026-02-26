"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useAuth } from "@clerk/nextjs";

import {
  useElementStore,
  ElementStore,
  type MoveData,
} from "@/features/editor";
import { useMouseStore } from "@/features/editor";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { CustomYjsProviderV2 } from "@/features/collaboration/lib/yjs/Provider";
import type { EditorElement } from "@/types/global.type";

import type { Page } from "@/features/pages";
import type {
  WSCollabState,
  WSRoomState,
  CollaborationContextValue,
  WSCollaborationConfig,
  RemotePresence,
  PresenceBroadcastPayload,
} from "@/features/collaboration";

const DEFAULT_WS_URL = "ws://localhost:8080";
const PRESENCE_SEND_THROTTLE_MS = 50;

const CollaborationContext = createContext<CollaborationContextValue | null>(
  null,
);

export function useCollaboration(): CollaborationContextValue {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error(
      "useCollaboration must be used within a <CollaborationProvider>",
    );
  }
  return context;
}

export function useCollaborationOptional(): CollaborationContextValue | null {
  return useContext(CollaborationContext);
}

interface CollaborationProviderProps {
  children: React.ReactNode;
  config: WSCollaborationConfig;
}

export default function CollaborationProvider({
  children,
  config,
}: CollaborationProviderProps) {
  const {
    projectId,
    pageId,
    wsUrl = DEFAULT_WS_URL,
    enabled = true,
    onSync,
    onError,
    onDisconnect,
    onReconnect,
  } = config;

  const { userId, getToken, isLoaded } = useAuth();
  const { loadElements } = useElementStore();

  const setUsers = useMouseStore((s) => s.setUsers);
  const setRemoteUsers = useMouseStore((s) => s.setRemoteUsers);
  const setSelectedByUser = useMouseStore((s) => s.setSelectedByUser);
  const updateMousePosition = useMouseStore((s) => s.updateMousePosition);
  const removeUser = useMouseStore((s) => s.removeUser);

  const [state, setState] = useState<WSCollabState>({
    roomState: "connecting",
    error: null,
    isSynced: false,
    pendingUpdates: 0,
  });

  const [remotePresences, setRemotePresences] = useState<
    Map<string, RemotePresence>
  >(new Map());

  const providerRef = useRef<CustomYjsProviderV2 | null>(null);
  const canvasRef = useRef<HTMLElement | null>(null);

  const internalRef = useRef({
    isApplyingRemoteUpdate: false,
    pendingMoves: new Set<string>(),
  });

  // Keep latest callback refs to avoid stale closures
  const latest = useRef({
    onSync,
    onError,
    onDisconnect,
    onReconnect,
    getToken,
    pageId,
  });
  latest.current = {
    onSync,
    onError,
    onDisconnect,
    onReconnect,
    getToken,
    pageId,
  };

  // ---------------------------------------------------------------------------
  // Core effect: Setup WebSocketProvider and wire everything together
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!enabled || !isLoaded || !userId || !pageId || pageId === "undefined")
      return;

    const ydoc = new Y.Doc();
    let persistence: IndexeddbPersistence | null = null;
    try {
      persistence = new IndexeddbPersistence(pageId, ydoc);
    } catch {
      persistence = null;
    }

    // Create the Yjs-backed provider (wraps WS envelope protocol).
    const provider = new CustomYjsProviderV2({
      url: wsUrl,
      pageId,
      projectId,
      userId,
      userName: userId,
      getToken: () => latest.current.getToken(),
      doc: ydoc,
      // Called when awareness/user list changes (sync + awareness updates)
      onSyncUsers: (users) => {
        setUsers(users);
      },
      // Errors from provider surface here
      onError: (e: any) => {
        const msg = e?.message || e?.error || "Unknown provider error";
        latest.current.onError?.(new Error(msg));
        setState((s: WSCollabState) => ({ ...s, error: msg }));
      },

      // Presence envelopes from the server can be handled immediately
      onPresence: (data: PresenceBroadcastPayload) => {
        if (data.userId === userId) return;

        updateMousePosition(data.userId, {
          x: data.cursorX,
          y: data.cursorY,
        });

        if (data.elementId) {
          useMouseStore
            .getState()
            .setSelectedElement(data.userId, data.elementId);
        }
      },
    });

    providerRef.current = provider;

    // ---- Status listener ----
    provider.on("status", ({ status }: { status: string }) => {
      const roomState: WSRoomState =
        status === "connected"
          ? "connected"
          : status === "error"
            ? "error"
            : "connecting";
      setState((s: WSCollabState) => ({
        ...s,
        roomState,
        error: status === "error" ? "Connection failed" : s.error,
      }));
      if (status === "connected") latest.current.onReconnect?.();
      else if (status === "disconnected") latest.current.onDisconnect?.();
    });

    // ---- Synced listener ----
    provider.on("synced", (synced: boolean) => {
      setState((s: WSCollabState) => ({ ...s, isSynced: synced }));
      if (synced) latest.current.onSync?.();
    });

    // ---- Observe Y.Text for remote element updates ----
    const yElementsText = ydoc.getText("elementsJson");
    const observer = (event: Y.YEvent<Y.Text>, transaction: Y.Transaction) => {
      if (internalRef.current.isApplyingRemoteUpdate) return;
      try {
        const json = yElementsText.toString();
        const elements = json ? JSON.parse(json) : [];
        loadElements(elements, true);
        if ((transaction as any)?.origin === "v2-sync") {
          setState((s: WSCollabState) => ({ ...s, isSynced: true }));
        }
      } catch (err) {
        console.warn("[YJS] Failed to parse remote elements", err);
      }
    };
    yElementsText.observe(observer);

    // Subscribe to normalized presence changes from the provider
    const unsubPresence = provider.onPresenceChange((presences) => {
      setRemotePresences(new Map(presences));

      // Also sync to mouse store for EditorCanvas compatibility
      const remoteUsersRecord: Record<string, { x: number; y: number }> = {};
      const selectedByUserRecord: Record<string, string> = {};
      const usersRecord: Record<
        string,
        { userId: string; userName: string; email: string }
      > = {};

      presences.forEach((p, uid) => {
        remoteUsersRecord[uid] = { x: p.cursorX, y: p.cursorY };
        if (p.elementId) {
          selectedByUserRecord[uid] = p.elementId;
        }
        usersRecord[uid] = {
          userId: p.userId,
          userName: p.userName,
          email: "",
        };
      });

      setRemoteUsers(remoteUsersRecord);
      setSelectedByUser(selectedByUserRecord);
      // Merge new user records into existing ones
      const existingUsers = useMouseStore.getState().users;
      setUsers({ ...existingUsers, ...usersRecord });
    });

    // Periodically update pending count in state
    const pendingInterval = setInterval(() => {
      if (providerRef.current) {
        const count = providerRef.current.pendingUpdates;
        setState((s: WSCollabState) =>
          s.pendingUpdates !== count ? { ...s, pendingUpdates: count } : s,
        );
      }
    }, 500);

    // Wire up the element store's collaborative callback so that local user
    // actions (create/update/delete/move) are sent over the provider.
    ElementStore.getState().setCollaborativeCallback(async (type, id, data) => {
      if (internalRef.current.isApplyingRemoteUpdate) return;
      if (!providerRef.current?.isSynced) return;
      if (!providerRef.current.isConnected()) return;

      const p = providerRef.current;
      try {
        if (type === "update" && id && data) {
          await p.updateElement(id, data as Partial<EditorElement>);
        } else if (type === "delete" && id) {
          await p.deleteElement(id);
        } else if (type === "create" && data) {
          const el = data as EditorElement;
          p.createElement(el, el.parentId ?? null, el.order).catch((err) =>
            latest.current.onError?.(err as Error),
          );
        } else if (type === "move" && data) {
          const moveData = data as MoveData;
          if (internalRef.current.pendingMoves.has(moveData.elementId)) return;
          internalRef.current.pendingMoves.add(moveData.elementId);
          try {
            await p.moveElement(
              moveData.elementId,
              moveData.newParentId,
              moveData.newPosition,
            );
          } finally {
            internalRef.current.pendingMoves.delete(moveData.elementId);
          }
        }
      } catch (err) {
        latest.current.onError?.(err as Error);
      }
    });

    // Cleanup
    return () => {
      clearInterval(pendingInterval);
      unsubPresence();
      // Remove Y.Text observer
      try {
        yElementsText.unobserve(observer);
      } catch {
        // ignore
      }
      ElementStore.getState().setCollaborativeCallback(null);
      // Also clear the yjs callback if it was set (backward compat)
      ElementStore.getState().setYjsUpdateCallback(null);
      provider.destroy();
      providerRef.current = null;
    };
  }, [
    pageId,
    projectId,
    wsUrl,
    enabled,
    userId,
    isLoaded,
    loadElements,
    setUsers,
    setRemoteUsers,
    setSelectedByUser,
    updateMousePosition,
    removeUser,
  ]);

  // ---------------------------------------------------------------------------
  // Mouse tracking on canvas — send presence updates via WebSocket
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !providerRef.current) return;

    let lastX = -1;
    let lastY = -1;
    let lastSendTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!providerRef.current?.isConnected()) return;

      const now = Date.now();
      if (now - lastSendTime < PRESENCE_SEND_THROTTLE_MS) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Skip if movement is tiny
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      if (lastX !== -1 && deltaX < 3 && deltaY < 3) return;

      lastX = x;
      lastY = y;
      lastSendTime = now;

      providerRef.current.sendPresence(x, y);
    };

    const handleMouseLeave = () => {
      // Send a "null" cursor presence when leaving the canvas
      if (providerRef.current?.isConnected()) {
        providerRef.current.sendPresence(-1, -1);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove, { passive: true });
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [state.roomState]);

  // ---------------------------------------------------------------------------
  // Stable operation callbacks
  // ---------------------------------------------------------------------------

  const createElement = useCallback(
    async (
      el: EditorElement,
      parentId?: string | null,
      position?: number,
    ): Promise<void> => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      await providerRef.current.createElement(el, parentId, position);
    },
    [],
  );

  const updateElement = useCallback(
    async (id: string, updates: Partial<EditorElement>): Promise<void> => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      await providerRef.current.updateElement(id, updates);
    },
    [],
  );

  const deleteElement = useCallback(async (id: string): Promise<void> => {
    if (!providerRef.current) throw new Error("Provider not initialized");
    await providerRef.current.deleteElement(id);
  }, []);

  const moveElement = useCallback(
    async (
      id: string,
      newParentId?: string | null,
      newPosition?: number,
    ): Promise<void> => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      await providerRef.current.moveElement(
        id,
        newParentId ?? null,
        newPosition ?? 0,
      );
    },
    [],
  );

  const createPage = useCallback(async (_page: Page): Promise<void> => {
    // Page operations can be handled via REST API or extended WS messages
    // For now this is a no-op placeholder matching the interface
    console.warn(
      "[CollaborationProvider] createPage via WebSocket not yet implemented — use REST API",
    );
  }, []);

  const updatePage = useCallback(
    async (_id: string, _updates: Partial<Page>): Promise<void> => {
      console.warn(
        "[CollaborationProvider] updatePage via WebSocket not yet implemented — use REST API",
      );
    },
    [],
  );

  const deletePage = useCallback(async (_id: string): Promise<void> => {
    console.warn(
      "[CollaborationProvider] deletePage via WebSocket not yet implemented — use REST API",
    );
  }, []);

  const reconnect = useCallback(async () => {
    await providerRef.current?.reconnect();
  }, []);

  // ---------------------------------------------------------------------------
  // Memoized context value
  // ---------------------------------------------------------------------------
  const contextValue = useMemo<CollaborationContextValue>(
    () => ({
      // State
      isConnected: state.roomState === "connected",
      isSynced: state.isSynced,
      roomState: state.roomState,
      error: state.error,
      pendingUpdates: state.pendingUpdates,
      collabType: "websocket" as const,

      // Canvas ref
      canvasRef,

      // Remote presences
      remotePresences,

      // Element operations
      createElement,
      updateElement,
      deleteElement,
      moveElement,

      // Page operations
      createPage,
      updatePage,
      deletePage,

      // Control
      reconnect,
    }),
    [
      state.roomState,
      state.isSynced,
      state.error,
      state.pendingUpdates,
      remotePresences,
      createElement,
      updateElement,
      deleteElement,
      moveElement,
      createPage,
      updatePage,
      deletePage,
      reconnect,
    ],
  );

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}
