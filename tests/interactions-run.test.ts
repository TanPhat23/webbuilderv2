// tests/interactions-run.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { runInteraction, skip, MAX_FLOW_DEPTH, type RunContext, type RunLogEntry } from "../src/features/interactions/runtime/run";
import { createVariableStore } from "../src/features/interactions/runtime/variables";

function ctx(over: Partial<RunContext> = {}): RunContext & { logs: RunLogEntry[]; calls: string[] } {
  const logs: RunLogEntry[] = [];
  const calls: string[] = [];
  return {
    elementId: "btn",
    ixId: "ix_aaaaaaaa",
    executors: {
      toast: (s, { value }) => void calls.push(`toast:${value(s.toast)}`),
      show: (s) => (s.show === "gone" ? skip(`element ${s.show} is not on the page`) : void calls.push(`show:${s.show}`)),
      call: async (s) => (s.url === "/ok" ? { ok: true, status: 200, data: { n: 1 }, error: null } : { ok: false, status: 500, data: null, error: "HTTP 500" }),
      copy: () => { throw new Error("clipboard denied"); },
    },
    flows: {},
    vars: createVariableStore({ user: { type: "object", default: null } }, { namespace: "t" }),
    steps: {},
    log: (e) => logs.push(e),
    sleep: async () => {},
    now: () => 0,
    logs,
    calls,
    ...over,
  };
}

test("steps run in order and step results are readable later", async () => {
  const c = ctx();
  const r = await runInteraction(
    {
      on: "click",
      do: [
        { id: "r", call: "api", method: "GET", url: "/ok" },
        { if: "{{ steps.r.ok }}", then: [{ toast: "got {{ steps.r.data.n }}" }], else: [{ toast: "nope" }] },
        { set: "user", to: "{{ steps.r.data }}" },
        { toast: "user {{ vars.user.n }}" },
      ],
    },
    c,
  );
  assert.equal(r, "done");
  assert.deepEqual(c.calls, ["toast:got 1", "toast:user 1"]);
  assert.deepEqual(c.logs.map((l) => l.path), [
    "ix_aaaaaaaa.do[0]", "ix_aaaaaaaa.do[1]", "ix_aaaaaaaa.do[1].then[0]", "ix_aaaaaaaa.do[2]", "ix_aaaaaaaa.do[3]",
  ]);
  assert.equal(c.logs[1].detail, "then");
});

test("a failed call does not stop the interaction; the else branch can handle it", async () => {
  const c = ctx();
  await runInteraction(
    { on: "click", do: [{ id: "r", call: "api", method: "GET", url: "/bad" }, { if: "{{ steps.r.ok }}", then: [], else: [{ toast: "failed {{ steps.r.status }}" }] }] },
    c,
  );
  assert.deepEqual(c.calls, ["toast:failed 500"]);
  assert.equal(c.logs[0].status, "error");
  assert.equal(c.logs[0].detail, "HTTP 500");
});

test("a call executor that throws is turned into ok:false and logged", async () => {
  const c = ctx();
  c.executors.call = async () => { throw new Error("offline"); };
  await runInteraction({ on: "click", do: [{ id: "r", call: "api", method: "GET", url: "/x" }, { toast: "{{ steps.r.error }}" }] }, c);
  assert.equal(c.logs[0].status, "error");
  assert.deepEqual(c.calls, ["toast:offline"]);
});

test("any other failure stops the interaction with the step path", async () => {
  const c = ctx();
  const r = await runInteraction({ on: "click", do: [{ copy: "x" }, { toast: "never" }] }, c);
  assert.equal(r, "stopped");
  assert.deepEqual(c.calls, []);
  assert.equal(c.logs[0].status, "error");
  assert.equal(c.logs[0].detail, "clipboard denied");
  assert.equal(c.logs[0].path, "ix_aaaaaaaa.do[0]");
});

test("an expression error stops the interaction", async () => {
  const c = ctx();
  assert.equal(await runInteraction({ on: "click", do: [{ toast: "{{ 1 + }}" }, { toast: "never" }] }, c), "stopped");
  assert.match(c.logs[0].detail!, /unexpected end/);
});

test("dangling references are skipped and the rest still runs", async () => {
  const c = ctx();
  await runInteraction({ on: "click", do: [{ show: "gone" }, { set: "ghost", to: "1" }, { run: "noFlow" }, { toast: "after" }] }, c);
  assert.deepEqual(c.logs.map((l) => l.status), ["skipped", "skipped", "skipped", "ok"]);
  assert.equal(c.logs[0].detail, "element gone is not on the page");
  assert.equal(c.logs[1].detail, "no variable named ghost");
  assert.equal(c.logs[2].detail, "no flow named noFlow");
  assert.deepEqual(c.calls, ["toast:after"]);
});

test("verbs without an executor are skipped", async () => {
  const c = ctx();
  await runInteraction({ on: "click", do: [{ navigate: "/x" }] }, c);
  assert.equal(c.logs[0].status, "skipped");
});

test("flows run with their own path and recursion is bounded", async () => {
  const c = ctx({ flows: { greet: { do: [{ toast: "hi" }] }, loop: { do: [{ run: "loop" }] } } });
  await runInteraction({ on: "click", do: [{ run: "greet" }] }, c);
  assert.deepEqual(c.calls, ["toast:hi"]);
  assert.equal(c.logs[1].path, "flow:greet.do[0]");

  const d = ctx({ flows: { loop: { do: [{ run: "loop" }] } } });
  assert.equal(await runInteraction({ on: "click", do: [{ run: "loop" }] }, d), "stopped");
  assert.match(d.logs.at(-1)!.detail!, new RegExp(`${MAX_FLOW_DEPTH}`));
});

test("wait uses the injected sleep", async () => {
  const waited: number[] = [];
  const c = ctx({ sleep: async (ms) => void waited.push(ms) });
  await runInteraction({ on: "click", do: [{ wait: 250 }] }, c);
  assert.deepEqual(waited, [250]);
});

test("step results cannot change the steps object prototype", async () => {
  const c = ctx();
  const original = Object.getPrototypeOf(c.steps);
  await runInteraction({ on: "click", do: [{ id: "__proto__", call: "api", method: "GET", url: "/ok" }] }, c);
  assert.equal(Object.getPrototypeOf(c.steps), original);
  assert.equal(Object.hasOwn(c.steps, "__proto__"), true);
});

test("control steps expose their result after execution", async () => {
  const c = ctx({ flows: { greet: { do: [{ toast: "inside" }] } } });
  const result = await runInteraction({ on: "click", do: [
    { id: "decision", if: "{{ 2 > 1 }}", then: [] },
    { id: "flow", run: "greet" },
    { toast: "{{ steps.decision }} / {{ steps.flow }}" },
  ] }, c);
  assert.equal(result, "done");
  assert.deepEqual(c.calls, ["toast:inside", "toast:true / true"]);
});
