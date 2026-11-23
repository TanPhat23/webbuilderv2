import assert from "node:assert/strict";
import { test } from "node:test";
import { codeGenerator } from "../src/features/editor/lib/code/generator";
import { parseCode } from "../src/features/editor/lib/code/parseCode";
import { diffTrees } from "../src/features/editor/utils/element/treeDiff";
import type { EditorElement } from "../src/types/global.type";

const PAGE = "page_1";
const el = (id: string, type: string, extra: Record<string, unknown> = {}) =>
  ({ id, type, pageId: PAGE, content: "", styles: {}, settings: null, ...extra }) as unknown as EditorElement;

const tree = (): EditorElement[] => [
  el("sec", "Section", {
    name: "Hero",
    styles: { default: { width: "100%" } },
    tailwindStyles: "py-8 sticky",
    elements: [
      el("title", "Text", { content: "Hello world", name: "Title" }),
      el("head", "Heading", { content: "Not in code", settings: { level: 2 } }),
      el("cta", "Button", { content: "Buy now", tailwindStyles: "px-4" }),
      el("link", "Link", { content: "Docs", href: "/docs" }),
      el("img", "Image", { content: "Logo", src: "/logo.png" }),
      el("email", "Input", { settings: { type: "email", required: true, interactions: { ix_1: { on: "click", do: [] } } } }),
      el("pick", "Select", { elements: [el("o1", "Text", { content: "One" }), el("o2", "Text", { content: "Two" })] }),
      el("list", "List", { settings: { ordered: true }, elements: [el("item", "Text", { content: "First" })] }),
    ],
  }),
];

const generate = (t = tree()) => codeGenerator.generateToJSX(t, undefined, { tagIds: true });
const parse = (code: string, t = tree()) => parseCode(code, t, PAGE);
const ok = (code: string, t = tree()) => {
  const r = parse(code, t);
  assert.ok(r.ok, r.ok ? "" : `${r.diagnostic.message} @${r.diagnostic.line}:${r.diagnostic.column}\n${code}`);
  return r.elements;
};
const find = (elements: EditorElement[], id: string): any => {
  for (const e of elements) {
    if (e.id === id) return e;
    const hit = find(((e as any).elements ?? []) as EditorElement[], id);
    if (hit) return hit;
  }
  return undefined;
};

test("the generated code reads back to exactly the same tree", async () => {
  const code = await generate();
  const parsed = ok(code);
  assert.deepEqual(diffTrees(tree(), parsed), []);
});

test("editing text updates only that element's content", async () => {
  const code = (await generate()).replace("Hello world", "Goodbye");
  const parsed = ok(code);
  const ops = diffTrees(tree(), parsed);
  assert.deepEqual(ops, [{ type: "update", id: "title", patch: { content: "Goodbye" } }]);
});

test("text with braces, angle brackets and edge spaces survives a round trip", async () => {
  const t = tree();
  find(t, "title").content = " a < b && {c} ";
  const code = await generate(t);
  assert.deepEqual(diffTrees(t, ok(code, t)), []);
});

test("editing classes keeps classes that come from the Style panel out of tailwindStyles", async () => {
  const code = await generate();
  assert.match(code, /w-\[100%\]/);
  const edited = code.replace('className="py-8 sticky w-[100%]"', 'className="py-12 sticky w-[100%] rounded-lg"');
  assert.notEqual(edited, code);
  const parsed = ok(edited);
  assert.equal(find(parsed, "sec").tailwindStyles, "py-12 sticky rounded-lg");
  assert.deepEqual(find(parsed, "sec").styles, { default: { width: "100%" } });
});

test("editing attributes updates href, src, alt and settings", async () => {
  const code = (await generate())
    .replace('href="/docs"', 'href="/guide"')
    .replace('src="/logo.png"', 'src="/new.png"')
    .replace('alt="Logo"', 'alt="Brand"')
    .replace('type="email"', 'type="text"');
  const parsed = ok(code);
  assert.equal(find(parsed, "link").href, "/guide");
  assert.equal(find(parsed, "img").src, "/new.png");
  assert.equal(find(parsed, "img").content, "Brand");
  assert.equal(find(parsed, "email").settings.type, "text");
  // Interactions are not in the code, and survive.
  assert.ok(find(parsed, "email").settings.interactions.ix_1);
});

test("deleting a tag deletes its element, and edits never delete elements the code can't show", async () => {
  const code = (await generate()).replace(/<button[\s\S]*?<\/button>/, "");
  const parsed = ok(code);
  assert.equal(find(parsed, "cta"), undefined);
  assert.ok(find(parsed, "head"), "the Heading has no code form and stays");
  assert.deepEqual(
    diffTrees(tree(), parsed).map((op) => op.type),
    ["delete"],
  );
});

test("a new tag becomes a new element on the right page and parent", async () => {
  const code = (await generate()).replace("</section>", '<div className="p-2">Added</div></section>');
  const parsed = ok(code);
  const added = find(parsed, "sec").elements.at(-1);
  assert.equal(added.type, "Text");
  assert.equal(added.content, "Added");
  assert.equal(added.tailwindStyles, "p-2");
  assert.equal(added.pageId, PAGE);
  assert.equal(added.parentId, "sec");
  assert.ok(added.id && added.id !== "sec");
});

test("a pasted copy of a tag becomes its own element", async () => {
  const code = await generate();
  const copy = code.match(/<button[\s\S]*?<\/button>/)![0];
  const parsed = ok(code.replace(copy, copy + copy));
  const buttons = find(parsed, "sec").elements.filter((e: any) => e.type === "Button");
  assert.equal(buttons.length, 2);
  assert.notEqual(buttons[0].id, buttons[1].id);
  assert.equal(buttons[0].id, "cta");
});

test("moving a tag moves its element and keeps its styling", async () => {
  const code = await generate();
  const button = code.match(/<button[\s\S]*?<\/button>/)![0];
  const parsed = ok(code.replace(button, "").replace("<div", `${button}<div`));
  const ops = diffTrees(tree(), parsed);
  assert.ok(ops.every((op) => op.type === "move"), JSON.stringify(ops));
  assert.equal(find(parsed, "cta").tailwindStyles, "px-4");
});

test("list items, options and ordered lists read back", async () => {
  const code = (await generate())
    .replace(">Two<", ">Deux<")
    .replace("<ol", "<ul")
    .replace("</ol>", "</ul>");
  const parsed = ok(code);
  assert.equal(find(parsed, "o2").content, "Deux");
  assert.equal(find(parsed, "list").settings.ordered, false);
});

test("code it can't read leaves the design alone and says where", async () => {
  const unsupported = parse((await generate()).replace("<button", "<video").replace("</button>", "</video>"));
  assert.equal(unsupported.ok, false);
  if (!unsupported.ok) assert.match(unsupported.diagnostic.message, /<video>/);

  const broken = parse((await generate()).replace("</section>", ""));
  assert.equal(broken.ok, false);
  if (!broken.ok) assert.ok(broken.diagnostic.line > 1);

  const none = parse("const x = 1;");
  assert.equal(none.ok, false);
});

test("an empty page accepts new elements", () => {
  const parsed = parseCode('const A = () => (<><section className="p-4"><div>Hi</div></section></>);', [], PAGE);
  assert.ok(parsed.ok);
  if (parsed.ok) {
    assert.equal(parsed.elements[0].type, "Section");
    assert.equal(find(parsed.elements, parsed.elements[0].id).elements[0].content, "Hi");
  }
  assert.equal(parseCode("const A = () => <div/>;", [], undefined).ok, false);
});

/* -------------------------- form libraries -------------------------- */

const formTree = (): EditorElement[] => [
  el("page", "Section", {
    elements: [
      el("signup", "Form", {
        name: "Signup",
        settings: { interactions: { ix_aaaaaaaa: { on: "submit", do: [{ toast: "Saved" }] } } },
        elements: [el("email", "Input", { settings: { type: "email" } }), el("go", "Button", { content: "Join" })],
      }),
    ],
  }),
];

const rhfCode = `
import React from 'react';
import { useForm } from 'react-hook-form';

type Values = { email: string };
const defaults: Values = { email: '' };

const Generated = () => {
  const { register, handleSubmit } = useForm<Values>({ defaultValues: defaults });
  const save = (data: Values) => console.log(data);

  return (
    <>
      <section data-element-id="page" className="">
        <form data-element-id="signup" className="" onSubmit={handleSubmit(save)}>
          <input data-element-id="email" className="" type="email" {...register('email', { required: true })} />
          <button data-element-id="go" className="">Join</button>
        </form>
      </section>
    </>
  );
};

export default Generated;
`;

test("a form library's props, imports and hooks are read from the code", () => {
  const r = parseCode(rhfCode, formTree(), PAGE);
  assert.ok(r.ok, r.ok ? "" : r.diagnostic.message);
  if (!r.ok) return;
  const form = find(r.elements, "signup");
  assert.deepEqual(form.settings.codeProps, ["onSubmit={handleSubmit(save)}"]);
  assert.equal(form.settings.customSubmit, true, "an onSubmit means the form owns its submit");
  assert.ok(form.settings.interactions.ix_aaaaaaaa, "interactions are kept");
  const email = find(r.elements, "email");
  assert.equal(email.settings.type, "email");
  assert.match(email.settings.codeProps[0], /^\{\.\.\.register\(['"]email['"], \{\s*required: true\s*\}\)\}$/);
  assert.match(r.preamble.imports, /import \{ useForm \} from 'react-hook-form'/);
  assert.doesNotMatch(r.preamble.imports, /import React/);
  assert.match(r.preamble.top, /type Values/);
  assert.match(r.preamble.top, /const defaults/);
  assert.match(r.preamble.body, /const \{ register, handleSubmit \} = useForm/);
  assert.match(r.preamble.body, /const save/);
});

test("code a form library needs survives regenerating and reads back unchanged", async () => {
  const first = parseCode(rhfCode, formTree(), PAGE);
  assert.ok(first.ok);
  if (!first.ok) return;

  const code = await codeGenerator.generateToJSX(first.elements, undefined, { tagIds: true, preamble: first.preamble });
  assert.match(code, /import \{ useForm \} from 'react-hook-form'/);
  assert.match(code, /onSubmit=\{handleSubmit\(save\)\}/);
  assert.match(code, /\{\.\.\.register\(/);
  assert.match(code, /const \{ register, handleSubmit \} = useForm/);
  assert.match(code, /type Values = /);
  assert.equal((code.match(/import React/g) ?? []).length, 1);
  assert.doesNotMatch(code, /customSubmit|codeProps/, "bookkeeping settings are not attributes");

  const again = parseCode(code, first.elements, PAGE);
  assert.ok(again.ok, again.ok ? "" : again.diagnostic.message);
  if (!again.ok) return;
  assert.deepEqual(diffTrees(first.elements, again.elements), []);

  // Formatting may reflow the preamble once; after that it is stable.
  const code2 = await codeGenerator.generateToJSX(again.elements, undefined, { tagIds: true, preamble: again.preamble });
  const third = parseCode(code2, again.elements, PAGE);
  assert.ok(third.ok);
  if (third.ok) assert.deepEqual(third.preamble, again.preamble);
  assert.equal(code2, code);
});

test("removing a custom prop in the code removes it from the element", async () => {
  const first = parseCode(rhfCode, formTree(), PAGE);
  assert.ok(first.ok);
  if (!first.ok) return;
  const code = (await codeGenerator.generateToJSX(first.elements, undefined, { tagIds: true, preamble: first.preamble })).replace(
    /\s*\{\.\.\.register\([^)]*\)\s*\}\)?\}?/,
    "",
  );
  const edited = parseCode(code, first.elements, PAGE);
  if (!edited.ok) return assert.fail(edited.diagnostic.message);
  assert.equal(find(edited.elements, "email").settings.codeProps, undefined);
});

test("generated interactions leave the submit of a form that owns it alone", async () => {
  const { toCode } = await import("../src/features/interactions/codegen/interactions");
  const withButton = (customSubmit: boolean) => ({
    elements: [
      {
        id: "signup",
        name: "Signup",
        settings: { customSubmit, interactions: { ix_aaaaaaaa: { on: "submit", do: [{ toast: "Saved" }] } } },
        elements: [{ id: "go", name: "Go", settings: { interactions: { ix_bbbbbbbb: { on: "click", do: [{ toast: "Hi" }] } } } }],
      },
    ],
    variables: {},
    flows: {},
  });
  const own = toCode(withButton(true) as never);
  assert.doesNotMatch(own, /bind\("signup"/);
  assert.doesNotMatch(own, /onSignupSubmit/);
  assert.match(own, /bind\("go", "click"/, "other events still bind");
  assert.match(own, /handle their own submit/);

  const plain = toCode(withButton(false) as never);
  assert.match(plain, /bind\("signup", "submit"/);
  assert.doesNotMatch(plain, /handle their own submit/);
});

test("export default function keeps component body statements in preamble", () => {
  const code = `
export default function Page() {
  const greeting = "Hello";
  return (
    <>
      <section><div>Hi</div></section>
    </>
  );
}
`;
  const parsed = parseCode(code, [], PAGE);
  assert.ok(parsed.ok, parsed.ok ? "" : parsed.diagnostic.message);
  if (!parsed.ok) return;
  assert.match(parsed.preamble.body, /const greeting = "Hello"/);
  assert.equal(parsed.preamble.top, "");
});

test("inline whitespace, wrapped list text, and dynamic attributes behave safely", () => {
  const spaced = parseCode("const A = () => <div><div>a</div> <div>b</div></div>;", [], PAGE);
  assert.ok(spaced.ok);
  if (spaced.ok) assert.equal(spaced.elements[0].content, " ");

  const list = parseCode("const A = () => <ul><li>Plain text</li></ul>;", [], PAGE);
  assert.ok(list.ok);
  if (list.ok) {
    assert.equal(find(list.elements, list.elements[0].id).elements[0].content, "Plain text");
  }

  const dynamicSrc = parseCode('const A = () => <img src={logoUrl} alt="Logo" />;', [], PAGE);
  assert.equal(dynamicSrc.ok, false);
});

test("helper function before page component keeps helper in top preamble and hooks in body", () => {
  const code = `
const formatLabel = (n: number) => \`#\${n}\`;

const Page = () => {
  const label = formatLabel(1);
  return <section><div>Hi</div></section>;
};
`;
  const parsed = parseCode(code, [], PAGE);
  assert.ok(parsed.ok, parsed.ok ? "" : parsed.diagnostic.message);
  if (!parsed.ok) return;
  assert.match(parsed.preamble.top, /formatLabel/);
  assert.match(parsed.preamble.body, /const label = formatLabel/);
});

test("select options preserve untouched value attributes while resolving text updates", () => {
  const selectTree: EditorElement[] = [
    el("pick", "Select", {
      elements: [
        el("opt-a", "Text", { content: "opt-a" }),
        el("opt-b", "Text", { content: "Beta" }),
      ],
    }),
  ];
  const edited = ok(
    `const A = () => (
      <section>
        <select data-element-id="pick">
          <option value="opt-a">Label A</option>
          <option value="opt-b-next">Beta</option>
          <option value="opt-c">Gamma</option>
          <option>Delta</option>
        </select>
      </section>
    );`,
    selectTree,
  );
  const options = find(edited, "pick").elements as EditorElement[];
  assert.deepEqual(
    options.map((o) => o.content),
    ["Label A", "opt-b-next", "opt-c", "Delta"],
  );
});
