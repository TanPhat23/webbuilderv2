import { cloneDeep } from "lodash-es";
import {
  diffTrees,
  type TreeOp,
} from "@/features/editor/utils/element/treeDiff";
import type { EditorElement } from "@/types/global.type";
import type { ElementStore, ElementStoreCreator } from "./element-store-types";

const MAX_HISTORY = 50;

interface HistoryEffects {
  notify: () => void;
  emit: NonNullable<ElementStore["collaborativeCallback"]>;
  allowsRootCount: (tree: EditorElement[]) => boolean;
}

function emitTreeOps(ops: TreeOp[], emit: HistoryEffects["emit"]) {
  for (const op of ops) {
    switch (op.type) {
      case "delete":
        emit("delete", op.id);
        break;
      case "create":
        emit("create", op.element.id, op.element);
        break;
      case "move":
        emit("move", op.id, {
          elementId: op.id,
          newParentId: op.newParentId,
          newPosition: op.newPosition,
        });
        break;
      case "update":
        emit("update", op.id, op.patch);
        break;
    }
  }
}

export function createElementHistory(
  set: Parameters<ElementStoreCreator>[0],
  get: Parameters<ElementStoreCreator>[1],
  { notify, emit, allowsRootCount }: HistoryEffects,
) {
  const takeSnapshot = (elements = get().elements) => {
    const past = [...get().past, cloneDeep(elements)].slice(-MAX_HISTORY);
    set({ past, future: [] });
  };

  const publishTree = (elements: EditorElement[]) => {
    set({ elements });
    notify();
  };

  const commitLocalTree = (elements: EditorElement[]) => {
    takeSnapshot();
    publishTree(elements);
  };

  const actions: Pick<
    ElementStore,
    "replaceTree" | "applyProgressiveStep" | "rememberTree" | "undo" | "redo"
  > = {
    replaceTree: (next) => {
      if (!allowsRootCount(next)) return get();
      const ops = diffTrees(get().elements, next);
      if (ops.length === 0) return get();
      commitLocalTree(next);
      emitTreeOps(ops, emit);
      return get();
    },

    applyProgressiveStep: (next, ops) => {
      if (!allowsRootCount(next)) return get();
      publishTree(next);
      emitTreeOps([...ops], emit);
      return get();
    },

    rememberTree: (previous) => takeSnapshot(previous),

    undo: () => {
      const { past, elements, future } = get();
      const previous = past.at(-1);
      if (!previous) return get();
      set({
        past: past.slice(0, -1),
        elements: previous,
        future: [elements, ...future],
      });
      notify();
      emitTreeOps(diffTrees(elements, previous), emit);
      return get();
    },

    redo: () => {
      const { future, elements, past } = get();
      const [next, ...remaining] = future;
      if (!next) return get();
      set({ past: [...past, elements], elements: next, future: remaining });
      notify();
      emitTreeOps(diffTrees(elements, next), emit);
      return get();
    },
  };

  return { actions, takeSnapshot, publishTree, commitLocalTree };
}
