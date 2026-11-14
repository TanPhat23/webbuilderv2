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

test("CustomYjsProviderV2 options and element state injection", async () => {
  const { CustomYjsProviderV2 } = await import(
    "../src/features/collaboration/lib/yjs/Provider"
  );
  type EditorElement = import("../src/types/global.type").EditorElement;

  const mockElement: EditorElement = {
    id: "el-integration",
    name: "Verification Element",
    type: "Text",
    styles: { opacity: "1" },
    settings: { text: "Hello from verification" },
  } as unknown as EditorElement;

  let getterCalled = false;
  const mockState = {
    elements: [mockElement],
    loadElements: () => {},
    remoteAdd: () => {},
    remoteUpdate: () => {},
    remoteMove: () => {},
    remoteDelete: () => {},
  };

  const providerWithState = new CustomYjsProviderV2({
    url: "ws://localhost:1234",
    pageId: "page-1",
    projectId: "project-1",
    userId: "user-1",
    getToken: async () => "mock-token",
    getElementState: () => {
      getterCalled = true;
      return mockState;
    },
  });

  try {
    assert.equal(providerWithState.connected, false);
    assert.equal(providerWithState.isSynced, false);

    const handler = (providerWithState as unknown as { messageHandler: { handle: (env: unknown) => void } }).messageHandler;
    handler.handle({
      type: "element:update",
      payload: {
        id: "el-integration",
        settings: { text: "Updated in verification" },
      },
    });

    assert.equal(getterCalled, true);
  } finally {
    providerWithState.destroy();
  }

});

test("getChoiceConfigurationDefaults handles undefined and custom configurations", async () => {
  const { getChoiceConfigurationDefaults } = await import(
    "../src/features/editor/components/sidebar/configurations/_shared/ChoiceConfigurationSection"
  );

  const defaults = getChoiceConfigurationDefaults(undefined);
  assert.equal(defaults.name, "");
  assert.equal(defaults.value, "");
  assert.equal(defaults.label, "");
  assert.equal(defaults.defaultChecked, false);
  assert.equal(defaults.disabled, false);
  assert.equal(defaults.required, false);

  const custom = getChoiceConfigurationDefaults({
    name: "newsletter",
    value: "subscribed",
    label: "Subscribe to newsletter",
    defaultChecked: true,
    disabled: false,
    required: true,
  });
  assert.equal(custom.name, "newsletter");
  assert.equal(custom.value, "subscribed");
  assert.equal(custom.label, "Subscribe to newsletter");
  assert.equal(custom.defaultChecked, true);
  assert.equal(custom.disabled, false);
  assert.equal(custom.required, true);
});

test("resolveControlsValue and PRELOAD_OPTIONS for media playback", async () => {
  const {
    PRELOAD_OPTIONS,
    resolveControlsValue,
  } = await import(
    "../src/features/editor/components/sidebar/configurations/_shared/MediaPlaybackSection"
  );

  assert.equal(resolveControlsValue("Audio", undefined), true);
  assert.equal(resolveControlsValue("Video", undefined), true);
  assert.equal(resolveControlsValue("Audio", true), true);
  assert.equal(resolveControlsValue("Audio", false), false);
  assert.equal(resolveControlsValue("Video", false), false);

  const preloadValues = PRELOAD_OPTIONS.map((o) => o.value);
  assert.deepEqual(preloadValues, ["auto", "metadata", "none"]);
});

test("sanitizeTextContent sanitizes dangerous HTML while preserving safe formatting", async () => {
  const { sanitizeTextContent } = await import(
    "../src/features/editor/components/elements/shared/TextElementShell"
  );

  const scriptPayload = '<p>Hello <strong>Antigravity</strong><script>alert("hacked")</script></p>';
  const cleanResult = sanitizeTextContent(scriptPayload);
  assert.equal(cleanResult, "<p>Hello <strong>Antigravity</strong></p>");

  const plainText = "Plain text sample";
  assert.equal(sanitizeTextContent(plainText), "Plain text sample");
});
