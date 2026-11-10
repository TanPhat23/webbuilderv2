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

test("getChoiceConfigurationDefaults handles undefined settings safely", async () => {
  const { getChoiceConfigurationDefaults } = await import(
    "../src/features/editor/components/sidebar/configurations/_shared/ChoiceConfigurationSection"
  );
  const result = getChoiceConfigurationDefaults(undefined);
  assert.equal(result.name, "");
  assert.equal(result.value, "");
  assert.equal(result.label, "");
  assert.equal(result.defaultChecked, false);
  assert.equal(result.disabled, false);
  assert.equal(result.required, false);
});

test("getChoiceConfigurationDefaults preserves configured values", async () => {
  const { getChoiceConfigurationDefaults } = await import(
    "../src/features/editor/components/sidebar/configurations/_shared/ChoiceConfigurationSection"
  );
  const result = getChoiceConfigurationDefaults({
    name: "terms",
    value: "accepted",
    label: "Agree to Terms",
    defaultChecked: true,
    disabled: false,
    required: true,
  });
  assert.equal(result.name, "terms");
  assert.equal(result.value, "accepted");
  assert.equal(result.label, "Agree to Terms");
  assert.equal(result.defaultChecked, true);
  assert.equal(result.disabled, false);
  assert.equal(result.required, true);
});
