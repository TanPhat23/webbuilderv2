"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

import { useElementStore, ElementStore } from "@/globalstore/elementstore";
import { useMouseStore } from "@/globalstore/mousestore";
import type { EditorElement } from "@/types/global.type";
import type { Page } from "@/interfaces/page.interface";
import {
  CustomYjsProviderV2,
  parseElementsJson,
} from "@/lib/yjs/yjs-provider-v2";
import {
  createSyncAwarenessToStore,
  createAwarenessChangeObserver,
} from "@/lib/utils/use-yjs-collab-utils";
import type {
  UseYjsCollabV2Options,
  UseYjsCollabV2Return,
  CollabState,
  RoomState,
  UpdateType,
  ElementOperationSuccess,
  PageOperationSuccess,
  UserInfo,
  ConflictMessage,
  ErrorMessage,
} from "@/interfaces/yjs-v2.interface";

const DEFAULT_WS_URL = "ws://localhost:8082";
const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_THROTTLE_MS = 500;
const AWARENESS_POLL_INTERVAL = 150;
const ELEMENT_STORE_UPDATE_DELAY = 50;

interface InternalState {
  isUpdatingFromRemote: boolean;
  isUpdatingFromElementStore: boolean;
  lastLocalHash: string;
  lastSentHash: string;
  lastSendTime: number;
  updateCount: number;
  remoteUpdateTimeout: NodeJS.Timeout | null;
  lastAwarenessHash: string;
  pendingElementUpdate: EditorElement[] | null;
  elementPositions: Map<string, { parentId: string | null; order?: number }>;
  pendingMoves: Set<string>;
}

const createInitialInternalState = (): InternalState => ({
  isUpdatingFromRemote: false,
  isUpdatingFromElementStore: false,
  lastLocalHash: "",
  lastSentHash: "",
  lastSendTime: 0,
  updateCount: 0,
  remoteUpdateTimeout: null,
  lastAwarenessHash: "",
  pendingElementUpdate: null,
  elementPositions: new Map(),
  pendingMoves: new Set(),
});

const createInitialCollabState = (): CollabState => ({
  roomState: "connecting",
  error: null,
  isSynced: false,
  pendingUpdates: 0,
});

const validateIds = (
  pageId: string,
  projectId: string,
): { valid: boolean; error?: string } => {
  if (!pageId || pageId === "undefined" || pageId === "") {
    return { valid: false, error: "Invalid page ID" };
  }
  if (!projectId || projectId === "undefined" || projectId === "") {
    return { valid: false, error: "Invalid project ID" };
  }
  return { valid: true };
};

const extractErrorMessage = (error: ErrorMessage): string => {
  return (
    error?.message ||
    error?.error ||
    error?.code ||
    JSON.stringify(error) ||
    "Unknown error"
  );
};

export function useYjsCollabV2({
  pageId,
  projectId,
  wsUrl = DEFAULT_WS_URL,
  enabled = true,
  onSync,
  onError,
  onConflict,
  onDisconnect,
  onReconnect,
  enableDebug = false,
}: UseYjsCollabV2Options): UseYjsCollabV2Return {
  const [state, setState] = useState<CollabState>(createInitialCollabState);
  const internalStateRef = useRef<InternalState>(createInitialInternalState());

  const { userId, getToken, isLoaded } = useAuth();
  const { elements, loadElements } = useElementStore();
  const mouseStore = useMouseStore();

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<CustomYjsProviderV2 | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const latestHandlersRef = useRef<any>(null);
  const canvasRef = useRef<HTMLElement | null>(null);

  const loadElementsRef = useRef((els: EditorElement[], remote: boolean) => {
    loadElements(els);
  });

  const mouseStoreRef = useRef(mouseStore);

  useEffect(() => {
    mouseStoreRef.current = mouseStore;
  }, [mouseStore]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const provider = providerRef.current;
      if (!provider?.awareness || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      provider.awareness.setLocalStateField("cursor", { x, y });
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousemove", handleMouseMove);
      return () => canvas.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const getProvider = () => providerRef.current;
  const getYdoc = () => ydocRef.current;

  const handleSync = useCallback(
    (elements: EditorElement[]) => {
      try {
        loadElementsRef.current(elements, true);
        setState((prev) => ({ ...prev, isSynced: true }));
        onSync?.();
      } catch (err) {
        console.error("[useYjsCollabV2] Failed to handle sync:", err);
        onError?.(err as Error);
      }
    },
    [onSync, onError],
  );

  const handleUpdate = useCallback(
    (elements: EditorElement[]) => {
      try {
        loadElementsRef.current(elements, true);
      } catch (err) {
        console.error("[useYjsCollabV2] Failed to handle update:", err);
        onError?.(err as Error);
      }
    },
    [onError],
  );

  const handleSyncUsers = useCallback((users: Record<string, UserInfo>) => {
    mouseStoreRef.current.setUsers(users);
  }, []);

  const handleConflict = useCallback(
    (conflict: ConflictMessage) => {
      console.warn("[useYjsCollabV2] Conflict detected:", conflict);
      onConflict?.(conflict);
    },
    [onConflict],
  );

  const handleProviderError = useCallback(
    (error: ErrorMessage) => {
      const errorMessage = extractErrorMessage(error);
      console.error("[useYjsCollabV2] Provider error:", {
        message: errorMessage,
        fullError: error,
      });
      onError?.(new Error(errorMessage));
      setState((prev) => ({ ...prev, error: errorMessage }));
    },
    [onError],
  );

  const handleStatusChange = useCallback(
    ({ status }: { status: string }) => {
      const roomState: RoomState =
        status === "connected"
          ? "connected"
          : status === "error"
            ? "error"
            : "connecting";

      setState((prev) => ({
        ...prev,
        roomState,
        error: status === "error" ? "Connection failed" : null,
      }));

      if (status === "connected") {
        onReconnect?.();
      } else if (status === "disconnected") {
        onDisconnect?.();
      }
    },
    [onReconnect, onDisconnect],
  );

  const handleSyncedChange = useCallback(
    (synced: boolean) => {
      if (synced) {
        setState((prev) => ({ ...prev, isSynced: synced }));
        onSync?.();
      }
    },
    [onSync],
  );

  useEffect(() => {
    latestHandlersRef.current = {
      handleSync,
      handleUpdate,
      mouseStore,
      onSync,
      onError,
      onConflict,
      getToken,
    };
  });

  const setupElementsObserver = (yElementsText: Y.Text) => {
    return (event: Y.YEvent<Y.Text>, transaction: Y.Transaction) => {
      if (internalStateRef.current.isUpdatingFromElementStore) {
        return;
      }

      const elementsJson = yElementsText.toString();
      const parsed = parseElementsJson(elementsJson);

      const isRemoteUpdate = transaction?.origin === "remote-update";
      const isV2Sync = transaction?.origin === "v2-sync";

      if (isV2Sync) {
        latestHandlersRef.current.handleSync(parsed);
      } else if (isRemoteUpdate) {
        latestHandlersRef.current.handleUpdate(parsed);
      } else {
        latestHandlersRef.current.handleSync(parsed);
      }
    };
  };

  const setupElementsCallback = () => {
    const elementStoreCallback = (elements: EditorElement[]) => {
      const currentProvider = providerRef.current;
      if (!currentProvider?.synched || !elements?.length) {
        return;
      }

      try {
        internalStateRef.current.isUpdatingFromElementStore = true;

        const currentYdoc = ydocRef.current;
        if (currentYdoc) {
          Y.transact(currentYdoc, () => {
            const yElementsText = currentYdoc.getText("elementsJson");
            yElementsText.delete(0, yElementsText.length);
            yElementsText.insert(0, JSON.stringify(elements));
          });
        }

        setTimeout(() => {
          internalStateRef.current.isUpdatingFromElementStore = false;
        }, ELEMENT_STORE_UPDATE_DELAY);
      } catch (err) {
        console.error("[useYjsCollabV2] Error updating elements:", err);
        internalStateRef.current.isUpdatingFromElementStore = false;
      }
    };

    ElementStore.getState().setYjsUpdateCallback(elementStoreCallback);
  };

  const setupCollaborativeCallback = () => {
    const handleMoveOp = async (data: {
      elementId: string;
      newParentId?: string | null;
      newPosition?: number;
    }) => {
      const { elementId, newParentId, newPosition } = data;

      if (internalStateRef.current.pendingMoves.has(elementId)) {
        if (enableDebug) {
          console.log(
            `[useYjsCollabV2] Skipping duplicate move for ${elementId}`,
          );
        }
        return;
      }

      const lastPosition =
        internalStateRef.current.elementPositions.get(elementId);
      const newPos = { parentId: newParentId ?? null, order: newPosition };

      if (
        lastPosition &&
        lastPosition.parentId === newPos.parentId &&
        lastPosition.order === newPos.order
      ) {
        return;
      }

      internalStateRef.current.pendingMoves.add(elementId);
      internalStateRef.current.elementPositions.set(elementId, newPos);

      try {
        const provider = providerRef.current;
        await provider?.moveElement(elementId, newParentId, newPosition);
      } finally {
        internalStateRef.current.pendingMoves.delete(elementId);
      }
    };

    ElementStore.getState().setCollaborativeCallback(
      async (
        type: "update" | "delete" | "create" | "move",
        id?: string,
        data?: any,
      ) => {
        const currentProvider = providerRef.current;
        if (!currentProvider?.synched) return;

        try {
          switch (type) {
            case "update":
              if (id && data) {
                await currentProvider.updateElement(id, data, "partial");
              }
              break;

            case "delete":
              if (id) {
                await currentProvider.deleteElement(id);
              }
              break;

            case "create":
              if (data) {
                await currentProvider.createElement(
                  data,
                  data.parentId,
                  data.position,
                );
              }
              break;

            case "move":
              if (id && data) {
                await handleMoveOp(data);
              }
              break;
          }
        } catch (err) {
          console.error(
            `[useYjsCollabV2] Failed to send collaborative ${type}:`,
            err,
          );
        }
      },
    );
  };

  useEffect(() => {
    if (!enabled || !isLoaded || !userId) {
      return;
    }

    const validation = validateIds(pageId, projectId);
    if (!validation.valid) {
      setState((p) => ({ ...p, roomState: "error", error: validation.error! }));
      return;
    }

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const persistence = new IndexeddbPersistence(pageId, ydoc);
    persistenceRef.current = persistence;

    persistence.whenSynced.then(() => {
      if (enableDebug) {
        console.log("[useYjsCollabV2] IndexedDB synced");
      }
    });

    const provider = new CustomYjsProviderV2({
      url: wsUrl,
      pageId,
      projectId,
      userId,
      getToken: () => latestHandlersRef.current.getToken(),
      doc: ydoc,
      onSyncUsers: handleSyncUsers,
      onConflict: handleConflict,
      onError: handleProviderError,
    });

    providerRef.current = provider;

    provider.on("status", handleStatusChange);
    provider.on("synced", handleSyncedChange);

    const yElementsText = ydoc.getText("elementsJson");
    const elementsObserver = setupElementsObserver(yElementsText);
    yElementsText.observe(elementsObserver);

    const initialElementsJson = yElementsText.toString();
    const initialElements = parseElementsJson(initialElementsJson);
    latestHandlersRef.current.handleSync(initialElements);

    if (provider.awareness) {
      const syncAwarenessToStore = createSyncAwarenessToStore(
        provider,
        mouseStore,
        internalStateRef,
      );

      const awarenessChangeObserver =
        createAwarenessChangeObserver(syncAwarenessToStore);

      provider.awareness.on("change", awarenessChangeObserver);
      syncAwarenessToStore();

      const awarenessPollingInterval = setInterval(() => {
        if (!provider?.awareness) {
          clearInterval(awarenessPollingInterval);
          return;
        }
        syncAwarenessToStore();
      }, AWARENESS_POLL_INTERVAL);

      internalStateRef.current.remoteUpdateTimeout = awarenessPollingInterval;
    }

    setupElementsCallback();
    setupCollaborativeCallback();

    return () => {
      if (enableDebug) {
        console.log("[useYjsCollabV2] Cleaning up...");
      }

      if (internalStateRef.current.remoteUpdateTimeout) {
        clearInterval(internalStateRef.current.remoteUpdateTimeout);
        internalStateRef.current.remoteUpdateTimeout = null;
      }

      ElementStore.getState().setYjsUpdateCallback(null);
      ElementStore.getState().setCollaborativeCallback(null);

      yElementsText.unobserve(elementsObserver);
      internalStateRef.current.elementPositions.clear();
      internalStateRef.current.pendingMoves.clear();

      if (provider.awareness) {
        try {
          provider.awareness.off("change", () => {});
        } catch {
          // Ignore cleanup errors
        }
      }

      provider.destroy();
      persistence.destroy();
      ydoc.destroy();

      ydocRef.current = null;
      providerRef.current = null;
      persistenceRef.current = null;
    };
  }, [
    enabled,
    isLoaded,
    userId,
    pageId,
    projectId,
    wsUrl,
    enableDebug,
    handleSyncUsers,
    handleConflict,
    handleProviderError,
    handleStatusChange,
    handleSyncedChange,
  ]);

  const createElement = useCallback(
    async (
      element: EditorElement,
      parentId?: string | null,
      position?: number,
    ): Promise<ElementOperationSuccess> => {
      const provider = providerRef.current;
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      try {
        return await provider.createElement(element, parentId, position);
      } catch (err) {
        console.error("[useYjsCollabV2] Failed to create element:", err);
        onError?.(err as Error);
        throw err;
      }
    },
    [onError],
  );

  const updateElement = useCallback(
    async (
      elementId: string,
      updates: Partial<EditorElement>,
      updateType: UpdateType = "partial",
    ): Promise<ElementOperationSuccess> => {
      const provider = providerRef.current;
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      try {
        return await provider.updateElement(elementId, updates, updateType);
      } catch (err) {
        console.error("[useYjsCollabV2] Failed to update element:", err);
        onError?.(err as Error);
        throw err;
      }
    },
    [onError],
  );

  const deleteElement = useCallback(
    async (
      elementId: string,
      deleteChildren = false,
      preserveStructure = true,
    ): Promise<ElementOperationSuccess> => {
      const provider = providerRef.current;
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      try {
        return await provider.deleteElement(
          elementId,
          deleteChildren,
          preserveStructure,
        );
      } catch (err) {
        console.error("[useYjsCollabV2] Failed to delete element:", err);
        onError?.(err as Error);
        throw err;
      }
    },
    [onError],
  );

  const moveElement = useCallback(
    async (
      elementId: string,
      newParentId?: string | null,
      newPosition?: number,
    ): Promise<ElementOperationSuccess> => {
      const provider = providerRef.current;
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      try {
        return await provider.moveElement(elementId, newParentId, newPosition);
      } catch (err) {
        console.error("[useYjsCollabV2] Failed to move element:", err);
        onError?.(err as Error);
        throw err;
      }
    },
    [onError],
  );

  const createPage = useCallback(
    async (page: Page): Promise<PageOperationSuccess> => {
      const provider = providerRef.current;
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      try {
        return await provider.createPage(page);
      } catch (err) {
        console.error("[useYjsCollabV2] Failed to create page:", err);
        onError?.(err as Error);
        throw err;
      }
    },
    [onError],
  );

  const updatePage = useCallback(
    async (
      pageId: string,
      updates: Partial<Page>,
    ): Promise<PageOperationSuccess> => {
      const provider = providerRef.current;
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      try {
        return await provider.updatePage(pageId, updates);
      } catch (err) {
        console.error("[useYjsCollabV2] Failed to update page:", err);
        onError?.(err as Error);
        throw err;
      }
    },
    [onError],
  );

  const deletePage = useCallback(
    async (pageId: string): Promise<PageOperationSuccess> => {
      const provider = providerRef.current;
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      try {
        return await provider.deletePage(pageId);
      } catch (err) {
        console.error("[useYjsCollabV2] Failed to delete page:", err);
        onError?.(err as Error);
        throw err;
      }
    },
    [onError],
  );

  const reconnect = useCallback(async () => {
    const provider = providerRef.current;
    if (!provider) {
      throw new Error("Provider not initialized");
    }

    try {
      await provider.reconnect();
    } catch (err) {
      console.error("[useYjsCollabV2] Failed to reconnect:", err);
      onError?.(err as Error);
      throw err;
    }
  }, [onError]);

  return {
    isConnected: state.roomState === "connected",
    roomState: state.roomState,
    error: state.error,
    isSynced: state.isSynced,
    pendingUpdates: state.pendingUpdates,
    ydoc: ydocRef.current,
    provider: providerRef.current,
    canvasRef,
    createElement,
    updateElement,
    deleteElement,
    moveElement,
    createPage,
    updatePage,
    deletePage,
    reconnect,
  };
}
