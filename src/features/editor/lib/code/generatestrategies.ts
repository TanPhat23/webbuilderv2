import { ContainerElement, EditorElement } from "@/types/global.type";
import * as t from "@babel/types";
import computeTailwindFromStyles from "../../utils/element/computeTailwindFromStyles";

interface GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null;
}

const handleChildren = (
  element: EditorElement,
): Array<t.JSXText | t.JSXElement> => {
  const children: Array<t.JSXText | t.JSXElement> = [];

  if (element.content) {
    children.push(t.jsxText(element.content));
  }

  const elems = (element as ContainerElement).elements;
  if (Array.isArray(elems) && elems.length > 0) {
    elems.forEach((child: EditorElement) => {
      const childStrategy = generateStrategies[child.type];
      if (!childStrategy) return;
      const childJSX = childStrategy.generate(child);
      if (childJSX) {
        children.push(childJSX);
      }
    });
  }
  return children;
};

const handleAttributes = (element: EditorElement): t.JSXAttribute[] => {
  const attributes: t.JSXAttribute[] = [];
  attributes.push(
    t.jsxAttribute(
      t.jsxIdentifier("className"),
      t.stringLiteral(computeTailwindFromStyles(element.styles) || ""),
    ),
  );
  return attributes;
};

/**
 * Helper to convert an element.settings (plain JS object) into JSX attributes.
 * It uses t.valueToNode for non-string values so numbers/booleans/objects become expression containers.
 */
const settingsToAttributes = (
  settings: Record<string, any> | undefined,
): t.JSXAttribute[] => {
  const attrs: t.JSXAttribute[] = [];
  if (!settings || typeof settings !== "object") return attrs;

  for (const [key, value] of Object.entries(settings)) {
    if (value === undefined) continue;

    if (typeof value === "string") {
      attrs.push(t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(value)));
    } else {
      try {
        const node = t.valueToNode(value as any) as t.Expression;
        attrs.push(
          t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(node)),
        );
      } catch {
        attrs.push(
          t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(String(value))),
        );
      }
    }
  }

  return attrs;
};

export class SectionGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "Section") return null;
    const children = handleChildren(element);

    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("section"),
      handleAttributes(element),
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("section"));
    return t.jsxElement(openingElement, closingElement, children as any, false);
  }
}

export class ButtonGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "Button") return null;
    const children: (t.JSXText | t.JSXElement)[] = [];
    if (element.content) {
      children.push(t.jsxText(element.content));
    }
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("button"),
      handleAttributes(element),
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("button"));
    return t.jsxElement(openingElement, closingElement, children as any, false);
  }
}

export class TextGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "Text") return null;
    const children: t.JSXText[] = [];
    if (element.content) children.push(t.jsxText(element.content));
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("div"),
      handleAttributes(element),
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("div"));
    return t.jsxElement(openingElement, closingElement, children as any, false);
  }
}

export class ImageGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "Image") return null;
    const attrs = handleAttributes(element);
    if (element.src) {
      attrs.push(
        t.jsxAttribute(t.jsxIdentifier("src"), t.stringLiteral(element.src)),
      );
    }
    attrs.push(
      t.jsxAttribute(
        t.jsxIdentifier("alt"),
        t.stringLiteral(element.content || ""),
      ),
    );
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("img"),
      attrs,
      true,
    );
    // Self-closing element
    return t.jsxElement(openingElement, null, [], true);
  }
}

export class LinkGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "Link") return null;
    const children = handleChildren(element);
    if (children.length === 0 && element.content)
      children.push(t.jsxText(element.content));
    const attrs = handleAttributes(element);
    if (element.href)
      attrs.push(
        t.jsxAttribute(t.jsxIdentifier("href"), t.stringLiteral(element.href)),
      );
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("a"),
      attrs,
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("a"));
    return t.jsxElement(openingElement, closingElement, children as any, false);
  }
}

export class InputGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "Input") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings as any),
    ];
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("input"),
      attrs,
      true,
    );
    return t.jsxElement(openingElement, null, [], true);
  }
}

export class SelectGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "Select") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings as any),
    ];
    const options: t.JSXElement[] = [];
    const elems = (element as ContainerElement).elements;
    if (Array.isArray(elems)) {
      elems.forEach((opt) => {
        const value = opt.content || "";
        const optionAttrs: t.JSXAttribute[] = [
          t.jsxAttribute(t.jsxIdentifier("value"), t.stringLiteral(value)),
        ];
        const optOpening = t.jsxOpeningElement(
          t.jsxIdentifier("option"),
          optionAttrs,
          false,
        );
        const optClosing = t.jsxClosingElement(t.jsxIdentifier("option"));
        options.push(
          t.jsxElement(
            optOpening,
            optClosing,
            [t.jsxText(value)] as any,
            false,
          ),
        );
      });
    }
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("select"),
      attrs,
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("select"));
    return t.jsxElement(openingElement, closingElement, options as any, false);
  }
}

export class ListGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "List") return null;
    // if settings indicate ordered, use ol else ul
    const ordered = !!(element.settings && (element.settings as any).ordered);
    const tag = ordered ? "ol" : "ul";
    const children: t.JSXElement[] = [];
    const elems = (element as ContainerElement).elements;
    if (Array.isArray(elems)) {
      elems.forEach((child) => {
        const childStrategy = generateStrategies[child.type];
        if (!childStrategy) return;
        const childJSX = childStrategy.generate(child);
        if (childJSX) {
          const liOpening = t.jsxOpeningElement(
            t.jsxIdentifier("li"),
            [],
            false,
          );
          const liClosing = t.jsxClosingElement(t.jsxIdentifier("li"));
          children.push(
            t.jsxElement(liOpening, liClosing, [childJSX] as any, false),
          );
        }
      });
    }
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier(tag),
      handleAttributes(element),
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier(tag));
    return t.jsxElement(openingElement, closingElement, children as any, false);
  }
}

export class FrameGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "Frame") return null;
    const children = handleChildren(element);
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("div"),
      handleAttributes(element),
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("div"));
    return t.jsxElement(openingElement, closingElement, children as any, false);
  }
}

export class FormGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "Form") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings as any),
    ];
    const children = handleChildren(element);
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("form"),
      attrs,
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("form"));
    return t.jsxElement(openingElement, closingElement, children as any, false);
  }
}

export class CarouselGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "Carousel") return null;

    const slides: t.JSXElement[] = [];
    const elems = (element as ContainerElement).elements;
    if (Array.isArray(elems) && elems.length > 0) {
      elems.forEach((child: EditorElement) => {
        const childStrategy = generateStrategies[child.type];
        if (!childStrategy) return;
        const childJSX = childStrategy.generate(child);
        if (childJSX) {
          const slideOpening = t.jsxOpeningElement(
            t.jsxIdentifier("div"),
            [
              t.jsxAttribute(
                t.jsxIdentifier("className"),
                t.stringLiteral("embla__slide"),
              ),
            ],
            false,
          );
          const slideClosing = t.jsxClosingElement(t.jsxIdentifier("div"));
          const slide = t.jsxElement(
            slideOpening,
            slideClosing,
            [childJSX] as any,
            false,
          );
          slides.push(slide);
        }
      });
    }

    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings as any),
    ];

    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("Carousel"),
      attrs,
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("Carousel"));
    return t.jsxElement(openingElement, closingElement, slides as any, false);
  }
}

export class CMSContentListGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "CMSContentList") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings as any),
    ];
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("div"),
      attrs,
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("div"));
    // elements is a template for each item
    const children = handleChildren(element);
    return t.jsxElement(openingElement, closingElement, children as any, false);
  }
}

export class CMSContentItemGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "CMSContentItem") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings as any),
    ];
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("div"),
      attrs,
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("div"));
    const children = handleChildren(element);
    return t.jsxElement(openingElement, closingElement, children as any, false);
  }
}

export class CMSContentGridGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement): t.JSXElement | null {
    if (element.type !== "CMSContentGrid") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings as any),
    ];
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("div"),
      attrs,
      false,
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("div"));
    const children = handleChildren(element);
    return t.jsxElement(openingElement, closingElement, children as any, false);
  }
}

export const generateStrategies: Record<string, GenerateStrategy> = {
  Section: new SectionGenerateStrategy(),
  Button: new ButtonGenerateStrategy(),
  Text: new TextGenerateStrategy(),
  Image: new ImageGenerateStrategy(),
  Link: new LinkGenerateStrategy(),
  Input: new InputGenerateStrategy(),
  Select: new SelectGenerateStrategy(),
  List: new ListGenerateStrategy(),
  Frame: new FrameGenerateStrategy(),
  Form: new FormGenerateStrategy(),
  Carousel: new CarouselGenerateStrategy(),

  CMSContentList: new CMSContentListGenerateStrategy(),
  CMSContentItem: new CMSContentItemGenerateStrategy(),
  CMSContentGrid: new CMSContentGridGenerateStrategy(),
};
