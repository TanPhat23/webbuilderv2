import * as t from "@babel/types";
import type { TableColumnDefinition } from "@webbuilder/site-runtime/types/elements";
import {
  buildContainerChildren,
  classNameAttr,
  codePropNames,
  elementTextChildren,
  isPlainRecord,
  jsonValueToExpression,
  jsxEl,
  selfClosingJsxEl,
  settingsToAttributes,
  textChild,
  type JsxChildNode,
} from "./shared";
import type { ElementCodec } from "./types";

const BUTTON_RENAME: Readonly<Record<string, string>> = { buttonType: "type" };
const LABEL_RENAME: Readonly<Record<string, string>> = { label: "data-label" };
const TABLE_SKIP: ReadonlySet<string> = new Set([
  "caption",
  "columns",
  "bordered",
  "striped",
  "hoverable",
  "compact",
]);

export const buttonCodec: ElementCodec<"Button"> = {
  type: "Button",
  generate(element) {
    const overridden = codePropNames(element.settings);
    const attrs: t.JSXAttribute[] = [classNameAttr(element)];
    if (element.href && !overridden.has("data-href")) {
      attrs.push(
        t.jsxAttribute(t.jsxIdentifier("data-href"), t.stringLiteral(element.href)),
      );
    }
    attrs.push(...settingsToAttributes(element.settings, undefined, BUTTON_RENAME));
    return jsxEl(
      "button",
      attrs,
      elementTextChildren(element),
    );
  },
};

export const linkCodec: ElementCodec<"Link"> = {
  type: "Link",
  generate(element, ctx) {
    const overridden = codePropNames(element.settings);
    const attrs: t.JSXAttribute[] = [classNameAttr(element)];
    if (element.href && !overridden.has("href")) {
      attrs.push(t.jsxAttribute(t.jsxIdentifier("href"), t.stringLiteral(element.href)));
    }
    return jsxEl("a", attrs, buildContainerChildren(element, ctx));
  },
};

export const inputCodec: ElementCodec<"Input"> = {
  type: "Input",
  generate(element) {
    const attrs = [
      classNameAttr(element),
      ...settingsToAttributes(element.settings),
    ];
    return selfClosingJsxEl("input", attrs);
  },
};

export const textareaCodec: ElementCodec<"Textarea"> = {
  type: "Textarea",
  generate(element) {
    const attrs = [
      classNameAttr(element),
      ...settingsToAttributes(element.settings),
    ];
    const children = elementTextChildren(element);
    if (children.length > 0) {
      return jsxEl("textarea", attrs, children);
    }
    return selfClosingJsxEl("textarea", attrs);
  },
};

export const checkboxCodec: ElementCodec<"Checkbox"> = {
  type: "Checkbox",
  generate(element) {
    const overridden = codePropNames(element.settings);
    const attrs: t.JSXAttribute[] = [classNameAttr(element)];
    if (!overridden.has("type")) {
      attrs.push(t.jsxAttribute(t.jsxIdentifier("type"), t.stringLiteral("checkbox")));
    }
    attrs.push(...settingsToAttributes(element.settings, undefined, LABEL_RENAME));
    return selfClosingJsxEl("input", attrs);
  },
};

export const radioCodec: ElementCodec<"Radio"> = {
  type: "Radio",
  generate(element) {
    const overridden = codePropNames(element.settings);
    const attrs: t.JSXAttribute[] = [classNameAttr(element)];
    if (!overridden.has("type")) {
      attrs.push(t.jsxAttribute(t.jsxIdentifier("type"), t.stringLiteral("radio")));
    }
    attrs.push(...settingsToAttributes(element.settings, undefined, LABEL_RENAME));
    return selfClosingJsxEl("input", attrs);
  },
};

export const progressCodec: ElementCodec<"Progress"> = {
  type: "Progress",
  generate(element) {
    const attrs = [
      classNameAttr(element),
      ...settingsToAttributes(element.settings, undefined, LABEL_RENAME),
    ];
    return selfClosingJsxEl("progress", attrs);
  },
};

export const selectCodec: ElementCodec<"Select"> = {
  type: "Select",
  generate(element) {
    const attrs = [
      classNameAttr(element),
      ...settingsToAttributes(element.settings),
    ];
    const options: JsxChildNode[] = [];
    if (Array.isArray(element.elements)) {
      for (const opt of element.elements) {
        const value = opt.content || "";
        const optAttrs = [
          t.jsxAttribute(t.jsxIdentifier("value"), t.stringLiteral(value)),
        ];
        options.push(jsxEl("option", optAttrs, value ? [textChild(value)] : []));
      }
    }
    return jsxEl("select", attrs, options);
  },
};

export const listCodec: ElementCodec<"List"> = {
  type: "List",
  generate(element, ctx) {
    const ordered =
      isPlainRecord(element.settings) && element.settings.ordered === true;
    const tag = ordered ? "ol" : "ul";
    const items: JsxChildNode[] = [];
    if (Array.isArray(element.elements)) {
      for (const child of element.elements) {
        const childJsx = ctx.generateChild(child);
        if (childJsx) {
          items.push(jsxEl("li", [], [childJsx]));
        }
      }
    }
    return jsxEl(tag, [classNameAttr(element)], items);
  },
};

export const formCodec: ElementCodec<"Form"> = {
  type: "Form",
  generate(element, ctx) {
    const attrs = [
      classNameAttr(element),
      ...settingsToAttributes(element.settings),
    ];
    return jsxEl("form", attrs, buildContainerChildren(element, ctx));
  },
};

function buildColumnHeaderCell(col: TableColumnDefinition): t.JSXElement {
  const thAttrs: t.JSXAttribute[] = [];
  if (col.id) {
    thAttrs.push(
      t.jsxAttribute(t.jsxIdentifier("data-col-id"), t.stringLiteral(col.id)),
    );
  }
  if (col.accessor !== undefined) {
    thAttrs.push(
      t.jsxAttribute(t.jsxIdentifier("data-accessor"), t.stringLiteral(col.accessor)),
    );
  }
  if (col.sortable !== undefined) {
    thAttrs.push(
      t.jsxAttribute(
        t.jsxIdentifier("data-sortable"),
        t.jsxExpressionContainer(t.booleanLiteral(col.sortable)),
      ),
    );
  }
  const styleRecord: Record<string, unknown> = {};
  if (col.align !== undefined) styleRecord.textAlign = col.align;
  if (col.width !== undefined) styleRecord.width = col.width;
  if (Object.keys(styleRecord).length > 0) {
    const styleExpr = jsonValueToExpression(styleRecord);
    if (styleExpr) {
      thAttrs.push(
        t.jsxAttribute(t.jsxIdentifier("style"), t.jsxExpressionContainer(styleExpr)),
      );
    }
  }
  return jsxEl("th", thAttrs, col.header ? [textChild(col.header)] : []);
}

export const tableCodec: ElementCodec<"Table"> = {
  type: "Table",
  generate(element, ctx) {
    const settings = element.settings;
    const attrs: t.JSXAttribute[] = [classNameAttr(element)];

    const flagPairs: ReadonlyArray<readonly [string, boolean | undefined]> = [
      ["data-bordered", settings?.bordered],
      ["data-striped", settings?.striped],
      ["data-hoverable", settings?.hoverable],
      ["data-compact", settings?.compact],
    ];
    for (const [attrName, flagVal] of flagPairs) {
      if (flagVal !== undefined) {
        attrs.push(
          t.jsxAttribute(
            t.jsxIdentifier(attrName),
            t.jsxExpressionContainer(t.booleanLiteral(flagVal)),
          ),
        );
      }
    }
    attrs.push(...settingsToAttributes(settings, TABLE_SKIP));

    const tableParts: JsxChildNode[] = [];
    if (settings?.caption) {
      tableParts.push(jsxEl("caption", [], [textChild(settings.caption)]));
    }

    const columns = settings?.columns;
    if (Array.isArray(columns) && columns.length > 0) {
      const headerRow = jsxEl(
        "tr",
        [],
        columns.map((col) => buildColumnHeaderCell(col)),
      );
      tableParts.push(jsxEl("thead", [], [headerRow]));
    }

    const colSpan = Math.max(columns?.length ?? 0, 1);
    const bodyChildren = buildContainerChildren(element, ctx);
    const slotCell = jsxEl(
      "td",
      [
        t.jsxAttribute(
          t.jsxIdentifier("colSpan"),
          t.jsxExpressionContainer(t.numericLiteral(colSpan)),
        ),
        t.jsxAttribute(t.jsxIdentifier("data-wb-slot"), t.stringLiteral("true")),
      ],
      bodyChildren,
    );
    tableParts.push(jsxEl("tbody", [], [jsxEl("tr", [], [slotCell])]));

    return jsxEl("table", attrs, tableParts);
  },
};
