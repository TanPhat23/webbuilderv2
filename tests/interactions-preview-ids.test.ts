import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const dir = "src/features/preview/components";

test("every preview component puts the element id on its root", () => {
  const files = readdirSync(dir).filter((f) =>
    /^Preview.*Component\.tsx$/.test(f),
  );
  assert.ok(files.length >= 13);
  for (const f of files) {
    const src = readFileSync(`${dir}/${f}`, "utf8");
    assert.match(src, /id=\{element\.id\}/, `${f} sets id`);
    assert.match(
      src,
      /data-element-id=\{element\.id\}/,
      `${f} sets data-element-id`,
    );
  }
});
