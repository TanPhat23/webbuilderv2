import assert from "node:assert/strict";
import { test } from "node:test";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { readCodeText, readCodeVisible } from "../apps/editor/src/features/editor/lib/code/customCode";
import { codeGenerator } from "../apps/editor/src/features/editor/lib/code/generator";
import { parseCode } from "../apps/editor/src/features/editor/lib/code/parseCode";
import { diffTrees } from "../apps/editor/src/features/editor/utils/element/treeDiff";

const PAGE = "page_hooks";

const statefulSource = `
import React, { useState, useEffect } from 'react';

export default function Generated() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [avatarUrl] = useState('/me.png');

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <section className="p-6">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count} times</button>
      <button onClick={() => setOpen((prev) => !prev)}>Toggle</button>
      <img src={avatarUrl} alt="Avatar" />
      {open && (
        <div className="mt-4 rounded border p-4">
          <span>Query: {query}</span>
        </div>
      )}
    </section>
  );
}
`;

function childrenOf(el: EditorElement | undefined): EditorElement[] {
  if (!el || !("elements" in el) || !Array.isArray(el.elements)) return [];
  return el.elements;
}

test("useState, useEffect, arrow handler params, dynamic text, and conditional blocks round-trip", async () => {
  const first = parseCode(statefulSource, [], PAGE);
  assert.ok(
    first.ok,
    first.ok ? "" : `${first.diagnostic.message} @${first.diagnostic.line}:${first.diagnostic.column}`,
  );
  if (!first.ok) return;

  assert.match(first.preamble.body, /useState\(0\)/);
  assert.match(first.preamble.body, /useEffect\(/);

  const generated = await codeGenerator.generateToJSX(first.elements, undefined, {
    tagIds: true,
    preamble: first.preamble,
  });
  assert.match(generated, /Clicked \{count\} times/);
  assert.match(generated, /\{open && \(/);
  assert.match(generated, /onChange=\{\(e\) => setQuery\(e\.target\.value\)\}/);
  assert.match(generated, /src=\{avatarUrl\}/);
  assert.doesNotMatch(generated, /src=""/);

  const second = parseCode(generated, first.elements, PAGE);
  assert.ok(second.ok, second.ok ? "" : second.diagnostic.message);
  if (!second.ok) return;
  assert.deepEqual(diffTrees(first.elements, second.elements), []);
});

test("editing element.content visually on the Canvas overrides stale codeText", async () => {
  const parsed = parseCode(statefulSource, [], PAGE);
  assert.ok(parsed.ok);
  if (!parsed.ok) return;

  const counterBtn = childrenOf(parsed.elements[0]).find(
    (e) => e.type === "Button" && e.content.includes("{count}"),
  );
  assert.ok(counterBtn, "expected counter button with {count}");
  assert.ok(readCodeText(counterBtn.settings), "expected initial codeText segments");
  counterBtn.content = "Submit now";

  const regenerated = await codeGenerator.generateToJSX(parsed.elements, undefined, {
    tagIds: true,
    preamble: parsed.preamble,
  });
  assert.match(regenerated, />\s*Submit now\s*<\/button>/);
  assert.doesNotMatch(regenerated, /Clicked \{count\} times/);

  const reparsed = parseCode(regenerated, parsed.elements, PAGE);
  assert.ok(reparsed.ok, reparsed.ok ? "" : reparsed.diagnostic.message);
  if (!reparsed.ok) return;
  const reparsedBtn = childrenOf(reparsed.elements[0]).find((e) => e.id === counterBtn.id);
  assert.ok(reparsedBtn);
  assert.equal(reparsedBtn.content, "Submit now");
  assert.equal(readCodeText(reparsedBtn.settings), undefined);
});

test("undeclared identifiers in JSX attributes or children fail with exact diagnostic", () => {
  const badAttr = parseCode('export default () => <img src={missingUrl} alt="x" />;', [], PAGE);
  assert.equal(badAttr.ok, false);
  if (!badAttr.ok) assert.match(badAttr.diagnostic.message, /missingUrl/);

  const badChild = parseCode('export default () => <div>Hello {missingName}</div>;', [], PAGE);
  assert.equal(badChild.ok, false);
  if (!badChild.ok) assert.match(badChild.diagnostic.message, /missingName/);
});

test("static consts, cn/clsx, dynamic href without duplicate, and root codeVisible round-trip", async () => {
  const src = `
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const theme = { card: 'rounded border', active: true };
const prefix = 'User';

export default function Profile() {
  const [visible, setVisible] = useState(true);
  const [ctaUrl] = useState('/signup');
  const [label] = useState('Ada');

  return (
    <>
      {visible && (
        <section className={cn('p-4', theme.active && theme.card)}>
          <a href={ctaUrl} onClick={(evt) => {
            try {
              const id = evt.currentTarget.tagName;
              console.log(id);
            } catch (err) {
              console.error(err);
            }
          }}>
            {\`\${prefix}: \`} {label}
          </a>
          <button onClick={() => setVisible((v) => !v)}>Hide</button>
        </section>
      )}
    </>
  );
}
`;
  const parsed = parseCode(src, [], PAGE);
  assert.ok(parsed.ok, parsed.ok ? "" : parsed.diagnostic.message);
  if (!parsed.ok) return;

  const section = parsed.elements[0]!;
  assert.equal(section.tailwindStyles, "p-4 rounded border");
  assert.equal(readCodeVisible(section.settings), "visible");

  const link = childrenOf(section)[0]!;
  assert.equal(link.type, "Link");
  assert.equal(link.href, "");
  const linkCodeProps =
    link.settings && "codeProps" in link.settings && Array.isArray(link.settings.codeProps)
      ? link.settings.codeProps
      : [];
  assert.ok(linkCodeProps.some((p) => typeof p === "string" && p.includes("href={ctaUrl}")));

  const generated = await codeGenerator.generateToJSX(parsed.elements, undefined, {
    tagIds: true,
    preamble: parsed.preamble,
  });
  assert.match(generated, /\{visible && \(/);
  assert.match(generated, /href=\{ctaUrl\}/);
  assert.doesNotMatch(generated, /href=""/);

  const reparsed = parseCode(generated, parsed.elements, PAGE);
  assert.ok(reparsed.ok, reparsed.ok ? "" : reparsed.diagnostic.message);
  if (!reparsed.ok) return;
  assert.deepEqual(diffTrees(parsed.elements, reparsed.elements), []);
});

test("unimported static and dynamic cn(...) and clsx(...) in JSX attributes parse and round-trip", async () => {
  const src = `
import React, { useState } from 'react';

export default function Banner() {
  const [open] = useState(true);
  return (
    <section className={cn('p-4', true && 'border')}>
      <div className={clsx('mt-2', false && 'hidden')}>Static clsx</div>
      <div className={cn('p-4', open && 'bg-muted')}>Dynamic cn</div>
    </section>
  );
}
`;
  const parsed = parseCode(src, [], PAGE);
  assert.ok(
    parsed.ok,
    parsed.ok ? "" : `${parsed.diagnostic.message} @${parsed.diagnostic.line}:${parsed.diagnostic.column}`,
  );
  if (!parsed.ok) return;

  const section = parsed.elements[0]!;
  assert.equal(section.tailwindStyles, "p-4 border");
  const children = childrenOf(section);
  assert.equal(children[0]?.tailwindStyles, "mt-2");
  const dynDiv = children[1]!;
  const dynProps =
    dynDiv.settings && "codeProps" in dynDiv.settings && Array.isArray(dynDiv.settings.codeProps)
      ? dynDiv.settings.codeProps
      : [];
  assert.ok(dynProps.some((p) => typeof p === "string" && p.includes("className={cn(")));

  const generated = await codeGenerator.generateToJSX(parsed.elements, undefined, {
    tagIds: true,
    preamble: parsed.preamble,
  });
  assert.match(generated, /className="p-4 border"/);
  assert.match(generated, /className="mt-2"/);
  assert.match(generated, /className=\{cn\('p-4', open && 'bg-muted'\)\}/);
  assert.equal((generated.match(/className=/g) ?? []).length, 3);

  const reparsed = parseCode(generated, parsed.elements, PAGE);
  assert.ok(reparsed.ok, reparsed.ok ? "" : reparsed.diagnostic.message);
  if (!reparsed.ok) return;
  assert.deepEqual(diffTrees(parsed.elements, reparsed.elements), []);
});
