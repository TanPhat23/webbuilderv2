import assert from "node:assert/strict";
import { test } from "node:test";
import { DRAG_KEYS } from "../src/features/editor/utils/element/dragPayload";
import {
  hasElementDragPayload,
  isSameDropIndicator,
} from "../src/features/editor/components/canvas/canvasDom";
import { shouldBlockPickEvent } from "../src/features/editor/components/canvas/useCanvasPickMode";

test("isSameDropIndicator compares null and indicator fields accurately", () => {
  assert.equal(isSameDropIndicator(null, null), true);
  assert.equal(
    isSameDropIndicator(null, { targetId: "a", position: "before", horizontal: false }),
    false,
  );
  assert.equal(
    isSameDropIndicator(
      { targetId: "a", position: "before", horizontal: false },
      { targetId: "a", position: "before", horizontal: false },
    ),
    true,
  );
  assert.equal(
    isSameDropIndicator(
      { targetId: "a", position: "before", horizontal: false },
      { targetId: "a", position: "after", horizontal: false },
    ),
    false,
  );
  assert.equal(
    isSameDropIndicator(
      { targetId: "a", position: "before", horizontal: false },
      { targetId: "a", position: "before", horizontal: true },
    ),
    false,
  );
});

test("hasElementDragPayload recognizes element, type, and template drag payloads only", () => {
  const makeDt = (types: string[]): Pick<DataTransfer, "types"> => ({ types });

  assert.equal(hasElementDragPayload(makeDt([DRAG_KEYS.elementId.toLowerCase()])), true);
  assert.equal(hasElementDragPayload(makeDt([DRAG_KEYS.elementType.toLowerCase()])), true);
  assert.equal(hasElementDragPayload(makeDt([DRAG_KEYS.template.toLowerCase()])), true);
  assert.equal(hasElementDragPayload(makeDt(["text/plain", "Files"])), false);
});

test("shouldBlockPickEvent blocks during active pick or suppressed multi-click", () => {
  assert.equal(shouldBlockPickEvent(true, false, 1), true);
  assert.equal(shouldBlockPickEvent(false, true, 2), true);
  assert.equal(shouldBlockPickEvent(false, true, 1), false);
  assert.equal(shouldBlockPickEvent(false, false, 2), false);
});
