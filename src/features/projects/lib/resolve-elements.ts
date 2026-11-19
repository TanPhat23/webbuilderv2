import type { EditorElement } from "@/types/global.type";
import { cloneComponentTree, detach, resolveComponents, visitComponentTree, type ComponentSource } from "./components";
import { resolveSharedSections } from "./shared-sections";

interface ResolveElementsOptions {
  page: EditorElement[];
  project: EditorElement[];
  pageIds: ReadonlySet<string>;
  componentIds: ReadonlySet<string>;
  /** The canvas reads saved sections and live component masters separately. */
  sharedProject?: EditorElement[];
  showMissing?: boolean;
}

export function resolveElements(options: ResolveElementsOptions): EditorElement[] {
  return resolveElementTree(options).elements;
}

function resolveElementTree({
  page,
  project,
  pageIds,
  componentIds,
  sharedProject = project,
  showMissing,
}: ResolveElementsOptions) {
  const shared = resolveSharedSections(page, sharedProject, pageIds);
  const elements = resolveComponents(shared, project, componentIds, { showMissing });
  return { shared, elements };
}

/** Snapshots travel across projects, so they contain local elements only. */
export function plainComponentSnapshot(
  root: EditorElement,
  pageId = root.pageId,
  source: ComponentSource & { routePageIds?: ReadonlySet<string> } = { elements: [], pageIds: new Set() },
): EditorElement {
  const { shared: [section], elements: [resolved] } = resolveElementTree({
    page: [root], project: source.elements, pageIds: source.routePageIds ?? new Set(), componentIds: source.pageIds,
  });
  const snapshot = cloneComponentTree(resolved ?? detach(section, source.elements, source.pageIds), pageId);
  visitComponentTree([snapshot], (element) => {
    const settings = element.settings as Record<string, unknown> | undefined;
    if (settings) delete settings.sharedSection;
  });
  return snapshot;
}
