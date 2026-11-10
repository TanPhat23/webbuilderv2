import test from "node:test";
import assert from "node:assert/strict";
import { NodeType } from "../src/features/eventworkflows/types/workflow.types";
import {
  NODE_META,
  NODE_TYPES_ORDER,
  type CanvasNodeType,
} from "../src/features/eventworkflows/constants/nodeMeta";
import {
  NODE_TYPE_LABELS,
  NODE_TYPE_DESCRIPTIONS,
  NODE_TYPE_COLORS,
  getNodeTypeColor,
} from "../src/features/eventworkflows/constants/eventWorkflows";

test("NODE_TYPES_ORDER contains all 4 canvas node types in expected order", () => {
  const expectedOrder: CanvasNodeType[] = [
    NodeType.TRIGGER,
    NodeType.ACTION,
    NodeType.CONDITION,
    NodeType.OUTPUT,
  ];

  assert.deepEqual(NODE_TYPES_ORDER, expectedOrder);
});

test("NODE_META defines valid metadata for all 4 canvas node types", () => {
  const canvasTypes: CanvasNodeType[] = [
    NodeType.TRIGGER,
    NodeType.ACTION,
    NodeType.CONDITION,
    NodeType.OUTPUT,
  ];

  for (const type of canvasTypes) {
    const meta = NODE_META[type];
    assert.ok(meta, `NODE_META should exist for ${type}`);
    assert.equal(typeof meta.label, "string");
    assert.ok(meta.label.length > 0, `label should not be empty for ${type}`);
    assert.equal(typeof meta.description, "string");
    assert.ok(meta.description.length > 0, `description should not be empty for ${type}`);
    assert.ok(meta.icon, `icon should exist for ${type}`);
    assert.ok(meta.colors, `colors should exist for ${type}`);

    assert.ok(meta.colors.bg && meta.colors.bg.length > 0);
    assert.ok(meta.colors.border && meta.colors.border.length > 0);
    assert.ok(meta.colors.borderSelected && meta.colors.borderSelected.length > 0);
    assert.ok(meta.colors.shadowSelected && meta.colors.shadowSelected.length > 0);
    assert.ok(meta.colors.icon && meta.colors.icon.length > 0);
    assert.ok(meta.colors.iconBg && meta.colors.iconBg.length > 0);
  }
});

test("eventWorkflows constants align with NODE_META for canvas node types", () => {
  for (const type of NODE_TYPES_ORDER) {
    assert.equal(NODE_TYPE_LABELS[type], NODE_META[type].label);
    assert.equal(NODE_TYPE_DESCRIPTIONS[type], NODE_META[type].description);
    assert.deepEqual(NODE_TYPE_COLORS[type], NODE_META[type].colors);
    assert.deepEqual(getNodeTypeColor(type), NODE_META[type].colors);
  }

  // Ensure element type is also preserved in NODE_TYPE_LABELS / DESCRIPTIONS / getNodeTypeColor
  assert.equal(NODE_TYPE_LABELS[NodeType.ELEMENT], "Element");
  assert.equal(NODE_TYPE_DESCRIPTIONS[NodeType.ELEMENT], "Canvas element event source");
  assert.deepEqual(getNodeTypeColor(NodeType.ELEMENT), NODE_TYPE_COLORS.trigger);
});
