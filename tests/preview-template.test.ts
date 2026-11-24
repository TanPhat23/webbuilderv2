import assert from "node:assert/strict";
import { test } from "node:test";
import { generateDesignSystemCSS } from "../src/features/projectsettings/utils/designSystemUtils";
import {
  generatePreviewHTML,
  resolvePreviewTokens,
} from "../src/features/projectsettings/utils/previewTemplate";

test("resolvePreviewTokens preserves zero metrics, clamps negatives, and sanitizes unsafe strings", () => {
  const zeroTokens = resolvePreviewTokens({
    colors: { primary: "#111111", secondary: "#222222", accent: "#333333" },
    fontFamily: "Lora",
    letterTracking: 0,
    borderRadius: 0,
    spacing: 0,
    shadowStyle: "sm",
  });
  assert.equal(zeroTokens.borderRadius, 0);
  assert.equal(zeroTokens.spacing, 0);
  assert.equal(zeroTokens.letterTracking, 0);

  const clamped = resolvePreviewTokens({
    borderRadius: -12,
    spacing: -4,
    shadowStyle: "constructor",
  });
  assert.equal(clamped.borderRadius, 0);
  assert.equal(clamped.spacing, 0);
  assert.equal(clamped.shadowStyle, "md");

  const unsafe = resolvePreviewTokens({
    colors: { primary: "red;</style><script>alert(1)</script>", secondary: "#eee", accent: "#333" },
    fontFamily: 'Inter";</style><script>',
  });
  assert.equal(unsafe.colors.primary, "#3b82f6");
  assert.equal(unsafe.fontFamily, "Inter");
});

test("generateDesignSystemCSS always defines --shadow and --font-mono safely", () => {
  for (const shadowStyle of ["sm", "md", "lg", "xl", "2xl"]) {
    const css = generateDesignSystemCSS({ shadowStyle, borderRadius: 0, spacing: 0 });
    assert.match(css, /--shadow:\s*0px/);
    assert.match(css, /--font-mono:/);
    assert.match(css, /--spacing:\s*0px/);
    assert.match(css, /--radius:\s*0px/);
  }
  const injected = generateDesignSystemCSS({ shadowStyle: "constructor" });
  assert.doesNotMatch(injected, /function Object/);
});

test("generatePreviewHTML includes design tokens and zero spacing/radius values", () => {
  const html = generatePreviewHTML({
    colors: { primary: "#10b981", secondary: "#ecfdf5", accent: "#047857" },
    fontFamily: "JetBrains Mono",
    letterTracking: 0.025,
    borderRadius: 0,
    spacing: 0,
    shadowStyle: "lg",
  });
  assert.match(html, /#10b981/);
  assert.match(html, /JetBrains Mono/);
  assert.match(html, /0px<\/div><div class="stat-label">Base Spacing/);
  assert.match(html, /0px<\/div><div class="stat-label">Border Radius/);
  assert.doesNotMatch(html, /<script/);
});

test("generatePreviewHTML injects sanitized customCSS and strips unsafe markup", () => {
  const html = generatePreviewHTML(
    {},
    undefined,
    ".hero h1 { color: #123456; } <script>alert(1)</script>",
  );
  assert.match(html, /\.hero h1 \{ color: #123456; \}/);
  assert.doesNotMatch(html, /<script/);
});
