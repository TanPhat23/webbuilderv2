import * as t from "@babel/types";
import type { ElementType } from "@webbuilder/site-runtime/types/elements";
import {
  buildContainerChildren,
  classNameAttr,
  jsxEl,
  settingsToAttributes,
  type JsxChildNode,
} from "./shared";
import type { ElementCodec } from "./types";

function semanticContainerCodec<
  T extends "Frame" | "Section" | "Nav" | "Header" | "Footer" | "Article" | "Aside",
>(type: T, tag: string): ElementCodec<T> {
  return {
    type,
    generate(element, ctx) {
      return jsxEl(tag, [classNameAttr(element)], buildContainerChildren(element, ctx));
    },
  };
}

function cmsContainerCodec<
  T extends "CMSContentList" | "CMSContentGrid" | "CMSContentItem",
>(type: T): ElementCodec<T> {
  return {
    type,
    generate(element, ctx) {
      const attrs = [
        classNameAttr(element),
        ...settingsToAttributes(element.settings),
      ];
      return jsxEl(type, attrs, buildContainerChildren(element, ctx));
    },
  };
}

export const frameCodec: ElementCodec<"Frame"> = semanticContainerCodec("Frame", "div");
export const sectionCodec: ElementCodec<"Section"> = semanticContainerCodec("Section", "section");
export const navCodec: ElementCodec<"Nav"> = semanticContainerCodec("Nav", "nav");
export const headerCodec: ElementCodec<"Header"> = semanticContainerCodec("Header", "header");
export const footerCodec: ElementCodec<"Footer"> = semanticContainerCodec("Footer", "footer");
export const articleCodec: ElementCodec<"Article"> = semanticContainerCodec("Article", "article");
export const asideCodec: ElementCodec<"Aside"> = semanticContainerCodec("Aside", "aside");

export const cmsContentListCodec: ElementCodec<"CMSContentList"> =
  cmsContainerCodec("CMSContentList");
export const cmsContentGridCodec: ElementCodec<"CMSContentGrid"> =
  cmsContainerCodec("CMSContentGrid");
export const cmsContentItemCodec: ElementCodec<"CMSContentItem"> =
  cmsContainerCodec("CMSContentItem");

export const carouselCodec: ElementCodec<"Carousel"> = {
  type: "Carousel",
  generate(element, ctx) {
    const slides: JsxChildNode[] = [];
    if (Array.isArray(element.elements)) {
      for (const child of element.elements) {
        const childJsx = ctx.generateChild(child);
        if (childJsx) {
          slides.push(
            jsxEl(
              "div",
              [t.jsxAttribute(t.jsxIdentifier("className"), t.stringLiteral("embla__slide"))],
              [childJsx],
            ),
          );
        }
      }
    }
    const attrs = [
      classNameAttr(element),
      ...settingsToAttributes(element.settings),
    ];
    return jsxEl("Carousel", attrs, slides);
  },
};

export type LayoutCodecElementType = Extract<
  ElementType,
  | "Frame"
  | "Section"
  | "Nav"
  | "Header"
  | "Footer"
  | "Article"
  | "Aside"
  | "CMSContentList"
  | "CMSContentGrid"
  | "CMSContentItem"
  | "Carousel"
>;
