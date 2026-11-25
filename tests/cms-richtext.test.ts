import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  countWords,
  sanitizeRichTextHtml,
  slugifyTitle,
  stripHtmlToPreview,
} from "../src/features/cms/components/richTextUtils";
import {
  FIELD_TYPE_META,
  getFieldTypeMeta,
} from "../src/features/cms/components/fieldTypeMeta";
import { FIELD_TYPES } from "../src/features/cms/components/types";

describe("richTextUtils", () => {
  it("sanitizeRichTextHtml strips scripts, event handlers, and javascript URLs while preserving safe markup", () => {
    const dirty =
      '<h1>Hello</h1><p>Welcome <strong>bold</strong> and <em>italic</em></p><ul><li>One</li></ul><blockquote>Quote</blockquote><code>const x = 1;</code><a href="https://example.com" onclick="alert(1)">Link</a><a href="javascript:alert(2)">Bad</a><img src=x onerror=alert(3) /><script>alert(4)</script><iframe src="https://evil.com"></iframe>';
    const clean = sanitizeRichTextHtml(dirty);

    assert.ok(clean.includes("<h1>Hello</h1>"));
    assert.ok(clean.includes("<strong>bold</strong>"));
    assert.ok(clean.includes("<em>italic</em>"));
    assert.ok(clean.includes("<ul><li>One</li></ul>"));
    assert.ok(clean.includes("<blockquote>Quote</blockquote>"));
    assert.ok(clean.includes("<code>const x = 1;</code>"));
    assert.ok(clean.includes('href="https://example.com"'));

    assert.ok(!clean.includes("<script"));
    assert.ok(!clean.includes("<iframe"));
    assert.ok(!clean.includes("onerror"));
    assert.ok(!clean.includes("onclick"));
    assert.ok(!clean.includes("javascript:"));
  });

  it("stripHtmlToPreview removes tags, decodes entities, and collapses whitespace", () => {
    const html =
      "<h1>  Hello&nbsp;World </h1>\n<p>Rock &amp; Roll &lt;2026&gt; &quot;quoted&quot; &#39;single&#39;</p>";
    assert.equal(
      stripHtmlToPreview(html),
      `Hello World Rock & Roll <2026> "quoted" 'single'`,
    );
    assert.equal(stripHtmlToPreview(""), "");
  });

  it("slugifyTitle produces clean lowercase URL slugs", () => {
    assert.equal(slugifyTitle("Hello World! 2026"), "hello-world-2026");
    assert.equal(slugifyTitle("  Café & Crème Brûlée  "), "cafe-creme-brulee");
    assert.equal(slugifyTitle("---Multiple   Spaces---"), "multiple-spaces");
    assert.equal(slugifyTitle(""), "");
  });

  it("countWords counts words accurately", () => {
    assert.equal(countWords(""), 0);
    assert.equal(countWords("   \n\t  "), 0);
    assert.equal(countWords("hello"), 1);
    assert.equal(countWords("  one   two\nthree\tfour  "), 4);
  });
});

describe("fieldTypeMeta", () => {
  it("covers every field type in FIELD_TYPES and falls back safely", () => {
    for (const fieldType of FIELD_TYPES) {
      const meta = FIELD_TYPE_META[fieldType];
      assert.ok(meta, `Missing metadata for ${fieldType}`);
      assert.ok(meta.label.length > 0);
      assert.ok(meta.description.length > 0);
      assert.ok(meta.icon);
      assert.equal(getFieldTypeMeta(fieldType), meta);
    }

    assert.equal(getFieldTypeMeta("unknown-custom-type"), FIELD_TYPE_META.text);
  });
});
