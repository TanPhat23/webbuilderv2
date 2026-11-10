import test from "node:test";
import assert from "node:assert/strict";
import {
  PRELOAD_OPTIONS,
  resolveControlsValue,
} from "../src/features/editor/components/sidebar/configurations/_shared/MediaPlaybackSection";

test("resolveControlsValue defaults controls to true when undefined", () => {
  assert.equal(resolveControlsValue("Audio", undefined), true);
  assert.equal(resolveControlsValue("Video", undefined), true);
  assert.equal(resolveControlsValue("Audio", true), true);
  assert.equal(resolveControlsValue("Audio", false), false);
  assert.equal(resolveControlsValue("Video", false), false);
});

test("PRELOAD_OPTIONS has valid entries for auto, metadata, none", () => {
  const values = PRELOAD_OPTIONS.map((o) => o.value);
  assert.deepEqual(values, ["auto", "metadata", "none"]);
});
