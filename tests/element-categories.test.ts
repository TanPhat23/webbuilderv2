import { test } from "node:test";
import assert from "node:assert/strict";
import elementHolders, { ALL_ELEMENT_TYPES } from "../src/features/editor/constants/elements";
import {
  ELEMENT_CATEGORIES,
  getElementsForCategory,
} from "../src/features/editor/constants/elementCategories";

test("all elements in elementHolders are mapped in categories", () => {
  const allCategoryElements = new Set<string>();
  for (const cat of ELEMENT_CATEGORIES) {
    for (const el of cat.elements) {
      allCategoryElements.add(el);
    }
  }

  for (const holder of elementHolders) {
    assert.ok(
      allCategoryElements.has(holder.type),
      `Element ${holder.type} is not mapped in any category`,
    );
  }

  for (const type of ALL_ELEMENT_TYPES) {
    assert.ok(
      allCategoryElements.has(type),
      `ElementType ${type} is not mapped in any category`,
    );
  }
});

test("every category has a label and non-empty element list", () => {
  assert.ok(ELEMENT_CATEGORIES.length > 0, "ELEMENT_CATEGORIES should not be empty");

  for (const cat of ELEMENT_CATEGORIES) {
    assert.ok(typeof cat.id === "string" && cat.id.length > 0, "category id must be non-empty string");
    assert.ok(typeof cat.label === "string" && cat.label.length > 0, "category label must be non-empty string");
    assert.ok(Array.isArray(cat.elements) && cat.elements.length > 0, `category ${cat.label} elements must not be empty`);

    // Verify getElementsForCategory returns matching elementHolders
    const elementsInHolder = getElementsForCategory(cat.id);
    assert.ok(elementsInHolder.length > 0, `getElementsForCategory("${cat.id}") must return non-empty list`);
  }
});

test("getElementsForCategory returns correct element holders by id or label", () => {
  const structureById = getElementsForCategory("structure");
  const structureByLabel = getElementsForCategory("Structure");
  assert.deepEqual(structureById, structureByLabel);
  assert.ok(structureById.some((el) => el.type === "Section"));

  const invalid = getElementsForCategory("nonexistent");
  assert.deepEqual(invalid, []);
});
