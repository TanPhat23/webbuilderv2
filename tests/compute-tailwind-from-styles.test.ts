import assert from "node:assert/strict";
import { test } from "node:test";
import type { CSSProperties } from "react";
import {
  computeTailwindFromStyles,
  computeTailwindFromStylesSingle,
} from "../src/features/elements/lib/computeTailwindFromStyles";

test("empty or undefined styles produce an empty class string", () => {
  assert.equal(computeTailwindFromStyles(undefined), "");
  assert.equal(computeTailwindFromStyles({}), "");
  assert.equal(computeTailwindFromStylesSingle(undefined), "");
  assert.equal(computeTailwindFromStylesSingle({}), "");
});

test("maps dimensions, spacing, gaps, colors, borders, and opacity", () => {
  const classes = computeTailwindFromStylesSingle({
    width: "auto",
    height: 120,
    backgroundColor: "rgb(10, 20, 30)",
    color: "#ffffff",
    borderRadius: 8,
    borderWidth: "2px",
    borderColor: "var(--border-main)",
    opacity: 50,
    padding: 16,
    paddingTop: "1rem",
    marginLeft: "auto",
    gap: 12,
    rowGap: "4px",
    columnGap: "8px",
  });

  assert.equal(
    classes,
    [
      "w-auto",
      "h-[120px]",
      "bg-[rgb(10,20,30)]",
      "text-[#ffffff]",
      "rounded-[8px]",
      "border-[2px]",
      "border-[var(--border-main)]",
      "opacity-[0.5]",
      "p-[16px]",
      "pt-[1rem]",
      "ml-[auto]",
      "gap-[12px]",
      "row-gap-[4px]",
      "col-gap-[8px]",
    ].join(" "),
  );
});

test("skips empty or whitespace-only color and opacity values and sanitizes brackets/quotes", () => {
  const classes = computeTailwindFromStylesSingle({
    backgroundColor: "   ",
    color: "",
    borderColor: "[#abc]",
    opacity: "   ",
    width: "calc(100% - 2rem)",
  });

  assert.equal(classes, "w-['calc(100% - 2rem)'] border-[#abc]");
  assert.equal(computeTailwindFromStylesSingle({ opacity: 0 }), "opacity-[0]");
  assert.equal(computeTailwindFromStylesSingle({ opacity: 0.25 }), "opacity-[0.25]");
});

test("maps layout props safely without reading Object.prototype keys", () => {
  const mapped = computeTailwindFromStylesSingle({
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  });
  assert.equal(mapped, "flex flex-col justify-between items-center");

  assert.equal(computeTailwindFromStylesSingle({ display: "none" }), "hidden");

  const fallbackAndProto = computeTailwindFromStylesSingle({
    display: "constructor" as CSSProperties["display"],
    flexDirection: "toString" as CSSProperties["flexDirection"],
    alignItems: "baseline",
  });
  assert.equal(fallbackAndProto, "block flex-[toString] items-[baseline]");
});

test("maps typography weights, font families including sans-serif, and position offsets", () => {
  const classes = computeTailwindFromStylesSingle({
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: "0.02em",
    textAlign: "center",
    textTransform: "uppercase",
    textDecoration: "lineThrough" as CSSProperties["textDecoration"],
    fontStyle: "italic",
    fontFamily: "Inter, sans-serif",
    zIndex: 40,
    top: 0,
    right: "10%",
    bottom: 8,
    left: "auto",
  });

  assert.equal(
    classes,
    [
      "text-[18px]",
      "font-medium",
      "leading-[1.5px]",
      "tracking-[0.02em]",
      "text-center",
      "uppercase",
      "line-through",
      "italic",
      "sans",
      "z-[40]",
      "top-[0px]",
      "bottom-[8px]",
      "left-[auto]",
      "right-[10%]",
    ].join(" "),
  );

  assert.equal(computeTailwindFromStylesSingle({ fontFamily: "Georgia, serif" }), "serif");
  assert.equal(computeTailwindFromStylesSingle({ fontFamily: "JetBrains Mono, monospace" }), "mono");
  assert.equal(computeTailwindFromStylesSingle({ fontFamily: "var(--font-sans)" }), "font-[var(--font-sans)]");
  assert.equal(computeTailwindFromStylesSingle({ fontFamily: "Lora" }), "font-[Lora]");

  assert.equal(computeTailwindFromStylesSingle({ fontWeight: "normal" }), "font-normal");
  assert.equal(computeTailwindFromStylesSingle({ fontWeight: "700" }), "font-bold");
  assert.equal(computeTailwindFromStylesSingle({ fontWeight: 550 }), "font-[550]");
  assert.equal(computeTailwindFromStylesSingle({ fontWeight: "heavy" }), "font-[heavy]");
});

test("prefixes responsive breakpoints in order", () => {
  const result = computeTailwindFromStyles({
    default: { display: "block", padding: 8 },
    sm: { display: "flex", gap: 4 },
    md: { justifyContent: "center" },
    lg: { width: "auto" },
    xl: { opacity: 80 },
  });

  assert.equal(
    result,
    "p-[8px] block sm:flex sm:gap-[4px] md:justify-center lg:w-auto xl:opacity-[0.8]",
  );
});
