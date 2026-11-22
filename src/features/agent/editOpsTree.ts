import type { EditorElement } from "@/types/global.type";
import { newEntityId } from "@/lib/entity-id";
import {
  componentRoots,
  componentSetting,
  makeComponentInstance,
  wouldCreateComponentCycle,
  type ComponentSource,
} from "@/features/projects/lib/components";
import type { AgentIssue } from "./protocol";
import {
  CONTAINERS,
  MAX_ELEMENTS,
  TEXT_FIELDS,
  isRecordObject,
  type ValidatedEditOp,
  type ValidatedPatch,
} from "./editOpsValidation";

export type EditResult =
  | {
      ok: true;
      elements: EditorElement[];
      created: { ref?: string; id: string }[];
      changes: number;
    }
  | { ok: false; issues: AgentIssue[] };

type MutableElementNode = Record<string, unknown> & {
  id: string;
  type: string;
  settings?: unknown;
  elements?: MutableElementNode[];
};

type NodeLocation = { node: MutableElementNode; siblings: MutableElementNode[] };

interface EditBatch {
  root: MutableElementNode[];
  pageId: string;
  components?: ComponentSource;
  masters?: ReturnType<typeof componentRoots>;
  refs: Map<string, string>;
  created: { ref?: string; id: string }[];
}

function walkTree(
  list: MutableElementNode[],
  visit: (
    n: MutableElementNode,
    parent: MutableElementNode | null,
    siblings: MutableElementNode[],
  ) => void,
  parent: MutableElementNode | null = null,
): void {
  for (const n of list) {
    visit(n, parent, list);
    if (n.elements) walkTree(n.elements, visit, n);
  }
}

function countAllNodes(list: MutableElementNode[]): number {
  let n = 0;
  walkTree(list, () => n++);
  return n;
}

function findNode(
  root: MutableElementNode[],
  id: string,
): NodeLocation | undefined {
  let hit: NodeLocation | undefined;
  walkTree(root, (node, _parent, siblings) => {
    if (!hit && node.id === id) hit = { node, siblings };
  });
  return hit;
}

function childrenOf(
  batch: EditBatch,
  parent: string | null | undefined,
  path: string,
): { list: MutableElementNode[]; id: string | undefined } | AgentIssue {
  if (parent === undefined || parent === null) {
    return { list: batch.root, id: undefined };
  }
  const id = batch.refs.get(parent) ?? parent;
  const hit = findNode(batch.root, id);
  if (!hit) return { path, message: `unknown element "${parent}"` };
  if (componentSetting(hit.node)) {
    return { path, message: "component instances cannot have children" };
  }
  if (!CONTAINERS.has(hit.node.type)) {
    return { path, message: `${hit.node.type} elements cannot have children` };
  }
  hit.node.elements ??= [];
  return { list: hit.node.elements, id };
}

function placeNode(
  list: MutableElementNode[],
  node: MutableElementNode,
  index: number | undefined,
  path: string,
): AgentIssue | undefined {
  if (index !== undefined && index > list.length) {
    return {
      path,
      message: `out of range: this parent has ${list.length} children, so the index is 0 to ${list.length}`,
    };
  }
  list.splice(index ?? list.length, 0, node);
  return undefined;
}

function createElementNode(
  batch: EditBatch,
  op: Extract<ValidatedEditOp, { op: "create" }>,
  path: string,
): AgentIssue | undefined {
  const { element, ref } = op;
  if (ref !== undefined && (batch.refs.has(ref) || findNode(batch.root, ref))) {
    return { path: `${path}.ref`, message: "a ref must be a new, unique name" };
  }
  const target = childrenOf(batch, op.parentId, `${path}.parentId`);
  if ("path" in target) return target;

  const clonedSettings = element.settings
    ? structuredClone(element.settings)
    : undefined;
  let id: string;
  let resolvedType: string;
  let resolvedName = element.name;
  let resolvedSettings: Record<string, unknown> | null = clonedSettings ?? null;
  let isComponentInstance = false;

  if (element.kind === "component") {
    const master = batch.masters?.get(element.component.id);
    if (
      !master ||
      !batch.components ||
      wouldCreateComponentCycle(batch.pageId, element.component.id, batch.components)
    ) {
      return {
        path: `${path}.element.component.id`,
        message:
          "choose a component with a master that does not reference this page",
      };
    }
    const instance = makeComponentInstance(
      master,
      batch.pageId,
      element.component.overrides,
    );
    id = instance.id;
    resolvedType = instance.type;
    resolvedName = element.name ?? instance.name;
    resolvedSettings = {
      ...(clonedSettings ?? {}),
      ...(isRecordObject(instance.settings) ? instance.settings : {}),
    };
    isComponentInstance = true;
  } else {
    id = newEntityId();
    resolvedType = element.type;
  }

  const node: MutableElementNode = {
    id,
    type: resolvedType,
    pageId: batch.pageId,
    ...(target.id !== undefined && { parentId: target.id }),
    content: element.content ?? "",
    styles: {},
    settings: resolvedSettings,
    ...(resolvedName !== undefined && { name: resolvedName }),
    ...(element.tailwindStyles !== undefined && {
      tailwindStyles: element.tailwindStyles,
    }),
    ...(element.src !== undefined && { src: element.src }),
    ...(element.href !== undefined && { href: element.href }),
    ...(!isComponentInstance && CONTAINERS.has(resolvedType) && { elements: [] }),
  };

  const issue = placeNode(target.list, node, op.index, `${path}.index`);
  if (issue) return issue;
  if (ref) batch.refs.set(ref, id);
  batch.created.push({ ...(ref && { ref }), id });
  return undefined;
}

function updateElementNode(
  node: MutableElementNode,
  fields: ValidatedPatch,
  path: string,
): AgentIssue | undefined {
  for (const field of TEXT_FIELDS) {
    if (fields[field] !== undefined) node[field] = fields[field];
  }
  if (!fields.settings && !fields.componentOverride) return undefined;

  const existingSettings = isRecordObject(node.settings) ? node.settings : {};
  const nextSettingsPatch = fields.settings
    ? structuredClone(fields.settings)
    : {};
  const settings: Record<string, unknown> = {
    ...existingSettings,
    ...nextSettingsPatch,
  };
  if (fields.componentOverride) {
    const link = componentSetting(node);
    if (!link) {
      return {
        path: `${path}.set.settings.component`,
        message: "this element is not a component instance",
      };
    }
    settings.component = {
      pageId: link.pageId,
      rootId: link.rootId,
      ...(!fields.componentOverride.clear && {
        overrides: structuredClone(fields.componentOverride.overrides),
      }),
    };
  }
  node.settings = settings;
  return undefined;
}

function moveElementNode(
  batch: EditBatch,
  hit: NodeLocation,
  { parentId, index }: Extract<ValidatedEditOp, { op: "move" }>,
  path: string,
): AgentIssue | undefined {
  const { node, siblings } = hit;
  if (parentId !== undefined && parentId !== null) {
    const targetId = batch.refs.get(parentId) ?? parentId;
    if (
      targetId === node.id ||
      (node.elements && findNode(node.elements, targetId))
    ) {
      return {
        path: `${path}.parentId`,
        message: "an element cannot be moved into itself or its own descendant",
      };
    }
  }
  const target = childrenOf(batch, parentId, `${path}.parentId`);
  if ("path" in target) return target;
  siblings.splice(siblings.indexOf(node), 1);
  if (target.id === undefined) delete node.parentId;
  else node.parentId = target.id;
  return placeNode(target.list, node, index, `${path}.index`);
}

function applySingleValidatedOp(
  batch: EditBatch,
  op: ValidatedEditOp,
  path: string,
): AgentIssue | undefined {
  if (op.op === "create") return createElementNode(batch, op, path);
  const hit = findNode(batch.root, op.id);
  if (!hit) return { path: `${path}.id`, message: `unknown element "${op.id}"` };
  if (op.op === "delete") {
    hit.siblings.splice(hit.siblings.indexOf(hit.node), 1);
    return undefined;
  }
  if (op.op === "update") return updateElementNode(hit.node, op.set, path);
  return moveElementNode(batch, hit, op, path);
}

export function applyValidatedBatch(
  current: EditorElement[],
  validatedOps: ValidatedEditOp[],
  pageId: string,
  components?: ComponentSource,
): EditResult {
  const root = structuredClone(current) as unknown as MutableElementNode[];
  const batch: EditBatch = {
    root,
    pageId,
    components,
    masters: components && componentRoots(components),
    refs: new Map(),
    created: [],
  };

  for (let index = 0; index < validatedOps.length; index++) {
    const issue = applySingleValidatedOp(
      batch,
      validatedOps[index],
      `operations[${index}]`,
    );
    if (issue) return { ok: false, issues: [issue] };
  }

  if (components?.pageIds.has(pageId) && root.length > 1) {
    return {
      ok: false,
      issues: [
        {
          path: "operations",
          message: "a component page can have only one root",
        },
      ],
    };
  }
  if (countAllNodes(root) > MAX_ELEMENTS) {
    return {
      ok: false,
      issues: [
        {
          path: "operations",
          message: `the page would exceed ${MAX_ELEMENTS} elements`,
        },
      ],
    };
  }
  return {
    ok: true,
    elements: root as unknown as EditorElement[],
    created: batch.created,
    changes: validatedOps.length,
  };
}
