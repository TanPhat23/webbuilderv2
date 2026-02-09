"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { useAuth } from "@clerk/nextjs";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

import {
  useElementStore,
  ElementStore,
  type MoveData,
} from "@/globalstore/element-store";

import { useMouseStore } from "@/globalstore/mouse-store";
import {
  createSyncAwarenessToStore,
  createAwarenessChangeObserver,
} from "@/lib/utils/use-yjs-collab-utils";
import { CustomYjsProviderV2 } from "@/lib/yjs/Provider";
import type {
  CollabState,
  RoomState,
  ErrorMessage,
  ConflictMessage,
  UpdateType,
  CustomYjsProviderV2 as CustomYjsProviderV2Type,
  ElementOperationSuccess,
  PageOperationSuccess,
} from "@/interfaces/yjs-v2.interface";
import type { EditorElement } from "@/types/global.type";
import type { Page } from "@/interfaces/page.interface";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_WS_URL = "ws://localhost:8082";
const AWARENESS_POLL_INTERVAL = 150;
const ELEMENT_STORE_UPDATE_DELAY = 50;

// ============================================================================
// Types
// ============================================================================

export interface CollaborationConfig {
  projectId: string;
  pageId: string;
  wsUrl?: string;
  enabled?: boolean;
  onSync?: () => void;
  onError?: (error: Error) => void;
  onConflict?: (conflict: ConflictMessage) => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
}

export interface CollaborationContextValue {
  // Connection state
  isConnected: boolean;
  isSynced: boolean;
  roomState: RoomState;
  error: string | null;
  pendingUpdates: number;
  collabType: "yjs";

  // Yjs instances
  ydoc: Y.Doc | null;
  provider: CustomYjsProviderV2Type | null;

  // Canvas ref for mouse tracking
  canvasRef: React.RefObject<HTMLElement | null>;

  // Element operations
  createElement: (
    element: EditorElement,
    parentId?: string | null,
    position?: number,
  ) => Promise<ElementOperationSuccess>;
  updateElement: (
    elementId: string,
    updates: Partial<EditorElement>,
    updateType?: UpdateType,
  ) => Promise<ElementOperationSuccess>;
  deleteElement: (
    elementId: string,
    deleteChildren?: boolean,
    preserveStructure?: boolean,
  ) => Promise<ElementOperationSuccess>;
  moveElement: (
    elementId: string,
    newParentId?: string | null,
    newPosition?: number,
  ) => Promise<ElementOperationSuccess>;

  // Page operations
  createPage: (page: Page) => Promise<PageOperationSuccess>;
  updatePage: (
    pageId: string,
    updates: Partial<Page>,
  ) => Promise<PageOperationSuccess>;
  deletePage: (pageId: string) => Promise<PageOperationSuccess>;

  // Control
  reconnect: () => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const CollaborationContext = createContext<CollaborationContextValue | null>(
  null,
);

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to consume the collaboration context.
 * Must be used within a `<CollaborationProvider>`.
 *
 * @example
 * ```tsx
 * const { isConnected, isSynced, ydoc, provider } = useCollaboration();
 * ```
 */
export function useCollaboration(): CollaborationContextValue {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error(
      "useCollaboration must be used within a <CollaborationProvider>",
    );
  }
  return context;
}

/**
 * Optional hook that returns null when used outside a CollaborationProvider.
 * Useful for components that may or may not be rendered inside the provider.
 */
export function useCollaborationOptional(): CollaborationContextValue | null {
  return useContext(CollaborationContext);
}

// ============================================================================
// Provider Component
// ============================================================================

interface CollaborationProviderProps {
  children: React.ReactNode;
  config: CollaborationConfig;
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
    onConflict,
    onDisconnect,
    onReconnect,
  } = config;

  const { userId, getToken, isLoaded } = useAuth();
  const { loadElements } = useElementStore();

  const setUsers = useMouseStore((s) => s.setUsers);
  const setRemoteUsers = useMouseStore((s) => s.setRemoteUsers);
  const setSelectedByUser = useMouseStore((s) => s.setSelectedByUser);

  const [state, setState] = useState<CollabState>({
    roomState: "connecting",
    error: null,
    isSynced: false,
    pendingUpdates: 0,
  });

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<CustomYjsProviderV2Type | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const canvasRef = useRef<HTMLElement | null>(null);

  const internalRef = useRef({
    isUpdatingFromElementStore: false,
    pendingMoves: new Set<string>(),
    remoteUpdateTimeout: null as NodeJS.Timeout | null,
  });

  // Keep latest callback refs to avoid stale closures
  const latest = useRef({
    onSync,
    onError,
    onConflict,
    onReconnect,
    onDisconnect,
    getToken,
  });
  latest.current = {
    onSync,
    onError,
    onConflict,
    onReconnect,
    onDisconnect,
    getToken,
  };

  // ---------------------------------------------------------------------------
  // Core effect: Setup Y.Doc, provider, persistence, observers
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!enabled || !isLoaded || !userId || !pageId || pageId === "undefined")
      return;

    const ydoc = new Y.Doc();
    const persistence = new IndexeddbPersistence(pageId, ydoc);
    const provider = new CustomYjsProviderV2({
      url: wsUrl,
      pageId,
      projectId,
      userId,
      getToken: () => latest.current.getToken(),
      doc: ydoc,
      onSyncUsers: (users) => setUsers(users),
      onConflict: (c) => latest.current.onConflict?.(c),
      onError: (e: ErrorMessage) => {
        const msg = e?.message || e?.error || "Unknown provider error";
        latest.current.onError?.(new Error(msg));
        setState((s) => ({ ...s, error: msg }));
      },
    });

    ydocRef.current = ydoc;
    providerRef.current = provider;
    persistenceRef.current = persistence;

    // Status listener
    provider.on("status", ({ status }: { status: string }) => {
      const roomState: RoomState =
        status === "connected"
          ? "connected"
          : status === "error"
            ? "error"
            : "connecting";
      setState((s) => ({
        ...s,
        roomState,
        error: status === "error" ? "Connection failed" : null,
      }));
      if (status === "connected") latest.current.onReconnect?.();
      else if (status === "disconnected") latest.current.onDisconnect?.();
    });

    // Synced listener
    provider.on("synced", (synced: boolean) => {
      setState((s) => ({ ...s, isSynced: synced }));
      if (synced) latest.current.onSync?.();
    });

    // Observe Y.Text for remote element updates
    const yElementsText = ydoc.getText("elementsJson");
    const observer = (event: Y.YEvent<Y.Text>, transaction: Y.Transaction) => {
      if (internalRef.current.isUpdatingFromElementStore) return;
      try {
        const json = yElementsText.toString();
        const elements = json ? JSON.parse(json) : [];
        loadElements(elements);
        if (transaction?.origin === "v2-sync")
          setState((s) => ({ ...s, isSynced: true }));
      } catch (err) {
        console.warn(
          "[CollaborationProvider] Failed to parse remote elements",
          err,
        );
      }
    };
    yElementsText.observe(observer);

    // Awareness sync
    if (provider.awareness) {
      const mouseStoreMock = { setRemoteUsers, setSelectedByUser, setUsers };
      const syncAwareness = createSyncAwarenessToStore(
        provider,
        mouseStoreMock,
        { current: { lastAwarenessHash: "" } } as any,
      );
      const awarenessObserver = createAwarenessChangeObserver(syncAwareness);
      provider.awareness.on("change", awarenessObserver);
      internalRef.current.remoteUpdateTimeout = setInterval(
        syncAwareness,
        AWARENESS_POLL_INTERVAL,
      );
    }

    // Wire up element store callbacks for collaborative editing
    ElementStore.getState().setYjsUpdateCallback((elements) => {
      if (!providerRef.current?.isSynced || !elements?.length) return;
      internalRef.current.isUpdatingFromElementStore = true;
      Y.transact(ydoc, () => {
        yElementsText.delete(0, yElementsText.length);
        yElementsText.insert(0, JSON.stringify(elements));
      });
      setTimeout(() => {
        internalRef.current.isUpdatingFromElementStore = false;
      }, ELEMENT_STORE_UPDATE_DELAY);
    });

    ElementStore.getState().setCollaborativeCallback(async (type, id, data) => {
      if (!providerRef.current?.isSynced) return;
      const p = providerRef.current;
      try {
        if (type === "update" && id && data) {
          await p.updateElement(id, data as Partial<EditorElement>, "partial");
        } else if (type === "delete" && id) {
          await p.deleteElement(id);
        } else if (type === "create" && data) {
          const el = data as EditorElement;
          const pos = (data as { position?: number }).position;
          await p.createElement(el, el.parentId, pos);
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
      if (internalRef.current.remoteUpdateTimeout)
        clearInterval(internalRef.current.remoteUpdateTimeout);
      ElementStore.getState().setYjsUpdateCallback(null);
      ElementStore.getState().setCollaborativeCallback(null);
      yElementsText.unobserve(observer);
      provider.destroy();
      persistence.destroy();
      ydoc.destroy();
      ydocRef.current = null;
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
  ]);

  // ---------------------------------------------------------------------------
  // Mouse tracking on canvas via awareness
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!providerRef.current?.awareness || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      providerRef.current.awareness.setLocalStateField("cursor", {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousemove", handleMove);
      return () => canvas.removeEventListener("mousemove", handleMove);
    }
  }, [state.roomState]);

  // ---------------------------------------------------------------------------
  // Stable operation callbacks
  // ---------------------------------------------------------------------------
  const createElement = async (
    el: EditorElement,
    pId?: string | null,
    pos?: number,
  ): Promise<ElementOperationSuccess> => {
    if (!providerRef.current) throw new Error("Provider not initialized");
    return providerRef.current.createElement(el, pId, pos);
  };

  const updateElement = async (
    id: string,
    upd: Partial<EditorElement>,
    ty: UpdateType = "partial",
  ): Promise<ElementOperationSuccess> => {
    if (!providerRef.current) throw new Error("Provider not initialized");
    return providerRef.current.updateElement(id, upd, ty);
  };

  const deleteElement = async (
    id: string,
    ch = false,
    str = true,
  ): Promise<ElementOperationSuccess> => {
    if (!providerRef.current) throw new Error("Provider not initialized");
    return providerRef.current.deleteElement(id, ch, str);
  };

  const moveElement = async (
    id: string,
    pId?: string | null,
    pos?: number,
  ): Promise<ElementOperationSuccess> => {
    if (!providerRef.current) throw new Error("Provider not initialized");
    return providerRef.current.moveElement(id, pId, pos);
  };

  const createPage = async (page: Page): Promise<PageOperationSuccess> => {
    if (!providerRef.current) throw new Error("Provider not initialized");
    return providerRef.current.createPage(page);
  };

  const updatePage = async (
    id: string,
    upd: Partial<Page>,
  ): Promise<PageOperationSuccess> => {
    if (!providerRef.current) throw new Error("Provider not initialized");
    return providerRef.current.updatePage(id, upd);
  };

  const deletePage = async (id: string): Promise<PageOperationSuccess> => {
    if (!providerRef.current) throw new Error("Provider not initialized");
    return providerRef.current.deletePage(id);
  };

  const reconnect = async () => {
    await providerRef.current?.reconnect();
  };

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
      collabType: "yjs" as const,

      // Yjs instances
      ydoc: ydocRef.current,
      provider: providerRef.current,

      // Canvas ref
      canvasRef,

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
    [state.roomState, state.isSynced, state.error, state.pendingUpdates],
  );

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}
