import { isEqual } from "lodash-es";
import { newEntityId } from "@/lib/entity-id";
import { ComponentConversionUnconfirmed, persistComponentInstance } from "../services/component-conversion";
import { RealtimeRequestRejected } from "@/features/collaboration/lib/yjs/MessageDispatcher";
import { useCallback } from "react";
import { useAuth } from "@clerk/tanstack-react-start";
import { useQueryClient } from "@tanstack/react-query";
import type { Page } from "@/features/pages";
import { projectKeys } from "@/features/projects/hooks/useProjects";
import { resolveSharedSections, sharedSectionSetting } from "@/features/projects/lib/shared-sections";
import { makeComponentInstance } from "@/features/projects/lib/components";
import type { EditorElement } from "@/types/global.type";
import { useCollaborationOptional } from "@/providers/collaborationprovider";
import { useEditorContext } from "@/providers/editorprovider";
import { elementService } from "../services/element.service";
import { createComponentMaster } from "../services/component-master.service";
import { ElementStore } from "../store/element-store";
import { useSelectionStore } from "../store/selection-store";
import { elementHelper } from "../utils/element/elementhelper";
import { useEditorPermissions } from "./useEditorPermissions";
import { projectComponentElementsKey, rememberPendingMaster } from "./useProjectComponents";

export function useComponentActions() {
  const { projectId, pageId, editor, editingMode } = useEditorContext();
  const permissions = useEditorPermissions(projectId);
  const { userId, getToken } = useAuth();
  const collaboration = useCollaborationOptional();
  const queryClient = useQueryClient();
  const canEdit = !editor.isReadOnly && !editor.isLocked && !editor.isLoading &&
    editingMode !== "code" && !!collaboration?.isSynced && permissions.canEditElements;
  const stageElement = collaboration?.createElement;
  const deleteElement = collaboration?.deleteElement;
  const canCreate = canEdit && permissions.canCreatePages && permissions.canCreateElements;
  const canReplace = canCreate && permissions.canDeleteElements;

  const createComponent = useCallback(async (
    name: string, options: { fromElementId?: string; snapshot?: EditorElement } = {},
  ) => {
    if (!projectId || !userId || !permissions.canCreatePages) throw new Error("You cannot create components in this project.");
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 255) throw new Error("Enter a name from 1 to 255 characters.");
    const { fromElementId, snapshot } = options;
    const store = ElementStore.getState();
    const original = fromElementId ? elementHelper.findById(store.elements, fromElementId) : undefined;
    if (fromElementId && (!canReplace || !original || original.pageId !== pageId)) {
      throw new Error("Select an element on the open page.");
    }
    if (snapshot && (!canCreate || !pageId)) throw new Error("You cannot insert elements on this page.");
    let source = original ?? snapshot;
    if (source) {
      const setting = sharedSectionSetting(source);
      if (setting) {
        if ("sourceId" in setting) {
          const pages = queryClient.getQueryData<Page[]>(projectKeys.pages(projectId));
          const routes = new Set(pages?.filter((page) => page.Type !== "cp" && !page.DeletedAt).map(({ Id }) => Id));
          const saved = await queryClient.fetchQuery({
            queryKey: projectComponentElementsKey(projectId), queryFn: () => elementService.getElements(projectId),
          });
          [source] = resolveSharedSections([source], saved, routes);
        }
        // A component owns a copy of the selected section's content.
        const { sharedSection: _shared, ...settings } = source.settings as Record<string, unknown>;
        source = { ...source, settings } as EditorElement;
      }
    }
    await queryClient.cancelQueries({ queryKey: projectKeys.pages(projectId), exact: true });
    const result = await createComponentMaster({
      projectId, name: trimmed, source, session: { userId, getToken },
      apply: async (root) => {
        const currentPage = () => {
          const live = ElementStore.getState();
          if (live.activePage?.projectId !== projectId || live.activePage.pageId !== pageId) return;
          return live;
        };
        const live = currentPage();
        if (!live || !stageElement || !deleteElement) throw new Error("The open page changed while creating the component.");
        const location = original && elementHelper.findLocation(live.elements, original.id);
        const current = original && elementHelper.findById(live.elements, original.id);
        if (original && (!location || !isEqual(current, original))) {
          throw new Error("The selected element changed. Try again.");
        }

        const parent = snapshot && live.isComponentPage ? live.elements[0] : undefined;
        if (parent && !elementHelper.isContainerElement(parent)) {
          throw new Error("Add a container to the master before inserting another component.");
        }
        const parentId = location?.parentId ?? parent?.id ?? null;
        const position = location ? location.index + 1 : parent ? parent.elements?.length ?? 0 : live.elements.length;
        const linked = {
          ...makeComponentInstance(root, pageId!, undefined, original),
          ...(original && { id: newEntityId() }), parentId: parentId ?? undefined, order: position, orderKey: undefined,
        };
        await persistComponentInstance({
          stage: () => stageElement(linked, parentId, position),
          ...(original && { removeOriginal: async () => {
            const open = currentPage();
            if (!open) throw new Error("The open page changed while creating the component.");
            const savedOriginal = elementHelper.findById(open.elements, original.id);
            const savedLocation = elementHelper.findLocation(open.elements, original.id);
            if (!isEqual(savedOriginal, original) || !isEqual(savedLocation, location)) {
              throw new RealtimeRequestRejected("The selected element changed. Try again.");
            }
            await deleteElement(original.id);
          } }),
          removeStaged: async () => {
            if (!currentPage()) throw new Error("The open page changed while creating the component.");
            await deleteElement(linked.id);
          },
        });

        const updated = currentPage();
        if (updated && elementHelper.findById(updated.elements, linked.id)) {
          const previous = original
            ? elementHelper.mapUpdateById(updated.elements, linked.id, () => original)
            : elementHelper.mapDeleteById(updated.elements, linked.id);
          updated.rememberTree(previous);
          useSelectionStore.setState({ selectedElementId: linked.id });
        }
      },
    }).catch((error: unknown) => {
      if (error instanceof ComponentConversionUnconfirmed) {
        void queryClient.invalidateQueries({ queryKey: projectKeys.pages(projectId), exact: true });
        void queryClient.invalidateQueries({ queryKey: projectComponentElementsKey(projectId) });
      }
      throw error;
    });
    queryClient.setQueryData<Page[]>(projectKeys.pages(projectId), (pages) => [...(pages ?? []).filter(({ Id }) => Id !== result.page.Id), result.page]);
    // Not written into the elements cache: the pending entry is dropped once the
    // server itself returns the master root, so the cache must reflect the server.
    if (result.root) rememberPendingMaster(projectId, result.page.Id, [result.root]);
    void queryClient.invalidateQueries({ queryKey: projectComponentElementsKey(projectId) });
    return { id: result.page.Id, name: result.page.Name, ...(result.root && { rootId: result.root.id }) };
  }, [projectId, pageId, userId, getToken, permissions.canCreatePages, canReplace, canCreate, queryClient, stageElement, deleteElement]);

  return { canCreate, canReplace, createComponent };
}
