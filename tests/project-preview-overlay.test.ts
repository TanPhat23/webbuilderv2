import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ProjectPreviewOverlay,
  buildOverlaySections,
  buildOverlaySwatches,
} from "../apps/editor/src/features/projectsettings/components/ProjectPreviewOverlay";

test("buildOverlaySwatches and buildOverlaySections normalize optional design tokens", () => {
  assert.deepEqual(buildOverlaySwatches(undefined), []);
  assert.deepEqual(
    buildOverlaySwatches({ primary: "#111", secondary: "#222", accent: "#333" }),
    [
      { label: "Primary Color", color: "#111" },
      { label: "Secondary Color", color: "#222" },
      { label: "Accent Color", color: "#333" },
    ],
  );

  assert.deepEqual(buildOverlaySections(undefined), []);
  assert.deepEqual(
    buildOverlaySections({
      fontFamily: "Inter",
      letterTracking: 0,
      spacing: 16,
      borderRadius: 8,
      shadowStyle: "soft",
    }),
    [
      [{ label: "Font:", value: "Inter" }],
      [
        { label: "Spacing:", value: "16px" },
        { label: "Radius:", value: "8px" },
      ],
      [{ label: "Shadow:", value: "soft", uppercase: true }],
    ],
  );

  assert.deepEqual(buildOverlaySections({ letterTracking: -0.025 }), [
    [{ label: "Tracking:", value: "-0.025em" }],
  ]);
});

test("ProjectPreviewOverlay renders token card when design system or colors exist and hides it when empty", () => {
  const emptyMarkup = renderToStaticMarkup(createElement(ProjectPreviewOverlay, {}));
  assert.match(emptyMarkup, /Preview Mode/);
  assert.doesNotMatch(emptyMarkup, /Live Preview/);

  const populatedMarkup = renderToStaticMarkup(
    createElement(ProjectPreviewOverlay, {
      colors: { primary: "#000000", secondary: "#444444", accent: "#888888" },
      designSystem: {
        colors: { primary: "#123456", secondary: "#654321", accent: "#abcdef" },
        fontFamily: "Lora",
        letterTracking: 0.05,
        shadowStyle: "lg",
      },
    }),
  );
  assert.match(populatedMarkup, /Live Preview/);
  assert.match(populatedMarkup, /background-color:#123456/);
  assert.doesNotMatch(populatedMarkup, /#000000/);
  assert.match(populatedMarkup, /Lora/);
  assert.match(populatedMarkup, /0\.050em/);
  assert.match(populatedMarkup, /uppercase/);
});
