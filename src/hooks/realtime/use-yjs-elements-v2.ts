"use client";

import { useRef, useCallback } from "react";
import { EditorElement } from "@/types/global.type";
import * as Y from "yjs";
import {
  safeValidateElementTree,
  validateContainerElementTree,
} from "@/lib/utils/element/containerElementValidator";
import {
  sanitizeElements,
  computeHash,
} from "@/lib/utils/use-yjs-collab-utils";

interface UseYjsElementsV2Options {
  ydoc: Y.Doc | null;
  provider: any;
  loadElements: (elements: EditorElement[], replace: boolean) => void;
  onSync?: () => void;
  getProvider?: () => any;
  getYdoc?: () => Y.Doc | null;
}

interface UseYjsElementsV2Return {
  handleSync: (elements: EditorElement[]) => void;
  handleUpdate: (elements: EditorElement[]) => void;
  setupElementsObserver: (
    yElementsText: Y.Text,
    internalStateRef: any,
  ) => (event: Y.YEvent<Y.Text>, transaction: Y.Transaction) => void;
  setupElementsCallback: (
    internalStateRef: any,
    ElementStore: any,
    getProvider: () => any,
    getYdoc: () => Y.Doc | null,
  ) => void;
}

export function useYjsElementsV2({
  ydoc,
  provider,
  loadElements,
  onSync,
  getProvider,
  getYdoc,
}: UseYjsElementsV2Options): UseYjsElementsV2Return {
  const internalStateRef = useRef({
    lastLocalHash: "",
    lastSentHash: "",
    isUpdatingFromElementStore: false,
    lastCallbackTime: 0,
  });

  const handleSync = useCallback(
    (elements: EditorElement[]) => {
      const sanitizedElements = sanitizeElements(elements);
      const validationResult = safeValidateElementTree(sanitizedElements);

      if (!validationResult.success) {
        console.warn(
          "[useYjsElementsV2] Validation failed:",
          validationResult.error,
        );
        return;
      }

      const normalizedElements = validationResult.data || sanitizedElements;
      const validation = validateContainerElementTree(normalizedElements);

      if (!validation.valid) {
        console.warn(
          "[useYjsElementsV2] Container validation issues:",
          validation.issues,
        );
      }

      const hash = computeHash(normalizedElements);
      internalStateRef.current.lastLocalHash = hash;
      internalStateRef.current.lastSentHash = hash;

      loadElements(normalizedElements, true);

      setTimeout(() => {
        onSync?.();
      }, 100);
    },
    [loadElements, onSync],
  );

  const handleUpdate = useCallback(
    (elements: EditorElement[]) => {
      const sanitizedElements = sanitizeElements(elements);
      const validationResult = safeValidateElementTree(sanitizedElements);

      if (!validationResult.success) {
        console.warn(
          "[useYjsElementsV2] Update validation failed:",
          validationResult.error,
        );
        return;
      }

      const normalizedElements = validationResult.data || sanitizedElements;
      const validation = validateContainerElementTree(normalizedElements);

      if (!validation.valid) {
        console.warn(
          "[useYjsElementsV2] Update container validation issues:",
          validation.issues,
        );
      }

      const hash = computeHash(normalizedElements);

      if (hash !== internalStateRef.current.lastLocalHash) {
        internalStateRef.current.lastLocalHash = hash;
        loadElements(normalizedElements, true);
      }
    },
    [loadElements],
  );

  const setupElementsObserver = useCallback(
    (yElementsText: Y.Text, internalStateRef: any) => {
      return (event: Y.YEvent<Y.Text>, transaction: Y.Transaction) => {
        try {
          if (internalStateRef.current.isUpdatingFromElementStore) {
            return;
          }

          const elementsJson = yElementsText.toString();
          const parsed = elementsJson ? JSON.parse(elementsJson) : [];

          const isRemoteUpdate =
            transaction && transaction.origin === "remote-update";
          const isV2Sync = transaction && transaction.origin === "v2-sync";

          if (isV2Sync) {
            handleSync(parsed);
          } else if (isRemoteUpdate) {
            handleUpdate(parsed);
          } else {
            handleSync(parsed);
          }
        } catch (err) {
          console.warn("[useYjsElementsV2] Elements parse failed:", err);
        }
      };
    },
    [handleSync, handleUpdate],
  );

  const setupElementsCallback = useCallback(
    (
      internalStateRef: any,
      ElementStore: any,
      getProvider: () => any,
      getYdoc: () => Y.Doc | null,
    ) => {
      const elementStoreCallback = (elements: EditorElement[]) => {
        const currentProvider = getProvider?.();
        if (!currentProvider?.synched) {
          return;
        }

        if (!elements || elements.length === 0) {
          return;
        }

        try {
          internalStateRef.current.isUpdatingFromElementStore = true;

          const currentYdoc = getYdoc();
          if (currentYdoc) {
            Y.transact(currentYdoc, () => {
              const yElementsText = currentYdoc.getText("elementsJson");
              yElementsText.delete(0, yElementsText.length);
              yElementsText.insert(0, JSON.stringify(elements));
            });
          }

          // Note: V2 provider doesn't need explicit sendUpdate
          // Operations are handled through the operation API methods

          setTimeout(() => {
            internalStateRef.current.isUpdatingFromElementStore = false;
          }, 50);
        } catch (err) {
          console.error("[useYjsElementsV2] Error updating elements:", err);
          internalStateRef.current.isUpdatingFromElementStore = false;
        }
      };

      ElementStore.getState().setYjsUpdateCallback(elementStoreCallback);
    },
    [],
  );

  return {
    handleSync,
    handleUpdate,
    setupElementsObserver,
    setupElementsCallback,
  };
}
