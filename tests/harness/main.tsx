import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Outlet, RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { EditorContext, type EditorContextType } from '../../apps/editor/src/features/editor/context/EditorContext';
import AIChatProvider from '../../apps/editor/src/providers/aiprovider';
import { useElementStore } from '../../apps/editor/src/features/editor/store/element-store';
import { useSelectionStore } from '../../apps/editor/src/features/editor/store/selection-store';
import { useCanvasViewportStore } from '../../apps/editor/src/features/editor/store/canvas-viewport-store';
import '../../apps/editor/src/app/globals.css';
import { installNetworkGuard } from './guard';
import { PAGE_ID, PROJECT_ID, USER_ID, harnessQueryClient } from './seed';
import { findScenario, scenarios } from './scenarios';
import type { Scenario } from './scenario';
import './api';

installNetworkGuard();

const editorValue: EditorContextType = {
  projectId: PROJECT_ID,
  userId: USER_ID,
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

function ScenarioIndex(): React.ReactElement {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Editor component harness</h1>
      <ul>
        {scenarios.map((s) => (
          <li key={s.name}><a href={`?scenario=${encodeURIComponent(s.name)}`}>{s.name}</a> - {s.description}</li>
        ))}
      </ul>
    </main>
  );
}

function ScenarioShell({ scenario }: { scenario: Scenario }): React.ReactElement {
  return (
    <QueryClientProvider client={harnessQueryClient}>
      <EditorContext.Provider value={editorValue}>
        <AIChatProvider>{scenario.render()}</AIChatProvider>
      </EditorContext.Provider>
    </QueryClientProvider>
  );
}

async function mount(scenario: Scenario): Promise<React.ReactElement> {
  const rootRoute = createRootRoute({ component: Outlet });
  const editorRoute = createRoute({ getParentRoute: () => rootRoute, path: '/editor/$id', component: () => <ScenarioShell scenario={scenario} /> });
  const router = createRouter({
    routeTree: rootRoute.addChildren([editorRoute]),
    history: createMemoryHistory({ initialEntries: [`/editor/${PROJECT_ID}?page=${PAGE_ID}`] }),
  });
  await router.load();
  return <RouterProvider router={router} />;
}

const root = createRoot(document.getElementById('root')!);
const requested = new URLSearchParams(location.search).get('scenario');
const scenario = findScenario(requested);

if (!scenario) {
  if (requested) console.error(`harness: unknown scenario "${requested}"`);
  root.render(<ScenarioIndex />);
} else {
  scenario.seed();
  window.__harness = {
    scenario: scenario.name,
    getElements: () => useElementStore.getState().elements,
    getSelection: () => {
      const { selectedElementId, editingElementId, hoveredElementId } = useSelectionStore.getState();
      return { selectedElementId, editingElementId, hoveredElementId };
    },
    reset: () => scenario.seed(),
    stores: { elements: useElementStore, selection: useSelectionStore, viewport: useCanvasViewportStore },
  };
  root.render(await mount(scenario));
}
