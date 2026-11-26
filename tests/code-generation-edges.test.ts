import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, parseExpression } from '@babel/parser';
import * as t from '@babel/types';
import { generate } from '@babel/generator';
import { generateImports } from '../apps/editor/src/features/editor/lib/code/generateImports';
import {
  generateStrategies,
  generationOptions,
  ListGenerateStrategy,
  SelectGenerateStrategy,
  FrameGenerateStrategy,
} from '../apps/editor/src/features/editor/lib/code/generatestrategies';
import { codeGenerator } from '../apps/editor/src/features/editor/lib/code/generator';
import { parseCode } from '../apps/editor/src/features/editor/lib/code/parseCode';
import { locatePage } from '../apps/editor/src/features/editor/lib/code/extractPreamble';
import {
  CodeError,
  attributeName,
  attributeValue,
  cleanJsxText,
  diagnosticAt,
  isTag,
  literalValue,
  splitChildren,
  stringAttribute,
  stringAttributeValue,
  tagName,
  unparen,
} from '../apps/editor/src/features/editor/lib/code/astLiterals';

const warnings: unknown[][] = [];
const errors: unknown[][] = [];
const realWarn = console.warn;
const realError = console.error;
beforeEach(() => {
  warnings.length = 0;
  errors.length = 0;
  console.warn = (...a: unknown[]) => void warnings.push(a);
  console.error = (...a: unknown[]) => void errors.push(a);
});
afterEach(() => {
  console.warn = realWarn;
  console.error = realError;
});

const el = (type: string, extra: Record<string, unknown> = {}) =>
  ({ id: `id-${type}-${Math.random().toString(36).slice(2, 7)}`, type, name: type, content: '', tailwindStyles: '', ...extra }) as never;
const print = (node: t.Node | null) => (node ? generate(node).code : null);
const expr = (src: string) => parseExpression(src, { plugins: ['jsx'] });
const jsx = (src: string) => expr(src) as t.JSXElement;

// ---------------------------------------------------------------- generateImports

test('generateImports always starts with React and adds only known, used components', () => {
  assert.equal(generateImports(''), "import React from 'react';");
  const out = generateImports('<Carousel><Badge /><Unknown x={1}/><div/></Carousel>');
  const lines = out.split('\n');
  assert.equal(lines[0], "import React from 'react';");
  assert.equal(lines.length, 3);
  assert.ok(lines.some((l) => l.includes("from '@/components/ui/carousel'")));
  assert.ok(lines.some((l) => l.includes("from '@/components/ui/badge'")));
  assert.ok(!out.includes('Unknown'));
});

test('generateImports ignores lowercase tags and repeated components', () => {
  assert.equal(generateImports('<button><span /></button>'), "import React from 'react';");
  const repeated = generateImports('<Switch/><Switch/><Slider></Slider>');
  assert.equal(repeated.split('\n').filter((l) => l.includes("ui/switch")).length, 1);
  assert.ok(repeated.includes("ui/slider"));
});

// ---------------------------------------------------------------- strategies

test('Select strategy emits a <select> with one <option> per child', () => {
  const out = print(
    new SelectGenerateStrategy().generate(
      el('Select', { elements: [el('Text', { content: 'Red' }), el('Text', { content: '' })] }),
    ),
  )!;
  assert.match(out, /^<select/);
  assert.match(out, /<option value="Red">Red<\/option>/);
  assert.match(out, /<option value=""><\/option>/);
});

test('Select strategy with no options and the wrong type', () => {
  assert.match(print(new SelectGenerateStrategy().generate(el('Select')))!, /<select[^>]*><\/select>/);
  assert.equal(new SelectGenerateStrategy().generate(el('Text')), null);
});

test('List strategy wraps each child in <li> and honours the ordered setting', () => {
  const children = [el('Text', { content: 'one' }), el('Text', { content: 'two' }), el('NotAThing')];
  const ul = print(new ListGenerateStrategy().generate(el('List', { elements: children })))!;
  assert.match(ul, /^<ul/);
  assert.equal((ul.match(/<li>/g) ?? []).length, 2, 'children without a strategy are skipped');
  const ol = print(new ListGenerateStrategy().generate(el('List', { settings: { ordered: true }, elements: children })))!;
  assert.match(ol, /^<ol/);
  assert.match(print(new ListGenerateStrategy().generate(el('List')))!, /<ul[^>]*><\/ul>/);
  assert.equal(new ListGenerateStrategy().generate(el('Frame')), null);
});

test('Frame strategy renders a div around its generated children', () => {
  const out = print(
    new FrameGenerateStrategy().generate(el('Frame', { elements: [el('Text', { content: 'hi' }), el('Bogus')] })),
  )!;
  assert.match(out, /^<div/);
  assert.match(out, /hi/);
  assert.equal(new FrameGenerateStrategy().generate(el('Text')), null);
});

test('element ids are tagged only while generationOptions.tagElementIds is set', () => {
  const frame = el('Frame', { id: 'frame-1' });
  assert.doesNotMatch(print(generateStrategies.Frame.generate(frame))!, /data-element-id/);
  generationOptions.tagElementIds = true;
  try {
    assert.match(print(generateStrategies.Frame.generate(frame))!, /data-element-id="frame-1"/);
  } finally {
    generationOptions.tagElementIds = false;
  }
});

// ---------------------------------------------------------------- generator

test('generateToJSX with no elements still returns a component shell', async () => {
  const code = await codeGenerator.generateToJSX([]);
  assert.match(code, /const Generated = \(\) =>/);
  assert.match(code, /export default Generated/);
});

test('generateToJSX warns about element types it cannot generate', async () => {
  const code = await codeGenerator.generateToJSX([el('Totally-Unknown'), el('Frame')]);
  assert.equal(warnings.length, 1);
  assert.match(String(warnings[0][0]), /No generate strategy for element type: Totally-Unknown/);
  assert.match(code, /<div/);
});

test('generateToJSX reports a throwing strategy and keeps going', async () => {
  const original = generateStrategies.Text;
  generateStrategies.Text = {
    generate: () => {
      throw new Error('boom');
    },
  } as never;
  generationOptions.tagElementIds = false;
  try {
    const code = await codeGenerator.generateToJSX([el('Text'), el('Frame')], undefined, { tagIds: true });
    assert.equal(errors.length, 1);
    assert.match(String(errors[0][0]), /Error generating JSX for element type Text/);
    assert.match(code, /<div/);
    assert.equal(generationOptions.tagElementIds, false, 'the tagging flag is always reset');
  } finally {
    generateStrategies.Text = original;
  }
});

test('tagIds adds data-element-id attributes to the output', async () => {
  const code = await codeGenerator.generateToJSX([el('Frame', { id: 'abc' })], undefined, { tagIds: true });
  assert.match(code, /data-element-id=["']abc["']/);
  const plain = await codeGenerator.generateToJSX([el('Frame', { id: 'abc' })]);
  assert.doesNotMatch(plain, /data-element-id/);
});

test('generateInteractions is null when no element has interactions', () => {
  assert.equal(codeGenerator.generateInteractions([el('Frame')]), null);
  assert.equal(codeGenerator.generateInteractions([el('Frame')], { variables: {}, flows: {} }), null);
});

test('a custom preamble is woven into the generated component', async () => {
  const code = await codeGenerator.generateToJSX([el('Frame')], undefined, {
    preamble: {
      imports: "import { useForm } from 'react-hook-form';",
      top: 'const schema = {};',
      body: 'const form = useForm();',
    },
  });
  assert.match(code, /import \{ useForm \} from 'react-hook-form';/);
  assert.match(code, /const schema = \{\};/);
  assert.match(code, /const form = useForm\(\);/);
  assert.match(code, /import React from 'react';/);
});

test("a user's own React import replaces the generated one", async () => {
  const code = await codeGenerator.generateToJSX([el('Frame')], undefined, {
    preamble: { imports: "import React, { useState } from 'react';", top: '', body: '' },
  });
  assert.equal((code.match(/import React/g) ?? []).length, 1);
  assert.match(code, /useState/);
});

test('an empty preamble is ignored', async () => {
  const withEmpty = await codeGenerator.generateToJSX([el('Frame', { id: 'x' })], undefined, {
    preamble: { imports: ' ', top: '', body: '\n' },
  });
  const without = await codeGenerator.generateToJSX([el('Frame', { id: 'x' })]);
  assert.equal(withEmpty, without);
});

test('unparseable custom code is returned unformatted instead of failing', async () => {
  const code = await codeGenerator.generateToJSX([el('Frame')], undefined, {
    preamble: { imports: '', top: '', body: 'const = ;' },
  });
  assert.equal(warnings.length, 1);
  assert.match(String(warnings[0][0]), /Could not format generated code/);
  assert.match(code, /const = ;/);
});

// ---------------------------------------------------------------- parseCode

test('parseCode reports syntax errors with a position', () => {
  const result = parseCode('const A = () => <div>;', [], 'p');
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.diagnostic.message.length > 0);
    assert.doesNotMatch(result.diagnostic.message, /\(\d+:\d+\)$/);
    assert.ok(result.diagnostic.line >= 1);
  }
});

test('parseCode requires JSX to be returned', () => {
  const result = parseCode('export default function A() { return null; }', [], 'p');
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.diagnostic.message, /No JSX found/);
});

test('fragment roots allow elements and comments but not loose text or expressions', () => {
  const ok = parseCode('export default () => (<>{/* note */}<div /><section /></>);', [], 'p');
  assert.equal(ok.ok, true);
  if (ok.ok) assert.deepEqual(ok.elements.map((e) => e.type), ['Frame', 'Section']);

  const text = parseCode('export default () => (<>hello<div /></>);', [], 'p');
  assert.equal(text.ok, false);
  if (!text.ok) assert.match(text.diagnostic.message, /Text at the root must sit inside an element/);

  const blank = parseCode('export default () => (<>\n  <div />\n</>);', [], 'p');
  assert.equal(blank.ok, true);

  const dynamic = parseCode('export default () => (<>{value}<div /></>);', [], 'p');
  assert.equal(dynamic.ok, false);
  if (!dynamic.ok) assert.match(dynamic.diagnostic.message, /Only elements are supported at the top level/);
});

test('parseCode surfaces unsupported tags as a diagnostic with a location', () => {
  const result = parseCode('export default () => (<div><marquee /></div>);', [], 'p');
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.diagnostic.line >= 1);
});

test('parseCode without an active page cannot create new elements', () => {
  for (const code of [
    'export default () => (<div>hello</div>);',
    'export default () => (<ul><li>a</li></ul>);',
  ]) {
    const result = parseCode(code, [], undefined);
    assert.equal(result.ok, false, code);
    if (!result.ok) assert.match(result.diagnostic.message, /no active page/);
  }
});

test('locatePage finds components declared several ways', () => {
  const find = (src: string) => locatePage(parse(src, { sourceType: 'module', plugins: ['jsx', 'typescript'] }).program);

  assert.ok(find('export default function A() { return <div />; }'));
  assert.ok(find('export default () => <div />;'));
  assert.ok(find('const A = () => (<div />);\nexport default A;'));
  assert.ok(find('function Page() { return <div />; }'));
  assert.ok(find('export const Page = function () { return (<div />); };'));
  assert.ok(find('const x = 1;\nrender(<div />);'), 'falls back to the first JSX in the file');
  assert.equal(find('export default function A() { return 1; }'), null);
  assert.equal(find('const A = () => 1;\nexport default A;'), null);
  assert.equal(find("import x from 'y';\nconst a = 1;"), null);
  assert.equal(find('function A() { const b = 1; }\nexport default function B() { return <p />; }')?.root.type, 'JSXElement');
});

// ---------------------------------------------------------------- astLiterals

test('cleanJsxText collapses whitespace the way JSX does', () => {
  assert.equal(cleanJsxText('  hello  '), '  hello  ');
  assert.equal(cleanJsxText('\n   hello\n   world\n'), 'hello world');
  assert.equal(cleanJsxText('   '), ' ');
  assert.equal(cleanJsxText('\n   \n'), '');
  assert.equal(cleanJsxText('a\tb'), 'a\tb'.replace('\t', ' '));
  assert.equal(cleanJsxText(''), '');
});

test('literalValue evaluates plain literals and rejects anything dynamic', () => {
  const lit = (src: string) => literalValue(expr(src));
  assert.deepEqual(lit('"a"'), { ok: true, value: 'a' });
  assert.deepEqual(lit('3'), { ok: true, value: 3 });
  assert.deepEqual(lit('true'), { ok: true, value: true });
  assert.deepEqual(lit('null'), { ok: true, value: null });
  assert.deepEqual(lit('undefined'), { ok: true, value: undefined });
  assert.deepEqual(lit('`plain`'), { ok: true, value: 'plain' });
  assert.deepEqual(lit('-4'), { ok: true, value: -4 });
  assert.deepEqual(lit('+4'), { ok: true, value: 4 });
  assert.deepEqual(lit('[1, "a", [true]]'), { ok: true, value: [1, 'a', [true]] });
  assert.deepEqual(lit('({ a: 1, "b": 2, 3: 4, c: { d: null } })'), { ok: true, value: { a: 1, b: 2, 3: 4, c: { d: null } } });

  for (const bad of ['foo', '`a${b}`', '!x', '-"s"', '[...a]', '[1, , 2]', '({ [k]: 1 })', '({ ...o })', '({ m() {} })', '({ a: x })', '[x]', 'f()', '(() => 1)']) {
    assert.equal(lit(bad).ok, false, bad);
  }
});

test('attributeValue reads strings, bare booleans and literal expressions', () => {
  const attrs = (src: string) => (jsx(`<a ${src} />`).openingElement.attributes[0] as t.JSXAttribute);
  assert.deepEqual(attributeValue(attrs('x')), { ok: true, value: true });
  assert.deepEqual(attributeValue(attrs('x="s"')), { ok: true, value: 's' });
  assert.deepEqual(attributeValue(attrs('x={5}')), { ok: true, value: 5 });
  assert.equal(attributeValue(attrs('x={dynamic}')).ok, false);
  const emptyExpression = t.jsxAttribute(t.jsxIdentifier('x'), t.jsxExpressionContainer(t.jsxEmptyExpression()));
  assert.equal(attributeValue(emptyExpression).ok, false);
  assert.equal(attributeValue(attrs('x=<b />')).ok, false);
});

test('attributeName, tagName and isTag handle namespaces and member tags', () => {
  const node = jsx('<svg xlink:href="a" id="b"><path /></svg>');
  const [ns, id] = node.openingElement.attributes as t.JSXAttribute[];
  assert.equal(attributeName(ns), 'xlink:href');
  assert.equal(attributeName(id), 'id');
  assert.equal(tagName(node), 'svg');
  assert.equal(isTag(node, 'svg'), true);
  assert.equal(isTag(node, 'div'), false);
  assert.equal(isTag(t.identifier('svg'), 'svg'), false);
  assert.throws(() => tagName(jsx('<A.B />')), (e) => e instanceof CodeError && /plain tags/.test(e.message));
});

test('splitChildren separates text from elements and rejects dynamic children', () => {
  const ok = splitChildren(jsx('<p>Hi {"there"} {2}<b />{/* c */}!</p>'));
  assert.equal(ok.text, 'Hi there 2!');
  assert.equal(ok.elements.length, 1);
  assert.throws(() => splitChildren(jsx('<p>{name}</p>')), /Dynamic expressions/);
  assert.throws(() => splitChildren(jsx('<p>{true}</p>')), /Dynamic expressions/);
  assert.throws(() => splitChildren(jsx('<p><>x</></p>')), /Nested fragments/);
});

test('string attribute helpers fall back sensibly', () => {
  const map = (src: string) => {
    const attrs = new Map<string, t.JSXAttribute>();
    for (const a of jsx(`<a ${src} />`).openingElement.attributes as t.JSXAttribute[]) attrs.set(attributeName(a), a);
    return attrs;
  };
  assert.equal(stringAttributeValue(map('a="x"'), 'a'), 'x');
  assert.equal(stringAttributeValue(map('a="x"'), 'missing'), undefined);
  assert.equal(stringAttributeValue(map('a={5}'), 'a'), undefined);
  assert.throws(() => stringAttributeValue(map('a={5}'), 'a', true), /must be a plain string/);

  assert.equal(stringAttribute(map('a="x"'), 'a', 'before'), 'x');
  assert.equal(stringAttribute(map(''), 'a', 'before'), '', 'removing an attribute that had a value clears it');
  assert.equal(stringAttribute(map(''), 'a', undefined), undefined);
  assert.equal(stringAttribute(map(''), 'a', ''), '');
});

test('unparen and diagnosticAt normalise nodes and locations', () => {
  const inner = expr('a');
  assert.equal(unparen(expr('((a))')) && (unparen(expr('((a))')) as t.Identifier).name, 'a');
  assert.equal(unparen(inner), inner);
  assert.equal(unparen(null), null);
  assert.equal(unparen(undefined), undefined);

  assert.deepEqual(diagnosticAt('m'), { message: 'm', line: 1, column: 1, endLine: 1, endColumn: 1 });
  const loc = { start: { line: 3, column: 4, index: 0 }, end: { line: 5, column: 6, index: 0 } } as t.SourceLocation;
  assert.deepEqual(diagnosticAt('m', loc), { message: 'm', line: 3, column: 5, endLine: 5, endColumn: 7 });
});
