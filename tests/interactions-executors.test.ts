// tests/interactions-executors.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { browserPlatform, createExecutors, elementScope, type Platform, type NodeLike } from "../src/features/interactions/runtime/executors";
import { runInteraction, type RunLogEntry } from "../src/features/interactions/runtime/run";
import { createVariableStore } from "../src/features/interactions/runtime/variables";
import { evaluate } from "../src/features/interactions/runtime/expression";

function node(tagName = "DIV", extra: Partial<NodeLike> = {}): NodeLike & { classes: Set<string>; attrs: Record<string, string> } {
  const classes = new Set<string>();
  const attrs: Record<string, string> = {};
  return {
    tagName, style: { display: "" }, classes, attrs,
    classList: { add: (c) => void classes.add(c), remove: (c) => void classes.delete(c), toggle: (c) => void (classes.has(c) ? classes.delete(c) : classes.add(c)) },
    setAttribute: (k, v) => void (attrs[k] = v),
    scrollIntoView: () => {},
    getBoundingClientRect: () => ({ top: 100 }),
    ...extra,
  };
}

function platform(nodes: Record<string, NodeLike>, over: Partial<Platform> = {}) {
  const events: string[] = [];
  const timers: (() => void)[] = [];
  const p: Platform = {
    byId: (id) => nodes[id] ?? null,
    navigate: (url, o) => void events.push(`navigate:${url}:${o.newTab}:${o.replace}`),
    toast: (kind, text) => void events.push(`toast:${kind}:${text}`),
    copy: async (text) => void events.push(`copy:${text}`),
    fetch: async () => ({ ok: true, status: 200, text: async () => '{"id":7}' }),
    download: (url, name) => void events.push(`download:${url}:${name}`),
    scrollTo: (y) => void events.push(`scrollTo:${y}`),
    scrollY: () => 50,
    later: (fn) => void timers.push(fn),
    runCode: () => 42,
    ...over,
  };
  return { p, events, timers };
}

async function go(p: Platform, steps: any[], logs: RunLogEntry[] = []) {
  const ctx = {
    elementId: "self", ixId: "ix_aaaaaaaa", executors: createExecutors(p), flows: {},
    vars: createVariableStore({}, { namespace: "t" }), steps: {} as Record<string, unknown>,
    log: (e: RunLogEntry) => logs.push(e), sleep: async () => {},
  };
  await runInteraction({ on: "click", do: steps }, ctx);
  return { logs, steps: ctx.steps };
}

test("show, hide and toggle change display", async () => {
  const box = node();
  const { p } = platform({ box });
  await go(p, [{ hide: "box" }]);
  assert.equal(box.style.display, "none");
  await go(p, [{ toggle: "box" }]);
  assert.equal(box.style.display, "");
  await go(p, [{ toggle: "box" }, { show: "box" }]);
  assert.equal(box.style.display, "");
});

test("a deleted target is skipped and later steps still run", async () => {
  const { p, events } = platform({});
  const { logs } = await go(p, [{ show: "gone" }, { toast: "after" }]);
  assert.equal(logs[0].status, "skipped");
  assert.equal(logs[0].detail, "element gone is not on the page");
  assert.deepEqual(events, ["toast:info:after"]);
});

test("navigate, toast, copy, download, scroll, class, animate, modal, submit", async () => {
  const form = node("FORM");
  let submitted = 0;
  form.requestSubmit = () => void submitted++;
  const box = node();
  const { p, events, timers } = platform({ form, box, self: node() });
  await go(p, [
    { navigate: "/pricing", newTab: true },
    { toast: "Saved", kind: "success" },
    { copy: "abc" },
    { download: "/f.pdf", filename: "f.pdf" },
    { scroll: "box", offset: -10 },
    { scroll: 300 },
    { class: "add", target: "box", name: "open" },
    { animate: "box", preset: "bounce" },
    { modal: "open", target: "box" },
    { submit: "form" },
  ]);
  assert.deepEqual(events, [
    "navigate:/pricing:true:false", "toast:success:Saved", "copy:abc", "download:/f.pdf:f.pdf",
    "scrollTo:140", "scrollTo:300",
  ]);
  assert.ok(box.classes.has("open"));
  assert.ok(box.classes.has("animate-bounce"));
  timers.forEach((t) => t());
  assert.ok(!box.classes.has("animate-bounce"), "animation class removed after the duration");
  assert.equal(box.style.display, "block");
  assert.equal(box.attrs["aria-hidden"], "false");
  assert.equal(submitted, 1);
});

test("submit or reset on something that is not a form is skipped; reset clears a form", async () => {
  const form = node("FORM");
  let resets = 0;
  form.reset = () => void resets++;
  const { p } = platform({ box: node(), form });
  const { logs } = await go(p, [{ submit: "box" }, { reset: "box" }, { reset: "form" }]);
  assert.deepEqual(logs.map((l) => l.status), ["skipped", "skipped", "ok"]);
  assert.equal(resets, 1);
});

test("call returns ok/status/data, sends JSON bodies and never throws", async () => {
  const seen: any[] = [];
  const { p } = platform({}, {
    fetch: async (url, init) => { seen.push({ url, init }); return { ok: false, status: 422, text: async () => "not json" }; },
  });
  const { steps } = await go(p, [{ id: "r", call: "api", method: "POST", url: "/api/{{ 'x' }}", body: "{{ steps }}" }]);
  assert.deepEqual(steps.r, { ok: false, status: 422, data: "not json", error: "HTTP 422" });
  assert.equal(seen[0].url, "/api/x");
  assert.equal(seen[0].init.headers["Content-Type"], "application/json");
  assert.equal(seen[0].init.body, "{}");

  const offline = platform({}, { fetch: async () => { throw new Error("Failed to fetch"); } });
  const r2 = await go(offline.p, [{ id: "r", call: "api", method: "GET", url: "/a" }]);
  assert.deepEqual(r2.steps.r, { ok: false, status: 0, data: null, error: "Failed to fetch" });

  const ok = platform({});
  const r3 = await go(ok.p, [{ id: "r", call: "api", method: "GET", url: "/a", body: "ignored on GET" }]);
  assert.deepEqual(r3.steps.r, { ok: true, status: 200, data: { id: 7 }, error: null });
});

test("el.<id> reads value, checked, visible and text lazily", () => {
  const input = node("INPUT", { value: "hello", checked: false, textContent: "" });
  const hidden = node("DIV", { textContent: "Hi" });
  hidden.style.display = "none";
  const el = elementScope((id) => ({ input, hidden } as Record<string, NodeLike>)[id] ?? null);
  const scope = { el };
  assert.equal(evaluate("el.input.value", scope), "hello");
  assert.equal(evaluate("el.hidden.visible", scope), false);
  assert.equal(evaluate("el.hidden.text", scope), "Hi");
  assert.equal(evaluate("el.missing.value", scope), undefined);
});

test("dynamic targets and class names resolve before lookup", async () => {
  const box = node();
  const { p, events } = platform({ box });
  const { logs } = await go(p, [
    { hide: "{{ 'box' }}" },
    { class: "add", target: "{{ 'box' }}", name: "{{ 'open' }}" },
    { show: "{{ 'deleted' }}" },
    { toast: "after" },
  ]);
  assert.equal(box.style.display, "none");
  assert.equal(box.classes.has("open"), true);
  assert.equal(logs[2].status, "skipped");
  assert.equal(logs[2].detail, "element deleted is not on the page");
  assert.deepEqual(events, ["toast:info:after"]);
});

test("invalid interpolated class fails without applying it", async () => {
  const box = node();
  const { p } = platform({ box });
  const { logs } = await go(p, [{ class: "add", target: "box", name: "{{ 'bad class' }}" }]);
  assert.equal(logs[0].status, "error");
  assert.equal(box.classes.size, 0);
});

test("call never throws when preparation fails", async () => {
  const { p } = platform({});
  const call = createExecutors(p).call!;
  const result = await call({ call: "api", method: "POST", url: "/", body: "{{ bad }}" }, {
    value: () => { throw new Error("bad template"); }, ctx: {} as any,
  });
  assert.deepEqual(result, { ok: false, status: 0, data: null, error: "bad template" });
});

test("unsafe navigation and download protocols are rejected", async () => {
  const { p, events } = platform({});
  const result = await go(p, [{ navigate: "javascript:alert(1)" }]);
  assert.equal(result.logs[0].status, "error");
  const result2 = await go(p, [{ download: " JAVASCRIPT:alert(1)" }]);
  assert.equal(result2.logs[0].status, "error");
  assert.deepEqual(events, []);
});

test("a numeric scroll expression scrolls to that position", async () => {
  const { p, events } = platform({});
  const { logs } = await go(p, [{ scroll: "{{ 300 }}" }]);
  assert.equal(logs[0].status, "ok");
  assert.deepEqual(events, ["scrollTo:300"]);
});


test("browser lookup only exposes allowed page elements inside its host", async () => {
  const page = node("DIV", { textContent: "page" });
  const chrome = node("DIV", { textContent: "editor secret" });
  const foreign = node("DIV", { textContent: "foreign" });
  const asElement = (id: string, n: NodeLike) => Object.assign(n, {
    getAttribute: (key: string) => key === "data-element-id" ? id : null,
  });
  const inside = asElement("page", page);
  const foreignInside = asElement("foreign", foreign);
  const outside = asElement("chrome", chrome);
  const host = {
    getAttribute: () => null,
    querySelectorAll: () => [inside, foreignInside],
  } as unknown as Element;
  const doc = {
    defaultView: {},
    getElementById: (id: string) => id === "chrome" ? outside : null,
  } as unknown as Document;
  const allowed = new Set(["page", "chrome"]);
  const p = browserPlatform(doc, host, (id) => allowed.has(id));
  assert.equal(p.byId("page"), page);
  assert.equal(p.byId("foreign"), null, "ids outside the page map are not exposed");
  assert.equal(p.byId("chrome"), null, "outside the host is not exposed even if allowed");
  const el = elementScope(p.byId);
  assert.equal(evaluate("el.chrome.text", { el }), undefined);
  const { logs } = await go(p, [{ hide: "chrome" }]);
  assert.equal(logs[0].status, "skipped");
  assert.equal(chrome.style.display, "");
  allowed.delete("page");
  assert.equal(p.byId("page"), null, "removed ids are immediately inaccessible");
});
