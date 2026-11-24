import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { EditorElement } from "@/types/global.type";
import { runAgentRequest } from "@/features/agent/runtime";
import type {
  RemoteAgentPresence,
  WSCollabState,
  WSCollaborationConfig,
  WSRoomState,
} from "@/features/collaboration/interfaces/websocket";
import {
  buildMouseStorePresencePatch,
  canStartCollabRoom,
  extractProviderErrorMessage,
} from "@/features/collaboration/lib/presenceSync";
import { CustomYjsProviderV2 } from "@/features/collaboration/lib/yjs/Provider";
import { sendElementOp } from "@/features/collaboration/lib/yjs/sendElementOp";
import { ElementStore, useElementStore } from "@/features/editor/store/element-store";
import { useMouseStore } from "@/features/editor/store/mouse-store";
import { useLogicStore } from "@/features/interactions/logic-store";
import { createCollabDraftManager } from "./collabDrafts";

const INITIAL_STATE: WSCollabState = {
  roomState: "connecting",
  error: null,
  isSynced: false,
  pendingUpdates: 0,
};

function mapRoomState(status: string): WSRoomState {
  if (status === "connected") return "connected";
  if (status === "error") return "error";
  return "connecting";
}

export function useCollabRoom({
  config,
  wsUrl,
  enabled,
  userId,
  getToken,
  isLoaded,
}: {
  config: WSCollaborationConfig;
  wsUrl: string;
  enabled: boolean;
  userId: string | null | undefined;
  getToken: () => Promise<string | null>;
  isLoaded: boolean;
}): {
  state: WSCollabState;
  providerRef: React.RefObject<CustomYjsProviderV2 | null>;
  remoteAgents: readonly RemoteAgentPresence[];
} {
  const { projectId, pageId, onSync, onError, onDisconnect, onReconnect } = config;
  const loadElements = useElementStore((s) => s.loadElements);
  const [state, setState] = useState<WSCollabState>(INITIAL_STATE);
  const [remoteAgents, setRemoteAgents] = useState<readonly RemoteAgentPresence[]>([]);

  const providerRef = useRef<CustomYjsProviderV2 | null>(null);
  const pendingMovesRef = useRef<Set<string>>(new Set());
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

  useEffect(() => {
    if (!canStartCollabRoom({ enabled, isLoaded, userId, pageId }) || !userId) return;
    const activeUserId = userId;

    let latestLocalElements: EditorElement[] | undefined;
    let disposed = false;

    const drafts = createCollabDraftManager({
      projectId,
      pageId,
      userId: activeUserId,
      loadElements,
      isCurrentPage: () => latest.current.pageId === pageId,
    });

    const provider = new CustomYjsProviderV2({
      url: wsUrl,
      pageId,
      projectId,
      userId: activeUserId,
      userName: activeUserId,
      onAgentRequest: (req) => runAgentRequest(req),
      getToken: () => latest.current.getToken(),
      getElementState: () => ElementStore.getState(),
      onPendingChange: (pendingUpdates) => {
        setState((prev) => ({ ...prev, pendingUpdates }));
      },
      onSyncUsers: (users) => {
        useMouseStore.getState().setUsers(users);
      },
      onError: (err) => {
        const msg = extractProviderErrorMessage(err);
        latest.current.onError?.(new Error(msg));
        drafts.offerRecovery();
        setState((prev) => ({ ...prev, error: msg }));
      },
      onLogicSync: (payload) => useLogicStore.getState().receiveSync(payload),
      onLogicChanged: (payload) =>
        useLogicStore
          .getState()
          .receiveChange(payload.scope, payload.pageId, payload.logic, payload.revision),
    });

    providerRef.current = provider;

    useLogicStore.getState().load(projectId);
    useLogicStore.getState().bindRemote({
      pageId,
      isOnline: () => provider.isConnected(),
      send: (scope, patch, nullPaths) => provider.updateLogic(scope, patch, nullPaths),
      move: (kind, name, to) => provider.moveLogic(kind, name, to),
      requestSync: () => provider.requestLogicSync(),
      onRejected: (message) => toast.error(`Change not saved: ${message}`),
    });

    provider.on("status", ({ status }: { status: string }) => {
      const roomState = mapRoomState(status);
      setState((prev) => ({
        ...prev,
        roomState,
        error:
          status === "error"
            ? "Connection failed"
            : status === "connected"
              ? null
              : prev.error,
        pendingUpdates: providerRef.current?.pendingUpdates ?? prev.pendingUpdates,
      }));
      if (status === "connected") latest.current.onReconnect?.();
      else if (status === "disconnected") latest.current.onDisconnect?.();
    });

    provider.on("synced", (synced: boolean) => {
      setState((prev) => ({ ...prev, isSynced: synced }));
      if (synced) {
        latest.current.onSync?.();
        drafts.offerRecovery();
      }
    });

    const unsubPresence = provider.onPresenceChange((presences) => {
      const mouseStore = useMouseStore.getState();
      const patch = buildMouseStorePresencePatch(presences, mouseStore.users);
      mouseStore.setRemoteUsers(patch.remoteUsers);
      mouseStore.setSelectedByUser(patch.selectedByUser);
      mouseStore.setUsers(patch.users);

      const activeAgents: RemoteAgentPresence[] = [];
      presences.forEach((presence) => {
        if (presence.agent?.active) {
          activeAgents.push({
            userId: presence.userId,
            userName: presence.userName,
            agent: presence.agent,
          });
        }
      });
      setRemoteAgents(activeAgents);
    });

    const store = ElementStore.getState();
    store.setElementsChangeCallback((elements) => {
      latestLocalElements = elements;
      if (provider.isConnected() && provider.isSynced) return;
      drafts.saveCatching(
        elements,
        "Could not save the local draft. Offline edits may be lost.",
      );
    });

    store.setCollaborativeCallback(async (type, id, data) => {
      const activeProvider = providerRef.current;
      if (!activeProvider?.isSynced || !activeProvider.isConnected()) return;

      try {
        await sendElementOp(
          activeProvider,
          () => ElementStore.getState().elements,
          pendingMovesRef.current,
          type,
          id,
          data,
        );
      } catch (err) {
        const current = ElementStore.getState();
        const isSamePage =
          current.activePage?.projectId === projectId &&
          current.activePage.pageId === pageId;
        const elements = isSamePage ? current.elements : latestLocalElements;
        if (elements) {
          drafts.saveCatching(
            elements,
            "Could not save the local draft. Unsynced edits may be lost.",
          );
        }
        if (!disposed) {
          latest.current.onError?.(
            err instanceof Error ? err : new Error(extractProviderErrorMessage(err)),
          );
        }
      }
    });

    return () => {
      disposed = true;
      unsubPresence();
      useLogicStore.getState().unbindRemote();
      drafts.dismissToast();
      const cleanupStore = ElementStore.getState();
      cleanupStore.setCollaborativeCallback(null);
      cleanupStore.setElementsChangeCallback(null);
      provider.destroy();
      providerRef.current = null;
      setRemoteAgents([]);
      setState((prev) => ({ ...prev, isSynced: false }));
    };
  }, [pageId, projectId, wsUrl, enabled, userId, isLoaded, loadElements]);

  return { state, providerRef, remoteAgents };
}
