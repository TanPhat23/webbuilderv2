import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stubResolved } from './support/editor-logic-resolve-stubs';

stubResolved({
  'pkg:prettier/standalone': './editor-logic-prettier-stub.ts',
  'pkg:prettier/parser-babel': './editor-logic-prettier-stub.ts',
});

const { DEFAULT_EDITOR_VALUE, MONACO_COMPILER_OPTIONS, MONACO_EXTERNAL_LIBS } = await import('../src/features/editor/lib/monaco/constants');
const { contentChange } = await import('../src/features/editor/lib/monaco/content-change');
const { registerPrettierFormatter } = await import('../src/features/editor/lib/monaco/format');
const { loadMonacoTypes } = await import('../src/features/editor/lib/monaco/types');
const prettierStub = await import('./support/editor-logic-prettier-stub');

test('monaco constants describe a React/TSX project with matching external typings', () => {
  assert.match(DEFAULT_EDITOR_VALUE, /export function Hello/);
  assert.equal(MONACO_COMPILER_OPTIONS.jsx, 1);
  assert.deepEqual(MONACO_COMPILER_OPTIONS.types, ['react', 'react-dom']);
  assert.ok(MONACO_EXTERNAL_LIBS.length >= 3);
  for (const lib of MONACO_EXTERNAL_LIBS) {
    assert.match(lib.url, /^https:\/\/unpkg\.com\//);
    assert.match(lib.path, /^file:\/\/\/node_modules\//);
  }
});

// --- contentChange ----------------------------------------------------------

function fakeEditor(line: string, column: number, opts: { model?: boolean; position?: boolean } = {}) {
  const edits: Array<{ source: string; ops: Array<{ text: string; range: Record<string, number> }> }> = [];
  const editor = {
    getModel: () => (opts.model === false ? null : { getLineContent: () => line }),
    getPosition: () => (opts.position === false ? null : { lineNumber: 3, column }),
    executeEdits: (source: string, ops: never[]) => void edits.push({ source, ops }),
  };
  return { editor: editor as never, edits };
}
const change = (...texts: string[]) => ({ changes: texts.map((text) => ({ text })) }) as never;

test('typing ">" after an opening tag inserts the closing tag at the cursor', () => {
  const { editor, edits } = fakeEditor('  <div className="a">', 22);
  contentChange(change('x', '>'), editor);
  assert.equal(edits.length, 1);
  assert.equal(edits[0].source, 'auto-close-tag');
  assert.equal(edits[0].ops[0].text, '</div>');
  assert.deepEqual(edits[0].ops[0].range, { startLineNumber: 3, startColumn: 22, endLineNumber: 3, endColumn: 22 });
});

test('auto-close skips self-closing void tags, "/>" endings and non-tag text', () => {
  for (const [line, col] of [['<img src="x">', 14], ['<BR>', 5], ['<input>', 8]] as const) {
    const { editor, edits } = fakeEditor(line, col);
    contentChange(change('>'), editor);
    assert.equal(edits.length, 0, line);
  }
  const selfClosed = fakeEditor('<Foo />', 8);
  contentChange(change('>'), selfClosed.editor);
  assert.equal(selfClosed.edits.length, 0);
  const arrow = fakeEditor('const f = () =>', 16);
  contentChange(change('>'), arrow.editor);
  assert.equal(arrow.edits.length, 0);
});

test('auto-close ignores other edits and missing model or cursor', () => {
  const plain = fakeEditor('<div>', 6);
  contentChange(change('a'), plain.editor);
  contentChange({ changes: [] } as never, plain.editor);
  assert.equal(plain.edits.length, 0);
  for (const opts of [{ model: false }, { position: false }]) {
    const { editor, edits } = fakeEditor('<div>', 6, opts);
    contentChange(change('>'), editor);
    assert.equal(edits.length, 0);
  }
});

// --- registerPrettierFormatter ---------------------------------------------

type Provider = { provideDocumentFormattingEdits(model: unknown): Promise<Array<{ range: unknown; text: string }>> };
function registerProviders() {
  const providers = new Map<string, Provider>();
  const monaco = { languages: { registerDocumentFormattingEditProvider: (lang: string, p: Provider) => void providers.set(lang, p) } };
  registerPrettierFormatter(monaco as never);
  return providers;
}
const model = (text: string) => ({ getValue: () => text, getFullModelRange: () => ({ full: true }) });
const quiet = async <T>(fn: () => Promise<T>): Promise<T> => {
  const saved = { log: console.log, warn: console.warn, error: console.error };
  console.log = console.warn = console.error = () => {};
  try { return await fn(); } finally { Object.assign(console, saved); }
};

test('a formatter is registered for each JS-like language', () => {
  assert.deepEqual([...registerProviders().keys()], ['typescript', 'javascript', 'jsx', 'tsx']);
});

test('prettier output replaces the document when it differs', async () => {
  prettierStub.state.mode = 'ok';
  const provider = registerProviders().get('tsx')!;
  const edits = await quiet(() => provider.provideDocumentFormattingEdits(model('a  =  1')));
  assert.deepEqual(edits, [{ range: { full: true }, text: 'formatted: a  =  1' }]);
  assert.deepEqual(prettierStub.state.lastOptions, { parser: 'babel', plugins: [prettierStub.parser], semi: true, singleQuote: false, trailingComma: 'es5' });
});

test('no edits are returned when prettier leaves the text unchanged', async () => {
  prettierStub.state.mode = 'identity';
  const edits = await quiet(() => registerProviders().get('jsx')!.provideDocumentFormattingEdits(model('same')));
  assert.deepEqual(edits, []);
});

test('falls back to the manual formatter when prettier throws or has no format()', async () => {
  const messy = 'function a() {\r\n      return foo(\r\n1);\r\n\r\n}\r\n';
  const manual = 'function a() {\n  return foo(\n    1);\n\n}\n';
  for (const mode of ['throws', 'no-format'] as const) {
    prettierStub.state.mode = mode;
    const edits = await quiet(() => registerProviders().get('typescript')!.provideDocumentFormattingEdits(model(messy)));
    assert.equal(edits.length, 1, mode);
    assert.equal(edits[0].text, manual, mode);
  }
  prettierStub.state.mode = 'throws';
  const already = await quiet(() => registerProviders().get('typescript')!.provideDocumentFormattingEdits(model(manual)));
  assert.deepEqual(already, [], 'already-formatted code needs no edit');
  const nonError = await quiet(() => registerProviders().get('typescript')!.provideDocumentFormattingEdits(model('x')));
  assert.deepEqual(nonError, []);
});

test('a failing model yields no edits instead of throwing', async () => {
  const broken = { getValue: () => { throw 'boom'; }, getFullModelRange: () => ({}) };
  const edits = await quiet(() => registerProviders().get('javascript')!.provideDocumentFormattingEdits(broken));
  assert.deepEqual(edits, []);
  const errored = { getValue: () => { throw new Error('bad model'); }, getFullModelRange: () => ({}) };
  assert.deepEqual(await quiet(() => registerProviders().get('javascript')!.provideDocumentFormattingEdits(errored)), []);
});

// --- loadMonacoTypes --------------------------------------------------------

test('loadMonacoTypes registers fetched libs, skips failures and adds the UI stubs', async () => {
  const libs: Array<{ content: string; path: string }> = [];
  const monaco = { languages: { typescript: { typescriptDefaults: { addExtraLib: (content: string, path: string) => void libs.push({ content, path }) } } } };
  const original = globalThis.fetch;
  const fetched: string[] = [];
  globalThis.fetch = (async (url: string) => {
    fetched.push(url);
    if (url.includes('jsx-runtime')) return { ok: false, status: 404, text: async () => '' };
    if (url.includes('csstype')) throw new Error('offline');
    return { ok: true, status: 200, text: async () => `// ${url}` };
  }) as never;
  try {
    await quiet(() => loadMonacoTypes(monaco as never));
  } finally {
    globalThis.fetch = original;
  }
  assert.equal(fetched.length, MONACO_EXTERNAL_LIBS.length);
  const paths = libs.map((l) => l.path);
  assert.ok(paths.includes('file:///node_modules/@types/react/index.d.ts'));
  assert.ok(!paths.some((p) => p.includes('jsx-runtime')), 'a 404 lib is skipped');
  assert.ok(!paths.some((p) => p.includes('csstype')), 'a network failure is skipped');
  assert.ok(libs.some((l) => l.content.includes("declare module '@/components/ui/button'")), 'UI stubs are registered');
});
