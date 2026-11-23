import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CMS_DISPLAY_FIELDS,
  clampCMSLimit,
  countVisibleCMSFields,
  isCMSFieldVisible,
  parseCMSSortBy,
  parseCMSSortOrder,
  readCMSSettings,
  toggleCMSField,
} from "../src/features/editor/lib/cmsConfig";

test("readCMSSettings validates fields and rejects non-objects", () => {
  assert.deepEqual(readCMSSettings(null), {});
  assert.deepEqual(readCMSSettings(["not", "an", "object"]), {});
  assert.deepEqual(
    readCMSSettings({
      contentTypeId: "posts",
      limit: 6,
      sortBy: "invalid",
      sortOrder: "asc",
      fieldsToShow: ["title", 42, "status"],
    }),
    {
      contentTypeId: "posts",
      limit: 6,
      sortOrder: "asc",
      fieldsToShow: ["title", "status"],
    },
  );
});

test("visible field helpers default to title and content and expose status", () => {
  assert.ok(CMS_DISPLAY_FIELDS.includes("status"));
  assert.equal(isCMSFieldVisible(undefined, "title"), true);
  assert.equal(isCMSFieldVisible(undefined, "content"), true);
  assert.equal(isCMSFieldVisible(undefined, "author"), false);
  assert.equal(countVisibleCMSFields(undefined), 2);
  assert.equal(countVisibleCMSFields(["title", "image", "date"]), 3);
});

test("toggleCMSField deduplicates existing fields and filters removed fields", () => {
  assert.deepEqual(toggleCMSField(undefined, "image", true), [
    "title",
    "content",
    "image",
  ]);
  assert.deepEqual(toggleCMSField(["title", "image"], "image", true), [
    "title",
    "image",
  ]);
  assert.deepEqual(toggleCMSField(["title", "image"], "title", false), [
    "image",
  ]);
});

test("enum parsers and limit clamp respect grid fallback and upper bound", () => {
  assert.equal(parseCMSSortBy("updatedAt"), "updatedAt");
  assert.equal(parseCMSSortBy("random"), null);
  assert.equal(parseCMSSortOrder("asc"), "asc");
  assert.equal(parseCMSSortOrder("other"), null);
  assert.equal(clampCMSLimit(""), 10);
  assert.equal(clampCMSLimit("", 6), 6);
  assert.equal(clampCMSLimit("25"), 25);
  assert.equal(clampCMSLimit("250"), 100);
});
