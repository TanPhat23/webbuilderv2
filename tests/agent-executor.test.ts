// $WEB/tests/agent-executor.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { createExecutor, type AgentHost } from "../src/features/agent/executor";
import type { EditorElement } from "../src/types/global.type";

const PAGE = "page_1";
const el = (id: string, type: string, extra: Record<string, unknown> = {}) =>
  ({ id, type, pageId: PAGE, content: "", styles: {}, settings: null, ...extra }) as unknown as EditorElement;

function host(overrides: Partial<AgentHost> = {}) {
  const calls = { replace: [] as EditorElement[][], notified: [] as string[], preambles: [] as unknown[], opened: [] as string[], created: [] as string[], styles: [] as unknown[], projectNotes: [] as string[] };
  let elements: EditorElement[] = [el("sec", "Section", { elements: [el("t", "Text", { content: "Hello" })] })];
  const h: AgentHost = {
    getElements: () => elements,
    getComponents: async () => ({ pages: [], elements: [], pageIds: new Set() }),
    createComponent: async (name) => ({ id: "master", name }),
    getPageId: () => PAGE,
    isReady: () => true,
    canEdit: () => true,
    canEditProject: () => true,
    canCreatePages: () => true,
    createPage: async (name) => { calls.created.push(name); return { id: "new_page", name }; },
    openPage: async (id) => { calls.opened.push(id); return id !== "ghost"; },
    setProjectStyle: async (patch) => { calls.styles.push(patch); return { css: "old{}" }; },
    notifyProjectChanged: (s) => calls.projectNotes.push(s),
    replaceTree: (next) => { calls.replace.push(next); elements = next; },
    getSelectedId: () => "t",
    generateCode: async () => "export default function Generated() { return null }",
    getPreamble: () => ({ imports: "", top: "", body: "" }),
    setPreamble: (p) => calls.preambles.push(p),
    notifyChanged: (s) => calls.notified.push(s),
    ...overrides,
  };
  return { h, calls };
}
const req = (tool: string, args: unknown, extra: Record<string, unknown> = {}) => ({ requestId: `r-${Math.random()}`, tool, pageId: PAGE, args, ...extra });

test("apply_edits applies once, as one undo step, and notifies", async () => {
  const { h, calls } = host();
  const out = await createExecutor(h)(req("apply_edits", { operations: [{ op: "update", id: "t", set: { content: "A" } }, { op: "update", id: "t", set: { content: "B" } }] }));
  assert.equal(out.ok, true);
  assert.equal(calls.replace.length, 1, "two operations must still be a single replaceTree call");
  assert.equal(calls.notified.length, 1);
});

test("an invalid operation changes nothing and reports issues with paths", async () => {
  const { h, calls } = host();
  const out = await createExecutor(h)(req("apply_edits", { operations: [{ op: "delete", id: "t" }, { op: "delete", id: "ghost" }] }));
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.equal(out.error.code, "invalid_edit");
    assert.equal(out.error.issues?.[0].path, "operations[1].id");
  }
  assert.equal(calls.replace.length, 0);
});

test("a read-only user cannot write but can read", async () => {
  const { h, calls } = host({ canEdit: () => false });
  const run = createExecutor(h);
  const denied = await run(req("apply_edits", { operations: [{ op: "delete", id: "t" }] }));
  assert.ok(!denied.ok && denied.error.code === "forbidden");
  assert.equal(calls.replace.length, 0);
  assert.equal((await run(req("get_code", {}))).ok, true);
  assert.equal((await run(req("get_selection", {}))).ok, true);
});

test("a request for a page that is not open fails with page_not_open and changes nothing", async () => {
  const { h, calls } = host({ getPageId: () => "page_2" });
  const out = await createExecutor(h)(req("apply_edits", { operations: [{ op: "delete", id: "t" }] }));
  assert.ok(!out.ok && out.error.code === "page_not_open");
  assert.match(out.ok ? "" : out.error.message, /page_1/);
  assert.equal(calls.replace.length, 0);
});

test("the same request id is applied once even when delivered twice", async () => {
  const { h, calls } = host();
  const run = createExecutor(h);
  const r = req("apply_edits", { operations: [{ op: "update", id: "t", set: { content: "Once" } }] }, { requestId: "dup-1" });
  const first = await run(r);
  const second = await run(r);
  assert.deepEqual(second, first);
  assert.equal(calls.replace.length, 1);
});

test("set_code parses the source, replaces the tree once and saves a changed preamble", async () => {
  const { h, calls } = host();
  const code = `export default function Generated() {\n  return (\n    <section data-element-id="sec">\n      <div data-element-id="t">Changed text</div>\n    </section>\n  );\n}\n`;
  const out = await createExecutor(h)(req("set_code", { code }));
  assert.equal(out.ok, true, JSON.stringify(out));
  assert.equal(calls.replace.length, 1);
  const sec = calls.replace[0][0] as unknown as { elements: { content: string }[] };
  assert.equal(sec.elements[0].content, "Changed text");
});

test("set_code with code the parser rejects reports the location and changes nothing", async () => {
  const { h, calls } = host();
  const out = await createExecutor(h)(req("set_code", { code: "export default function Generated() { return <section> }" }));
  assert.ok(!out.ok && out.error.code === "invalid_edit");
  assert.match(out.ok ? "" : (out.error.issues?.[0].path ?? ""), /^code:\d+:\d+$/);
  assert.equal(calls.replace.length, 0);
});

test("get_selection returns the selected element, get_code returns the source", async () => {
  const { h } = host();
  const run = createExecutor(h);
  const sel = await run(req("get_selection", {}));
  assert.ok(sel.ok);
  assert.deepEqual((sel.ok && (sel.result as { elements: { id: string }[] }).elements.map((e) => e.id)), ["t"]);
  const code = await run(req("get_code", {}));
  assert.ok(code.ok && typeof (code.result as { code: string }).code === "string");
});

test("unknown tools and a throwing host become clean errors", async () => {
  const { h } = host({ generateCode: async () => { throw new Error("boom"); } });
  const run = createExecutor(h);
  const unknown = await run(req("format_disk", {}));
  assert.ok(!unknown.ok && unknown.error.code === "unknown_tool");
  const broke = await run(req("get_code", {}));
  assert.ok(!broke.ok && broke.error.code === "internal");
});

test("get_page returns the live tree, not the last save", async () => {
  const { h } = host();
  const out = await createExecutor(h)(req("get_page", {}));
  assert.ok(out.ok);
  if (out.ok) {
    const r = out.result as { source: string; elements: { id: string; children?: { id: string; content?: string }[] }[] };
    assert.equal(r.source, "editor");
    assert.equal(r.elements[0].children?.[0].content, "Hello");
  }
});

test("page tools wait while the page is still loading", async () => {
  const { h, calls } = host({ isReady: () => false });
  const run = createExecutor(h);
  for (const tool of ["get_page", "get_code", "apply_edits"]) {
    const out = await run(req(tool, { operations: [{ op: "delete", id: "t" }] }));
    assert.ok(!out.ok && out.error.code === "editor_not_ready", tool);
  }
  assert.equal(calls.replace.length, 0);
});

test("open_page switches page, works from any open page, and rejects unknown pages", async () => {
  const { h, calls } = host({ getPageId: () => "page_2" });
  const run = createExecutor(h);
  const ok = await run(req("open_page", { pageId: "page_1" }, { pageId: undefined }));
  assert.ok(ok.ok);
  assert.deepEqual(calls.opened, ["page_1"]);
  const missing = await run(req("open_page", { pageId: "ghost" }, { pageId: undefined }));
  assert.ok(!missing.ok && missing.error.code === "page_not_found");
  const same = await createExecutor(host().h)(req("open_page", { pageId: PAGE }));
  assert.ok(same.ok && (same.result as { alreadyOpen?: boolean }).alreadyOpen);
});

test("set_project_style sanitizes the CSS, reports what it replaced and can be undone", async () => {
  const { h, calls } = host({ getPageId: () => undefined });
  const out = await createExecutor(h)(req("set_project_style", { css: "<style>body{color:red}</style><script>x</script>", theme: { fontFamily: "Inter" } }, { pageId: undefined }));
  assert.ok(out.ok);
  assert.equal((calls.styles[0] as { css: string }).css, "body{color:red}");
  assert.equal((out as { result: { previousCss: string } }).result.previousCss, "old{}");
  assert.equal(calls.projectNotes.length, 1);
});

test("set_project_style needs project edit rights and something to set", async () => {
  const denied = await createExecutor(host({ canEditProject: () => false }).h)(req("set_project_style", { css: "a{}" }));
  assert.ok(!denied.ok && denied.error.code === "forbidden");
  const { h, calls } = host();
  const empty = await createExecutor(h)(req("set_project_style", {}));
  assert.ok(!empty.ok && empty.error.code === "invalid_edit");
  const bad = await createExecutor(h)(req("set_project_style", { theme: ["x"] }));
  assert.ok(!bad.ok);
  assert.equal(calls.styles.length, 0);
});

test("set_project_style validates theme tokens and merges presets cleanly", async () => {
  const { h, calls } = host();
  const run = createExecutor(h);

  const badPreset = await run(req("set_project_style", { preset: "Neon" }, { pageId: undefined }));
  assert.ok(!badPreset.ok && badPreset.error.code === "invalid_edit");
  assert.equal(badPreset.error.issues?.[0]?.path, "preset");

  const badToken = await run(req("set_project_style", { theme: { shadowStyle: "huge" } }, { pageId: undefined }));
  assert.ok(!badToken.ok && badToken.error.code === "invalid_edit");
  assert.equal(badToken.error.issues?.[0]?.path, "theme.shadowStyle");
  assert.equal(calls.styles.length, 0);

  const presetRes = await run(req("set_project_style", {
    preset: "green forest",
    theme: { fontFamily: "Lora", borderRadius: 12 },
  }, { pageId: undefined }));
  assert.equal(presetRes.ok, true);
  assert.equal(calls.styles.length, 1);
  const applied = (calls.styles[0] as { theme: Record<string, unknown> }).theme;
  assert.equal(applied.primary, "#10b981");
  assert.equal(applied.fontFamily, "Lora");
  assert.equal(applied.borderRadius, 12);
});

test("create_page makes an empty page and can open it", async () => {
  const { h, calls } = host({ getPageId: () => undefined });
  const run = createExecutor(h);
  const plain = await run(req("create_page", { name: "  Pricing " }, { pageId: undefined }));
  assert.ok(plain.ok);
  assert.deepEqual(calls.created, ["Pricing"]);
  assert.deepEqual(calls.opened, []);
  const open = await run(req("create_page", { name: "About", open: true }, { pageId: undefined }));
  assert.ok(open.ok && (open.result as { opened: boolean; pageId: string }).opened);
  assert.deepEqual(calls.opened, ["new_page"]);
});

test("create_page needs the right to create pages and a sane name", async () => {
  const denied = await createExecutor(host({ canCreatePages: () => false }).h)(req("create_page", { name: "x" }));
  assert.ok(!denied.ok && denied.error.code === "forbidden");
  const { h, calls } = host();
  for (const args of [{}, { name: "   " }, { name: "a".repeat(256) }, { name: "ok", open: "yes" }]) {
    const out = await createExecutor(h)(req("create_page", args));
    assert.ok(!out.ok && out.error.code === "invalid_edit", JSON.stringify(args).slice(0, 40));
  }
  assert.equal(calls.created.length, 0);
});

test("create_page supports dynamic :param, catch-all *, and CMS collection options and validates constraints", async () => {
  const createdCalls: Array<{ name: string; options?: unknown }> = [];
  const { h } = host({
    getPageId: () => undefined,
    createPage: async (name, options) => {
      createdCalls.push({ name, options });
      return {
        id: "dp_1",
        name,
        slug: options?.slug ?? "",
        type: options?.type ?? "sp",
        contentTypeId: options?.contentTypeId ?? null,
      };
    },
  });
  const run = createExecutor(h);

  const dynamic = await run(req("create_page", {
    name: "Blog Post",
    type: "dp",
    slug: "/blog/:slug/",
    contentTypeId: "ct-blog",
  }, { pageId: undefined }));
  assert.equal(dynamic.ok, true);
  assert.deepEqual(createdCalls[0], {
    name: "Blog Post",
    options: { type: "dp", slug: "blog/:slug", contentTypeId: "ct-blog" },
  });

  const catchAll = await run(req("create_page", {
    name: "Docs Fallback",
    type: "dp",
    slug: "docs/*path",
    requireAuth: true,
  }, { pageId: undefined }));
  assert.equal(catchAll.ok, true);
  assert.deepEqual(createdCalls[1], {
    name: "Docs Fallback",
    options: { type: "dp", slug: "docs/*path", requireAuth: true },
  });

  for (const bad of [
    { name: "Bad", type: "cp" },
    { name: "Bad", type: "sp", slug: "blog/:slug" },
    { name: "Bad", slug: "docs/*path" },
    { name: "Bad", type: "dp", slug: "docs/*path/edit" },
    { name: "Bad", type: "sp", contentTypeId: "ct-blog" },
  ]) {
    const out = await run(req("create_page", bad, { pageId: undefined }));
    assert.ok(!out.ok && out.error.code === "invalid_edit", JSON.stringify(bad));
  }
  assert.equal(createdCalls.length, 2);
});

test("a refused write says why, so the CLI can tell the user what to change", async () => {
  const { h, calls } = host({ canEdit: () => false, whyNotEditable: () => ({ code: "editor_locked", message: "The editor is in code mode." }) });
  const out = await createExecutor(h)(req("apply_edits", { operations: [{ op: "delete", id: "t" }] }));
  assert.ok(!out.ok && out.error.code === "editor_locked" && /code mode/.test(out.error.message));
  assert.equal(calls.replace.length, 0);
});

test("component tools list roots and usage, create a master, and detach an instance", async () => {
  const root = el("root", "Text", { pageId: "master", content: "Master content" });
  const link = el("linked", "Text", { settings: { component: { pageId: "master", rootId: "root" } } });
  const { h, calls } = host({
    getElements: () => [link],
    getComponents: async () => ({ pages: [{ id: "master", name: "Card" }], elements: [root, link], pageIds: new Set(["master"]) }),
    createComponent: async (name, fromElementId) => ({ id: "created", name, rootId: fromElementId === "linked" ? "created-root" : undefined }),
  });
  const run = createExecutor(h);
  const listed = await run(req("list_components", {}));
  assert.deepEqual(listed, { ok: true, result: { components: [{ id: "master", name: "Card", usage: 1, root: { id: "root", type: "Text", content: "Master content" } }] } });
  const read = await run(req("get_page", {}));
  assert.ok(read.ok);
  const [node] = (read.result as { elements: Record<string, unknown>[] }).elements;
  assert.deepEqual(node.component, { id: "master", name: "Card" });
  assert.equal("children" in node, false);
  assert.deepEqual(await run(req("create_component", { name: "New", fromElementId: "linked" })), { ok: true, result: { id: "created", name: "New", rootId: "created-root" } });
  assert.deepEqual(await run(req("create_component", { name: "Empty" })), { ok: true, result: { id: "created", name: "Empty", rootId: undefined } });
  assert.equal((await run(req("detach_component", { elementId: "linked" }))).ok, true);
  assert.equal(calls.replace.length, 1);
  assert.equal(calls.replace[0][0].content, "Master content");
  assert.equal(calls.replace[0][0].settings?.component, undefined);
});

test("duplicate component creation requests share the in-flight operation", async () => {
  let calls = 0;
  let complete!: () => void;
  const save = new Promise<void>((resolve) => { complete = resolve; });
  const { h } = host({
    createComponent: async (name) => {
      calls++;
      await save;
      return { id: "master", name };
    },
  });
  const run = createExecutor(h);
  const request = req("create_component", { name: "Card" });
  const first = run(request);
  const duplicate = run(request);
  complete();
  assert.deepEqual(await first, await duplicate);
  assert.equal(calls, 1);
});

test("code edits cannot add children to linked instances", async () => {
  const { h, calls } = host({
    getElements: () => [el("linked", "Section", { settings: { component: { pageId: "master", rootId: "root" } } })],
  });
  const result = await createExecutor(h)(req("set_code", {
    code: 'export default function Generated() { return <section data-element-id="linked"><div>New child</div></section> }',
  }));
  assert.ok(!result.ok && result.error.code === "invalid_edit");
  assert.equal(calls.replace.length, 0);
});
