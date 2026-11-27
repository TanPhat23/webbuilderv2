import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import { redirectModules } from './support/test-stub-modules';
import { $q, act, cleanup, React, render } from './support/sidebar-dom-harness';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
});

const { default: AIChatProvider } = await import('../apps/editor/src/providers/aiprovider');
const { useAiChat } = await import('../apps/editor/src/features/ai/context/AiChatContext');
const { useAskAiOptions } = await import('../apps/editor/src/features/editor/context/AskAiOptionsContext');
const { default: AiChatPanel } = await import('../apps/editor/src/features/ai/components/AiChatPanel');
const { ELEMENT_STARTER_ACTIONS } = await import('../apps/editor/src/features/ai/utils/aiChatUtils');
const { EditorContext } = await import('../apps/editor/src/features/editor/context/EditorContext');
const { ElementStore } = await import('../apps/editor/src/features/editor/store/element-store');
const { SelectionStore } = await import('../apps/editor/src/features/editor/store/selection-store');
const { editorValue, withEditor } = await import('./support/sidebar-fixtures');
const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');

const h = React.createElement;
type AiChat = ReturnType<typeof useAiChat>;

let chat: AiChat | undefined;
function Probe(): null {
  chat = useAiChat();
  return null;
}

const title = {
  id: 'text-1', type: 'Text', name: 'Title', content: 'Hello', pageId: 'page-1', styles: {}, tailwindStyles: '',
} as unknown as EditorElement;

const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } });

const mountPanel = () =>
  render(
    h(
      QueryClientProvider,
      { client: queryClient },
      withEditor(editorValue(), h(AIChatProvider, null, h(Probe), h(AiChatPanel)), EditorContext),
    ),
  );

const composer = (): HTMLTextAreaElement => $q<HTMLTextAreaElement>(document.body, '[aria-label="Prompt message"]');
const actions = (): AiChat => {
  assert.ok(chat, 'probe mounted');
  return chat;
};

beforeEach(async () => {
  await cleanup();
  chat = undefined;
  ElementStore.getState().beginPage('proj-1', 'page-1', false);
  ElementStore.getState().setElements([title], true);
  SelectionStore.getState().setSelectedElement(title);
});

afterEach(async () => {
  await cleanup();
  SelectionStore.getState().clearSelection();
});

after(() => queryClient.clear());

test('the provider exposes the Ask AI menu options, which queue a prompt through askAi', async () => {
  let options: ReturnType<typeof useAskAiOptions>;
  function Reader(): null {
    chat = useAiChat();
    options = useAskAiOptions();
    return null;
  }
  await render(h(AIChatProvider, null, h(Reader)));
  const ids = options?.map((o) => o.id);
  assert.deepEqual(ids, [...ELEMENT_STARTER_ACTIONS.map((s) => s.id), 'custom']);
  await act(() => options?.find((o) => o.id === 'make-responsive')?.run(title));
  assert.equal(actions().chatOpen, true);
  assert.equal(actions().pendingRequest?.scope, 'element');
  assert.match(actions().pendingRequest?.prompt ?? '', /"Title"/);
  await act(() => options?.find((o) => o.id === 'custom')?.run(title));
  assert.equal(actions().pendingRequest?.prompt, '');
});

test('askAi opens the chat and stores one pending request with a fresh nonce each time', async () => {
  function Reader(): null {
    chat = useAiChat();
    return null;
  }
  await render(h(AIChatProvider, null, h(Reader)));
  assert.equal(actions().chatOpen, false);
  assert.equal(actions().pendingRequest, undefined);
  await act(() => actions().askAi({ prompt: 'Do it', scope: 'element' }));
  const first = actions().pendingRequest;
  assert.equal(actions().chatOpen, true);
  assert.equal(first?.prompt, 'Do it');
  assert.equal(first?.scope, 'element');
  await act(() => actions().askAi({ prompt: 'Do it', scope: 'element' }));
  assert.notEqual(actions().pendingRequest?.nonce, first?.nonce, 'the same request twice is a new request');
});

test('AiChatPanel applies a pending request once: draft and scope set, focused, cleared, never sent', async () => {
  await mountPanel();
  assert.equal(composer().value, '');
  await act(() => actions().askAi({ prompt: 'Polish the title', scope: 'theme' }));

  assert.equal(composer().value, 'Polish the title');
  assert.match(composer().placeholder, /colors, fonts/, 'scope switched to theme');
  assert.equal(document.activeElement, composer(), 'composer is focused');
  assert.equal(actions().pendingRequest, undefined, 'request consumed');
  const leaves = Array.from(document.body.querySelectorAll('*')).filter((n) => n.tagName !== 'TEXTAREA' && n.children.length === 0);
  assert.ok(!leaves.some((n) => (n.textContent ?? '').includes('Polish the title')), 'nothing was sent into the thread');

  // Consumed once: later edits and re-renders never re-apply it.
  await act(() => {
    const textarea = composer();
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(textarea, 'my own words');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.equal(composer().value, 'my own words');
  await act(() => actions().openChat());
  assert.equal(composer().value, 'my own words');

  // The same request again still applies (unique nonce).
  await act(() => actions().askAi({ prompt: 'Polish the title', scope: 'theme' }));
  assert.equal(composer().value, 'Polish the title');
});

test('AiChatPanel applies a request that was stored before it mounted', async () => {
  function Late(): React.ReactElement | null {
    const ai = useAiChat();
    const [mounted, setMounted] = React.useState(false);
    chat = ai;
    return h(
      React.Fragment,
      null,
      h('button', { id: 'mount', onClick: () => setMounted(true) }),
      mounted ? h(AiChatPanel) : null,
    );
  }
  await render(
    h(QueryClientProvider, { client: queryClient }, withEditor(editorValue(), h(AIChatProvider, null, h(Late)), EditorContext)),
  );
  await act(() => actions().askAi({ prompt: 'Early ask', scope: 'element' }));
  await act(() => $q(document.body, '#mount').click());
  assert.equal(composer().value, 'Early ask');
  assert.match(composer().placeholder, /Edit "Title"/, 'element scope uses the selected element');
  assert.equal(actions().pendingRequest, undefined);
});
