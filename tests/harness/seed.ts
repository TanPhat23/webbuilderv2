import { QueryClient } from '@tanstack/react-query';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';
import { useElementStore } from '../../apps/editor/src/features/editor/store/element-store';
import { useSelectionStore } from '../../apps/editor/src/features/editor/store/selection-store';
import { useCanvasViewportStore } from '../../apps/editor/src/features/editor/store/canvas-viewport-store';
import { useEditorChromeStore } from '../../apps/editor/src/features/editor/store/editor-chrome-store';
import { projectKeys } from '../../apps/editor/src/features/projects/hooks/useProjects';

export const PROJECT_ID = 'proj-1';
export const PAGE_ID = 'page-1';
export const USER_ID = 'user-1';

/** Shared by the shell and `seedEditor`; the cache is never refetched, so no request is made. */
export const harnessQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity, refetchOnMount: false, refetchOnWindowFocus: false } },
});

export interface EditorSeed {
  readonly elements: ReadonlyArray<EditorElement>;
  /** Project detail as the editor reads it from the query cache. */
  readonly project?: Readonly<Record<string, unknown>>;
  readonly pages?: ReadonlyArray<unknown>;
  readonly selectedElementId?: string;
}

/** Replaces the editor stores and the project query cache with `seed`; anything not given goes back to its initial state. */
export function seedEditor(seed: EditorSeed): void {
  harnessQueryClient.clear();
  harnessQueryClient.setQueryData(projectKeys.detail(PROJECT_ID), { Id: PROJECT_ID, header: { cssStyles: '' }, ...seed.project });
  harnessQueryClient.setQueryData(projectKeys.pages(PROJECT_ID), seed.pages ?? []);

  useElementStore.setState(useElementStore.getInitialState(), true);
  useElementStore.setState({ elements: [...seed.elements], activePage: { projectId: PROJECT_ID, pageId: PAGE_ID } });
  useSelectionStore.setState(useSelectionStore.getInitialState(), true);
  useCanvasViewportStore.setState(useCanvasViewportStore.getInitialState(), true);
  useEditorChromeStore.setState(useEditorChromeStore.getInitialState(), true);
  if (seed.selectedElementId) useSelectionStore.setState({ selectedElementId: seed.selectedElementId });
}
