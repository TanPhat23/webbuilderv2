import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import type { AgentPresence } from "@/features/collaboration/interfaces/websocket";
import type { TreeOp } from "@/features/editor/utils/element/treeDiff";
import type {
  ContainerElement,
  EditorElement,
  ElementTypeMap,
} from "@/types/global.type";
import { createExecutor, type AgentHost } from "@/features/agent/executor";
import { createLiveEditPlayer } from "@/features/agent/liveEditPlayer";
import { useAgentPlaybackStore } from "@/features/agent/playbackStore";

function makeText(
  id: string,
  overrides: Partial<ElementTypeMap["Text"]> = {},
): ElementTypeMap["Text"] {
  return {
    id,
    type: "Text",
    name: overrides.name ?? "Text",
    content: overrides.content ?? "",
    styles: overrides.styles ?? {},
    tailwindStyles: overrides.tailwindStyles ?? "",
    pageId: "page-1",
    parentId: overrides.parentId,
    order: overrides.order ?? 0,
    ...overrides,
  };
}

function makeSection(
  id: string,
  elements: EditorElement[],
  overrides: Partial<ElementTypeMap["Section"]> = {},
): ElementTypeMap["Section"] {
  return {
    id,
    type: "Section",
    name: overrides.name ?? "Section",
    content: overrides.content ?? "",
    styles: overrides.styles ?? {},
    tailwindStyles: overrides.tailwindStyles ?? "",
    pageId: "page-1",
    parentId: overrides.parentId,
    order: overrides.order ?? 0,
    elements,
    ...overrides,
  };
}

function isContainer(el: EditorElement | undefined): el is ContainerElement {
  return Boolean(el && "elements" in el && Array.isArray(el.elements));
}

interface ScheduledTimer {
  readonly id: number;
  readonly runAt: number;
  readonly fn: () => void;
}

function createFakeClock() {
  let now = 0;
  let nextId = 1;
  const timers = new Map<number, ScheduledTimer>();

  const setTimeoutFn = (
    fn: () => void,
    ms: number,
  ): ReturnType<typeof setTimeout> => {
    const id = nextId++;
    timers.set(id, { id, runAt: now + Math.max(0, ms), fn });
    return id as unknown as ReturnType<typeof setTimeout>;
  };

  const clearTimeoutFn = (id: ReturnType<typeof setTimeout>): void => {
    timers.delete(Number(id));
  };

  const advanceBy = (ms: number): void => {
    const target = now + ms;
    while (true) {
      let earliest: ScheduledTimer | null = null;
      for (const timer of timers.values()) {
        if (timer.runAt <= target && (!earliest || timer.runAt < earliest.runAt)) {
          earliest = timer;
        }
      }
      if (!earliest) break;
      timers.delete(earliest.id);
      now = earliest.runAt;
      earliest.fn();
    }
    now = target;
  };

  const runAll = (): void => {
    let guard = 0;
    while (timers.size > 0 && guard < 1000) {
      guard += 1;
      let earliest: ScheduledTimer | null = null;
      for (const timer of timers.values()) {
        if (!earliest || timer.runAt < earliest.runAt) {
          earliest = timer;
        }
      }
      if (!earliest) break;
      timers.delete(earliest.id);
      now = earliest.runAt;
      earliest.fn();
    }
  };

  return { setTimeoutFn, clearTimeoutFn, advanceBy, runAll };
}

function createHarness(options: { readonly reducedMotion?: boolean } = {}) {
  let elements: EditorElement[] = [];
  const snapshots: EditorElement[][] = [];
  const emittedBatches: (readonly TreeOp[])[] = [];
  const presenceLog: (AgentPresence | null)[] = [];
  const clock = createFakeClock();

  useAgentPlaybackStore.getState().clear();

  const player = createLiveEditPlayer({
    getElements: () => elements,
    rememberTree: (prev) => {
      snapshots.push(prev);
    },
    applyProgressiveStep: (next, ops) => {
      elements = next;
      emittedBatches.push(ops);
    },
    playback: {
      start: (input) => useAgentPlaybackStore.getState().start(input),
      setStep: (input) => useAgentPlaybackStore.getState().setStep(input),
      clear: () => useAgentPlaybackStore.getState().clear(),
    },
    prefersReducedMotion: () => options.reducedMotion ?? false,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn,
  });

  player.setPresenceBroadcaster((agent) => {
    presenceLog.push(agent);
  });

  return {
    player,
    clock,
    getElements: (): EditorElement[] => elements,
    setElements: (next: EditorElement[]): void => {
      elements = next;
    },
    snapshots,
    emittedBatches,
    presenceLog,
  };
}

afterEach(() => {
  useAgentPlaybackStore.getState().clear();
});

describe("LiveEditPlayer", () => {
  it("records exactly 1 Undo snapshot and emits progressive steps with AgentPresence", () => {
    const harness = createHarness();
    const after: EditorElement[] = [
      makeSection("sec-1", [
        makeText("t-1", { parentId: "sec-1", order: 0, content: "One" }),
        makeText("t-2", { parentId: "sec-1", order: 1, content: "Two" }),
        makeText("t-3", { parentId: "sec-1", order: 2, content: "Three" }),
      ]),
    ];

    const onComplete = mock.fn();
    harness.player.play({
      beforeTree: [],
      afterTree: after,
      agentName: "MCP Agent",
      summary: "4 changes",
      onComplete,
    });

    assert.equal(harness.snapshots.length, 1);
    assert.equal(harness.emittedBatches.length, 1);
    assert.equal(useAgentPlaybackStore.getState().playback.status, "playing");
    assert.equal(harness.presenceLog.at(-1)?.active, true);

    harness.clock.runAll();

    assert.equal(harness.snapshots.length, 1);
    assert.ok(harness.emittedBatches.length >= 4);
    assert.equal(useAgentPlaybackStore.getState().playback.status, "idle");
    assert.equal(harness.presenceLog.at(-1)?.active, false);
    assert.equal(onComplete.mock.callCount(), 1);

    const root = harness.getElements()[0];
    assert.ok(isContainer(root));
    assert.deepEqual(
      root.elements.map((c) => c.id),
      ["t-1", "t-2", "t-3"],
    );
  });

  it("flushes remaining ops synchronously and lands on exact afterTree", () => {
    const harness = createHarness();
    const after: EditorElement[] = [
      makeSection("sec-1", [
        makeText("t-1", { parentId: "sec-1", order: 0 }),
        makeText("t-2", { parentId: "sec-1", order: 1 }),
      ]),
    ];

    const onComplete = mock.fn();
    harness.player.play({
      beforeTree: [],
      afterTree: after,
      agentName: "MCP Agent",
      summary: "3 changes",
      onComplete,
    });

    assert.equal(harness.player.isPlaying(), true);
    harness.player.flush();

    assert.equal(harness.player.isPlaying(), false);
    assert.equal(useAgentPlaybackStore.getState().playback.status, "idle");
    assert.equal(harness.presenceLog.at(-1)?.active, false);
    assert.equal(onComplete.mock.callCount(), 1);
    assert.deepEqual(harness.getElements(), after);
  });

  it("flushes prior playback before starting a back-to-back play() call", () => {
    const harness = createHarness();
    const firstAfter: EditorElement[] = [
      makeSection("sec-1", [
        makeText("t-1", { parentId: "sec-1", order: 0 }),
        makeText("t-2", { parentId: "sec-1", order: 1 }),
      ]),
    ];
    const secondAfter: EditorElement[] = [
      makeSection("sec-1", [
        makeText("t-1", { parentId: "sec-1", order: 0 }),
        makeText("t-2", { parentId: "sec-1", order: 1 }),
        makeText("t-3", { parentId: "sec-1", order: 2 }),
      ]),
    ];

    const firstComplete = mock.fn();
    const secondComplete = mock.fn();

    harness.player.play({
      beforeTree: [],
      afterTree: firstAfter,
      agentName: "MCP Agent",
      summary: "first",
      onComplete: firstComplete,
    });

    harness.player.play({
      beforeTree: firstAfter,
      afterTree: secondAfter,
      agentName: "MCP Agent",
      summary: "second",
      onComplete: secondComplete,
    });

    assert.equal(firstComplete.mock.callCount(), 1);
    harness.clock.runAll();
    assert.equal(secondComplete.mock.callCount(), 1);
    assert.deepEqual(harness.getElements(), secondAfter);
  });

  it("commits immediately without timers when prefers-reduced-motion is enabled", () => {
    const harness = createHarness({ reducedMotion: true });
    const after: EditorElement[] = [
      makeSection("sec-1", [makeText("t-1", { parentId: "sec-1", order: 0 })]),
    ];

    const onComplete = mock.fn();
    harness.player.play({
      beforeTree: [],
      afterTree: after,
      agentName: "Canvas Copilot",
      summary: "reduced",
      onComplete,
    });

    assert.equal(harness.snapshots.length, 1);
    assert.equal(harness.emittedBatches.length, 1);
    assert.equal(harness.player.isPlaying(), false);
    assert.equal(onComplete.mock.callCount(), 1);
    assert.deepEqual(harness.getElements(), after);
  });

  it("targets deleted element in playbackStore before removing it from tree", () => {
    const harness = createHarness();
    const before: EditorElement[] = [
      makeText("old-1", { name: "Legacy Banner" }),
    ];
    harness.setElements(before);

    harness.player.play({
      beforeTree: before,
      afterTree: [],
      agentName: "MCP Agent",
      summary: "1 change",
    });

    const stateBeforeBeat = useAgentPlaybackStore.getState().playback;
    assert.equal(stateBeforeBeat.status, "playing");
    if (stateBeforeBeat.status === "playing") {
      assert.equal(stateBeforeBeat.targetElementId, "old-1");
      assert.equal(stateBeforeBeat.action, "delete");
    }
    assert.equal(harness.getElements().length, 1);

    harness.clock.advanceBy(110);
    assert.equal(harness.getElements().length, 0);

    harness.clock.runAll();
    assert.equal(useAgentPlaybackStore.getState().playback.status, "idle");
  });
});

describe("createExecutor playback integration", () => {
  function makeMockHost(overrides: Partial<AgentHost> = {}) {
    const replaceTree = mock.fn<(next: EditorElement[]) => void>();
    const playTreeChange =
      mock.fn<
        (before: EditorElement[], next: EditorElement[], summary: string) => void
      >();
    const flushPlayback = mock.fn<() => void>();

    const host: AgentHost = {
      getComponents: async () => ({
        pages: [],
        pageIds: new Set<string>(),
        elements: [],
      }),
      createComponent: async (name: string) => ({ id: "cp-1", name }),
      getElements: () => [],
      getPageId: () => "page-1",
      isReady: () => true,
      canEdit: () => true,
      canEditProject: () => true,
      canCreatePages: () => true,
      createPage: async (name: string) => ({ id: "page-2", name }),
      openPage: async () => true,
      setProjectStyle: async () => ({}),
      notifyProjectChanged: () => {},
      replaceTree,
      playTreeChange,
      flushPlayback,
      getSelectedId: () => undefined,
      generateCode: async () => "<section />",
      getPreamble: () => ({ imports: "", top: "", body: "" }),
      setPreamble: () => {},
      notifyChanged: () => {},
      ...overrides,
    };

    return { host, replaceTree, playTreeChange, flushPlayback };
  }

  it("calls flushPlayback before get_page, open_page, apply_edits, and set_code", async () => {
    const { host, flushPlayback } = makeMockHost();
    const run = createExecutor(host);

    await run({ requestId: "r-1", tool: "get_page", args: {} });
    await run({
      requestId: "r-2",
      tool: "open_page",
      args: { pageId: "page-2" },
    });
    await run({
      requestId: "r-3",
      tool: "apply_edits",
      args: {
        operations: [{ op: "create", element: { type: "Section", name: "Hero" } }],
      },
    });
    await run({
      requestId: "r-4",
      tool: "set_code",
      args: { code: "export default function Page() { return <section />; }" },
    });

    assert.equal(flushPlayback.mock.callCount(), 4);
  });

  it("routes apply_edits through playTreeChange and returns immediately", async () => {
    const { host, playTreeChange, replaceTree } = makeMockHost();
    const run = createExecutor(host);

    const outcome = await run({
      requestId: "r-apply",
      tool: "apply_edits",
      args: {
        operations: [
          { op: "create", element: { type: "Section", name: "Hero Section" } },
        ],
      },
    });

    assert.equal(outcome.ok, true);
    assert.equal(playTreeChange.mock.callCount(), 1);
    assert.equal(replaceTree.mock.callCount(), 0);
  });
});
