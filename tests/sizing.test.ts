import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  adaptToParent,
  BLOCK_PARENT,
  parentLayout,
  readSizeMode,
  sizeLabel,
  writeSizeMode,
} from "../src/features/editor/utils/element/sizing";

const ROW = { kind: "row", stretch: true } as const;
const COLUMN = { kind: "column", stretch: true } as const;

test("parentLayout reads styles, then Tailwind classes", () => {
  assert.deepEqual(parentLayout(undefined), BLOCK_PARENT);
  assert.deepEqual(parentLayout({ styles: { default: {} } }), BLOCK_PARENT);
  assert.deepEqual(parentLayout({ styles: { default: { display: "flex" } } }), ROW);
  assert.deepEqual(
    parentLayout({
      styles: { default: { display: "flex", flexDirection: "column" } },
    }),
    COLUMN,
  );
  assert.deepEqual(
    parentLayout({ tailwindStyles: "flex items-center justify-between" }),
    { kind: "row", stretch: false },
  );
  assert.deepEqual(parentLayout({ tailwindStyles: "flex flex-col" }), COLUMN);
  // A breakpoint-prefixed class is not the base layout.
  assert.deepEqual(parentLayout({ tailwindStyles: "md:flex" }), BLOCK_PARENT);
  // Styles win over classes.
  assert.deepEqual(
    parentLayout({
      styles: { default: { display: "block" } },
      tailwindStyles: "flex",
    }),
    BLOCK_PARENT,
  );
});

test("fill in a flex row shares space instead of claiming 100%", () => {
  const next = writeSizeMode({ width: "100%", color: "red" }, "width", "fill", ROW);
  assert.deepEqual(next, {
    color: "red",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: "0px",
  });
  assert.equal(readSizeMode(next, "width", ROW), "fill");
});

test("fill on the cross axis stretches; in a block it is 100%", () => {
  assert.deepEqual(writeSizeMode({ height: "40px" }, "height", "fill", ROW), {
    alignSelf: "stretch",
  });
  assert.deepEqual(writeSizeMode({}, "width", "fill", BLOCK_PARENT), {
    width: "100%",
  });
  assert.deepEqual(writeSizeMode({}, "height", "fill", COLUMN), {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minHeight: "0px",
  });
});

test("hug uses fit-content only where auto would not hug", () => {
  assert.deepEqual(writeSizeMode({ width: "100%" }, "width", "hug", BLOCK_PARENT), {
    width: "fit-content",
  });
  assert.deepEqual(writeSizeMode({ height: "100%" }, "height", "hug", BLOCK_PARENT), {});
  assert.deepEqual(
    writeSizeMode({ flexGrow: 1, flexBasis: "0%", minWidth: "0px" }, "width", "hug", ROW),
    {},
  );
  assert.deepEqual(writeSizeMode({}, "height", "hug", ROW), {
    height: "fit-content",
  });
});

test("fixed uses the measured size and stops flex from resizing it", () => {
  assert.deepEqual(
    writeSizeMode({ flexGrow: 1, flexBasis: "0%", minWidth: "0px" }, "width", "fixed", ROW, "320px"),
    { width: "320px", flexShrink: 0 },
  );
  // An existing fixed size is kept.
  assert.deepEqual(writeSizeMode({ width: "50%" }, "width", "fixed", BLOCK_PARENT, "320px"), {
    width: "50%",
  });
  assert.deepEqual(writeSizeMode({}, "height", "fixed", BLOCK_PARENT), {
    height: "200px",
  });
  // A real minimum is not thrown away.
  assert.equal(
    writeSizeMode({ minWidth: "120px", flexGrow: 1 }, "width", "fixed", ROW, "300px").minWidth,
    "120px",
  );
});

test("readSizeMode reflects what the CSS does", () => {
  assert.equal(readSizeMode({}, "width", BLOCK_PARENT), "fill");
  assert.equal(readSizeMode({}, "height", BLOCK_PARENT), "hug");
  assert.equal(readSizeMode({ width: "240px" }, "width", ROW), "fixed");
  assert.equal(readSizeMode({}, "width", ROW), "hug");
  assert.equal(readSizeMode({}, "height", ROW), "fill");
  assert.equal(readSizeMode({}, "height", { kind: "row", stretch: false }), "hug");
  assert.equal(readSizeMode({ alignSelf: "center" }, "width", COLUMN), "hug");
  assert.equal(readSizeMode({ height: "auto" }, "height", BLOCK_PARENT), "hug");
  assert.equal(sizeLabel({ width: "100%", height: "auto" }, "width", BLOCK_PARENT), "Fill");
  assert.equal(sizeLabel({ width: "240px" }, "width", ROW), "240px");
});

test("adaptToParent turns 100% into fill only on a flex main axis", () => {
  assert.equal(adaptToParent({ width: "100%" }, BLOCK_PARENT), null);
  assert.equal(adaptToParent({ width: "100%" }, COLUMN), null);
  assert.equal(adaptToParent({ width: "240px" }, ROW), null);
  assert.deepEqual(adaptToParent({ width: "100%", height: "auto" }, ROW), {
    height: "auto",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: "0px",
  });
  assert.deepEqual(adaptToParent({ height: "100%" }, COLUMN), {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minHeight: "0px",
  });
});

import { handlesForSize } from "../src/features/editor/constants/direction";

test("small elements get only the handles that fit", () => {
  const all = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as any[];
  assert.deepEqual(handlesForSize(all, 300, 200), all);
  // A short, wide-ish link: corners only.
  assert.deepEqual(handlesForSize(all, 47, 25), ["ne", "nw", "se", "sw"]);
  // Wide but short: top/bottom mid handles stay, side ones go.
  assert.deepEqual(handlesForSize(all, 300, 30), ["n", "s", "ne", "nw", "se", "sw"]);
  // Too short for two corners per side.
  assert.deepEqual(handlesForSize(all, 300, 16), ["n", "s", "se", "sw"]);
  assert.deepEqual(handlesForSize(all, 16, 16), ["se"]);
});

import { isSizeClass } from "../src/features/editor/utils/element/sizing";
import { elementHelper } from "../src/features/editor/utils/element/elementhelper";

test("isSizeClass matches one axis at one breakpoint", () => {
  assert.equal(isSizeClass("w-full", "width"), true);
  assert.equal(isSizeClass("w-[12.00%]", "width"), true);
  assert.equal(isSizeClass("h-10", "width"), false);
  assert.equal(isSizeClass("md:w-full", "width"), false);
  assert.equal(isSizeClass("md:w-full", "width", "md"), true);
  assert.equal(isSizeClass("min-w-0", "width"), false);
  assert.equal(isSizeClass("rounded-lg", "height"), false);
});

test("removing a style also removes the class generated from it", () => {
  let patch: any;
  const update = (_id: string, p: any) => (patch = p);
  const element = {
    id: "a",
    type: "Image",
    styles: { default: { width: "12%", color: "red" } },
    tailwindStyles: "rounded-lg w-full",
  } as any;
  elementHelper.updateElementStyle(element, { width: "12%", color: "red" }, "default", update);
  const withWidth = { ...element, ...patch };
  assert.match(withWidth.tailwindStyles, /w-\[12%\]/);

  // Width removed (Hug on a flex main axis), stale size classes dropped.
  elementHelper.updateElementStyle(withWidth, { color: "red" }, "default", update, (c) =>
    isSizeClass(c, "width"),
  );
  assert.doesNotMatch(patch.tailwindStyles, /(^|\s)w-/);
  assert.match(patch.tailwindStyles, /rounded-lg/);
});
