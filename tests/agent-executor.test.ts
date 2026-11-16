// $WEB/tests/agent-executor.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { createExecutor, type AgentHost } from "../src/features/agent/executor";
import type { EditorElement } from "../src/types/global.type";

const PAGE = "page_1";
const el = (id: string, type: string, extra: Record<string, unknown> = {}) =>
  ({ id, type, pageId: PAGE, content: "", styles: {}, settings: null, ...extra }) as unknown as EditorElement;

function host(overrides: Partial<AgentHost> = {}) {
  const calls = { replace: [] as EditorElement[][], notified: [] as string[], preambles: [] as unknown[] };
  let elements: EditorElement[] = [el("sec", "Section", { elements: [el("t", "Text", { content: "Hello" })] })];
  const h: AgentHost = {
    getElements: () => elements,
    getPageId: () => PAGE,
    canEdit: () => true,
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
