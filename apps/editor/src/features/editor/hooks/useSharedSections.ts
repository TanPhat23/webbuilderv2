import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProjectRoutePages } from "@/features/projects/hooks/useProjects";
import {
  sharedSectionSources,
} from "@webbuilder/site-runtime/projects/shared-sections";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { elementService } from "@/features/elements/services/element.service";

export function useSharedSectionSources(enabled: boolean) {
  const { projectId, pageId } = useEditorContext();
  const { data: pages } = useProjectRoutePages(projectId);
  const saved = useQuery({
    queryKey: ["shared-sections", projectId, pageId],
    queryFn: () => projectId ? elementService.listProjectElements(projectId) : Promise.resolve([]),
    enabled: enabled && Boolean(projectId && pageId),
    refetchInterval: enabled ? 10_000 : false,
  });
  const pageIds = useMemo(
    () => new Set(pages?.filter((page) => !page.DeletedAt).map((page) => page.Id)),
    [pages],
  );
  return { pages, pageIds, saved };
}

export function useAvailableSharedSections(enabled: boolean) {
  const { pages, pageIds, saved } = useSharedSectionSources(enabled);
  const sources = useMemo(
    () => sharedSectionSources(saved.data ?? [], pageIds),
    [pageIds, saved.data],
  );
  return { pages, sources, isLoading: saved.isLoading, isError: saved.isError };
}
