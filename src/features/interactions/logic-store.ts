// src/features/interactions/logic-store.ts
/**
 * Editable page/project logic (variables and flows) with undo/redo.
 *
 * Every edit goes through `editLogic`, which re-validates the whole set of
 * documents (including names that must be unique across scopes) and refuses
 * a change that would break them. In the editor the store is bound to the
 * realtime connection (`bindRemote`) and the server is the source of truth;
 * without one it falls back to a per-project copy in localStorage. The preview
 * does not use this store: it reads the published logic from the public API.
 */
import { create } from "zustand";
import type { Issue, Step } from "./schema";
import type { VariableDef } from "./runtime/variables";
import { emptyLogic, moveLogic, validateLogic, validateLogicScopes, type LogicDocument } from "./logic";
import { templateErrors, templateRefs } from "./runtime/expression";

export type LogicScope = "project" | { page: string };

export interface LogicSnapshot {
  project: LogicDocument;
  pages: Record<string, LogicDocument>;
}

export type EditResult =
  | { ok: true; snapshot: LogicSnapshot }
  | { ok: false; issues: Issue[] };

const MAX_HISTORY = 100;

export const emptySnapshot = (): LogicSnapshot => ({ project: emptyLogic(), pages: {} });

/**
 * Storable means no error-level issue. Incomplete steps (an empty field, a
 * template that doesn't parse yet) are drafts the server stores as well; an
 * unparseable template only fails its own step when it runs.
 */
const errorsOf = (issues: Issue[]) => issues.filter((i) => i.level === "error");
const storable = (doc: unknown) => errorsOf(validateLogic(doc)).length === 0;
const issueKey = (i: Issue) => `${i.level}\u0000${i.path}\u0000${i.message}`;

const documentOf = (snapshot: LogicSnapshot, scope: LogicScope): LogicDocument =>
  scope === "project" ? snapshot.project : (snapshot.pages[scope.page] ?? emptyLogic());

/** Pure: applies `change` to one scope and validates the result across scopes. */
export function editLogic(
  snapshot: LogicSnapshot,
  scope: LogicScope,
  change: (doc: LogicDocument) => { ok: true; logic: LogicDocument } | { ok: false; issues: Issue[] },
  opts: { allowIncomplete?: boolean } = {},
): EditResult {
  const changed = change(documentOf(snapshot, scope));
  if (!changed.ok) return changed;
  const next: LogicSnapshot =
    scope === "project"
      ? { ...snapshot, project: changed.logic }
      : { ...snapshot, pages: { ...snapshot.pages, [scope.page]: changed.logic } };
  // Incomplete drafts already stored (e.g. from a collaborator) don't block
  // unrelated edits; only incomplete issues this change introduces do.
  const existing = new Set(validateLogicScopes(snapshot.project, snapshot.pages).map(issueKey));
  const issues = validateLogicScopes(next.project, next.pages).filter(
    (i) => i.level === "error" || (!opts.allowIncomplete && !existing.has(issueKey(i))),
  );
  return issues.length ? { ok: false, issues } : { ok: true, snapshot: next };
}

export interface MergedLogic {
  variables: Record<string, VariableDef>;
  flows: Record<string, { do: Step[] }>;
}

/**
 * Project logic plus one page's logic (the editor), or plus every page's
 * (the preview, which renders the whole project). Names are unique across
 * scopes, so merging cannot shadow anything.
 */
export function mergedLogic(snapshot: LogicSnapshot, pageId?: string | null): MergedLogic {
  const docs = [snapshot.project, ...(pageId ? [snapshot.pages[pageId] ?? emptyLogic()] : Object.values(snapshot.pages))];
  return {
    variables: Object.assign({}, ...docs.map((d) => d.variables)),
    flows: Object.assign({}, ...docs.map((d) => d.flows)),
  };
}

/** Reads a stored snapshot, discarding anything that no longer validates. */
export function parseSnapshot(raw: unknown): LogicSnapshot {
  if (!raw || typeof raw !== "object") return emptySnapshot();
  const value = raw as { project?: unknown; pages?: unknown };
  const pages: Record<string, LogicDocument> = {};
  if (value.pages && typeof value.pages === "object") {
    for (const [id, doc] of Object.entries(value.pages)) {
      if (storable(doc)) pages[id] = doc as LogicDocument;
    }
  }
  const project = storable(value.project) ? (value.project as LogicDocument) : emptyLogic();
  const snapshot = { project, pages };
  return errorsOf(validateLogicScopes(snapshot.project, snapshot.pages)).length ? emptySnapshot() : snapshot;
}

const storageKey = (projectId: string) => `wb:logic:${projectId}`;

export function readStoredLogic(projectId: string): LogicSnapshot {
  try {
    const raw = window.localStorage.getItem(storageKey(projectId));
    return raw ? parseSnapshot(JSON.parse(raw)) : emptySnapshot();
  } catch {
    return emptySnapshot();
  }
}

function writeStoredLogic(projectId: string, snapshot: LogicSnapshot) {
  try {
    window.localStorage.setItem(storageKey(projectId), JSON.stringify(snapshot));
  } catch {
    // Blocked or full: the edit still lives in memory for this session.
  }
}

export type RemoteScope = "project" | "page";

/** What the store needs from the realtime connection; the provider supplies it. */
export interface LogicRemote {
  /** The page the connection is joined to; `{ page }` scopes for other pages cannot be sent. */
  pageId: string | null;
  isOnline(): boolean;
  send(scope: RemoteScope, patch: Record<string, unknown>, nullPaths?: string[][]): Promise<unknown>;
  move?(kind: "variable" | "flow", name: string, to: RemoteScope): Promise<unknown>;
  requestSync(): void;
  /** Called when the server refuses an edit and the store has rolled it back. */
  onRejected(message: string): void;
}

/** A change a merge patch cannot carry (see `diffPatch`). */
export class UnsupportedPatch extends Error {}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }
  if (isRecord(a) && isRecord(b)) {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]));
  }
  return false;
}

const hasNullInMap = (v: unknown): boolean =>
  v === null || (isRecord(v) && Object.values(v).some(hasNullInMap));

/**
 * The merge patch that turns `before` into `after`: nested objects merge, a
 * missing key becomes `null` (delete), arrays and scalars are replaced. A
 * patch cannot store `null` inside an object, so such a change throws.
 */
export function diffPatch(before: Record<string, unknown>, after: Record<string, unknown>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(before)) if (!Object.hasOwn(after, key)) patch[key] = null;
  for (const [key, value] of Object.entries(after)) {
    const old = before[key];
    if (deepEqual(old, value)) continue;
    if (hasNullInMap(value)) {
      throw new UnsupportedPatch("An empty (null) value inside a variable's default can't be synced yet. Use {} or a real value.");
    }
    patch[key] = isRecord(value) && isRecord(old) ? diffPatch(old, value) : value;
  }
  return patch;
}

/** Merge patch plus explicit paths for literal nulls in variable defaults. */
export function encodeLogicPatch(before: Record<string, unknown>, after: Record<string, unknown>): { patch: Record<string, unknown>; nullPaths: string[][] } {
  const nullPaths: string[][] = [];
  const diff = (old: Record<string, unknown>, next: Record<string, unknown>, path: string[]): Record<string, unknown> => {
    const patch: Record<string, unknown> = {};
    for (const key of Object.keys(old)) if (!Object.hasOwn(next, key)) Object.defineProperty(patch, key, { value: null, enumerable: true, configurable: true });
    for (const [key, value] of Object.entries(next)) {
      if (deepEqual(old[key], value)) continue;
      const at = [...path, key];
      if (value === null) {
        if (at[0] !== "variables" || at.length < 3 || at[2] !== "default") throw new UnsupportedPatch("Only variable defaults can contain literal null values.");
        nullPaths.push(at);
      } else {
        const nextValue = isRecord(value) ? diff(isRecord(old[key]) ? old[key] as Record<string, unknown> : {}, value, at) : value;
        Object.defineProperty(patch, key, { value: nextValue, enumerable: true, configurable: true });
      }
    }
    return patch;
  };
  return { patch: diff(before, after, []), nullPaths };
}

/** Mirror of the server's merge: objects merge, `null` deletes, everything else replaces. */
export function applyPatch(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete out[key];
    else if (isRecord(value)) out[key] = applyPatch(isRecord(out[key]) ? (out[key] as Record<string, unknown>) : {}, value);
    else out[key] = value;
  }
  return out;
}

function applyEncodedPatch(base: Record<string, unknown>, patch: Record<string, unknown>, nullPaths: string[][]): Record<string, unknown> {
  const result = applyPatch(base, patch);
  for (const path of nullPaths) {
    let parent = result;
    for (const key of path.slice(0, -1)) {
      const child = isRecord(parent[key]) ? { ...parent[key] as Record<string, unknown> } : {};
      Object.defineProperty(parent, key, { value: child, enumerable: true, configurable: true, writable: true });
      parent = child;
    }
    Object.defineProperty(parent, path[path.length - 1], { value: null, enumerable: true, configurable: true, writable: true });
  }
  return result;
}

/** One edit, kept as before/after documents so undo can replay it on top of other people's changes. */
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

interface LogicState extends LogicSnapshot {
  projectId: string | null;
  past: HistoryEntry[];
  future: HistoryEntry[];
  /** What the server last confirmed; the editor shows this once no edit is in flight. */
  confirmed: LogicSnapshot;
  pending: number;
  /**
   * The server's revision of each confirmed document (a missing revision is 0).
   * A sync is read outside the server's write order, so it can arrive after a
   * newer broadcast; anything older than this is ignored.
   */
  revisions: { project: number; pages: Record<string, number> };
  remote: LogicRemote | null;
  load(projectId: string): void;
  edit(scope: LogicScope, change: Parameters<typeof editLogic>[2], opts?: Parameters<typeof editLogic>[3]): EditResult;
  move(pageId: string, kind: "variable" | "flow", name: string, to: RemoteScope): EditResult;
  undo(): EditResult | undefined;
  redo(): EditResult | undefined;
  bindRemote(remote: LogicRemote): void;
  unbindRemote(): void;
  /** Server → client: the documents that apply to the joined page. */
  receiveSync(payload: { project?: unknown; page?: unknown; pageId?: string; projectRevision?: number; pageRevision?: number }): void;
  /** Server → client: one committed document (ours or a collaborator's). */
  receiveChange(scope: RemoteScope, pageId: string | undefined, logic: unknown, revision?: number): void;
}

const snapshotOf = (s: LogicSnapshot): LogicSnapshot => ({ project: s.project, pages: s.pages });
const noRevisions = () => ({ project: 0, pages: {} as Record<string, number> });
const revisionOf = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const issue = (message: string): EditResult => ({ ok: false, issues: [{ path: "", message, level: "error" }] });

/** A stored document from the server, or null when it isn't usable. A fresh project has `{}`. */
function readDocument(raw: unknown): LogicDocument | null {
  if (isRecord(raw) && Object.keys(raw).length === 0) return emptyLogic();
  return storable(raw) ? (raw as unknown as LogicDocument) : null;
}

/**
 * The published logic as the public API returns it: the project's document
 * plus each page's. A missing or empty document is empty logic; a document that
 * no longer validates is skipped, and an inconsistent set (names reused across
 * scopes) yields nothing rather than a half-applied program.
 */
export function snapshotFromServer(
  projectLogic: unknown,
  pages: ReadonlyArray<{ id: string; logic?: unknown }>,
): LogicSnapshot {
  const snapshot: LogicSnapshot = { project: readDocument(projectLogic ?? {}) ?? emptyLogic(), pages: {} };
  for (const page of pages) {
    const doc = readDocument(page.logic ?? {});
    if (doc) snapshot.pages[page.id] = doc;
  }
  return errorsOf(validateLogicScopes(snapshot.project, snapshot.pages)).length ? emptySnapshot() : snapshot;
}

export const useLogicStore = create<LogicState>((set, get) => {
  let binding = 0;
  const replaceDocument = (snapshot: LogicSnapshot, scope: LogicScope, doc: LogicDocument): LogicSnapshot =>
    scope === "project"
      ? { ...snapshot, project: doc }
      : { ...snapshot, pages: { ...snapshot.pages, [scope.page]: doc } };

  const persist = () => {
    const { projectId, remote } = get();
    // With a connection the server is the source of truth; the local copy is only for offline-first use.
    if (projectId && !remote) writeStoredLogic(projectId, snapshotOf(get()));
  };

  /** Once nothing is in flight, show exactly what the server has. */
  const reconcile = () => {
    const { pending, confirmed, remote } = get();
    if (!remote || pending > 0) return;
    const current = snapshotOf(get());
    if (!deepEqual(current, confirmed)) set({ ...confirmed });
  };

  /** Sends one scope's change; on refusal the visible state returns to the server's. */
  const send = (scope: LogicScope, patch: Record<string, unknown>, entry?: HistoryEntry, nullPaths: string[][] = []) => {
    const remote = get().remote!;
    const sentBinding = binding;
    set({ pending: get().pending + 1 });
    remote
      .send(scope === "project" ? "project" : "page", patch, nullPaths)
      .catch((error: unknown) => {
        if (sentBinding !== binding) return;
        if (entry) set({ past: get().past.filter((e) => e !== entry), future: get().future.filter((e) => e !== entry) });
        remote.onRejected(error instanceof Error ? error.message : "The change was not saved.");
      })
      .finally(() => {
        if (sentBinding !== binding) return;
        set({ pending: get().pending - 1 });
        reconcile();
      });
  };

  /** Checks a change can go over the connection, returning why not. */
  const sendable = (scope: LogicScope): string | null => {
    const remote = get().remote;
    if (!remote) return null;
    if (!remote.isOnline()) return "You're offline. Reconnect to change variables and flows.";
    if (scope !== "project" && scope.page !== remote.pageId) return "Open that page to change its variables and flows.";
    return null;
  };

  /** Applies a prepared patch to the visible state and sends it. */
  const applyEdit = (scope: LogicScope, entry: EditHistoryEntry, encoded: { patch: Record<string, unknown>; nullPaths: string[][] } | null): EditResult => {
    const state = get();
    set(replaceDocument(snapshotOf(state), scope, entry.after));
    if (encoded) send(scope, encoded.patch, entry, encoded.nullPaths);
    persist();
    return { ok: true, snapshot: snapshotOf(get()) };
  };

  const applyMove = (entry: MoveHistoryEntry, to: RemoteScope): EditResult => {
    const state = get();
    const blocked = sendable({ page: entry.pageId });
    if (blocked) return issue(blocked);
    if (state.remote && !state.remote.move) return issue("Moving logic is unavailable on this connection.");
    const page = state.pages[entry.pageId] ?? emptyLogic();
    const moved = to === "page"
      ? moveLogic(state.project, page, entry.kind, entry.name)
      : moveLogic(page, state.project, entry.kind, entry.name);
    if (!moved.ok) return moved;
    const snapshot = {
      project: to === "page" ? moved.from : moved.to,
      pages: { ...state.pages, [entry.pageId]: to === "page" ? moved.to : moved.from },
    };
    const issues = errorsOf(validateLogicScopes(snapshot.project, snapshot.pages));
    if (issues.length) return { ok: false, issues };
    set(snapshot);
    if (state.remote?.move) {
      const remote = state.remote;
      const sendMove = remote.move!;
      const sentBinding = binding;
      set({ pending: get().pending + 1 });
      sendMove(entry.kind, entry.name, to).catch((error: unknown) => {
        if (sentBinding !== binding) return;
        set({ past: get().past.filter((e) => e !== entry), future: get().future.filter((e) => e !== entry) });
        remote.onRejected(error instanceof Error ? error.message : "The change was not saved.");
      }).finally(() => {
        if (sentBinding !== binding) return;
        set({ pending: get().pending - 1 });
        reconcile();
      });
    }
    persist();
    return { ok: true, snapshot };
  };

  /** Rebuilds an entry's change on today's document (which may include other people's edits). */
  const replay = (from: LogicDocument, to: LogicDocument) => {
    const { patch, nullPaths } = encodeLogicPatch(from as unknown as Record<string, unknown>, to as unknown as Record<string, unknown>);
    return {
      patch,
      nullPaths,
      change: (doc: LogicDocument) => ({ ok: true as const, logic: applyEncodedPatch(doc as unknown as Record<string, unknown>, patch, nullPaths) as unknown as LogicDocument }),
    };
  };

  const step = (direction: "undo" | "redo"): EditResult | undefined => {
    const state = get();
    const stack = direction === "undo" ? state.past : state.future;
    const entry = stack[direction === "undo" ? stack.length - 1 : 0];
    if (!entry) return undefined;
    if (entry.type === "move") {
      const to = direction === "redo" ? entry.to : entry.to === "project" ? "page" : "project";
      const result = applyMove(entry, to);
      if (!result.ok) return result;
      set({ past: direction === "undo" ? state.past.slice(0, -1) : [...state.past, entry], future: direction === "undo" ? [entry, ...state.future] : state.future.slice(1) });
      return result;
    }
    const blocked = sendable(entry.scope);
    if (blocked) return issue(blocked);
    let plan;
    try {
      plan = direction === "undo" ? replay(entry.after, entry.before) : replay(entry.before, entry.after);
    } catch (error) {
      if (error instanceof UnsupportedPatch) return issue(error.message);
      throw error;
    }
    const result = editLogic(snapshotOf(state), entry.scope, plan.change, { allowIncomplete: true });
    if (!result.ok) return result;
    const next = result.snapshot;
    set({
      ...next,
      past: direction === "undo" ? state.past.slice(0, -1) : [...state.past, entry],
      future: direction === "undo" ? [entry, ...state.future] : state.future.slice(1),
    });
    if (state.remote && (Object.keys(plan.patch).length || plan.nullPaths.length)) send(entry.scope, plan.patch, undefined, plan.nullPaths);
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
      set({ ...stored, confirmed: stored, projectId, past: [], future: [], pending: 0, revisions: noRevisions() });
    },
    edit(scope, change, opts) {
      const state = get();
      const blocked = sendable(scope);
      if (blocked) return issue(blocked);
      const result = editLogic(snapshotOf(state), scope, change, opts);
      if (!result.ok) return result;
      const before = documentOf(snapshotOf(state), scope);
      const after = documentOf(result.snapshot, scope);
      let encoded: { patch: Record<string, unknown>; nullPaths: string[][] } | null = null;
      if (state.remote) {
        try {
          encoded = encodeLogicPatch(before as unknown as Record<string, unknown>, after as unknown as Record<string, unknown>);
        } catch (error) {
          if (error instanceof UnsupportedPatch) return issue(error.message);
          throw error;
        }
        if (Object.keys(encoded.patch).length === 0 && encoded.nullPaths.length === 0) encoded = null;
      }
      const entry: EditHistoryEntry = { type: "edit", scope, before, after };
      set({ past: [...state.past, entry].slice(-MAX_HISTORY), future: [] });
      return applyEdit(scope, entry, encoded);
    },
    move(pageId, kind, name, to) {
      const state = get();
      const entry: MoveHistoryEntry = { type: "move", pageId, kind, name, to };
      const result = applyMove(entry, to);
      if (result.ok) set({ past: [...state.past, entry].slice(-MAX_HISTORY), future: [] });
      return result;
    },
    undo() {
      return step("undo");
    },
    redo() {
      return step("redo");
    },
    bindRemote(remote) {
      // A new connection's first sync is authoritative.
      binding++;
      set({ remote, pending: 0, revisions: noRevisions() });
      remote.requestSync();
    },
    unbindRemote() {
      binding++;
      set({ remote: null, pending: 0 });
    },
    receiveSync(payload) {
      const project = readDocument(payload.project);
      if (!project) return;
      const { revisions } = get();
      const projectRevision = revisionOf(payload.projectRevision);
      let confirmed: LogicSnapshot = get().confirmed;
      let next = revisions;
      if (projectRevision >= revisions.project) {
        confirmed = { ...confirmed, project };
        next = { ...next, project: projectRevision };
      }
      if (payload.pageId) {
        // The server leaves out a page document that has no logic yet.
        const page = readDocument(payload.page ?? {});
        const pageRevision = revisionOf(payload.pageRevision);
        if (page && pageRevision >= (revisions.pages[payload.pageId] ?? 0)) {
          confirmed = { ...confirmed, pages: { ...confirmed.pages, [payload.pageId]: page } };
          next = { ...next, pages: { ...next.pages, [payload.pageId]: pageRevision } };
        }
      }
      set({ confirmed, revisions: next });
      reconcile();
    },
    receiveChange(scope, pageId, logic, revision) {
      const doc = readDocument(logic);
      if (!doc) return;
      const { confirmed, revisions } = get();
      const incoming = revisionOf(revision);
      if (scope === "project") {
        if (incoming < revisions.project) return;
        set({ confirmed: { ...confirmed, project: doc }, revisions: { ...revisions, project: incoming } });
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

/** Counts places that still use a variable or flow, so a delete can warn first. */
export function countUsages(kind: "variable" | "flow", name: string, sources: unknown[]): number {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mention = new RegExp(`\\bvars\\s*(?:\\.\\s*${escaped}(?![\\w$])|\\[\\s*(['"])${escaped}\\1\\s*\\])`);
  let count = 0;
  const walk = (node: unknown, depth: number, field?: string) => {
    if (depth > 64 || node === null || typeof node !== "object") {
      if (typeof node === "string" && kind === "variable" && (
        templateRefs(node).some(([root, ref]) => root === "vars" && ref === name) ||
        ((field === "code" || templateErrors(node).length > 0) && mention.test(node))
      )) count++;
      return;
    }
    if (Array.isArray(node)) return node.forEach((n) => walk(n, depth + 1));
    const record = node as Record<string, unknown>;
    if (kind === "flow" && record.run === name) count++;
    if (kind === "variable" && record.set === name) count++;
    for (const [key, value] of Object.entries(record)) walk(value, depth + 1, key);
  };
  sources.forEach((s) => walk(s, 0));
  return count;
}

export function findUsageLocations(kind: "variable" | "flow", name: string, sources: { label: string; value: unknown; elementId?: string }[]): { label: string; count: number; elementId?: string }[] {
  return sources.flatMap(({ label, value, elementId }) => {
    const count = countUsages(kind, name, [value]);
    return count ? [{ label, count, ...(elementId ? { elementId } : {}) }] : [];
  });
}
