import type { ElementType } from "./elements";

export const CONTAINER_ELEMENT_TYPES = [
  "Frame",
  "Form",
  "List",
  "Section",
  "Carousel",
  "CMSContentList",
  "CMSContentItem",
  "CMSContentGrid",
  "Table",
  "Nav",
  "Header",
  "Footer",
  "Article",
  "Aside",
] as const;

export const EDITABLE_ELEMENT_TYPES = [
  "Text",
  "Span",
  "Heading",
  "Label",
  "Blockquote",
  "Code",
  "Button",
  "Input",
  "Textarea",
  "Select",
  "Link",
] as const;

export const ALL_ELEMENT_TYPES = [
  ...CONTAINER_ELEMENT_TYPES,
  ...EDITABLE_ELEMENT_TYPES,
  "Image",
  "Video",
  "Audio",
  "IFrame",
  "Separator",
  "Icon",
  "Checkbox",
  "Radio",
  "Progress",
] as const satisfies readonly ElementType[];

export type ContainerElementType = (typeof CONTAINER_ELEMENT_TYPES)[number];
export type EditableElementType = (typeof EDITABLE_ELEMENT_TYPES)[number];

type AssertAllTypesListed<T extends true> = T;
type _AllElementTypesListed = AssertAllTypesListed<
  Exclude<ElementType, (typeof ALL_ELEMENT_TYPES)[number]> extends never ? true : false
>;

export const isContainerElement = (
  type: ElementType,
): type is ContainerElementType => {
  return (CONTAINER_ELEMENT_TYPES as readonly ElementType[]).includes(type);
};

export const isEditableElement = (
  type: ElementType,
): type is EditableElementType => {
  return (EDITABLE_ELEMENT_TYPES as readonly ElementType[]).includes(type);
};
