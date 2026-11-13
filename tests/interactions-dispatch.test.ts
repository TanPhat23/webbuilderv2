import { strict as assert } from "node:assert";
import { test } from "node:test";
import { chainIds, enteredIds, indexInteractions, plan, visibleTargets, createVisibleTracker } from "../src/features/interactions/runtime/dispatch";
import { useRunLogStore, RUN_LOG_LIMIT } from "../src/features/interactions/runtime/run-log-store";

const tree = [
  {
    id: "card",
    settings: { interactions: { ix_card0001: { on: "click", do: [{ toast: "card" }] } } },
    elements: [
      {
        id: "btn",
        settings: {
          interactions: {
            ix_btn00001: { on: "click", do: [{ toast: "btn" }] },
            ix_btn00002: { on: "click", enabled: false, do: [{ toast: "off" }] },
          },
        },
        elements: [],
      },
      { id: "form", settings: { interactions: { ix_form0001: { on: "submit", do: [] } } }, elements: [] },
      { id: "form2", settings: { interactions: { ix_form0002: { on: "submit", preventDefault: false, do: [] } } }, elements: [] },
    ],
  },
  { id: "plain", elements: [] },
];

test("index only holds elements with interactions, nested ones included", () => {
  const index = indexInteractions(tree);
  assert.deepEqual([...index.keys()].sort(), ["btn", "card", "form", "form2"]);
});

test("click bubbles from the inner element outward and skips disabled ones", () => {
  const index = indexInteractions(tree);
  const { runs } = plan(index, ["btn", "card"], "click", { bubble: true });
  assert.deepEqual(runs.map((r) => r.ixId), ["ix_btn00001", "ix_card0001"]);
});

test("stopPropagation stops after that element", () => {
  const t = structuredClone(tree);
  (t[0].elements[0].settings!.interactions as any).ix_btn00001.stopPropagation = true;
  const { runs } = plan(indexInteractions(t), ["btn", "card"], "click", { bubble: true });
  assert.deepEqual(runs.map((r) => r.ixId), ["ix_btn00001"]);
});

test("submit prevents the page reload unless the maker opted out", () => {
  const index = indexInteractions(tree);
  assert.equal(plan(index, ["form", "card"], "submit", { bubble: true }).preventDefault, true);
  assert.equal(plan(index, ["form2", "card"], "submit", { bubble: true }).preventDefault, false);
  assert.equal(plan(index, ["btn", "card"], "click", { bubble: true }).preventDefault, false);
});

test("a key filter matches KeyboardEvent.key ignoring case", () => {
  const index = indexInteractions([
    {
      id: "input",
      settings: {
        interactions: {
          ix_enter001: { on: "keydown", key: "Enter", do: [] },
          ix_anykey01: { on: "keydown", do: [] },
        },
      },
    },
  ]);
  assert.deepEqual(plan(index, ["input"], "keydown", { bubble: true, key: "enter" }).runs.map((r) => r.ixId), ["ix_enter001", "ix_anykey01"]);
  assert.deepEqual(plan(index, ["input"], "keydown", { bubble: true, key: "a" }).runs.map((r) => r.ixId), ["ix_anykey01"]);
});

test("visibleTargets lists elements to observe and whether they repeat", () => {
  const index = indexInteractions([
    { id: "hero", settings: { interactions: { ix_vis00001: { on: "visible", do: [] } } } },
    { id: "ticker", settings: { interactions: { ix_vis00002: { on: "visible", once: false, do: [] } } } },
    { id: "off", settings: { interactions: { ix_vis00003: { on: "visible", enabled: false, do: [] } } } },
  ]);
  assert.deepEqual(Object.fromEntries(visibleTargets(index)), { hero: { repeat: false }, ticker: { repeat: true } });
});

test("bubble:false only uses the given ids", () => {
  const { runs } = plan(indexInteractions(tree), ["btn"], "click", { bubble: false });
  assert.deepEqual(runs.map((r) => r.ixId), ["ix_btn00001"]);
});

test("chainIds walks up to the root, enteredIds diffs hover chains", () => {
  const root = { parentElement: null, getAttribute: () => null };
  const card = { parentElement: root, getAttribute: (n: string) => (n === "data-element-id" ? "card" : null) };
  const span = { parentElement: card, getAttribute: () => null };
  const btn = { parentElement: span, getAttribute: (n: string) => (n === "data-element-id" ? "btn" : null) };
  const text = { parentElement: btn };
  assert.deepEqual(chainIds(text, root), ["btn", "card"]);
  assert.deepEqual(chainIds(null, root), []);
  assert.deepEqual(enteredIds(["btn", "card"], ["card"]), ["btn"]);
  assert.deepEqual(enteredIds(["card"], ["btn", "card"]), []);
});

test("the run log keeps the newest entries", () => {
  const { push, clear } = useRunLogStore.getState();
  clear();
  for (let i = 0; i < RUN_LOG_LIMIT + 50; i++) {
    push({ at: i, elementId: "e", ixId: "ix", path: `p${i}`, verb: "toast", status: "ok" });
  }
  const entries = useRunLogStore.getState().entries;
  assert.equal(entries.length, RUN_LOG_LIMIT);
  assert.equal(entries[0].path, "p50");
  assert.equal(entries.at(-1)!.path, `p${RUN_LOG_LIMIT + 49}`);
});


test("visible once is tracked per interaction and survives unrelated index updates", () => {
  const makeIndex = (extra = false) => indexInteractions([
    { id: "hero", settings: { interactions: {
      ix_once0001: { on: "visible", do: [] },
      ix_loop0001: { on: "visible", once: false, do: [] },
      ...(extra ? { ix_once0002: { on: "visible", do: [] } } : {}),
    } } },
  ]);
  const tracker = createVisibleTracker();
  const initial = makeIndex();
  assert.deepEqual(tracker.take(initial, "hero").map(x => x.ixId), ["ix_once0001", "ix_loop0001"]);
  assert.deepEqual(tracker.take(initial, "hero").map(x => x.ixId), ["ix_loop0001"]);
  const updated = makeIndex(true);
  tracker.reconcile(updated);
  assert.deepEqual(tracker.take(updated, "hero").map(x => x.ixId), ["ix_loop0001", "ix_once0002"]);
  tracker.reconcile(new Map());
  assert.deepEqual(tracker.take(initial, "hero").map(x => x.ixId), ["ix_once0001", "ix_loop0001"]);
});

test("plan exposes native stop propagation for any matching interaction", () => {
  const t = structuredClone(tree);
  (t[0].elements[0].settings!.interactions as any).ix_btn00001.stopPropagation = true;
  assert.equal(plan(indexInteractions(t), ["btn", "card"], "click", {bubble: true}).stopPropagation, true);
  assert.equal(plan(indexInteractions(tree), ["btn"], "click", {bubble: true}).stopPropagation, false);
});

test("chains from nodes outside the host do not contribute element ids", () => {
  const root = {parentElement: null};
  const outside = {parentElement: null, getAttribute: () => "outside"};
  assert.deepEqual(chainIds(outside, root), []);
});
