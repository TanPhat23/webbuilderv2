import { create } from "zustand";
import { emptyLogic, moveLogic, validateLogicScopes, type LogicDocument } from "@webbuilder/site-runtime/interactions/logic";
import {
  UnsupportedPatch,
  applyEncodedPatch,
  applyPatch,
  deepEqual,
  encodeLogicPatch,
} from "@webbuilder/site-runtime/interactions/logicPatch";
import {
  countUsages,
  documentOf,
  editLogic,
  emptySnapshot,
  errorsOf,
  findUsageLocations,
  mergedLogic,
  parseSnapshot,
  readDocument,
  readStoredLogic,
  replaceDocument,
  snapshotFromServer,
  snapshotOf,
  writeStoredLogic,
  type EditResult,
  type LogicRemote,
  type LogicScope,
  type LogicSnapshot,
  type MergedLogic,
  type RemoteScope,
} from "@webbuilder/site-runtime/interactions/logicSnapshot";

export {
  UnsupportedPatch,
  applyPatch,
  countUsages,
  editLogic,
  emptySnapshot,
  encodeLogicPatch,
  findUsageLocations,
  mergedLogic,
  parseSnapshot,
  snapshotFromServer,
  type EditResult,
  type LogicRemote,
  type LogicScope,
  type LogicSnapshot,
  type MergedLogic,
  type RemoteScope,
};

const MAX_HISTORY = 100;

interface EditHistoryEntry {
  type: "edit";
  scope: LogicScope;
  before: LogicDocument;
  after: LogicDocument;
}

interface MoveHistoryEntry {
  type: "move";
  pageId: string;
  kind: "variable" | "flow";
  name: string;
  to: RemoteScope;
}

type HistoryEntry = EditHistoryEntry | MoveHistoryEntry;

interface RevisionsState {
  project: number;
  pages: Record<string, number>;
}

interface LogicState extends LogicSnapshot {
  projectId: string | null;
  past: HistoryEntry[];
  future: HistoryEntry[];
  confirmed: LogicSnapshot;
  pending: number;
  revisions: RevisionsState;
  remote: LogicRemote | null;
  load(projectId: string): void;
  edit(
    scope: LogicScope,
    change: Parameters<typeof editLogic>[2],
    opts?: Parameters<typeof editLogic>[3],
  ): EditResult;
  move(
    pageId: string,
    kind: "variable" | "flow",
    name: string,
    to: RemoteScope,
  ): EditResult;
  undo(): EditResult | undefined;
  redo(): EditResult | undefined;
  bindRemote(remote: LogicRemote): void;
  unbindRemote(): void;
  receiveSync(payload: {
    project?: unknown;
    page?: unknown;
    pageId?: string;
    projectRevision?: number;
    pageRevision?: number;
  }): void;
  receiveChange(
    scope: RemoteScope,
    pageId: string | undefined,
    logic: unknown,
    revision?: number,
  ): void;
}

const noRevisions = (): RevisionsState => ({ project: 0, pages: {} });
const revisionOf = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;
const makeErrorResult = (message: string): EditResult => ({
  ok: false,
  issues: [{ path: "", message, level: "error" }],
});

function replayEditPatch(from: LogicDocument, to: LogicDocument) {
  const { patch, nullPaths } = encodeLogicPatch(from, to);
  return {
    patch,
    nullPaths,
    change: (doc: LogicDocument) => {
      const next = readDocument(applyEncodedPatch(doc, patch, nullPaths));
      return next
        ? { ok: true as const, logic: next }
        : {
            ok: false as const,
            issues: [
              {
                path: "",
                message: "Could not apply patch to logic document.",
                level: "error" as const,
              },
            ],
          };
    },
  };
}

function advanceStacks(
  past: HistoryEntry[],
  future: HistoryEntry[],
  entry: HistoryEntry,
  direction: "undo" | "redo",
): { past: HistoryEntry[]; future: HistoryEntry[] } {
  return direction === "undo"
    ? { past: past.slice(0, -1), future: [entry, ...future] }
    : { past: [...past, entry], future: future.slice(1) };
}

export const useLogicStore = create<LogicState>((set, get) => {
  let binding = 0;

  const persist = () => {
    const { projectId, remote } = get();
    if (projectId && !remote) writeStoredLogic(projectId, snapshotOf(get()));
  };

  const reconcile = () => {
    const { pending, confirmed, remote } = get();
    if (!remote || pending > 0) return;
    if (!deepEqual(snapshotOf(get()), confirmed)) set({ ...confirmed });
  };

  const trackRemoteMutation = (
    remote: LogicRemote,
    request: Promise<unknown>,
    onRollback?: () => void,
  ) => {
    const sentBinding = binding;
    set({ pending: get().pending + 1 });
    request.then(
      () => {
        if (sentBinding !== binding) return;
        set({ pending: get().pending - 1 });
        reconcile();
      },
      (error: unknown) => {
        if (sentBinding !== binding) return;
        set({ pending: get().pending - 1 });
        onRollback?.();
        reconcile();
        remote.onRejected(
          error instanceof Error ? error.message : "The change was not saved.",
        );
      },
    );
  };

  const removeHistoryEntry = (entry: HistoryEntry) => () => {
    set({
      past: get().past.filter((e) => e !== entry),
      future: get().future.filter((e) => e !== entry),
    });
  };

  const send = (
    scope: LogicScope,
    patch: Record<string, unknown>,
    nullPaths: string[][],
    onRollback?: () => void,
  ) => {
    const remote = get().remote;
    if (!remote) return;
    trackRemoteMutation(
      remote,
      remote.send(scope === "project" ? "project" : "page", patch, nullPaths),
      onRollback,
    );
  };

  const sendable = (scope: LogicScope): string | null => {
    const remote = get().remote;
    if (!remote) return null;
    if (!remote.isOnline()) {
      return "You're offline. Reconnect to change variables and flows.";
    }
    if (scope !== "project" && scope.page !== remote.pageId) {
      return "Open that page to change its variables and flows.";
    }
    return null;
  };

  const applyMove = (
    entry: MoveHistoryEntry,
    to: RemoteScope,
    onRollback?: () => void,
  ): EditResult => {
    const state = get();
    const blocked = sendable({ page: entry.pageId });
    if (blocked) return makeErrorResult(blocked);
    if (state.remote && !state.remote.move) {
      return makeErrorResult("Moving logic is unavailable on this connection.");
    }
    const page = state.pages[entry.pageId] ?? emptyLogic();
    const moved =
      to === "page"
        ? moveLogic(state.project, page, entry.kind, entry.name)
        : moveLogic(page, state.project, entry.kind, entry.name);
    if (!moved.ok) return moved;
    const snapshot: LogicSnapshot = {
      project: to === "page" ? moved.from : moved.to,
      pages: {
        ...state.pages,
        [entry.pageId]: to === "page" ? moved.to : moved.from,
      },
    };
    const issues = errorsOf(validateLogicScopes(snapshot.project, snapshot.pages));
    if (issues.length) return { ok: false, issues };
    set(snapshot);
    if (state.remote?.move) {
      trackRemoteMutation(
        state.remote,
        state.remote.move(entry.kind, entry.name, to),
        onRollback,
      );
    }
    persist();
    return { ok: true, snapshot };
  };

  const step = (direction: "undo" | "redo"): EditResult | undefined => {
    const state = get();
    const stack = direction === "undo" ? state.past : state.future;
    const entry = stack[direction === "undo" ? stack.length - 1 : 0];
    if (!entry) return undefined;
    const restoreStacks = () => set({ past: state.past, future: state.future });

    if (entry.type === "move") {
      const to =
        direction === "redo" ? entry.to : entry.to === "project" ? "page" : "project";
      const result = applyMove(entry, to, restoreStacks);
      if (result.ok) set(advanceStacks(state.past, state.future, entry, direction));
      return result;
    }

    const blocked = sendable(entry.scope);
    if (blocked) return makeErrorResult(blocked);
    let plan: ReturnType<typeof replayEditPatch>;
    try {
      plan =
        direction === "undo"
          ? replayEditPatch(entry.after, entry.before)
          : replayEditPatch(entry.before, entry.after);
    } catch (error) {
      if (error instanceof UnsupportedPatch) return makeErrorResult(error.message);
      throw error;
    }
    const result = editLogic(snapshotOf(state), entry.scope, plan.change, {
      allowIncomplete: true,
    });
    if (!result.ok) return result;
    set({
      ...result.snapshot,
      ...advanceStacks(state.past, state.future, entry, direction),
    });
    if (
      state.remote &&
      (Object.keys(plan.patch).length || plan.nullPaths.length)
    ) {
      send(entry.scope, plan.patch, plan.nullPaths, restoreStacks);
    }
    persist();
    return result;
  };

  return {
    ...emptySnapshot(),
    projectId: null,
    past: [],
    future: [],
    confirmed: emptySnapshot(),
    pending: 0,
    revisions: noRevisions(),
    remote: null,
    load(projectId) {
      if (get().projectId === projectId) return;
      binding++;
      const stored = readStoredLogic(projectId);
      set({
        ...stored,
        confirmed: stored,
        projectId,
        past: [],
        future: [],
        pending: 0,
        revisions: noRevisions(),
      });
    },
    edit(scope, change, opts) {
      const state = get();
      const blocked = sendable(scope);
      if (blocked) return makeErrorResult(blocked);
      const result = editLogic(snapshotOf(state), scope, change, opts);
      if (!result.ok) return result;
      const before = documentOf(snapshotOf(state), scope);
      const after = documentOf(result.snapshot, scope);
      if (deepEqual(before, after)) {
        return { ok: true, snapshot: snapshotOf(state) };
      }
      let encoded: { patch: Record<string, unknown>; nullPaths: string[][] } | null =
        null;
      if (state.remote) {
        try {
          encoded = encodeLogicPatch(before, after);
        } catch (error) {
          if (error instanceof UnsupportedPatch) return makeErrorResult(error.message);
          throw error;
        }
        if (
          Object.keys(encoded.patch).length === 0 &&
          encoded.nullPaths.length === 0
        ) {
          encoded = null;
        }
      }
      const entry: EditHistoryEntry = { type: "edit", scope, before, after };
      set({
        ...replaceDocument(snapshotOf(state), scope, after),
        past: [...state.past, entry].slice(-MAX_HISTORY),
        future: [],
      });
      if (encoded) {
        send(scope, encoded.patch, encoded.nullPaths, removeHistoryEntry(entry));
      }
      persist();
      return { ok: true, snapshot: snapshotOf(get()) };
    },
    move(pageId, kind, name, to) {
      const state = get();
      const entry: MoveHistoryEntry = { type: "move", pageId, kind, name, to };
      const result = applyMove(entry, to, removeHistoryEntry(entry));
      if (result.ok) {
        set({ past: [...state.past, entry].slice(-MAX_HISTORY), future: [] });
      }
      return result;
    },
    undo() {
      return step("undo");
    },
    redo() {
      return step("redo");
    },
    bindRemote(remote) {
      binding++;
      set({ remote, pending: 0, revisions: noRevisions() });
      remote.requestSync();
    },
    unbindRemote() {
      binding++;
      set({ remote: null, pending: 0 });
    },
    receiveSync(payload) {
      const { revisions } = get();
      let confirmed = get().confirmed;
      let nextRevisions = revisions;
      if (payload.project !== undefined) {
        const project = readDocument(payload.project);
        const projectRevision = revisionOf(payload.projectRevision);
        if (project && projectRevision >= revisions.project) {
          confirmed = { ...confirmed, project };
          nextRevisions = { ...nextRevisions, project: projectRevision };
        }
      }
      if (payload.pageId) {
        const page = readDocument(payload.page ?? {});
        const pageRevision = revisionOf(payload.pageRevision);
        if (page && pageRevision >= (revisions.pages[payload.pageId] ?? 0)) {
          confirmed = {
            ...confirmed,
            pages: { ...confirmed.pages, [payload.pageId]: page },
          };
          nextRevisions = {
            ...nextRevisions,
            pages: { ...nextRevisions.pages, [payload.pageId]: pageRevision },
          };
        }
      }
      set({ confirmed, revisions: nextRevisions });
      reconcile();
    },
    receiveChange(scope, pageId, logic, revision) {
      const doc = readDocument(logic);
      if (!doc) return;
      const { confirmed, revisions } = get();
      const incoming = revisionOf(revision);
      if (scope === "project") {
        if (incoming < revisions.project) return;
        set({
          confirmed: { ...confirmed, project: doc },
          revisions: { ...revisions, project: incoming },
        });
      } else if (pageId) {
        if (incoming < (revisions.pages[pageId] ?? 0)) return;
        set({
          confirmed: { ...confirmed, pages: { ...confirmed.pages, [pageId]: doc } },
          revisions: { ...revisions, pages: { ...revisions.pages, [pageId]: incoming } },
        });
      }
      reconcile();
    },
  };
});
