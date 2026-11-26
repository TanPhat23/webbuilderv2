import assert from "node:assert/strict";
import { test } from "node:test";
import {
  cssByteLength,
  formatCssPreview,
  isCssUploadFile,
  validateCssImport,
} from "../apps/editor/src/features/editor/lib/cssImport";

test("validateCssImport enforces non-empty CSS, size bounds, and safe tags", () => {
  assert.equal(validateCssImport("", 1024), "CSS is empty");
  assert.match(validateCssImport("a".repeat(2049), 1024) ?? "", /too large/i);
  assert.match(
    validateCssImport("body{}<script>alert(1)</script>", 4096) ?? "",
    /script/i,
  );
  assert.match(
    validateCssImport("<!DOCTYPE html><html></html>", 4096) ?? "",
    /no full HTML/i,
  );
  assert.equal(validateCssImport(".btn { color: red; }", 4096), null);
});

test("isCssUploadFile recognizes CSS MIME types and .css extensions", () => {
  assert.equal(isCssUploadFile({ type: "text/css", name: "styles.txt" }), true);
  assert.equal(isCssUploadFile({ type: "", name: "globals.css" }), true);
  assert.equal(isCssUploadFile({ type: "text/plain", name: "notes.txt" }), false);
});

test("formatCssPreview and cssByteLength format style previews and UTF-8 bytes", () => {
  assert.equal(formatCssPreview(".a{}"), "<style>.a{}</style>");
  assert.match(
    formatCssPreview("x".repeat(10005)),
    /\n\.\.\.truncated\.\.\.<\/style>$/,
  );
  assert.equal(cssByteLength("/* ✓ */"), 9);
});
