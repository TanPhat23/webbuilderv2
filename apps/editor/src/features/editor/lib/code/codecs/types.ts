import type * as t from "@babel/types";
import type { ElementType } from "@webbuilder/site-runtime/types/elements";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import type { ComponentCatalog } from "../catalog";

export interface GenerateNodeContext {
  readonly catalog: ComponentCatalog;
  readonly tagElementIds: boolean;
  readonly usedLucideIcons: Set<string>;
  readonly usedProjectComponents: Set<string>;
  generateChild(element: EditorElement): t.JSXElement | t.JSXExpressionContainer | null;
}

export interface ElementCodec<T extends ElementType = ElementType> {
  readonly type: T;
  generate(element: Extract<EditorElement, { type: T }>, ctx: GenerateNodeContext): t.JSXElement;
}
