import assert from "node:assert/strict";
import { test } from "node:test";
import type { EditorElement } from "../src/types/global.type";
import { ElementStore } from "../src/features/editor/store/element-store";
import { SelectionStore } from "../src/features/editor/store/selection-store";
import { ElementKeyboardActions } from "../src/features/editor/lib/keyBoardEvents";

function installSessionStorage(): () => void {
  const prev = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    },
  });
  return () => {
    if (prev) Object.defineProperty(globalThis, "sessionStorage", prev);
    else delete (globalThis as Record<string, unknown>).sessionStorage;
  };
}

function makeText(id: string, content: string, settings: Record<string, unknown> | null = null): EditorElement {
  return { id, type: "Text", pageId: "page-1", content, styles: {}, settings };
}

test("ElementKeyboardActions copy, cut, paste, reorder, and delete respect read-only and component bounds", () => {
  const restore = installSessionStorage();
  try {
    const e1 = makeText("el-1", "First");
    const e2 = makeText("el-2", "Second");
    ElementStore.getState().beginPage("proj-1", "page-1", false);
    ElementStore.getState().loadElements([e1, e2]);
    SelectionStore.getState().setSelectedElement(e1);

    const actions = new ElementKeyboardActions();
    actions.copyElement();
    actions.pasteElement();
    assert.equal(ElementStore.getState().elements.length, 3);

    SelectionStore.getState().setSelectedElement(e1);
    actions.bringToFront();
    assert.equal(ElementStore.getState().elements.at(-1)?.id, "el-1");

    actions.sendToBack();
    assert.equal(ElementStore.getState().elements[0]?.id, "el-1");

    actions.cutElement();
    assert.equal(SelectionStore.getState().selectedElementId, undefined);
    assert.equal(ElementStore.getState().elements.some((e) => e.id === "el-1"), false);

    actions.setReadOnly(true);
    const beforeReadOnlyCount = ElementStore.getState().elements.length;
    actions.pasteElement();
    actions.cutElement();
    actions.bringToFront();
    actions.sendToBack();
    actions.deleteElement();
    assert.equal(ElementStore.getState().elements.length, beforeReadOnlyCount);

    actions.setReadOnly(false);
    actions.setLocked(true);
    actions.deleteElement();
    assert.equal(ElementStore.getState().elements.length, beforeReadOnlyCount);

    actions.setLocked(false);
    const linked = makeText("cmp-inst", "Comp", { component: { pageId: "master", rootId: "root" } });
    ElementStore.getState().loadElements([e2, linked]);
    SelectionStore.getState().setSelectedElement(linked);
    actions.copyElement();

    ElementStore.getState().beginPage("proj-other", "page-other", false);
    ElementStore.getState().loadElements([]);
    actions.pasteElement();
    assert.equal(ElementStore.getState().elements.length, 0);

    actions.deselectAll();
    assert.equal(SelectionStore.getState().selectedElementId, undefined);
  } finally {
    ElementStore.getState().loadElements([]);
    SelectionStore.getState().setSelectedElement(undefined);
    restore();
  }
});
