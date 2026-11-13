import { strict as assert } from "node:assert";
import { test } from "node:test";
import { useElementStore } from "../src/features/editor/store/element-store";
import { elementHelper } from "../src/features/editor/utils/element/elementhelper";

const el = (id: string, extra: Record<string, unknown> = {}) =>
  ({
    id,
    type: "Frame",
    content: "",
    styles: {},
    tailwindStyles: "",
    elements: [],
    pageId: "p",
    ...extra,
  }) as any;

test("an element dropped into a flex row fills instead of overflowing", () => {
  const store = useElementStore.getState();
  store.loadElements(
    [
      el("nav", { tailwindStyles: "flex items-center", elements: [el("link", { parentId: "nav" })] }),
      el("stack"),
    ],
    true,
  );

  const image = el("img", {
    type: "Image",
    parentId: "nav",
    styles: { default: { width: "100%", height: "auto" } },
  });
  useElementStore.getState().insertElementRelative(image, "link", "before");

  const placed = elementHelper.findById(useElementStore.getState().elements, "img")!;
  assert.deepEqual(placed.styles?.default, {
    height: "auto",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: "0px",
  });

  // In a block parent the same element keeps its 100% width.
  const other = el("img2", {
    type: "Image",
    parentId: "stack",
    styles: { default: { width: "100%" } },
  });
  useElementStore.getState().addElement(other);
  assert.deepEqual(
    elementHelper.findById(useElementStore.getState().elements, "img2")!.styles?.default,
    { width: "100%" },
  );

  // Moving it into the row adapts it and tells collaborators.
  const sent: string[] = [];
  useElementStore.getState().setCollaborativeCallback(((type: string) => {
    sent.push(type);
  }) as any);
  useElementStore.getState().moveElement("img2", "link", "after");
  useElementStore.getState().setCollaborativeCallback(null as any);
  assert.equal(
    (elementHelper.findById(useElementStore.getState().elements, "img2")!.styles?.default as any)
      .flexGrow,
    1,
  );
  assert.deepEqual(sent, ["move", "update"]);
});
