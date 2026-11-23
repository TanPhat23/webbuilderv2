import assert from "node:assert/strict";
import { test } from "node:test";
import type { EditorElement } from "../src/types/global.type";
import {
  addSelectOption,
  moveSelectOption,
  readSelectSettings,
  removeSelectOption,
  resolveSelectOptions,
  toggleDefaultSelectOption,
  updateSelectOptionField,
} from "../src/features/editor/lib/selectOptions";

test("readSelectSettings safely extracts select configuration fields", () => {
  assert.deepEqual(readSelectSettings(null), {});
  assert.deepEqual(
    readSelectSettings({
      name: "country",
      selectOptions: [{ id: "1", label: "One", value: "one" }],
      defaultValue: "one",
      required: true,
      disabled: false,
    }),
    {
      name: "country",
      selectOptions: [{ id: "1", label: "One", value: "one" }],
      defaultValue: "one",
      required: true,
      disabled: false,
    },
  );
});

test("resolveSelectOptions prefers child elements before falling back to two defaults", () => {
  assert.deepEqual(resolveSelectOptions({}, "Pick me"), [
    { id: "default-1", label: "Pick me", value: "option-1" },
    { id: "default-2", label: "Option 2", value: "option-2" },
  ]);
  const fallbackElements: EditorElement[] = [
    { id: "el-1", type: "Text", pageId: "p1", content: "Alpha", styles: {} },
    { id: "el-2", type: "Text", pageId: "p1", content: "", styles: {} },
  ];
  assert.deepEqual(resolveSelectOptions({}, "Pick me", fallbackElements), [
    { id: "el-1", label: "Alpha", value: "Alpha" },
    { id: "el-2", label: "Option 2", value: "" },
  ]);
  const existing = [{ id: "x", label: "X", value: "x" }];
  assert.equal(resolveSelectOptions({ selectOptions: existing }), existing);
});

test("option list mutations avoid duplicate values and use undefined for unset default", () => {
  const initial = resolveSelectOptions({});
  const afterRemove = removeSelectOption(initial, 0, undefined);
  const added = addSelectOption(afterRemove.selectOptions, "opt-next");
  assert.equal(added.length, 2);
  assert.notEqual(added[1].value, added[0].value);
  assert.deepEqual(added[1], { id: "opt-next", label: "Option 3", value: "option-3" });

  const renamed = updateSelectOptionField(
    [
      { id: "1", label: "One", value: "option-1" },
      { id: "2", label: "Two", value: "option-2" },
    ],
    1,
    "value",
    "second",
    "option-2",
  );
  assert.equal(renamed.defaultValue, "second");

  const emptyUntouched = updateSelectOptionField(
    [{ id: "empty", label: "Empty", value: "" }],
    0,
    "label",
    "Updated Empty",
    undefined,
  );
  assert.equal(emptyUntouched.defaultValue, undefined);

  const movedUp = moveSelectOption(renamed.selectOptions, 1, "up");
  assert.equal(movedUp?.[0].value, "second");
  assert.equal(moveSelectOption(renamed.selectOptions, 0, "up"), null);
  assert.equal(moveSelectOption(renamed.selectOptions, 1, "down"), null);

  const removedDefault = removeSelectOption(renamed.selectOptions, 1, "second");
  assert.equal(removedDefault.defaultValue, undefined);

  assert.equal(toggleDefaultSelectOption("a", "a"), undefined);
  assert.equal(toggleDefaultSelectOption(undefined, ""), "");
  assert.equal(toggleDefaultSelectOption("", ""), undefined);
});
