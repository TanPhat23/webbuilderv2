import { useMemo, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProjectPages } from "@/features/projects/hooks/useProjects";
import { componentRoots } from "@/features/projects/lib/components";
import type { EditorElement } from "@/types/global.type";
import { useCollaborationOptional } from "@/providers/collaborationprovider";
import { useEditorContext } from "@/providers/editorprovider";
import { useElements } from "../store/selectors/element-selectors";
import { elementService } from "../services/element.service";

const NO_ELEMENTS: EditorElement[] = [];

/**
 * A master created in this tab is written over the realtime socket, and the
 * server may not have committed it when the next elements refetch lands. That
 * refetch would drop the master from the cache and every instance would flash
 * "Missing component" until a later poll. Remember what we created and keep it
 * visible until the server returns that master root (or it goes stale).
 */
const PENDING_MASTER_TTL_MS = 60_000;
const pendingMasters = new Map<string, { at: number; projectId: string; pageId: string; elements: EditorElement[] }>();

// Bumped whenever a master is remembered so mounted hooks recompute.
let pendingVersion = 0;
const pendingListeners = new Set<() => void>();
const subscribePending = (listener: () => void) => { pendingListeners.add(listener); return () => { pendingListeners.delete(listener); }; };
const pendingSnapshot = () => pendingVersion;

export function rememberPendingMaster(projectId: string, pageId: string, elements: EditorElement[]) {
  pendingMasters.set(`${projectId}:${pageId}`, { at: Date.now(), projectId, pageId, elements });
  pendingVersion += 1;
  pendingListeners.forEach((listener) => listener());
}

function withPendingMasters(projectId: string | null, saved: EditorElement[]): EditorElement[] {
  if (!projectId || pendingMasters.size === 0) return saved;
  const extra: EditorElement[] = [];
  for (const [key, pending] of pendingMasters) {
    if (Date.now() - pending.at > PENDING_MASTER_TTL_MS || pending.elements.every((master) => saved.some((element) => element.id === master.id))) {
      pendingMasters.delete(key);
    } else if (pending.projectId === projectId) {
      extra.push(...pending.elements);
    }
  }
  return extra.length ? [...saved, ...extra] : saved;
}

export const projectComponentElementsKey = (projectId: string | null) => ["component-elements", projectId] as const;

export function useProjectComponents(enabled = true) {
  const { projectId, pageId, editor } = useEditorContext();
  const live = useElements();
  const collaboration = useCollaborationOptional();
  const ready = !editor.isLoading && (collaboration?.isSynced ?? true);
  const projectPages = useProjectPages(projectId, enabled ? 15_000 : false);
  const query = useQuery({
    queryKey: projectComponentElementsKey(projectId),
    queryFn: () => elementService.getElements(projectId!),
    enabled: enabled && !!projectId,
    refetchInterval: enabled ? 5_000 : false,
  });

  const pages = useMemo(() => (projectPages.data ?? []).filter((page) => page.Type === "cp" && !page.DeletedAt), [projectPages.data]);
  const pageIds = useMemo(() => new Set(pages.map((page) => page.Id)), [pages]);
  const routePageIds = useMemo(
    () => new Set((projectPages.data ?? []).filter((page) => page.Type !== "cp" && !page.DeletedAt).map((page) => page.Id)),
    [projectPages.data],
  );
  const pendingRevision = useSyncExternalStore(subscribePending, pendingSnapshot, () => 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- pendingRevision re-runs this when a master is remembered
  const saved = useMemo(() => withPendingMasters(projectId, query.data ?? NO_ELEMENTS), [projectId, query.data, pendingRevision]);
  const elements = useMemo(
    () => pageId && ready && live.every((element) => element.pageId === pageId)
      ? [...saved.filter((element) => element.pageId !== pageId), ...live]
      : saved,
    [saved, live, pageId, ready],
  );
  const roots = useMemo(() => componentRoots({ elements, pageIds }), [elements, pageIds]);
  return { elements, pageIds, routePageIds, pages, roots, isLoading: projectPages.isLoading || query.isLoading, isError: projectPages.isError || query.isError };
}
