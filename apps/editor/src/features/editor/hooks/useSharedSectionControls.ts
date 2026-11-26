import { useCurrentPage } from "@/features/projects/hooks/useProjects";
import { componentSetting } from "@webbuilder/site-runtime/projects/components";
import { useElements, useSelectedElement, useUpdateElement } from "@/features/editor";
import { useAvailableSharedSections } from "@/features/editor/hooks/useSharedSections";
import {
  isShareableSection,
  sharedSectionSetting,
  type SharedSectionSetting,
} from "@webbuilder/site-runtime/projects/shared-sections";
import { useEditorContext } from "@/features/editor/context/EditorContext";

export function useSharedSectionControls() {
  const section = useSelectedElement();
  const roots = useElements();
  const update = useUpdateElement();
  const { editor, projectId, pageId } = useEditorContext();
  const isMaster = useCurrentPage()?.Type === "cp";
  const isRootSection = !!section && !isMaster && !componentSetting(section) && isShareableSection(section) && roots.some((root) => root.id === section?.id);
  const { pages, sources, isLoading, isError } = useAvailableSharedSections(isRootSection);
  const setting = section ? sharedSectionSetting(section) : undefined;
  const linkedId = setting && "sourceId" in setting && typeof setting.sourceId === "string"
    ? setting.sourceId
    : undefined;
  const value = linkedId ? `link:${linkedId}` : setting?.slot ?? "local";
  const usedSources = new Set(roots.flatMap((root) => {
    if (root.id === section?.id) return [];
    const other = sharedSectionSetting(root);
    return other && "sourceId" in other ? [other.sourceId] : [];
  }));
  const available = sources
    .filter(({ element }) => element.pageId !== pageId && !usedSources.has(element.id))
    .map(({ element, slot }) => {
      const page = pages?.find(({ Id }) => Id === element.pageId);
      return {
        id: element.id,
        pageId: element.pageId,
        label: `${page?.Name || "Home"} · ${element.name || slot}`,
        slot,
        value: `link:${element.id}`,
      };
    });
  const canEdit = isRootSection && !editor.isReadOnly && !editor.isLocked && !editor.isLoading && section.pageId === pageId;

  function setSharedSection(next: string) {
    if (!section || !canEdit) return;
    const settings: Record<string, unknown> = { ...section.settings };
    let sharedSection: SharedSectionSetting | undefined;
    if (next === "header" || next === "footer") {
      sharedSection = { slot: next };
    } else if (next !== "local") {
      const source = available.find(({ value }) => value === next);
      if (!source) return;
      sharedSection = { slot: source.slot, sourceId: source.id, sourcePageId: source.pageId };
    }
    if (sharedSection) settings.sharedSection = sharedSection;
    else delete settings.sharedSection;
    update(section.id, { settings });
  }

  return {
    isRootSection, canEdit, value, available, linkedId,
    projectId, isLoading, isError, setSharedSection,
  };
}
