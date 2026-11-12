import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  compactStyles,
  isSectionOn,
  isTextElement,
  joinColorAlpha,
  normalizeCssInput,
  readSides,
  sectionDefaults,
  sidesDiffer,
  splitColorAlpha,
  splitNumber,
  stepCssValue,
  toBackgroundImage,
  withoutKeys,
  writeAxis,
  writeSide,
} from "../src/features/editor/components/sidebar/style/styleModel";

test("normalizeCssInput accepts lengths, keywords and functions", () => {
  assert.deepEqual(normalizeCssInput("16", "px"), { ok: true, value: "16px" });
  assert.deepEqual(normalizeCssInput("16", ""), { ok: true, value: "16" });
  assert.deepEqual(normalizeCssInput(" 1.5rem ", "px"), {
    ok: true,
    value: "1.5rem",
  });
  assert.deepEqual(normalizeCssInput("100%", "px"), {
    ok: true,
    value: "100%",
  });
  assert.deepEqual(normalizeCssInput("-8px", "px"), {
    ok: true,
    value: "-8px",
  });
  assert.deepEqual(normalizeCssInput("0", "px"), { ok: true, value: "0px" });
  assert.deepEqual(normalizeCssInput("auto", "px"), {
    ok: true,
    value: "auto",
  });
  assert.deepEqual(normalizeCssInput("calc(100% - 2rem)", "px"), {
    ok: true,
    value: "calc(100% - 2rem)",
  });
  assert.deepEqual(normalizeCssInput("var(--gap)", "px"), {
    ok: true,
    value: "var(--gap)",
  });
  assert.deepEqual(normalizeCssInput("", "px"), { ok: true, value: undefined });
  assert.deepEqual(normalizeCssInput("12qx", "px"), { ok: false });
  assert.deepEqual(normalizeCssInput("1 2", "px"), { ok: false });
});

test("splitNumber and stepCssValue", () => {
  assert.deepEqual(splitNumber("16px"), { num: 16, unit: "px" });
  assert.deepEqual(splitNumber(0.5), { num: 0.5, unit: "" });
  assert.equal(splitNumber("auto"), null);
  assert.equal(stepCssValue("16px", 1, "px"), "17px");
  assert.equal(stepCssValue("1.5rem", -0.1, "px"), "1.4rem");
  assert.equal(stepCssValue("auto", 10, "px"), "10px");
  assert.equal(stepCssValue(undefined, 1, ""), "1");
});

test("compactStyles drops undefined and empty strings, keeps 0", () => {
  assert.deepEqual(compactStyles({ a: undefined, b: "", c: 0, d: "1px" }), {
    c: 0,
    d: "1px",
  });
});

test("optional sections: on detection, defaults, removal", () => {
  assert.equal(isSectionOn({ color: "red", width: "1px" }, "border"), false);
  assert.equal(isSectionOn({ borderRadius: "4px" }, "border"), true);
  assert.equal(isSectionOn({ boxShadow: "0 1px 2px #0003" }, "shadow"), true);
  assert.equal(isSectionOn({ opacity: 0 }, "effects"), true);
  assert.equal(isSectionOn({ backgroundColor: "#fff" }, "fillImage"), false);
  assert.deepEqual(sectionDefaults("border"), {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "currentColor",
  });
  assert.deepEqual(
    withoutKeys({ borderWidth: "1px", borderColor: "red", color: "blue" }, [
      "borderWidth",
      "borderColor",
    ]),
    { color: "blue" },
  );
});

test("readSides: longhands, shorthand fallback, mixed", () => {
  assert.deepEqual(readSides({ paddingLeft: "4px" }, "padding"), {
    top: "",
    right: "",
    bottom: "",
    left: "4px",
  });
  assert.deepEqual(readSides({ padding: "8px 16px" }, "padding"), {
    top: "8px",
    right: "16px",
    bottom: "8px",
    left: "16px",
  });
  assert.deepEqual(readSides({ margin: "1px 2px 3px" }, "margin"), {
    top: "1px",
    right: "2px",
    bottom: "3px",
    left: "2px",
  });
  assert.deepEqual(
    readSides({ padding: "8px", paddingTop: "2px" }, "padding"),
    { top: "2px", right: "8px", bottom: "8px", left: "8px" },
  );
  assert.equal(
    sidesDiffer({ top: "1px", right: "2px", bottom: "1px", left: "2px" }),
    false,
  );
  assert.equal(
    sidesDiffer({ top: "1px", right: "2px", bottom: "1px", left: "3px" }),
    true,
  );
});

test("writeAxis expands a shorthand and keeps the other axis", () => {
  assert.deepEqual(
    writeAxis({ padding: "8px 16px", color: "red" }, "padding", "x", "4px"),
    {
      color: "red",
      paddingTop: "8px",
      paddingBottom: "8px",
      paddingLeft: "4px",
      paddingRight: "4px",
    },
  );
  assert.deepEqual(
    writeAxis({ marginTop: "2px" }, "margin", "y", undefined),
    {},
  );
  assert.deepEqual(writeSide({ padding: "8px" }, "padding", "top", "0px"), {
    paddingTop: "0px",
    paddingRight: "8px",
    paddingBottom: "8px",
    paddingLeft: "8px",
  });
});

test("splitColorAlpha / joinColorAlpha", () => {
  assert.deepEqual(splitColorAlpha("#ffffff"), {
    hex: "#ffffff",
    alpha: 100,
    raw: "#ffffff",
  });
  assert.deepEqual(splitColorAlpha("#FFF"), {
    hex: "#ffffff",
    alpha: 100,
    raw: "#FFF",
  });
  assert.deepEqual(splitColorAlpha("#00000080"), {
    hex: "#000000",
    alpha: 50,
    raw: "#00000080",
  });
  assert.deepEqual(splitColorAlpha("var(--primary)"), {
    hex: null,
    alpha: 100,
    raw: "var(--primary)",
  });
  assert.deepEqual(splitColorAlpha("rgb(0 0 0 / .5)"), {
    hex: null,
    alpha: 100,
    raw: "rgb(0 0 0 / .5)",
  });
  assert.deepEqual(splitColorAlpha(undefined), {
    hex: null,
    alpha: 100,
    raw: "",
  });
  assert.equal(joinColorAlpha("#000000", 100), "#000000");
  assert.equal(joinColorAlpha("#000000", 50), "#00000080");
});

test("toBackgroundImage wraps bare URLs", () => {
  assert.equal(
    toBackgroundImage("https://x.test/a.png"),
    'url("https://x.test/a.png")',
  );
  assert.equal(toBackgroundImage("url(a.png)"), "url(a.png)");
  assert.equal(
    toBackgroundImage("linear-gradient(red, blue)"),
    "linear-gradient(red, blue)",
  );
  assert.equal(toBackgroundImage("  "), undefined);
});

test("isTextElement", () => {
  assert.equal(isTextElement("Heading"), true);
  assert.equal(isTextElement("Button"), true);
  assert.equal(isTextElement("Section"), false);
  assert.equal(isTextElement("Image"), false);
});

test("spacing shorthands keep CSS functions together when expanding", () => {
  assert.deepEqual(
    readSides({ padding: "calc(100% - 2rem) var(--gap)" }, "padding"),
    {
      top: "calc(100% - 2rem)",
      right: "var(--gap)",
      bottom: "calc(100% - 2rem)",
      left: "var(--gap)",
    },
  );
  assert.deepEqual(
    writeAxis({ padding: "calc(100% - 2rem) 16px" }, "padding", "x", "4px"),
    {
      paddingTop: "calc(100% - 2rem)",
      paddingRight: "4px",
      paddingBottom: "calc(100% - 2rem)",
      paddingLeft: "4px",
    },
  );
});

test("CSS length validation accepts modern viewport and font units", () => {
  for (const value of [
    "2lh",
    "10cqw",
    "5dvw",
    "12mm",
    "1cap",
    "revert-layer",
  ]) {
    assert.deepEqual(normalizeCssInput(value, "px"), { ok: true, value });
  }
});
