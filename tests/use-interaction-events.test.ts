import assert from "node:assert/strict";
import { test } from "node:test";
import type { InteractionMap } from "@webbuilder/site-runtime/interactions/schema";
import type { Planned } from "@webbuilder/site-runtime/interactions/runtime/dispatch";
import type { HostRunner } from "@webbuilder/site-runtime/interactions/runtime/hostDom";
import type { NodeLike, Platform } from "@webbuilder/site-runtime/interactions/runtime/executors";
import {
  dispatchImageError,
  dispatchPendingLoads,
  dispatchHoverEvent,
  dispatchNativeEvent,
  pruneStaleLoadHistory,
  resolveNativeTargetIds,
  type ImageErrorState,
} from "@webbuilder/site-runtime/interactions/hooks/useInteractionEvents";

class FakeElement {
  parentElement: FakeElement | null = null;
  ownerDocument: { defaultView: { Element: typeof FakeElement } };
  complete = false;
  naturalWidth = 0;
  currentSrc = "";
  readonly tagName: string;
  private readonly attrs: ReadonlyMap<string, string>;

  constructor(
    tagName: string,
    ownerDoc: { defaultView: { Element: typeof FakeElement } },
    attrs: Record<string, string> = {},
    parent: FakeElement | null = null,
  ) {
    this.tagName = tagName;
    this.ownerDocument = ownerDoc;
    this.attrs = new Map(Object.entries(attrs));
    this.parentElement = parent;
  }

  getAttribute(name: string): string | null {
    return this.attrs.get(name) ?? null;
  }
}

interface EventLog {
  prevented: number;
  stopped: number;
}

function makeDomFixture() {
  const ownerDoc = { defaultView: { Element: FakeElement } };
  const root = new FakeElement("DIV", ownerDoc);
  const form = new FakeElement("FORM", ownerDoc, { "data-element-id": "form-1" }, root);
  const button = new FakeElement("BUTTON", ownerDoc, { "data-element-id": "btn-1" }, form);
  const iconSpan = new FakeElement("SPAN", ownerDoc, {}, button);
  const outside = new FakeElement("DIV", ownerDoc, { "data-element-id": "outside-1" }, null);
  return { ownerDoc, root, form, button, iconSpan, outside };
}

function asElement(node: FakeElement): Element {
  return node as unknown as Element;
}

function makeEvent(
  type: string,
  target: FakeElement | null,
  extra: { key?: string; relatedTarget?: FakeElement | null } = {},
): { event: Event; log: EventLog } {
  const log: EventLog = { prevented: 0, stopped: 0 };
  const eventObj = {
    type,
    target,
    ...(extra.key !== undefined ? { key: extra.key } : {}),
    ...(extra.relatedTarget !== undefined ? { relatedTarget: extra.relatedTarget } : {}),
    preventDefault: () => {
      log.prevented++;
    },
    stopPropagation: () => {
      log.stopped++;
    },
  };
  return { event: eventObj as unknown as Event, log };
}

function makeRunner(nodes: Record<string, FakeElement> = {}): {
  runner: HostRunner;
  fired: { runs: Planned[]; event: Event | null }[];
} {
  const fired: { runs: Planned[]; event: Event | null }[] = [];
  const platform: Platform = {
    byId: (id) => (id in nodes ? (nodes[id] as unknown as NodeLike) : null),
    navigate: () => {},
    toast: () => {},
    copy: async () => {},
    fetch: async () => ({ ok: true, status: 200, text: async () => "" }),
    download: () => {},
    scrollTo: () => {},
    scrollY: () => 0,
    later: () => {},
    runCode: () => undefined,
  };
  const runner: HostRunner = {
    platform,
    runOne: async () => {},
    fireSequence: (runs, event) => {
      fired.push({ runs, event });
    },
  };
  return { runner, fired };
}

test("resolveNativeTargetIds distinguishes bubbling chains, direct self-only targets, and outside nodes", () => {
  const { root, button, iconSpan, outside } = makeDomFixture();

  assert.deepEqual(
    resolveNativeTargetIds(asElement(iconSpan), asElement(root), false),
    ["btn-1", "form-1"],
  );
  assert.deepEqual(
    resolveNativeTargetIds(asElement(button), asElement(root), true),
    ["btn-1"],
  );
  assert.deepEqual(
    resolveNativeTargetIds(asElement(iconSpan), asElement(root), true),
    [],
  );
  assert.deepEqual(
    resolveNativeTargetIds(asElement(outside), asElement(root), false),
    [],
  );
});

test("dispatchNativeEvent dispatches bubbling click/submit, enforces self-only focus, and matches keydown keys", () => {
  const { root, form, button, iconSpan } = makeDomFixture();
  const index = new Map<string, InteractionMap>([
    [
      "btn-1",
      {
        ix_click: { on: "click", preventDefault: true, stopPropagation: true, do: [{ toast: "btn" }] },
        ix_btn_focus: { on: "focus", do: [{ toast: "btn-focus" }] },
        ix_enter: { on: "keydown", key: "Enter", do: [{ toast: "enter" }] },
      },
    ],
    [
      "form-1",
      {
        ix_form_click: { on: "click", do: [{ toast: "form" }] },
        ix_form_focus: { on: "focus", do: [{ toast: "form-focus" }] },
        ix_submit: { on: "submit", do: [{ toast: "submitted" }] },
      },
    ],
  ]);

  const { runner, fired } = makeRunner();

  const ignored = makeEvent("pointermove", button);
  dispatchNativeEvent(ignored.event, asElement(root), index, runner);
  assert.equal(fired.length, 0);

  const click = makeEvent("click", iconSpan);
  dispatchNativeEvent(click.event, asElement(root), index, runner);
  assert.equal(click.log.prevented, 1);
  assert.equal(click.log.stopped, 1);
  assert.deepEqual(
    fired[0].runs.map((r) => r.ixId),
    ["ix_click"],
  );

  const untaggedFocus = makeEvent("focusin", iconSpan);
  dispatchNativeEvent(untaggedFocus.event, asElement(root), index, runner);
  assert.equal(fired.length, 1);

  const buttonFocus = makeEvent("focusin", button);
  dispatchNativeEvent(buttonFocus.event, asElement(root), index, runner);
  assert.deepEqual(
    fired[1].runs.map((r) => r.ixId),
    ["ix_btn_focus"],
  );

  const directSubmit = makeEvent("submit", form);
  dispatchNativeEvent(directSubmit.event, asElement(root), index, runner);
  assert.equal(directSubmit.log.prevented, 1);
  assert.deepEqual(
    fired[2].runs.map((r) => r.ixId),
    ["ix_submit"],
  );

  const wrongKey = makeEvent("keydown", button, { key: "Escape" });
  dispatchNativeEvent(wrongKey.event, asElement(root), index, runner);
  assert.equal(fired.length, 3);

  const rightKey = makeEvent("keydown", button, { key: "enter" });
  dispatchNativeEvent(rightKey.event, asElement(root), index, runner);
  assert.deepEqual(
    fired[3].runs.map((r) => r.ixId),
    ["ix_enter"],
  );
});

test("dispatchHoverEvent dispatches mouseenter and mouseleave only for entered or left element IDs", () => {
  const { root, form, button } = makeDomFixture();
  const index = new Map<string, InteractionMap>([
    ["form-1", { ix_form_enter: { on: "mouseenter", do: [] } }],
    [
      "btn-1",
      {
        ix_btn_enter: { on: "mouseenter", do: [] },
        ix_btn_leave: { on: "mouseleave", do: [] },
      },
    ],
  ]);
  const { runner, fired } = makeRunner();

  const over = makeEvent("mouseover", button, { relatedTarget: form });
  dispatchHoverEvent(over.event, asElement(root), index, runner);
  assert.deepEqual(
    fired[0].runs.map((r) => r.ixId),
    ["ix_btn_enter"],
  );

  const out = makeEvent("mouseout", button, { relatedTarget: form });
  dispatchHoverEvent(out.event, asElement(root), index, runner);
  assert.deepEqual(
    fired[1].runs.map((r) => r.ixId),
    ["ix_btn_leave"],
  );
});

test("pruneStaleLoadHistory deletes removed elements and non-load entries", () => {
  const fired = new Map<string, Set<string>>([
    ["el-1", new Set(["ix_load", "ix_click"])],
    ["el-removed", new Set(["ix_old"])],
  ]);
  const index = new Map<string, InteractionMap>([
    [
      "el-1",
      {
        ix_load: { on: "load", do: [] },
        ix_click: { on: "click", do: [] },
      },
    ],
  ]);

  pruneStaleLoadHistory(fired, index);
  assert.deepEqual([...fired.get("el-1")!], ["ix_load"]);
  assert.equal(fired.has("el-removed"), false);
});

test("dispatchImageError deduplicates broken image loads and absorbs native error echoes", () => {
  const { ownerDoc, root, outside } = makeDomFixture();
  const img = new FakeElement(
    "IMG",
    ownerDoc,
    { "data-element-id": "img-1", src: "/broken.png" },
    root,
  );
  const index = new Map<string, InteractionMap>([
    ["img-1", { ix_err: { on: "error", preventDefault: true, do: [] } }],
  ]);
  const imageErrors = new WeakMap<Element, ImageErrorState>();
  const { runner, fired } = makeRunner();

  dispatchImageError(asElement(outside), null, asElement(root), index, imageErrors, runner);
  assert.equal(fired.length, 0);

  dispatchImageError(asElement(img), null, asElement(root), index, imageErrors, runner);
  dispatchImageError(asElement(img), null, asElement(root), index, imageErrors, runner);
  assert.equal(fired.length, 1);

  const nativeEcho = makeEvent("error", img);
  dispatchImageError(asElement(img), nativeEcho.event, asElement(root), index, imageErrors, runner);
  assert.equal(fired.length, 1);

  const nextNative = makeEvent("error", img);
  dispatchImageError(asElement(img), nextNative.event, asElement(root), index, imageErrors, runner);
  assert.equal(fired.length, 2);
});

test("dispatchPendingLoads fires load interactions once per element and triggers error on broken loaded images", () => {
  const { ownerDoc, root, button } = makeDomFixture();
  const brokenImg = new FakeElement(
    "IMG",
    ownerDoc,
    { "data-element-id": "img-1", src: "/broken.png" },
    root,
  );
  brokenImg.complete = true;
  brokenImg.naturalWidth = 0;

  const index = new Map<string, InteractionMap>([
    ["btn-1", { ix_load: { on: "load", do: [] } }],
    ["img-1", { ix_err: { on: "error", do: [] } }],
    ["missing-1", { ix_missing_load: { on: "load", do: [] } }],
  ]);
  const firedHistory = new Map<string, Set<string>>();
  const imageErrors = new WeakMap<Element, ImageErrorState>();
  const { runner, fired } = makeRunner({ "btn-1": button, "img-1": brokenImg });

  dispatchPendingLoads(asElement(root), index, firedHistory, imageErrors, runner);
  dispatchPendingLoads(asElement(root), index, firedHistory, imageErrors, runner);

  assert.equal(fired.length, 2);
  assert.deepEqual(
    fired.map((entry) => entry.runs[0].ixId),
    ["ix_load", "ix_err"],
  );
});
