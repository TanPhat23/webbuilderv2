import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ALL_ICON_NAMES,
  clampIconMetric,
  filterIconNames,
  isValidIconName,
} from "../src/features/editor/lib/iconConfig";

test("iconConfig validates icon names in O(1) and filters single-pass", () => {
  assert.equal(isValidIconName("star"), true);
  assert.equal(isValidIconName("not-a-real-lucide-icon-xyz"), false);
  assert.equal(isValidIconName(""), false);

  const emptyQuery = filterIconNames("   ", 15);
  assert.equal(emptyQuery.items.length, 15);
  assert.equal(emptyQuery.total, ALL_ICON_NAMES.length);

  const arrowMatches = filterIconNames("arrow", 10);
  assert.ok(arrowMatches.total >= arrowMatches.items.length);
  assert.ok(arrowMatches.items.every((name) => name.includes("arrow")));
});

test("clampIconMetric parses bounded floats and returns undefined when cleared", () => {
  assert.equal(clampIconMetric("", 8, 512), undefined);
  assert.equal(clampIconMetric("abc", 8, 512), undefined);
  assert.equal(clampIconMetric("2", 8, 512), 8);
  assert.equal(clampIconMetric("24", 8, 512), 24);
  assert.equal(clampIconMetric("999", 8, 512), 512);
  assert.equal(clampIconMetric("1.25", 0.5, 4), 1.25);
});
