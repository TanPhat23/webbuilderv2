import type {
  ContainerElementType,
  EditableElementType,
  EditorElement,
  ElementType,
  ElementTypeMap,
} from "./elements";

type ContainerElement = Extract<EditorElement, { type: ContainerElementType }>;

type ExcludeType = "id" | "pageId" | "parentId";

type ContainerElementTemplate = Partial<Omit<EditorElement, ExcludeType>> & {
  type: ContainerElementType;
  elements?: ElementTemplate[];
};

type LeafElementTemplate = Partial<Omit<EditorElement, ExcludeType>> & {
  type: Exclude<ElementType, ContainerElementType>;
};

type ElementTemplate = ContainerElementTemplate | LeafElementTemplate;

export type {
  EditorElement,
  EditableElementType,
  ContainerElement,
  ElementType,
  ContainerElementType,
  ContainerElementTemplate,
  LeafElementTemplate,
  ElementTemplate,
  ElementTypeMap,
};
