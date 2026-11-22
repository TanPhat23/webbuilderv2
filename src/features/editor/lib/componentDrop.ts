import { plainComponentSnapshot } from "@/features/projects/lib/resolve-elements";
import type { QueryClient } from "@tanstack/react-query";
import type { Page } from "@/features/pages";
import { projectKeys } from "@/features/projects/hooks/useProjects";
import {
  componentRoots,
  makeComponentInstance,
  wouldCreateComponentCycle,
} from "@/features/projects/lib/components";
import type { EditorElement } from "@/types/global.type";
import {
  componentLibraryKey,
  isComponentSnapshot,
  type ComponentSnapshot,
} from "../services/component-library.service";
import { getCachedComponentElements } from "../hooks/useProjectComponents";
import type { DropPayload } from "../utils/element/dragPayload";

export function componentFromDrop(
  payload: Extract<DropPayload, { kind: "component" | "snapshot" }>,
  queryClient: QueryClient,
  projectId: string,
  pageId: string,
  userId: string | null,
): EditorElement | undefined {
  if (payload.kind === "snapshot") {
    if (!userId) return;
    const snapshot = queryClient
      .getQueryData<ComponentSnapshot[]>(componentLibraryKey(userId))
      ?.find(({ id }) => id === payload.id);
    return isComponentSnapshot(snapshot?.structure)
      ? plainComponentSnapshot(snapshot.structure, pageId)
      : undefined;
  }

  const pages = queryClient.getQueryData<Page[]>(projectKeys.pages(projectId));
  const pageIds = new Set(
    pages
      ?.filter((page) => page.Type === "cp" && !page.DeletedAt)
      .map((page) => page.Id),
  );
  const elements = getCachedComponentElements(queryClient, projectId);
  const source = { elements, pageIds };
  const root = componentRoots(source).get(payload.id);
  if (root && !wouldCreateComponentCycle(pageId, payload.id, source)) {
    return makeComponentInstance(root, pageId);
  }
}
