import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createTableColumn,
  getActiveTableAppearanceFlags,
  moveTableColumn,
  parseTableColumnWidth,
  removeTableColumnAt,
  updateTableColumnAt,
} from "../apps/editor/src/features/editor/lib/tableConfig";

test("table column helpers create, update, reorder, and delete columns cleanly", () => {
  const c1 = createTableColumn(0, "col-1");
  const c2 = createTableColumn(1, "col-2");
  assert.equal(c1.header, "Column 1");
  assert.equal(c2.header, "Column 2");

  const updated = updateTableColumnAt([c1, c2], 1, { ...c2, header: "Total" });
  assert.equal(updated[1].header, "Total");

  const moved = moveTableColumn(updated, 1, "up");
  assert.equal(moved?.[0].id, "col-2");
  assert.equal(moveTableColumn(updated, 0, "up"), null);
  assert.equal(moveTableColumn(updated, 1, "down"), null);

  assert.equal(removeTableColumnAt([c1], 0), undefined);
  assert.equal(removeTableColumnAt(updated, 0)?.length, 1);
});

test("width parser trims, rejects negatives, and appearance flags reflect booleans", () => {
  assert.equal(parseTableColumnWidth(""), undefined);
  assert.equal(parseTableColumnWidth("-50"), undefined);
  assert.equal(parseTableColumnWidth(" -10px "), undefined);
  assert.equal(parseTableColumnWidth("120"), 120);
  assert.equal(parseTableColumnWidth(" 25% "), "25%");

  assert.deepEqual(
    getActiveTableAppearanceFlags({ bordered: true, striped: false, compact: true }),
    ["bordered", "compact"],
  );
});
