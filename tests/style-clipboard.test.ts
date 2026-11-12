import { strict as assert } from "node:assert";
import { test } from "node:test";
import { useStyleClipboard } from "../src/features/editor/components/sidebar/style/styleClipboard";

test("copy stores a detached copy", () => {
  const src = { color: "red" };
  useStyleClipboard.getState().copy(src);
  src.color = "blue";
  assert.deepEqual(useStyleClipboard.getState().copied, { color: "red" });
});
