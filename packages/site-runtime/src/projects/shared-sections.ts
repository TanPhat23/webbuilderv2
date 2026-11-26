import type { EditorElement } from "../types/global.type";

type Section = Extract<EditorElement, { type: "Section" | "Header" | "Footer" | "Nav" }>;
export type SharedSectionSlot = "header" | "footer";
export type SharedSectionSetting = { slot: SharedSectionSlot } | {
  slot: SharedSectionSlot;
  sourcePageId: string;
  sourceId: string;
};

export function isShareableSection(element: EditorElement): element is Section {
  return element.type === "Section" || element.type === "Header" || element.type === "Footer" || element.type === "Nav";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function sharedSectionSetting(element: EditorElement): SharedSectionSetting | undefined {
  if (!isShareableSection(element)) return;
  const setting = element.settings?.sharedSection;
  if (!isRecord(setting)) return;
  const { slot, sourcePageId, sourceId } = setting;
  if (slot !== "header" && slot !== "footer") return;
  if (sourcePageId === undefined && sourceId === undefined) return { slot };
  if (typeof sourcePageId === "string" && sourcePageId && typeof sourceId === "string" && sourceId) {
    return { slot, sourcePageId, sourceId };
  }
}

/** Only top-level sections explicitly marked as sources can be linked. */
export function sharedSectionSources(roots: EditorElement[], pageIds: ReadonlySet<string>) {
  return roots.flatMap((element) => {
    const setting = sharedSectionSetting(element);
    return isShareableSection(element) && setting && !("sourceId" in setting) && pageIds.has(element.pageId)
      ? [{ element, slot: setting.slot }]
      : [];
  });
}

export function resolveSharedSections(
  page: EditorElement[],
  project: EditorElement[],
  pageIds: ReadonlySet<string>,
): EditorElement[] {
  const sources = new Map<string, { element: Section; slot: SharedSectionSlot }>(
    sharedSectionSources(project, pageIds).map((source) => [source.element.id, source]),
  );
  const used = new Set<string>();
  return page.map((element) => {
    const setting = sharedSectionSetting(element);
    if (!setting || !("sourceId" in setting) || setting.sourcePageId === element.pageId) return element;
    const source = sources.get(setting.sourceId);
    if (!source || source.slot !== setting.slot || source.element.pageId !== setting.sourcePageId || used.has(setting.sourceId)) {
      return element;
    }
    used.add(setting.sourceId);
    return { ...source.element, id: element.id, pageId: element.pageId };
  });
}
