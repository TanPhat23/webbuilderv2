import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import { redirectModules } from './support/test-stub-modules';
import { $q, act, cleanup, React, render, win } from './support/sidebar-dom-harness';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
});

const { EditorContextMenu } = await import('../apps/editor/src/features/editor/components/EditorContextMenu');
const { EditorContext } = await import('../apps/editor/src/features/editor/context/EditorContext');
const { AskAiOptionsContext } = await import('../apps/editor/src/features/editor/context/AskAiOptionsContext');
const { buildAskAiOptions } = await import('../apps/editor/src/features/ai/utils/askAiOptions');
const { ELEMENT_STARTER_ACTIONS } = await import('../apps/editor/src/features/ai/utils/aiChatUtils');
const { buildAgentReference } = await import('../apps/editor/src/features/editor/lib/agentReference');
const { useEditorShortcuts } = await import('../apps/editor/src/features/editor/hooks/useEditorShortcuts');
const { ElementStore } = await import('../apps/editor/src/features/editor/store/element-store');
const { SelectionStore } = await import('../apps/editor/src/features/editor/store/selection-store');
const { editorValue, withEditor } = await import('./support/sidebar-fixtures');
const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');

const h = React.createElement;
type AskAiOptions = NonNullable<React.ContextType<typeof AskAiOptionsContext>>;

const section = {
  id: 'section-1', type: 'Section', name: 'Hero', content: '', pageId: 'page-1', styles: {}, tailwindStyles: '',
  elements: [] as EditorElement[],
} as unknown as EditorElement;
const title = {
  id: 'text-1', type: 'Text', name: 'Title', content: 'Hello', pageId: 'page-1', parentId: 'section-1',
  styles: {}, tailwindStyles: 'text-xl',
} as unknown as EditorElement;
(section as unknown as { elements: EditorElement[] }).elements = [title];

const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } });

interface AskCall { prompt: string; scope: string }
function aiValue(calls: AskCall[]): AskAiOptions {
  return buildAskAiOptions((request) => void calls.push({ prompt: request.prompt, scope: request.scope }));
}

async function mountMenu(options: { readOnly?: boolean; ai?: AskAiOptions } = {}) {
  const menu = h(EditorContextMenu, { isReadOnly: options.readOnly ?? false, children: h('div', { id: 'menu-target' }, 'target') });
  const inner = options.ai ? h(AskAiOptionsContext.Provider, { value: options.ai }, menu) : menu;
  const r = await render(h(QueryClientProvider, { client: queryClient }, withEditor(editorValue({ isReadOnly: options.readOnly ?? false }), inner, EditorContext)));
  await act(() => {
    $q(r.container, '#menu-target').dispatchEvent(new win.MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 5, clientY: 5 }));
  });
  return r;
}

const action = (name: string): HTMLElement | null => document.querySelector<HTMLElement>('[data-action="' + name + '"]');
const needAction = (name: string): HTMLElement => {
  const el = action(name);
  assert.ok(el, 'data-action=' + name);
  return el;
};
const isDisabled = (el: HTMLElement): boolean => el.hasAttribute('data-disabled') || el.getAttribute('aria-disabled') === 'true';

async function choose(el: HTMLElement): Promise<void> {
  await act(() => {
    el.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  });
}

let clipboardWrites: string[] = [];
let clipboardFails = false;
beforeEach(async () => {
  await cleanup();
  clipboardWrites = [];
  clipboardFails = false;
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async (text: string) => {
        if (clipboardFails) throw new Error('denied');
        clipboardWrites.push(text);
      },
    },
  });
  ElementStore.getState().beginPage('proj-1', 'page-1', false);
  ElementStore.getState().setElements([section], true);
  SelectionStore.getState().setSelectedElement(title);
});

afterEach(async () => {
  await cleanup();
  SelectionStore.getState().clearSelection();
});

after(() => queryClient.clear());

test('every menu item carries a stable data-action and shortcut items an aria-keyshortcuts', async () => {
  await mountMenu({ ai: aiValue([]) });
  for (const name of ['copy', 'cut', 'paste', 'bring-to-front', 'send-to-back', 'ask-ai', 'copy-for-agent', 'create-component', 'save-to-library', 'delete']) {
    assert.equal(needAction(name).getAttribute('role'), 'menuitem', name);
  }
  assert.equal(needAction('ask-ai').getAttribute('aria-haspopup'), 'menu');
  assert.equal(needAction('copy').getAttribute('aria-keyshortcuts'), 'Control+C');
  assert.equal(needAction('cut').getAttribute('aria-keyshortcuts'), 'Control+X');
  assert.equal(needAction('paste').getAttribute('aria-keyshortcuts'), 'Control+V');
  assert.equal(needAction('delete').getAttribute('aria-keyshortcuts'), 'Delete');
  assert.equal(needAction('bring-to-front').hasAttribute('aria-keyshortcuts'), false);
  assert.equal($q(document.body, '[role="menu"]').getAttribute('aria-label'), 'Actions for Title');
});

test('the menu label falls back to the element type when it has no name', async () => {
  SelectionStore.getState().setSelectedElement({ ...title, name: undefined } as unknown as EditorElement);
  ElementStore.getState().setElements([{ ...section, elements: [{ ...title, name: undefined }] } as unknown as EditorElement], true);
  await mountMenu({ ai: aiValue([]) });
  assert.equal($q(document.body, '[role="menu"]').getAttribute('aria-label'), 'Actions for Text');
});

test('Ask AI lists the element starters plus a custom question and hands the prompt and scope to askAi', async () => {
  const calls: AskCall[] = [];
  await mountMenu({ ai: aiValue(calls) });
  await act(() => { needAction('ask-ai').dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true })); });
  for (const starter of ELEMENT_STARTER_ACTIONS) {
    const item = needAction('ask-ai-' + starter.id);
    assert.ok((item.textContent ?? '').includes(starter.label));
  }
  needAction('ask-ai-custom');

  await choose(needAction('ask-ai-make-responsive'));
  const starter = ELEMENT_STARTER_ACTIONS.find((s) => s.id === 'make-responsive');
  assert.ok(starter);
  assert.deepEqual(calls, [{
    prompt: starter.buildPrompt({ id: 'text-1', type: 'Text', name: 'Title', content: 'Hello', tailwindStyles: 'text-xl' }),
    scope: 'element',
  }]);
  assert.match(calls[0]?.prompt ?? '', /"Title"/);
});

test('"Ask about this element…" sends an empty prompt with element scope', async () => {
  const calls: AskCall[] = [];
  await mountMenu({ ai: aiValue(calls) });
  await act(() => { needAction('ask-ai').dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true })); });
  await choose(needAction('ask-ai-custom'));
  assert.deepEqual(calls, [{ prompt: '', scope: 'element' }]);
});

test('read-only: Ask AI and the edit actions are disabled but Copy for AI agent and Copy stay enabled', async () => {
  await mountMenu({ readOnly: true, ai: aiValue([]) });
  assert.equal(isDisabled(needAction('ask-ai')), true);
  assert.equal(isDisabled(needAction('cut')), true);
  assert.equal(isDisabled(needAction('delete')), true);
  assert.equal(isDisabled(needAction('copy-for-agent')), false);
  assert.equal(isDisabled(needAction('copy')), false);
});

test('editable: Ask AI is enabled', async () => {
  await mountMenu({ ai: aiValue([]) });
  assert.equal(isDisabled(needAction('ask-ai')), false);
});

test('without an AI provider the Ask AI submenu is hidden and Copy for AI agent remains', async () => {
  await mountMenu();
  assert.equal(action('ask-ai'), null);
  assert.equal(action('copy-for-agent') !== null, true);
});

test('Copy for AI agent writes the Markdown reference of the selected element to the clipboard', async () => {
  await mountMenu({ readOnly: true, ai: aiValue([]) });
  await choose(needAction('copy-for-agent'));
  await act(async () => { await Promise.resolve(); });
  assert.deepEqual(clipboardWrites, [buildAgentReference(title, ElementStore.getState().elements)]);
  assert.match(clipboardWrites[0] ?? '', /- Path: Section "Hero" › Text "Title"/);
});

test('Copy for AI agent survives a clipboard failure', async () => {
  clipboardFails = true;
  await mountMenu({ ai: aiValue([]) });
  await choose(needAction('copy-for-agent'));
  await act(async () => { await Promise.resolve(); });
  assert.deepEqual(clipboardWrites, []);
});

// ---- Shift+F10 / ContextMenu key -----------------------------------------------------

function Shortcuts(): null {
  const stageRef = React.useRef<HTMLElement | null>(null);
  useEditorShortcuts({ stageRef, mountNode: null, isReadOnly: false, isLocked: false });
  return null;
}

function addElementNode(): { node: HTMLElement; events: MouseEvent[] } {
  const node = document.createElement('div');
  node.setAttribute('data-element-id', 'text-1');
  node.getBoundingClientRect = () => ({ left: 10, top: 20, width: 100, height: 40, right: 110, bottom: 60, x: 10, y: 20, toJSON() {} }) as DOMRect;
  document.body.appendChild(node);
  const events: MouseEvent[] = [];
  node.addEventListener('contextmenu', (e) => events.push(e as MouseEvent));
  return { node, events };
}

function press(target: EventTarget, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

test('Shift+F10 and the ContextMenu key open the menu at the centre of the selected element', async () => {
  const { node, events } = addElementNode();
  await render(h(Shortcuts));

  let event!: KeyboardEvent;
  await act(() => { event = press(document.body, 'F10', { shiftKey: true }); });
  assert.equal(events.length, 1);
  assert.equal(events[0]?.type, 'contextmenu');
  assert.equal(events[0]?.clientX, 60);
  assert.equal(events[0]?.clientY, 40);
  assert.equal(events[0]?.bubbles, true);
  assert.equal(event.defaultPrevented, true, 'native menu is suppressed');

  await act(() => { event = press(document.body, 'ContextMenu'); });
  assert.equal(events.length, 2);
  assert.equal(event.defaultPrevented, true);
  node.remove();
});

test('Shift+F10 is ignored without a selection, inside inputs, while editing and for plain F10', async () => {
  const { node, events } = addElementNode();
  await render(h(Shortcuts));

  SelectionStore.getState().clearSelection();
  await act(() => { press(document.body, 'F10', { shiftKey: true }); });
  assert.equal(events.length, 0, 'nothing selected');

  SelectionStore.getState().setSelectedElement(title);
  const input = document.createElement('input');
  document.body.appendChild(input);
  let event!: KeyboardEvent;
  await act(() => { event = press(input, 'F10', { shiftKey: true }); });
  assert.equal(events.length, 0, 'typing in a field');
  assert.equal(event.defaultPrevented, false, 'native behaviour untouched');
  await act(() => { press(input, 'ContextMenu'); });
  assert.equal(events.length, 0);

  SelectionStore.getState().setEditingElementId('text-1');
  await act(() => { press(document.body, 'F10', { shiftKey: true }); });
  assert.equal(events.length, 0, 'inline text editing');
  SelectionStore.getState().setEditingElementId(undefined);

  await act(() => { press(document.body, 'F10'); });
  assert.equal(events.length, 0, 'plain F10');

  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  document.body.appendChild(dialog);
  await act(() => { press(dialog, 'F10', { shiftKey: true }); });
  assert.equal(events.length, 0, 'inside a dialog');

  await act(() => { press(document.body, 'F10', { shiftKey: true }); });
  assert.equal(events.length, 1, 'control: the same key works on the canvas');
  node.remove(); input.remove(); dialog.remove();
});
