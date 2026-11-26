import { useMemo } from "react";
import { componentSetting, visitComponentTree } from "@webbuilder/site-runtime/projects/components";
import { resolveElements } from "@webbuilder/site-runtime/projects/resolve-elements";
import { sharedSectionSetting } from "@webbuilder/site-runtime/projects/shared-sections";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { useProjectComponents } from "./useProjectComponents";
import { useSharedSectionSources } from "./useSharedSections";

export function useResolvedElements(page: EditorElement[]) {
  const hasSharedLinks = page.some((element) => {
    const setting = sharedSectionSetting(element);
    return setting && "sourceId" in setting;
  });
  const hasComponentLinks = useMemo(() => {
    let linked = false;
    visitComponentTree(page, (element) => { if (componentSetting(element)) linked = true; });
    return linked;
  }, [page]);
  const { saved, pageIds } = useSharedSectionSources(hasSharedLinks);
  const { elements: project, pageIds: componentIds } = useProjectComponents(hasSharedLinks || hasComponentLinks);
  return useMemo(
    () => hasSharedLinks || hasComponentLinks
      ? resolveElements({ page, project, pageIds, componentIds, sharedProject: saved.data ?? [], showMissing: true })
      : page,
    [page, project, pageIds, componentIds, saved.data, hasSharedLinks, hasComponentLinks],
  );
}
