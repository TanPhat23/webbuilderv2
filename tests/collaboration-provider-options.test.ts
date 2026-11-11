import { register } from 'node:module';

// Polyfill import.meta.env for test runner when loading files that reference Vite globals
const loaderCode = `
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.includes('src/utils/urlbuilder.ts')) {
    result.source = result.source.toString().replaceAll('import.meta.env', '(import.meta.env || {})');
  }
  return result;
}
`;
register('data:text/javascript,' + encodeURIComponent(loaderCode));

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

test('CustomYjsProviderV2 accepts injected getElementState without element store dependency', async () => {
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  type EditorElement = import('../src/types/global.type').EditorElement;

  const doc = new Y.Doc();
  const mockElement: EditorElement = {
    id: 'el-1',
    name: 'Test Element',
    type: 'Text',
    styles: { opacity: '1' },
    settings: { text: 'Hello' },
  } as unknown as EditorElement;

  let getterCalled = false;
  const mockState = {
    elements: [mockElement],
    loadElements: () => {},
    remoteAdd: () => {},
    remoteUpdate: () => {},
    remoteMove: () => {},
    remoteDelete: () => {},
  };

  const provider = new CustomYjsProviderV2({
    url: 'ws://localhost:1234',
    pageId: 'page-1',
    projectId: 'project-1',
    userId: 'user-1',
    getToken: async () => 'mock-token',
    doc,
    getElementState: () => {
      getterCalled = true;
      return mockState;
    },
  });

  try {
    assert.equal(provider.connected, false);
    assert.equal(provider.isSynced, false);

    const handler = (provider as unknown as { messageHandler: { handle: (env: unknown) => void } }).messageHandler;
    handler.handle({
      type: 'element:update',
      payload: {
        id: 'el-1',
        settings: { text: 'Updated' },
      },
    });

    assert.equal(getterCalled, true);
  } finally {
    provider.destroy();
    doc.destroy();
  }
});

test('provider rejects a missing element state adapter before starting a connection', async () => {
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  let provider: InstanceType<typeof CustomYjsProviderV2> | undefined;
  try {
    assert.throws(() => {
      provider = new CustomYjsProviderV2({
        url: 'ws://localhost:1234', pageId: 'p', projectId: 'p', userId: 'u',
        getToken: async () => null, doc,
      } as any);
    }, /getElementState/);
  } finally {
    provider?.destroy();
    doc.destroy();
  }
});
