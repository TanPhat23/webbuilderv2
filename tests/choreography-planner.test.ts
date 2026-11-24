import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  ContainerElement,
  EditorElement,
  ElementTypeMap,
} from "@/types/global.type";
import {
  applyTreeOpsLocally,
  planChoreographySteps,
} from "@/features/agent/choreographyPlanner";

function makeText(
  id: string,
  overrides: Partial<ElementTypeMap["Text"]> = {},
): ElementTypeMap["Text"] {
  return {
    id,
    type: "Text",
    name: overrides.name ?? "Text",
    content: overrides.content ?? "",
    styles: overrides.styles ?? {},
    tailwindStyles: overrides.tailwindStyles ?? "",
    pageId: "page-1",
    parentId: overrides.parentId,
    order: overrides.order ?? 0,
    ...overrides,
  };
}

function makeButton(
  id: string,
  overrides: Partial<ElementTypeMap["Button"]> = {},
): ElementTypeMap["Button"] {
  return {
    id,
    type: "Button",
    name: overrides.name ?? "Button",
    content: overrides.content ?? "",
    styles: overrides.styles ?? {},
    tailwindStyles: overrides.tailwindStyles ?? "",
    pageId: "page-1",
    parentId: overrides.parentId,
    order: overrides.order ?? 0,
    ...overrides,
  };
}

function makeSection(
  id: string,
  elements: EditorElement[],
  overrides: Partial<ElementTypeMap["Section"]> = {},
): ElementTypeMap["Section"] {
  return {
    id,
    type: "Section",
    name: overrides.name ?? "Section",
    content: overrides.content ?? "",
    styles: overrides.styles ?? {},
    tailwindStyles: overrides.tailwindStyles ?? "",
    pageId: "page-1",
    parentId: overrides.parentId,
    order: overrides.order ?? 0,
    elements,
    ...overrides,
  };
}

function isContainer(el: EditorElement | undefined): el is ContainerElement {
  return Boolean(el && "elements" in el && Array.isArray(el.elements));
}

describe("planChoreographySteps", () => {
  it("plans delete-first, parent-before-child creates, and human-readable labels", () => {
    const oldEl = makeText("old-1", { name: "Old Banner" });
    const child = makeText("child-1", {
      name: "Headline",
      parentId: "sec-1",
      content: "Welcome",
    });
    const section = makeSection("sec-1", [child], { name: "Hero Section" });

    const steps = planChoreographySteps([oldEl], [section]);
    assert.ok(steps.length >= 3);
    assert.equal(steps[0]?.action, "delete");
    assert.equal(steps[0]?.targetElementId, "old-1");
    assert.ok(steps[0]?.label.includes("Old Banner"));

    const createIds = steps
      .filter((s) => s.action === "create")
      .map((s) => s.targetElementId);
    assert.ok(createIds.indexOf("sec-1") >= 0);
    assert.ok(createIds.indexOf("child-1") >= 0);
    assert.ok(createIds.indexOf("sec-1") < createIds.indexOf("child-1"));
  });

  it("keeps total planned duration within adaptive 4-10s budget for 120 ops", () => {
    const children: EditorElement[] = Array.from({ length: 119 }, (_, idx) =>
      makeText(`item-${idx}`, {
        name: `Item ${idx}`,
        parentId: "root-sec",
        order: idx,
      }),
    );
    const root = makeSection("root-sec", children, { name: "Grid Section" });

    const steps = planChoreographySteps([], [root]);
    assert.ok(steps.length <= 32);
    const totalMs = steps.reduce((sum, s) => sum + s.delayMs, 0);
    assert.ok(totalMs >= 3000, `expected totalMs >= 3000, got ${totalMs}`);
    assert.ok(totalMs <= 10400, `expected totalMs <= 10400, got ${totalMs}`);
  });

  it("reaches exact afterTree structure when applying planned steps sequentially", () => {
    const before: EditorElement[] = [
      makeSection(
        "sec-1",
        [
          makeText("txt-1", {
            name: "Title",
            content: "Before",
            parentId: "sec-1",
            styles: { default: { color: "red", fontSize: "16px" } },
          }),
        ],
        { name: "Hero" },
      ),
    ];
    const after: EditorElement[] = [
      makeSection(
        "sec-1",
        [
          makeText("txt-1", {
            name: "Title",
            content: "After",
            parentId: "sec-1",
            styles: { default: { fontSize: "24px" } },
          }),
          makeButton("btn-1", {
            name: "CTA Button",
            content: "Get Started",
            parentId: "sec-1",
            order: 1,
          }),
        ],
        { name: "Hero" },
      ),
    ];

    const steps = planChoreographySteps(before, after);
    let current: EditorElement[] = before;
    for (const step of steps) {
      current = applyTreeOpsLocally(current, step.ops);
    }

    const root = current[0];
    assert.ok(isContainer(root));
    assert.deepEqual(
      root.elements.map((c) => c.id),
      ["txt-1", "btn-1"],
    );
    assert.equal(root.elements[0]?.content, "After");
    assert.equal(root.elements[0]?.styles?.default?.fontSize, "24px");
    assert.equal(root.elements[0]?.styles?.default?.color, undefined);
  });

  it("inserts sibling sections top-to-bottom even when afterTree elements share order 0", () => {
    const after: EditorElement[] = [
      makeSection("sec-header", [], { name: "Header", order: 0 }),
      makeSection("sec-hero", [], { name: "Hero", order: 0 }),
      makeSection("sec-footer", [], { name: "Footer", order: 0 }),
    ];

    const steps = planChoreographySteps([], after);
    assert.equal(steps.length, 3);

    let current: EditorElement[] = [];
    const intermediateOrders: string[][] = [];
    for (const step of steps) {
      current = applyTreeOpsLocally(current, step.ops);
      intermediateOrders.push(current.map((el) => el.id));
    }

    assert.deepEqual(intermediateOrders, [
      ["sec-header"],
      ["sec-header", "sec-hero"],
      ["sec-header", "sec-hero", "sec-footer"],
    ]);
  });
});
