import { EditorComponentProps } from "@/features/editor";

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
] as const;

export type ElementType = (typeof ALL_ELEMENT_TYPES)[number];

const ELEMENT_METADATA: Record<ElementType, { icon: string; label: string }> = {
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
  Form: { icon: "FormInput", label: "Form" },
  Progress: { icon: "BarChart3", label: "Progress" },
  Table: { icon: "Table", label: "Table" },
  Frame: { icon: "CardSim", label: "Frame" },
  Section: { icon: "CardSim", label: "Section" },
  Nav: { icon: "Navigation", label: "Nav" },
  Header: { icon: "PanelTop", label: "Header" },
  Footer: { icon: "PanelBottom", label: "Footer" },
  Article: { icon: "FileText", label: "Article" },
  Aside: { icon: "PanelRight", label: "Aside" },
  Carousel: { icon: "SlidersHorizontal", label: "Carousel" },
  List: { icon: "List", label: "List" },
  CMSContentList: { icon: "List", label: "CMS List" },
  CMSContentItem: { icon: "Database", label: "CMS Item" },
  CMSContentGrid: { icon: "Database", label: "CMS Grid" },
};

interface ElementHolder {
  readonly type: ElementType;
  readonly icon: string;
  readonly label: string;
}

export const elementHolders: readonly ElementHolder[] = ALL_ELEMENT_TYPES.map(
  (type) => ({
    type,
    ...ELEMENT_METADATA[type],
  }),
);

type ComponentMapValue = (props: EditorComponentProps) => any;

const componentMap: Record<ElementType, () => Promise<ComponentMapValue>> = {
  // Inline / Leaf
  Text: () =>
    import("@/features/editor/components/elements/BaseComponent").then(
      (m) => m.default,
    ),
  Span: () =>
    import("@/features/editor/components/elements/BaseComponent").then(
      (m) => m.default,
    ),
  Heading: () =>
    import("@/features/editor/components/elements/HeadingComponent").then(
      (m) => m.default,
    ),
  Label: () =>
    import("@/features/editor/components/elements/BaseComponent").then(
      (m) => m.default,
    ),
  Blockquote: () =>
    import("@/features/editor/components/elements/BlockquoteComponent").then(
      (m) => m.default,
    ),
  Code: () =>
    import("@/features/editor/components/elements/CodeComponent").then(
      (m) => m.default,
    ),
  Separator: () =>
    import("@/features/editor/components/elements/SeparatorComponent").then(
      (m) => m.default,
    ),
  Icon: () =>
    import("@/features/editor/components/elements/IconComponent").then(
      (m) => m.default,
    ),
  // Media
  Image: () =>
    import("@/features/editor/components/elements/ImageComponent").then(
      (m) => m.default,
    ),
  Video: () =>
    import("@/features/editor/components/elements/VideoComponent").then(
      (m) => m.default,
    ),
  Audio: () =>
    import("@/features/editor/components/elements/AudioComponent").then(
      (m) => m.default,
    ),
  IFrame: () =>
    import("@/features/editor/components/elements/IFrameComponent").then(
      (m) => m.default,
    ),
  // Interactive
  Button: () =>
    import("@/features/editor/components/elements/ButtonComponent").then(
      (m) => m.default,
    ),
  Link: () =>
    import("@/features/editor/components/elements/BaseComponent").then(
      (m) => m.default,
    ),
  // Form
  Input: () =>
    import("@/features/editor/components/elements/InputComponent").then(
      (m) => m.default,
    ),
  Textarea: () =>
    import("@/features/editor/components/elements/TextareaComponent").then(
      (m) => m.default,
    ),
  Checkbox: () =>
    import("@/features/editor/components/elements/CheckboxComponent").then(
      (m) => m.default,
    ),
  Radio: () =>
    import("@/features/editor/components/elements/RadioComponent").then(
      (m) => m.default,
    ),
  Select: () =>
    import("@/features/editor/components/elements/SelectComponent").then(
      (m) => m.default,
    ),
  Form: () =>
    import("@/features/editor/components/elements/FormComponent").then(
      (m) => m.default,
    ),
  Progress: () =>
    import("@/features/editor/components/elements/ProgressComponent").then(
      (m) => m.default,
    ),
  // Table
  Table: () =>
    import("@/features/editor/components/elements/TableComponent").then(
      (m) => m.default,
    ),
  // Container / Layout
  Frame: () =>
    import("@/features/editor/components/elements/FrameComponent").then(
      (m) => m.default,
    ),
  Section: () =>
    import("@/features/editor/components/elements/SectionComponent").then(
      (m) => m.default,
    ),
  Nav: () =>
    import("@/features/editor/components/elements/SemanticContainerComponent").then(
      (m) => m.default,
    ),
  Header: () =>
    import("@/features/editor/components/elements/SemanticContainerComponent").then(
      (m) => m.default,
    ),
  Footer: () =>
    import("@/features/editor/components/elements/SemanticContainerComponent").then(
      (m) => m.default,
    ),
  Article: () =>
    import("@/features/editor/components/elements/SemanticContainerComponent").then(
      (m) => m.default,
    ),
  Aside: () =>
    import("@/features/editor/components/elements/SemanticContainerComponent").then(
      (m) => m.default,
    ),
  // Carousel
  Carousel: () =>
    import("@/features/editor/components/elements/CarouselComponent").then(
      (m) => m.default,
    ),
  // List
  List: () =>
    import("@/features/editor/components/elements/ListComponent").then(
      (m) => m.default,
    ),
  // CMS
  CMSContentList: () =>
    import("@/features/editor/components/elements/CMSContentListComponent").then(
      (m) => m.default,
    ),
  CMSContentItem: () =>
    import("@/features/editor/components/elements/CMSContentItemComponent").then(
      (m) => m.default,
    ),
  CMSContentGrid: () =>
    import("@/features/editor/components/elements/CMSContentGridComponent").then(
      (m) => m.default,
    ),
};

export const getComponentFactory = (
  elementType: ElementType,
): (() => Promise<ComponentMapValue>) | undefined => {
  return componentMap[elementType];
};

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
