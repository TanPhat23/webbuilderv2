import { strict as assert } from 'node:assert';
import { beforeEach, test } from 'node:test';
import {
  DEFAULT_CHROME,
  sanitizeChrome,
  useEditorChromeStore,
} from '../src/features/editor/store/editor-chrome-store';

const layout = () => {
  const { activePanel, panelOpen, inspectorOpen } = useEditorChromeStore.getState();
  return { activePanel, panelOpen, inspectorOpen };
};

beforeEach(() => useEditorChromeStore.setState({ ...DEFAULT_CHROME }));

test('starts at defaults before rehydration', () => {
  assert.deepEqual(layout(), DEFAULT_CHROME);
});

test('selecting another rail item switches and opens the panel', () => {
  useEditorChromeStore.setState({ panelOpen: false });
  useEditorChromeStore.getState().selectPanel('layers');
  assert.deepEqual(layout(), { ...DEFAULT_CHROME, activePanel: 'layers', panelOpen: true });
});

test('re-selecting the open item collapses it, and again re-opens it', () => {
  useEditorChromeStore.getState().selectPanel('insert');
  assert.equal(layout().panelOpen, false);
  useEditorChromeStore.getState().selectPanel('insert');
  assert.equal(layout().panelOpen, true);
});

test('togglePanel, toggleInspector and closePanel', () => {
  useEditorChromeStore.getState().togglePanel();
  useEditorChromeStore.getState().toggleInspector();
  assert.equal(layout().panelOpen, false);
  assert.equal(layout().inspectorOpen, false);
  useEditorChromeStore.getState().closePanel();
  assert.equal(layout().panelOpen, false);
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
