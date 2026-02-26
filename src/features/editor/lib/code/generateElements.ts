import { EditorElement, ElementType } from "@/types/global.type";
import * as t from "@babel/types";
import traverse, { NodePath } from "@babel/traverse";
import { parse } from "@babel/parser";

type HTMLTag = keyof HTMLElementTagNameMap;

const mapJSXToElementType: Partial<Record<HTMLTag, ElementType>> = {
  // Text & Content
  div: "Frame",
  section: "Section",
  p: "Text",
  h1: "Text",
  h2: "Text",
  h3: "Text",
  h4: "Text",
  h5: "Text",
  h6: "Text",
  span: "Text",
  article: "Section",

  // Images & Media
  img: "Image",

  // Forms & Input
  form: "Form",
  input: "Input",
  textarea: "Input",
  select: "Select",
  button: "Button",

  // Links & Navigation
  a: "Link",

  // Lists
  ul: "List",
  ol: "List",
  li: "Text",
};

class ElementGenerator {
  private static instance: ElementGenerator;

  private constructor() {}

  getInstance(): ElementGenerator {
    if (!ElementGenerator.instance) {
      ElementGenerator.instance = new ElementGenerator();
    }
    return ElementGenerator.instance;
  }

  transformJSXToElements(jsxCode: string): EditorElement[] {
    const ast = parse(jsxCode, {
      sourceType: "module",
      plugins: ["jsx"],
    });
    const jsxElements: t.JSXElement[] = [];

    traverse(ast, {
      JSXElement(path: NodePath<t.JSXElement>) {
        jsxElements.push(path.node);
      },
    });
    const elements: EditorElement[] = [];
    return elements;
  }
}
