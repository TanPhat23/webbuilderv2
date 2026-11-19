import type { ElementTypeMap } from "@/features/editor/interfaces/elements.interface";
import type { IconName } from "@/features/editor/utils/icons/iconMap";

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

export type ElementType = keyof ElementTypeMap;
type AssertAllTypesListed<T extends true> = T;
type AllElementTypesListed = AssertAllTypesListed<
  Exclude<ElementType, (typeof ALL_ELEMENT_TYPES)[number]> extends never ? true : false
>;

const ELEMENT_METADATA: Record<ElementType, { icon: IconName; label: string }> = {
  Text: { icon: "Type", label: "Text" },
  Span: { icon: "TextCursorInput", label: "Span" },
  Heading: { icon: "Heading", label: "Heading" },
  Label: { icon: "Tag", label: "Label" },
  Blockquote: { icon: "Quote", label: "Blockquote" },
  Code: { icon: "Code", label: "Code" },
  Separator: { icon: "Minus", label: "Separator" },
  Icon: { icon: "Smile", label: "Icon" },
  Image: { icon: "Image", label: "Image" },
  Video: { icon: "Video", label: "Video" },
  Audio: { icon: "Volume2", label: "Audio" },
  IFrame: { icon: "Globe", label: "IFrame" },
  Button: { icon: "MousePointerClick", label: "Button" },
  Link: { icon: "Link", label: "Link" },
  Input: { icon: "FormInput", label: "Input" },
  Textarea: { icon: "AlignLeft", label: "Textarea" },
  Checkbox: { icon: "CheckSquare", label: "Checkbox" },
  Radio: { icon: "Circle", label: "Radio" },
  Select: { icon: "TextSelection", label: "Select" },
  Form: { icon: "ClipboardList", label: "Form" },
  Progress: { icon: "BarChart3", label: "Progress" },
  Table: { icon: "Table", label: "Table" },
  Frame: { icon: "Frame", label: "Frame" },
  Section: { icon: "RectangleHorizontal", label: "Section" },
  Nav: { icon: "Navigation", label: "Nav" },
  Header: { icon: "PanelTop", label: "Header" },
  Footer: { icon: "PanelBottom", label: "Footer" },
  Article: { icon: "FileText", label: "Article" },
  Aside: { icon: "PanelRight", label: "Aside" },
  Carousel: { icon: "SlidersHorizontal", label: "Carousel" },
  List: { icon: "List", label: "List" },
  CMSContentList: { icon: "ListTree", label: "CMS List" },
  CMSContentItem: { icon: "Database", label: "CMS Item" },
  CMSContentGrid: { icon: "LayoutGrid", label: "CMS Grid" },
};

interface ElementHolder {
  readonly type: ElementType;
  readonly icon: IconName;
  readonly label: string;
}

export const elementHolders: readonly ElementHolder[] = ALL_ELEMENT_TYPES.map(
  (type) => ({
    type,
    ...ELEMENT_METADATA[type],
  }),
);

export const isContainerElement = (
  type: ElementType,
): type is (typeof CONTAINER_ELEMENT_TYPES)[number] => {
  return (CONTAINER_ELEMENT_TYPES as readonly ElementType[]).includes(type);
};

export const isEditableElement = (
  type: ElementType,
): type is (typeof EDITABLE_ELEMENT_TYPES)[number] => {
  return (EDITABLE_ELEMENT_TYPES as readonly ElementType[]).includes(type);
};

export default elementHolders;
