import React from 'react';
import { createRoot } from 'react-dom/client';
import { InteractionHost } from '@webbuilder/site-runtime/interactions/components/InteractionHost';
import PreviewElementLoader from '@webbuilder/site-runtime/preview/PreviewElementLoader';
import { browserPlatform, createExecutors } from '@webbuilder/site-runtime/interactions/runtime/executors';
import { ComponentInstanceCanvas, ResolvedInstancesContext } from '../../apps/editor/src/features/editor/components/ComponentInstanceCanvas';
import { EditorFlagsProvider } from '../../apps/editor/src/features/editor/components/context/EditorFlagsContext';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';
import { useScrollReveal } from '@webbuilder/site-runtime/preview/useScrollReveal';
import '../../apps/editor/src/features/interactions/runtime/animations.css';

const input = { id: 'email', type: 'Input', content: '', settings: { name: 'email', type: 'email' }, styles: {}, elements: [] } as any;
const textarea = { id: 'message', type: 'Textarea', settings: { name: 'message', defaultValue: 'Hello' }, styles: {}, elements: [] } as any;
const select = { id: 'topic', type: 'Select', settings: { name: 'topic', defaultValue: 'billing', selectOptions: [{ id: '1', label: 'Billing', value: 'billing' }, { id: '2', label: 'Other', value: 'other' }] }, styles: {}, elements: [] } as any;
const elements = [{ id: 'form', settings: { interactions: { ix_aaaaaaaa: { on: 'submit', do: [{ call: 'api', method: 'POST', url: '/submit', body: '{{ form }}' }] } } }, elements: [input, textarea, select, { id: 'box', settings: {}, elements: [] }] }] as any;
const platform = (doc: Document, host: Element, allowed: (id: string) => boolean) => ({
  ...browserPlatform(doc, host, allowed),
  fetch: async (_url: string, init: any) => {
    (window as any).requestBody = JSON.parse(init.body);
    return { ok: true, status: 200, text: async () => '' };
  },
});
const lateElement = { id: 'late', pageId: 'test', type: 'Code', content: 'Lazy content' } as const;
const resolvedInstances = new Map<string, EditorElement>([[lateElement.id, lateElement]]);
function App() {
  const [showLate, setShowLate] = React.useState(false);
  useScrollReveal([{ id: 'late', effect: 'fade', delay: 0 }], true);
  return <InteractionHost elements={elements} enabled namespace="final-test" platform={platform}>
    <form id="form" data-element-id="form"><PreviewElementLoader elements={[input, textarea, select]} /><button id="submit">Submit</button></form>
    <button id="mount-lazy" onClick={() => setShowLate(true)}>Mount code</button>
    {showLate && (
      <EditorFlagsProvider isReadOnly={false} isLocked={false} permissionsRole={null} canEdit canCreate>
        <ResolvedInstancesContext.Provider value={resolvedInstances}>
          <ComponentInstanceCanvas element={lateElement} />
          <ComponentInstanceCanvas element={{ ...lateElement, id: 'missing' }} />
        </ResolvedInstancesContext.Provider>
      </EditorFlagsProvider>
    )}
    <div id="box" data-element-id="box">Box</div>
  </InteractionHost>;
}
(window as any).runAnimation = (preset: string) => {
  const box = document.getElementById('box')!;
  const p = browserPlatform(document, box, (id) => id === 'box');
  createExecutors(p).animate!({ animate: 'box', preset, duration: 2000 } as any, { value: (v: string) => v, ctx: {} } as any);
  const style = getComputedStyle(box);
  return { name: style.animationName, duration: style.animationDuration };
};
createRoot(document.getElementById('root')!).render(<App />);
