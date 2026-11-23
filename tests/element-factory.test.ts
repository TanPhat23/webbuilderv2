import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ElementFactory,
  ElementFactoryError,
} from '../src/features/editor/lib/ElementFactory';
import { SelectionStore } from '../src/features/editor/store/selection-store';
import { ElementStrategyMap } from '../src/features/editor/utils/element/create/elementStrategyMap';

const factory = ElementFactory.getInstance();
const errors: unknown[][] = [];
const originalError = console.error;

beforeEach(() => {
  errors.length = 0;
  console.error = (...args: unknown[]) => {
    errors.push(args);
  };
  SelectionStore.getState().clearSelection();
});

afterEach(() => {
  console.error = originalError;
});

test('getInstance always returns the same singleton', () => {
  assert.equal(ElementFactory.getInstance(), factory);
});

test('createElement builds a typed element with a generated id and selects it', () => {
  const el = factory.createElement({ type: 'Heading', pageId: 'page-1' });
  assert.ok(el);
  assert.equal(el.type, 'Heading');
  assert.equal(el.pageId, 'page-1');
  assert.equal(el.parentId, undefined);
  assert.match(el.id, /^[0-9a-f-]{36}$/);
  assert.equal(SelectionStore.getState().selectedElementId, el.id);
  assert.equal(errors.length, 0);
});

test('createElement keeps the parent id and issues unique ids', () => {
  const a = factory.createElement({ type: 'Text', pageId: 'p', parentId: 'parent' });
  const b = factory.createElement({ type: 'Text', pageId: 'p', parentId: 'parent' });
  assert.equal(a?.parentId, 'parent');
  assert.notEqual(a?.id, b?.id);
  assert.equal(SelectionStore.getState().selectedElementId, b?.id);
});

test('createElement returns undefined and logs when pageId is blank', () => {
  for (const pageId of ['', '   ']) {
    SelectionStore.getState().clearSelection();
    assert.equal(factory.createElement({ type: 'Text', pageId }), undefined);
    assert.equal(SelectionStore.getState().selectedElementId, undefined);
  }
  assert.equal(errors.length, 2);
  assert.match(String(errors[0][0]), /ElementFactory\.createElement/);
  assert.match(String(errors[0][0]), /pageId is required/);
});

test('createElement logs and returns undefined for an unknown element type', () => {
  const el = factory.createElement({ type: 'Bogus' as never, pageId: 'p' });
  assert.equal(el, undefined);
  assert.equal(errors.length, 1);
  const detail = errors[0][1] as { originalError: ElementFactoryError };
  assert.ok(detail.originalError instanceof ElementFactoryError);
  assert.equal(detail.originalError.code, 'BUILD_FAILED');
  assert.equal(detail.originalError.name, 'ElementFactoryError');
  assert.equal(detail.originalError.context?.type, 'Bogus');
});

test('createElement surfaces a strategy that returns nothing as STRATEGY_FAILED', () => {
  const original = ElementStrategyMap.Text;
  (ElementStrategyMap as Record<string, unknown>).Text = { buildElement: () => null };
  try {
    assert.equal(factory.createElement({ type: 'Text', pageId: 'p' }), undefined);
  } finally {
    (ElementStrategyMap as Record<string, unknown>).Text = original;
  }
  const detail = errors[0][1] as { originalError: ElementFactoryError };
  assert.equal(detail.originalError.code, 'STRATEGY_FAILED');
  assert.equal(detail.originalError.context?.type, 'Text');
});

test('createElement wraps non-Error strategy failures with an Unknown error message', () => {
  const original = ElementStrategyMap.Text;
  (ElementStrategyMap as Record<string, unknown>).Text = {
    buildElement: () => {
      throw 'boom';
    },
  };
  try {
    assert.equal(factory.createElement({ type: 'Text', pageId: 'p' }), undefined);
  } finally {
    (ElementStrategyMap as Record<string, unknown>).Text = original;
  }
  const detail = errors[0][1] as { originalError: ElementFactoryError };
  assert.equal(detail.originalError.code, 'BUILD_FAILED');
  assert.match(detail.originalError.message, /Unknown error/);
  assert.equal(detail.originalError.context?.originalError, 'boom');
});

test('createElementFromTemplate builds a leaf template with overrides and selects it', () => {
  const el = factory.createElementFromTemplate({
    pageId: 'page-1',
    element: {
      type: 'Link',
      content: 'Go',
      href: '/go',
      src: '/s',
      styles: { default: { color: 'red' } },
      tailwindStyles: 'underline',
    } as never,
  });
  assert.ok(el);
  assert.equal(el.type, 'Link');
  assert.equal(el.content, 'Go');
  assert.equal(el.href, '/go');
  assert.equal(el.src, '/s');
  assert.deepEqual(el.styles, { default: { color: 'red' } });
  assert.equal(el.tailwindStyles, 'underline');
  assert.equal(el.parentId, undefined);
  assert.equal(SelectionStore.getState().selectedElementId, el.id);
});

test('createElementFromTemplate recursively builds children and links parent ids', () => {
  const root = factory.createElementFromTemplate<any>({
    pageId: 'page-1',
    element: {
      type: 'Frame',
      elements: [
        { type: 'Text', content: 'one' },
        { type: 'Section', elements: [{ type: 'Button', content: 'two' }] },
      ],
    } as never,
  });
  assert.ok(root);
  assert.equal(root.elements.length, 2);
  const [text, section] = root.elements;
  assert.equal(text.parentId, root.id);
  assert.equal(text.content, 'one');
  assert.equal(section.parentId, root.id);
  assert.equal(section.elements[0].parentId, section.id);
  assert.equal(section.elements[0].content, 'two');
  const ids = [root.id, text.id, section.id, section.elements[0].id];
  assert.equal(new Set(ids).size, 4);
  assert.ok([root, text, section, section.elements[0]].every((e) => e.pageId === 'page-1'));
  // Only the root is selected, not the descendants.
  assert.equal(SelectionStore.getState().selectedElementId, root.id);
});

test('a container template with no children array yields an empty element list', () => {
  const root = factory.createElementFromTemplate<any>({
    pageId: 'p',
    element: { type: 'Frame', elements: undefined } as never,
  });
  assert.deepEqual(root?.elements, []);
});

test('template settings are merged over strategy defaults', () => {
  const heading = factory.createElementFromTemplate<any>({
    pageId: 'p',
    element: { type: 'Heading', settings: { level: 4, extra: true } } as never,
  });
  assert.deepEqual(heading?.settings, { level: 4, extra: true });

  const video = factory.createElementFromTemplate<any>({
    pageId: 'p',
    element: { type: 'Video', settings: { autoplay: true } } as never,
  });
  assert.equal(video?.settings.autoplay, true);
  assert.equal(video?.settings.controls, true, 'untouched defaults survive the merge');
});

test('template settings replace null strategy settings outright', () => {
  const text = factory.createElementFromTemplate<any>({
    pageId: 'p',
    element: { type: 'Text', settings: { custom: 1 } } as never,
  });
  assert.deepEqual(text?.settings, { custom: 1 });
});

test('template settings do not mutate the shared strategy defaults', () => {
  factory.createElementFromTemplate({
    pageId: 'p',
    element: { type: 'Heading', settings: { level: 6 } } as never,
  });
  const fresh = factory.createElement({ type: 'Heading', pageId: 'p' }) as any;
  assert.equal(fresh.settings.level, 2);
});

test('createElementFromTemplate returns undefined for a blank page id', () => {
  const el = factory.createElementFromTemplate({
    pageId: ' ',
    element: { type: 'Text' } as never,
  });
  assert.equal(el, undefined);
  assert.equal(errors.length, 1);
  assert.match(String(errors[0][0]), /createElementFromTemplate/);
});

test('createElementFromTemplate returns undefined when any nested child is invalid', () => {
  const el = factory.createElementFromTemplate({
    pageId: 'p',
    element: { type: 'Frame', elements: [{ type: 'Bogus' }] } as never,
  });
  assert.equal(el, undefined);
  assert.equal(errors.length, 1);
  assert.equal(SelectionStore.getState().selectedElementId, undefined);
});
