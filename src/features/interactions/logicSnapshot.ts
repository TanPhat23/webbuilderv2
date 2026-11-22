import type { Issue, Step } from "./schema";
import type { VariableDef } from "./runtime/variables";
import { emptyLogic, validateLogic, validateLogicScopes, type LogicDocument } from "./logic";
import { templateErrors, templateRefs } from "./runtime/expression";
import { isRecord } from "./logicPatch";

export type LogicScope = "project" | { page: string };

export interface LogicSnapshot {
  project: LogicDocument;
  pages: Record<string, LogicDocument>;
}

export type EditResult =
  | { ok: true; snapshot: LogicSnapshot }
  | { ok: false; issues: Issue[] };

export interface MergedLogic {
  variables: Record<string, VariableDef>;
  flows: Record<string, { do: Step[] }>;
}

export type RemoteScope = "project" | "page";

export interface LogicRemote {
  /** The page the connection is joined to; `{ page }` scopes for other pages cannot be sent. */
  pageId: string | null;
  isOnline(): boolean;
  send(
    scope: RemoteScope,
    patch: Record<string, unknown>,
    nullPaths?: string[][],
  ): Promise<unknown>;
  move?(kind: "variable" | "flow", name: string, to: RemoteScope): Promise<unknown>;
  requestSync(): void;
  onRejected(message: string): void;
}

export const emptySnapshot = (): LogicSnapshot => ({
  project: emptyLogic(),
  pages: {},
});

export const errorsOf = (issues: Issue[]): Issue[] =>
  issues.filter((i) => i.level === "error");

function isStorableDocument(doc: unknown): doc is LogicDocument {
  return isRecord(doc) && errorsOf(validateLogic(doc)).length === 0;
}

const issueKey = (i: Issue): string => `${i.level}\u0000${i.path}\u0000${i.message}`;

export const snapshotOf = (s: LogicSnapshot): LogicSnapshot => ({
  project: s.project,
  pages: s.pages,
});

export const documentOf = (
  snapshot: LogicSnapshot,
  scope: LogicScope,
): LogicDocument =>
  scope === "project" ? snapshot.project : (snapshot.pages[scope.page] ?? emptyLogic());

export const replaceDocument = (
  snapshot: LogicSnapshot,
  scope: LogicScope,
  doc: LogicDocument,
): LogicSnapshot =>
  scope === "project"
    ? { ...snapshot, project: doc }
    : { ...snapshot, pages: { ...snapshot.pages, [scope.page]: doc } };

export function editLogic(
  snapshot: LogicSnapshot,
  scope: LogicScope,
  change: (
    doc: LogicDocument,
  ) => { ok: true; logic: LogicDocument } | { ok: false; issues: Issue[] },
  opts: { allowIncomplete?: boolean } = {},
): EditResult {
  const changed = change(documentOf(snapshot, scope));
  if (!changed.ok) return changed;
  const next = replaceDocument(snapshot, scope, changed.logic);
  const existing = new Set(
    validateLogicScopes(snapshot.project, snapshot.pages).map(issueKey),
  );
  const issues = validateLogicScopes(next.project, next.pages).filter(
    (i) => i.level === "error" || (!opts.allowIncomplete && !existing.has(issueKey(i))),
  );
  return issues.length ? { ok: false, issues } : { ok: true, snapshot: next };
}

export function mergedLogic(
  snapshot: LogicSnapshot,
  pageId?: string | null,
): MergedLogic {
  const docs = [
    snapshot.project,
    ...(pageId
      ? [snapshot.pages[pageId] ?? emptyLogic()]
      : Object.values(snapshot.pages)),
  ];
  return {
    variables: Object.assign({}, ...docs.map((d) => d.variables)),
    flows: Object.assign({}, ...docs.map((d) => d.flows)),
  };
}

export function parseSnapshot(raw: unknown): LogicSnapshot {
  if (!isRecord(raw)) return emptySnapshot();
  const pages: Record<string, LogicDocument> = {};
  if (isRecord(raw.pages)) {
    for (const [id, doc] of Object.entries(raw.pages)) {
      if (isStorableDocument(doc)) pages[id] = doc;
    }
  }
  const project = isStorableDocument(raw.project) ? raw.project : emptyLogic();
  const snapshot = { project, pages };
  return errorsOf(validateLogicScopes(snapshot.project, snapshot.pages)).length
    ? emptySnapshot()
    : snapshot;
}

export function readDocument(raw: unknown): LogicDocument | null {
  if (isRecord(raw) && Object.keys(raw).length === 0) return emptyLogic();
  return isStorableDocument(raw) ? raw : null;
}

export function snapshotFromServer(
  projectLogic: unknown,
  pages: ReadonlyArray<{ id: string; logic?: unknown }>,
): LogicSnapshot {
  const snapshot: LogicSnapshot = {
    project: readDocument(projectLogic ?? {}) ?? emptyLogic(),
    pages: {},
  };
  for (const page of pages) {
    const doc = readDocument(page.logic ?? {});
    if (doc) snapshot.pages[page.id] = doc;
  }
  return errorsOf(validateLogicScopes(snapshot.project, snapshot.pages)).length
    ? emptySnapshot()
    : snapshot;
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

export function writeStoredLogic(
  projectId: string,
  snapshot: LogicSnapshot,
): void {
  try {
    window.localStorage.setItem(storageKey(projectId), JSON.stringify(snapshot));
  } catch {}
}

export function countUsages(
  kind: "variable" | "flow",
  name: string,
  sources: unknown[],
): number {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mention = new RegExp(
    `\\bvars\\s*(?:\\.\\s*${escaped}(?![\\w$])|\\[\\s*(['"])${escaped}\\1\\s*\\])`,
  );
  let count = 0;
  const walk = (node: unknown, depth: number, field?: string, inStep = false) => {
    if (depth > 64 || node === null || typeof node !== "object") {
      if (
        typeof node === "string" &&
        kind === "variable" &&
        (templateRefs(node).some(([root, ref]) => root === "vars" && ref === name) ||
          ((field === "code" || templateErrors(node).length > 0) && mention.test(node)))
      ) {
        count++;
      }
      return;
    }
    if (Array.isArray(node)) {
      const childIsStep = field === "do" || field === "then" || field === "else";
      node.forEach((n) => walk(n, depth + 1, undefined, childIsStep));
      return;
    }
    if (inStep) {
      if ("run" in node && kind === "flow" && node.run === name) count++;
      if ("set" in node && kind === "variable" && node.set === name) count++;
    }
    for (const [key, value] of Object.entries(node)) {
      walk(value, depth + 1, key, false);
    }
  };
  sources.forEach((s) => walk(s, 0));
  return count;
}

export function findUsageLocations(
  kind: "variable" | "flow",
  name: string,
  sources: { label: string; value: unknown; elementId?: string }[],
): { label: string; count: number; elementId?: string }[] {
  return sources.flatMap(({ label, value, elementId }) => {
    const count = countUsages(kind, name, [value]);
    return count ? [{ label, count, ...(elementId ? { elementId } : {}) }] : [];
  });
}
