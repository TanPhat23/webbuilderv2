import { strict as assert } from 'node:assert';
import { beforeEach, test } from 'node:test';

// In-memory localStorage, installed before the store module loads.
const storage = new Map<string, string>();
(globalThis as { window?: unknown }).window = {
  localStorage: {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => void storage.set(k, v),
    removeItem: (k: string) => void storage.delete(k),
  },
};
storage.set(
  'editor-chrome',
  JSON.stringify({ state: { activePanel: 'cms', panelOpen: false, inspectorOpen: false }, version: 1 }),
);

const { DEFAULT_CHROME, sanitizeChrome, useEditorChromeStore } = await import(
  '../src/features/editor/store/editor-chrome-store'
);

const layout = () => {
  const { activePanel, panelOpen, inspectorOpen } = useEditorChromeStore.getState();
  return { activePanel, panelOpen, inspectorOpen };
};

test('renders defaults until rehydrated, then loads the stored layout', async () => {
  assert.equal(useEditorChromeStore.persist.hasHydrated(), false);
  assert.deepEqual(layout(), DEFAULT_CHROME);
  await useEditorChromeStore.persist.rehydrate();
  assert.deepEqual(layout(), { activePanel: 'cms', panelOpen: false, inspectorOpen: false });
});

test('a corrupt stored layout rehydrates to defaults', async () => {
  storage.set('editor-chrome', JSON.stringify({ state: { activePanel: 'tools', panelOpen: 'yes' }, version: 1 }));
  await useEditorChromeStore.persist.rehydrate();
  assert.deepEqual(layout(), DEFAULT_CHROME);
});

test('changes are written back to storage', () => {
  useEditorChromeStore.getState().selectPanel('layers');
  const saved = JSON.parse(storage.get('editor-chrome') ?? '{}');
  assert.equal(saved.state.activePanel, 'layers');
});

test('store transitions', async (t) => {
  beforeEach(() => useEditorChromeStore.setState({ ...DEFAULT_CHROME }));

  await t.test('selecting another rail item switches and opens the panel', () => {
    useEditorChromeStore.setState({ ...DEFAULT_CHROME, panelOpen: false });
    useEditorChromeStore.getState().selectPanel('layers');
    assert.deepEqual(layout(), { ...DEFAULT_CHROME, activePanel: 'layers', panelOpen: true });
  });

  await t.test('re-selecting the open item collapses it, and again re-opens it', () => {
    useEditorChromeStore.setState({ ...DEFAULT_CHROME });
    useEditorChromeStore.getState().selectPanel('insert');
    assert.equal(layout().panelOpen, false);
    useEditorChromeStore.getState().selectPanel('insert');
    assert.equal(layout().panelOpen, true);
  });

  await t.test('togglePanel, toggleInspector and closePanel', () => {
    useEditorChromeStore.setState({ ...DEFAULT_CHROME });
    useEditorChromeStore.getState().togglePanel();
    useEditorChromeStore.getState().toggleInspector();
    assert.equal(layout().panelOpen, false);
    assert.equal(layout().inspectorOpen, false);
    useEditorChromeStore.getState().closePanel();
    assert.equal(layout().panelOpen, false);
  });
});

test('sanitizeChrome falls back to defaults for stale or corrupt values', () => {
  assert.deepEqual(sanitizeChrome(null), DEFAULT_CHROME);
  assert.deepEqual(sanitizeChrome('x'), DEFAULT_CHROME);
  assert.deepEqual(sanitizeChrome({ activePanel: 'tools', panelOpen: 'yes' }), DEFAULT_CHROME);
});

test('sanitizeChrome keeps valid fields', () => {
  assert.deepEqual(
    sanitizeChrome({ activePanel: 'cms', panelOpen: false, inspectorOpen: false }),
    { activePanel: 'cms', panelOpen: false, inspectorOpen: false },
  );
});

test('a saved legacy workflows panel falls back to the insert panel', () => {
  assert.equal(sanitizeChrome({ activePanel: 'workflows' }).activePanel, DEFAULT_CHROME.activePanel);
});
