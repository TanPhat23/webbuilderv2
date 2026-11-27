import * as t from "@babel/types";
import { ALL_ELEMENT_TYPES, type ElementType } from "@webbuilder/site-runtime/types/elements";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { EMPTY_COMPONENT_CATALOG } from "./catalog";
import { ELEMENT_CODECS } from "./codecs/registry";
import { decorateGeneratedElement } from "./codecs/shared";
import type { GenerateNodeContext } from "./codecs/types";

export interface GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null;
}

/**
 * When on, every generated element carries `data-element-id`, which is how the
 * generated interactions module finds the elements it listens to and acts on.
 * Set around one synchronous generation run by the code generator.
 */
export const generationOptions = { tagElementIds: false };

function invokeCodec(element: EditorElement, ctx: GenerateNodeContext): t.JSXElement {
  switch (element.type) {
    case "Text":
      return ELEMENT_CODECS.Text.generate(element, ctx);
    case "Span":
      return ELEMENT_CODECS.Span.generate(element, ctx);
    case "Heading":
      return ELEMENT_CODECS.Heading.generate(element, ctx);
    case "Label":
      return ELEMENT_CODECS.Label.generate(element, ctx);
    case "Blockquote":
      return ELEMENT_CODECS.Blockquote.generate(element, ctx);
    case "Code":
      return ELEMENT_CODECS.Code.generate(element, ctx);
    case "Separator":
      return ELEMENT_CODECS.Separator.generate(element, ctx);
    case "Icon":
      return ELEMENT_CODECS.Icon.generate(element, ctx);
    case "Image":
      return ELEMENT_CODECS.Image.generate(element, ctx);
    case "Video":
      return ELEMENT_CODECS.Video.generate(element, ctx);
    case "Audio":
      return ELEMENT_CODECS.Audio.generate(element, ctx);
    case "IFrame":
      return ELEMENT_CODECS.IFrame.generate(element, ctx);
    case "Button":
      return ELEMENT_CODECS.Button.generate(element, ctx);
    case "Link":
      return ELEMENT_CODECS.Link.generate(element, ctx);
    case "Input":
      return ELEMENT_CODECS.Input.generate(element, ctx);
    case "Textarea":
      return ELEMENT_CODECS.Textarea.generate(element, ctx);
    case "Checkbox":
      return ELEMENT_CODECS.Checkbox.generate(element, ctx);
    case "Radio":
      return ELEMENT_CODECS.Radio.generate(element, ctx);
    case "Progress":
      return ELEMENT_CODECS.Progress.generate(element, ctx);
    case "List":
      return ELEMENT_CODECS.List.generate(element, ctx);
    case "Select":
      return ELEMENT_CODECS.Select.generate(element, ctx);
    case "Form":
      return ELEMENT_CODECS.Form.generate(element, ctx);
    case "Table":
      return ELEMENT_CODECS.Table.generate(element, ctx);
    case "Frame":
      return ELEMENT_CODECS.Frame.generate(element, ctx);
    case "Section":
      return ELEMENT_CODECS.Section.generate(element, ctx);
    case "Nav":
      return ELEMENT_CODECS.Nav.generate(element, ctx);
    case "Header":
      return ELEMENT_CODECS.Header.generate(element, ctx);
    case "Footer":
      return ELEMENT_CODECS.Footer.generate(element, ctx);
    case "Article":
      return ELEMENT_CODECS.Article.generate(element, ctx);
    case "Aside":
      return ELEMENT_CODECS.Aside.generate(element, ctx);
    case "CMSContentList":
      return ELEMENT_CODECS.CMSContentList.generate(element, ctx);
    case "CMSContentItem":
      return ELEMENT_CODECS.CMSContentItem.generate(element, ctx);
    case "CMSContentGrid":
      return ELEMENT_CODECS.CMSContentGrid.generate(element, ctx);
    case "Carousel":
      return ELEMENT_CODECS.Carousel.generate(element, ctx);
  }
}

function createStandaloneContext(): GenerateNodeContext {
  const ctx: GenerateNodeContext = {
    catalog: EMPTY_COMPONENT_CATALOG,
    get tagElementIds(): boolean {
      return generationOptions.tagElementIds;
    },
    usedLucideIcons: new Set<string>(),
    usedProjectComponents: new Set<string>(),
    generateChild(child: EditorElement): t.JSXElement | null {
      if (!Object.hasOwn(generateStrategies, child.type)) return null;
      const strategy = generateStrategies[child.type];
      return strategy ? strategy.generate(child, ctx) : null;
    },
  };
  return ctx;
}

function generateForType(
  expectedType: ElementType,
  element: EditorElement,
  ctx?: GenerateNodeContext,
): t.JSXElement | null {
  if (element.type !== expectedType) return null;
  const activeCtx = ctx ?? createStandaloneContext();
  const node = invokeCodec(element, activeCtx);
  return decorateGeneratedElement(node, element, activeCtx.tagElementIds);
}

function createTypeStrategy(expectedType: ElementType): GenerateStrategy {
  return {
    generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
      return generateForType(expectedType, element, ctx);
    },
  };
}

export class SectionGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("Section", element, ctx);
  }
}

export class ButtonGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("Button", element, ctx);
  }
}

export class TextGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("Text", element, ctx);
  }
}

export class ImageGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("Image", element, ctx);
  }
}

export class LinkGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("Link", element, ctx);
  }
}

export class InputGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("Input", element, ctx);
  }
}

export class SelectGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("Select", element, ctx);
  }
}

export class ListGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("List", element, ctx);
  }
}

export class FrameGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("Frame", element, ctx);
  }
}

export class FormGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("Form", element, ctx);
  }
}

export class CarouselGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("Carousel", element, ctx);
  }
}

export class CMSContentListGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("CMSContentList", element, ctx);
  }
}

export class CMSContentItemGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("CMSContentItem", element, ctx);
  }
}

export class CMSContentGridGenerateStrategy implements GenerateStrategy {
  generate(element: EditorElement, ctx?: GenerateNodeContext): t.JSXElement | null {
    return generateForType("CMSContentGrid", element, ctx);
  }
}

export const generateStrategies: Record<string, GenerateStrategy> = Object.fromEntries(
  ALL_ELEMENT_TYPES.map((type) => [type, createTypeStrategy(type)]),
);
