import React from 'react';
import { createRoot } from 'react-dom/client';
import { InteractionHost } from '../../src/features/interactions/components/InteractionHost';
import PreviewInputComponent from '../../src/features/preview/components/PreviewInputComponent';
import PreviewElementLoader from '../../src/features/preview/components/PreviewElementLoader';
import { browserPlatform, createExecutors } from '../../src/features/interactions/runtime/executors';
import '../../src/features/interactions/runtime/animations.css';

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
function App() {
  return <InteractionHost elements={elements} enabled namespace="final-test" platform={platform}>
    <form id="form" data-element-id="form"><PreviewInputComponent element={input} /><PreviewElementLoader elements={[textarea, select]} /><button id="submit">Submit</button></form>
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
