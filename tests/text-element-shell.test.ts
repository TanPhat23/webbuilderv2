import { register } from "node:module";

// Polyfill import.meta.env for test runner when loading files that reference Vite globals
const loaderCode = `
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.includes('src/utils/urlbuilder.ts')) {
    result.source = result.source.toString().replaceAll('import.meta.env', '(import.meta.env || {})');
  }
  return result;
}
`;
register("data:text/javascript," + encodeURIComponent(loaderCode));

import test from "node:test";
import assert from "node:assert/strict";

test("sanitizeTextContent strips harmful script tags but preserves valid html", async () => {
  const { sanitizeTextContent } = await import(
    "../src/features/editor/components/elements/shared/TextElementShell"
  );
  const dirty = 'Hello <b>World</b><script>alert("xss")</script>';
  const clean = sanitizeTextContent(dirty);
  assert.equal(clean, "Hello <b>World</b>");
});

test("sanitizeTextContent handles plain text strings without alteration", async () => {
  const { sanitizeTextContent } = await import(
    "../src/features/editor/components/elements/shared/TextElementShell"
  );
  const plain = "Simple plain text";
  assert.equal(sanitizeTextContent(plain), "Simple plain text");
});
