"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

import { useElementStore, ElementStore } from "@/globalstore/elementstore";
import { useMouseStore } from "@/globalstore/mousestore";
import { CustomYjsProviderV2 } from "@/lib/yjs/yjs-provider-v2";
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
  ErrorMessage,
} from "@/interfaces/yjs-v2.interface";

const DEFAULT_WS_URL = "ws://localhost:8082";
const AWARENESS_POLL_INTERVAL = 150;
const ELEMENT_STORE_UPDATE_DELAY = 50;

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
  const providerRef = useRef<CustomYjsProviderV2 | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const canvasRef = useRef<HTMLElement | null>(null);

  const internalRef = useRef({
    isUpdatingFromElementStore: false,
    pendingMoves: new Set<string>(),
    remoteUpdateTimeout: null as NodeJS.Timeout | null,
  });

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

    provider.on("synced", (synced: boolean) => {
      setState((s) => ({ ...s, isSynced: synced }));
      if (synced) latest.current.onSync?.();
    });

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

    if (provider.awareness) {
      // Pass the stable store actions to the awareness utility
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
        if (type === "update" && id) await p.updateElement(id, data, "partial");
        else if (type === "delete" && id) await p.deleteElement(id);
        else if (type === "create" && data)
          await p.createElement(data, data.parentId, data.position);
        else if (type === "move" && data) {
          if (internalRef.current.pendingMoves.has(data.elementId)) return;
          internalRef.current.pendingMoves.add(data.elementId);
          try {
            await p.moveElement(
              data.elementId,
              data.newParentId,
              data.newPosition,
            );
          } finally {
            internalRef.current.pendingMoves.delete(data.elementId);
          }
        }
      } catch (err) {
        latest.current.onError?.(err as Error);
      }
    });

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
    reconnect: async () => providerRef.current?.reconnect(),
  };
}
