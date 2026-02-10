"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

import {
  useElementStore,
  ElementStore,
  type MoveData,
} from "@/globalstore/element-store";
import { EditorElement } from "@/types/global.type";
import { useMouseStore } from "@/globalstore/mouse-store";
import type {
  UseYjsCollabV2Options,
  UseYjsCollabV2Return,
  CollabState,
  RoomState,
  ErrorMessage,
  CustomYjsProviderV2 as CustomYjsProviderV2Type,
} from "@/interfaces/websocket";
import { CustomYjsProviderV2 } from "@/lib/yjs/Provider";

const DEFAULT_WS_URL = "ws://localhost:8080";
const ELEMENT_STORE_UPDATE_DELAY = 50;

/**
 * React hook for real-time collaboration using the Yjs-backed WebSocket provider.
 *
 * Updated to work with the new WebSocket API protocol:
 *   - URL pattern: `ws://<host>/ws/:project?token=<jwt>`
 *   - Envelope-based messages: `join`, `sync`, `element:*`, `presence`, `error`
 *   - Presence via WebSocket messages (not Yjs Awareness polling)
 *   - Exponential backoff with jitter for reconnection
 *
 * The Y.Doc is used as a local cache layer. The server is authoritative;
 * all incoming broadcasts are applied to the Y.Doc as source of truth.
 *
 * @see WebSocket API Reference
 */
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
}: UseYjsCollabV2Options): UseYjsCollabV2Return {
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
  // Core effect: Setup Y.Doc, provider, IndexedDB persistence
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
      userName: userId,
      getToken: () => latest.current.getToken(),
      doc: ydoc,
      onSyncUsers: (users) => setUsers(users),
      onConflict: (c) => latest.current.onConflict?.(c),
      onError: (e: ErrorMessage) => {
        let msg = "Unknown provider error";
        if (e && typeof e === "object") {
          if ("message" in e && typeof e.message === "string" && e.message) {
            msg = e.message;
          } else if ("error" in e && typeof e.error === "string" && e.error) {
            msg = e.error;
          } else if (
            "payload" in e &&
            e.payload &&
            typeof e.payload === "object" &&
            "message" in e.payload &&
            typeof (e.payload as any).message === "string"
          ) {
            msg = (e.payload as any).message;
          } else if (
            "payload" in e &&
            e.payload &&
            typeof e.payload === "object" &&
            "code" in e.payload
          ) {
            msg = String((e.payload as any).code);
          }
        }
        latest.current.onError?.(new Error(msg));
        setState((s) => ({ ...s, error: msg }));
      },
      // Presence updates from other users are handled by the
      // AwarenessController inside the Provider, which emits "change"
      // events that trigger onSyncUsers above. No manual polling needed.
    });

    ydocRef.current = ydoc;
    providerRef.current = provider;
    persistenceRef.current = persistence;

    // ---- Status listener ----
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

    // ---- Synced listener ----
    provider.on("synced", (synced: boolean) => {
      setState((s) => ({ ...s, isSynced: synced }));
      if (synced) latest.current.onSync?.();
    });

    // ---- Observe Y.Text for remote element updates ----
    // When the DocumentSyncer writes to the Y.Doc (from server broadcasts),
    // this observer picks up the change and loads it into the element store.
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
        console.warn("[YJS] Failed to parse remote elements", err);
      }
    };
    yElementsText.observe(observer);

    // ---- Wire awareness change events directly to mouse store ----
    // The AwarenessController now handles both Yjs Awareness and WS presence
    // broadcasts internally. It emits normalized "change" events with
    // { remoteUsers, selectedByUser, users } that we sync to the store.
    if (provider.awareness) {
      const handleAwarenessChange = () => {
        // The Provider's AwarenessController already emits events that
        // are wired to onSyncUsers. For remote cursor positions and
        // selections, we additionally read from the awareness states.
        const states = provider.awareness.getStates();
        const remoteUsers: Record<string, { x: number; y: number }> = {};
        const selectedByUser: Record<string, string> = {};

        states.forEach((state: any, clientId: number) => {
          if (!state) return;
          const clientIdStr = clientId.toString();

          if (state.cursor?.x != null && state.cursor?.y != null) {
            remoteUsers[clientIdStr] = {
              x: state.cursor.x,
              y: state.cursor.y,
            };
          }

          if (state.selectedElement) {
            selectedByUser[clientIdStr] = state.selectedElement;
          }
        });

        setRemoteUsers(remoteUsers);
        setSelectedByUser(selectedByUser);
      };

      provider.awareness.on("change", handleAwarenessChange);
    }

    // ---- Sync local element store changes into Y.Doc ----
    // This callback fires when the local user modifies the element store.
    // We write the full elements array into the Y.Text so the observer
    // doesn't re-trigger (guarded by isUpdatingFromElementStore).
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

    // ---- Wire collaborative callback for outgoing operations ----
    // When the local user creates/updates/deletes/moves elements via
    // the element store, this callback sends the operation to the server
    // through the Provider (which wraps it in an envelope message).
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
          await p.createElement(el, el.parentId ?? null, el.order);
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

    // ---- Cleanup ----
    return () => {
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
  // Mouse tracking on canvas — sends `presence` envelope messages
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !providerRef.current) return;

    let lastX = -1;
    let lastY = -1;
    let lastSendTime = 0;
    const THROTTLE_MS = 50;

    const handleMouseMove = (e: MouseEvent) => {
      if (!providerRef.current?.isSynced) return;

      const now = Date.now();
      if (now - lastSendTime < THROTTLE_MS) return;

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

      // Send presence via the Provider (which creates the envelope)
      providerRef.current.sendPresence(x, y);
    };

    const handleMouseLeave = () => {
      // Send a "hidden" cursor when leaving the canvas
      if (providerRef.current?.isSynced) {
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
  // Return value
  // ---------------------------------------------------------------------------
  return {
    ...state,
    isConnected: state.roomState === "connected",
    ydoc: ydocRef.current,
    provider: providerRef.current,
    canvasRef,

    createElement: async (el, pId, pos) => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      return providerRef.current.createElement(el, pId, pos);
    },
    updateElement: async (id, upd, ty = "partial") => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      return providerRef.current.updateElement(id, upd, ty);
    },
    deleteElement: async (id, ch = false, str = true) => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      return providerRef.current.deleteElement(id, ch, str);
    },
    moveElement: async (id, pId, pos) => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      return providerRef.current.moveElement(id, pId, pos);
    },
    createPage: async (page) => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      return providerRef.current.createPage(page);
    },
    updatePage: async (id, upd) => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      return providerRef.current.updatePage(id, upd);
    },
    deletePage: async (id) => {
      if (!providerRef.current) throw new Error("Provider not initialized");
      return providerRef.current.deletePage(id);
    },
    reconnect: async () => {
      await providerRef.current?.reconnect();
    },
  };
}
