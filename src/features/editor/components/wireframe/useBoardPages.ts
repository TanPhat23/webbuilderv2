import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { elementService, useElements } from "@/features/editor";
import { useProjectPages } from "@/features/projects/hooks/useProjects";
import { useCollaborationOptional } from "@/providers/collaborationprovider";
import { useEditorContext } from "@/providers/editorprovider";
import type { EditorElement } from "@/types/global.type";
import { groupByPage, type PageItem } from "./sketchModel";

/** Pages of the project with their top-level sections: live for the open page, saved state for the rest. */
export function useBoardPages() {
  const { projectId, pageId: activePageId } = useEditorContext();
  const { data: pages = [], isLoading: pagesLoading } = useProjectPages(projectId);
  const live = useElements();
  const collab = useCollaborationOptional();

  // Keyed by the open page so switching pages refetches the saved state.
  const query = useQuery({
    queryKey: ["wireframe-elements", projectId, activePageId],
    queryFn: () => elementService.getElements(projectId as string),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  const saved = useMemo(
    () => groupByPage((query.data ?? []) as unknown as PageItem[]) as unknown as Map<string, EditorElement[]>,
    [query.data],
  );

  return {
    pages,
    pagesLoading,
    activePageId,
    activeReady: collab ? collab.isSynced : true,
    othersLoading: query.isPending,
    othersError: query.isError,
    retry: () => void query.refetch(),
    sectionsOf: (pageId: string): EditorElement[] | undefined =>
      pageId === activePageId ? live : query.data ? (saved.get(pageId) ?? []) : undefined,
  };
}
