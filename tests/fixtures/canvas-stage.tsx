import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet, RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import CanvasStage from '../../apps/editor/src/features/editor/components/canvas/CanvasStage';
import { EditorContext, type EditorContextType } from '../../apps/editor/src/features/editor/context/EditorContext';
import AIChatProvider from '../../apps/editor/src/providers/aiprovider';
import { useElementStore } from '../../apps/editor/src/features/editor/store/element-store';
import { useSelectionStore } from '../../apps/editor/src/features/editor/store/selection-store';
import { useCanvasViewportStore } from '../../apps/editor/src/features/editor/store/canvas-viewport-store';
import { projectKeys } from '../../apps/editor/src/features/projects/hooks/useProjects';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';
import '../../apps/editor/src/app/globals.css';

const PROJECT_ID = 'proj-1';
const PAGE_ID = 'page-1';
const params = new URLSearchParams(location.search);
const stageWidth = Number(params.get('w') ?? 800);
const stageHeight = Number(params.get('h') ?? 700);

const base = { content: '', pageId: PAGE_ID, settings: null } as const;
const text = (id: string, content: string): EditorElement => ({
  ...base,
  id,
  type: 'Text',
  content,
  parentId: 'frame',
  styles: {
    default: { color: 'rgb(255, 0, 0)', padding: '16px', margin: '0px', fontSize: '24px' },
    md: { color: 'rgb(0, 0, 255)' },
  },
}) as unknown as EditorElement;

/** Section > grid Frame > two Text children; the grid goes two-column and the text blue from md up. */
const elements: EditorElement[] = [
  {
    ...base,
    id: 'section',
    type: 'Section',
    styles: { default: { padding: '24px', width: '100%' } },
    elements: [
      {
        ...base,
        id: 'frame',
        type: 'Frame',
        parentId: 'section',
        styles: {
          default: { display: 'grid', gridTemplateColumns: '1fr', gap: '12px', width: '100%' },
          md: { gridTemplateColumns: '1fr 1fr' },
        },
        elements: [text('text-1', 'First text'), text('text-2', 'Second text')],
      },
    ],
  } as unknown as EditorElement,
];

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity, refetchOnMount: false, refetchOnWindowFocus: false } },
});
queryClient.setQueryData(projectKeys.detail(PROJECT_ID), { Id: PROJECT_ID, header: { cssStyles: '#frame-marker{outline:1px solid red}' } });
queryClient.setQueryData(projectKeys.pages(PROJECT_ID), []);

const editorValue: EditorContextType = {
  projectId: PROJECT_ID,
  userId: 'user-1',
  editor: {
    currentView: 'desktop',
    setCurrentView() {},
    isLoading: false,
    selectedElement: undefined,
    addNewSection() {},
    isReadOnly: false,
    isLocked: false,
    permissions: { canCreateElements: true, canEditElements: true, canDeleteElements: true, canReorderElements: true },
  },
  mode: 'editor',
  setMode() {},
  editingMode: 'visual',
  setEditingMode() {},
  pageId: PAGE_ID,
};

function Harness(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <EditorContext.Provider value={editorValue}>
        <AIChatProvider>
          <div data-testid="stage-host" style={{ width: stageWidth, height: stageHeight, position: 'relative' }}>
            <CanvasStage />
          </div>
          <output data-testid="selected">{useSelectionStoreId()}</output>
        </AIChatProvider>
      </EditorContext.Provider>
    </QueryClientProvider>
  );
}

function useSelectionStoreId(): string {
  return useSelectionStore((s) => s.selectedElementId) ?? '';
}

const rootRoute = createRootRoute({ component: Outlet });
const editorRoute = createRoute({ getParentRoute: () => rootRoute, path: '/editor/$id', component: Harness });
const router = createRouter({
  routeTree: rootRoute.addChildren([editorRoute]),
  history: createMemoryHistory({ initialEntries: ['/editor/' + PROJECT_ID + '?page=' + PAGE_ID] }),
});

useElementStore.setState({ elements, activePage: { projectId: PROJECT_ID, pageId: PAGE_ID } });
(window as unknown as Record<string, unknown>).__canvas = { elementStore: useElementStore, selection: useSelectionStore, viewport: useCanvasViewportStore };
await router.load();
createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
