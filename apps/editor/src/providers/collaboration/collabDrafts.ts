import { toast } from "sonner";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { createEditorDraftStore } from "@/features/editor/store/editor-draft";

type DraftStore = ReturnType<typeof createEditorDraftStore>;

export interface OfflineDraftRecovery {
  save: (elements: EditorElement[]) => void;
  saveCatching: (elements: EditorElement[], unavailableMessage: string) => void;
  offerRecovery: () => void;
  dismissToast: () => void;
}

export function createOfflineDraftRecovery({
  projectId,
  pageId,
  userId,
  setElements,
  isCurrentPage,
}: {
  projectId: string;
  pageId: string;
  userId: string;
  setElements: (elements: EditorElement[], skipSave?: boolean) => void;
  isCurrentPage: () => boolean;
}): OfflineDraftRecovery {
  let store: DraftStore | undefined;
  try {
    store = createEditorDraftStore(window.localStorage, userId, projectId, pageId);
  } catch {
    toast.error("Local draft storage is unavailable. Offline edits may be lost.");
  }

  const toastId = `editor-draft:${projectId}:${pageId}`;

  const saveCatching = (
    elements: EditorElement[],
    unavailableMessage: string,
  ): void => {
    if (!store) return;
    try {
      store.save(elements);
    } catch {
      toast.error(unavailableMessage);
    }
  };

  const offerRecovery = (): void => {
    try {
      const draft = store?.read();
      if (!draft) return;
      toast.warning("An offline draft is available", {
        id: toastId,
        duration: Infinity,
        description:
          "Restoring replaces the current editor view. The draft is not automatically synchronized.",
        action: {
          label: "Restore draft",
          onClick: () => {
            if (!isCurrentPage()) return;
            try {
              setElements(draft.elements, true);
            } catch {
              toast.error("Could not read the local draft.");
            }
          },
        },
        cancel: {
          label: "Discard draft",
          onClick: () => {
            try {
              store?.remove(draft.id);
            } catch {
              toast.error("Could not discard the local draft.");
            }
          },
        },
      });
    } catch {
      toast.error("Could not read the local draft.");
    }
  };

  return {
    save: (elements) => {
      store?.save(elements);
    },
    saveCatching,
    offerRecovery,
    dismissToast: () => {
      toast.dismiss(toastId);
    },
  };
}
