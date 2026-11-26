import React from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import LogicPanel from '../../apps/editor/src/features/interactions/components/LogicPanel';
import { useLogicStore } from '../../apps/editor/src/features/interactions/logic-store';
import '../../apps/editor/src/app/globals.css';

const project = { v: 1 as const, variables: { count: { type: 'number' as const, default: 0 } }, flows: { welcome: { do: [{ set: 'count', to: '{{ vars.count + 1 }}' }] } } };
useLogicStore.setState({ projectId: 'test-project', project, pages: {}, past: [], future: [] });
const root = createRootRoute();
const page = createRoute({ getParentRoute: () => root, path: '/project/$id', component: LogicPanel });
const router = createRouter({ routeTree: root.addChildren([page]), history: createMemoryHistory({ initialEntries: ['/project/test-project?page=home'] }) });
createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
