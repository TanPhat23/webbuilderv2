import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_COLORS,
  PRESET_COLORS,
  RADIUS_SCALES,
  SPACING_MULTIPLIERS,
} from "../src/features/projectsettings/constants/themePresets";
import {
  buildProjectUpdatePayload,
  extractProjectSettings,
  extractUpdateErrorMessage,
} from "../src/features/projectsettings/utils/projectSettingsState";

test("extractProjectSettings falls back to defaults for missing or partial project styles", () => {
  const result = extractProjectSettings({
    name: "Marketing Site",
    description: null,
    published: true,
    subdomain: "marketing",
    header: { cssStyles: "body { color: red; }" },
    styles: {
      primary: "#123456",
      fontFamily: "Lora",
      borderRadius: 12,
    },
  });

  assert.equal(result.projectName, "Marketing Site");
  assert.equal(result.projectDescription, "");
  assert.equal(result.isPublished, true);
  assert.equal(result.subdomain, "marketing");
  assert.equal(result.customCSS, "body { color: red; }");
  assert.equal(result.selectedColors.primary, "#123456");
  assert.equal(result.selectedColors.secondary, DEFAULT_COLORS.secondary);
  assert.equal(result.fontFamily, "Lora");
  assert.equal(result.borderRadius, 12);
  assert.equal(result.spacing, 4);
  assert.equal(result.letterTracking, 0);
  assert.equal(result.shadowStyle, "md");
});

test("buildProjectUpdatePayload normalizes nullable fields and sanitizes custom CSS", () => {
  const payload = buildProjectUpdatePayload({
    projectId: "proj-1",
    existingHeader: { title: "Keep Me" },
    state: {
      projectName: "My Site",
      projectDescription: "",
      isPublished: false,
      subdomain: "",
      customCSS: "body { color: blue; } <script>alert(1)</script> @import url('http://evil.example/x.css');",
      selectedColors: DEFAULT_COLORS,
      fontFamily: "Inter",
      letterTracking: 0.02,
      borderRadius: 8,
      spacing: 4,
      shadowStyle: "lg",
    },
  });

  assert.equal(payload.id, "proj-1");
  assert.equal(payload.name, "My Site");
  assert.equal(payload.description, null);
  assert.equal(payload.subdomain, null);
  assert.equal(payload.header.title, "Keep Me");
  assert.doesNotMatch(payload.header.cssStyles, /<script|@import/i);
  assert.equal(payload.styles.fontFamily, "Inter");
  assert.equal(payload.styles.borderRadius, 8);
  assert.equal(payload.styles.shadowStyle, "lg");
});

test("extractUpdateErrorMessage unwraps embedded JSON messages and falls back safely", () => {
  assert.equal(
    extractUpdateErrorMessage(
      new Error('HTTP 400: {"errorMessage":"Subdomain already taken"}'),
    ),
    "Subdomain already taken",
  );
  assert.equal(
    extractUpdateErrorMessage(new Error('{"message":"Invalid color"}')),
    "Invalid color",
  );
  assert.equal(
    extractUpdateErrorMessage(new Error("Plain network error")),
    "Plain network error",
  );
  assert.equal(
    extractUpdateErrorMessage(new Error("Broken {not-json")),
    "Broken {not-json",
  );
  assert.equal(extractUpdateErrorMessage(null), "Failed to update project");
});

test("theme presets and scale tables match expected structure", () => {
  assert.equal(PRESET_COLORS.length, 6);
  assert.deepEqual([...SPACING_MULTIPLIERS], [1, 2, 4, 8, 12]);
  assert.deepEqual(
    RADIUS_SCALES.map((s) => s.label),
    ["SM", "MD", "LG", "XL"],
  );
  assert.equal(RADIUS_SCALES[0].compute(2), 0);
  assert.equal(RADIUS_SCALES[3].compute(8), 12);
});
