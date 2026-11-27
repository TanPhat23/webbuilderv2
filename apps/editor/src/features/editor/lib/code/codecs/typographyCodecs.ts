import * as t from "@babel/types";
import {
  classNameAttr,
  codePropNames,
  elementTextChildren,
  jsxEl,
  selfClosingJsxEl,
  settingsToAttributes,
} from "./shared";
import type { ElementCodec } from "./types";

const HEADING_SKIP: ReadonlySet<string> = new Set(["level"]);
const CODE_SKIP: ReadonlySet<string> = new Set(["preformatted", "language"]);

export const textCodec: ElementCodec<"Text"> = {
  type: "Text",
  generate(element) {
    return jsxEl(
      "div",
      [classNameAttr(element)],
      elementTextChildren(element),
    );
  },
};

export const spanCodec: ElementCodec<"Span"> = {
  type: "Span",
  generate(element) {
    return jsxEl(
      "span",
      [classNameAttr(element)],
      elementTextChildren(element),
    );
  },
};

export const headingCodec: ElementCodec<"Heading"> = {
  type: "Heading",
  generate(element) {
    const rawLevel = element.settings?.level;
    const level =
      rawLevel === 1 ||
      rawLevel === 2 ||
      rawLevel === 3 ||
      rawLevel === 4 ||
      rawLevel === 5 ||
      rawLevel === 6
        ? rawLevel
        : 2;
    const attrs = [
      classNameAttr(element),
      ...settingsToAttributes(element.settings, HEADING_SKIP),
    ];
    return jsxEl(
      `h${level}`,
      attrs,
      elementTextChildren(element),
    );
  },
};

export const labelCodec: ElementCodec<"Label"> = {
  type: "Label",
  generate(element) {
    const attrs = [
      classNameAttr(element),
      ...settingsToAttributes(element.settings),
    ];
    return jsxEl(
      "label",
      attrs,
      elementTextChildren(element),
    );
  },
};

export const blockquoteCodec: ElementCodec<"Blockquote"> = {
  type: "Blockquote",
  generate(element) {
    const attrs = [
      classNameAttr(element),
      ...settingsToAttributes(element.settings),
    ];
    return jsxEl(
      "blockquote",
      attrs,
      elementTextChildren(element),
    );
  },
};

export const codeCodec: ElementCodec<"Code"> = {
  type: "Code",
  generate(element) {
    const preformatted = element.settings?.preformatted === true;
    const language = element.settings?.language;
    const overridden = codePropNames(element.settings);
    const attrs = [
      classNameAttr(element),
      ...(language && !overridden.has("data-language") && !overridden.has("language")
        ? [t.jsxAttribute(t.jsxIdentifier("data-language"), t.stringLiteral(language))]
        : []),
      ...settingsToAttributes(element.settings, CODE_SKIP),
    ];
    const children = elementTextChildren(element);
    if (preformatted) {
      return jsxEl("pre", attrs, [jsxEl("code", [], children)]);
    }
    return jsxEl("code", attrs, children);
  },
};

export const separatorCodec: ElementCodec<"Separator"> = {
  type: "Separator",
  generate(element) {
    return selfClosingJsxEl("hr", [classNameAttr(element)]);
  },
};
