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
    import("@/features/editor/components/elements").then(
      (m) => m.BaseComponent,
    ),
  Span: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.BaseComponent,
    ),
  Heading: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.HeadingComponent,
    ),
  Label: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.BaseComponent,
    ),
  Blockquote: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.BlockquoteComponent,
    ),
  Code: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.CodeComponent,
    ),
  Separator: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.SeparatorComponent,
    ),
  Icon: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.IconComponent,
    ),
  // Media
  Image: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.ImageComponent,
    ),
  Video: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.VideoComponent,
    ),
  Audio: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.AudioComponent,
    ),
  IFrame: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.IFrameComponent,
    ),
  // Interactive
  Button: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.ButtonComponent,
    ),
  Link: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.BaseComponent,
    ),
  // Form
  Input: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.InputComponent,
    ),
  Textarea: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.TextareaComponent,
    ),
  Checkbox: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.CheckboxComponent,
    ),
  Radio: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.RadioComponent,
    ),
  Select: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.SelectComponent,
    ),
  Form: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.FormComponent,
    ),
  Progress: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.ProgressComponent,
    ),
  // Table
  Table: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.TableComponent,
    ),
  // Container / Layout
  Frame: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.FrameComponent,
    ),
  Section: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.SectionComponent,
    ),
  Nav: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.SemanticContainerComponent,
    ),
  Header: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.SemanticContainerComponent,
    ),
  Footer: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.SemanticContainerComponent,
    ),
  Article: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.SemanticContainerComponent,
    ),
  Aside: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.SemanticContainerComponent,
    ),
  // Carousel
  Carousel: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.CarouselComponent,
    ),
  // List
  List: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.ListComponent,
    ),
  // CMS
  CMSContentList: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.CMSContentListComponent,
    ),
  CMSContentItem: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.CMSContentItemComponent,
    ),
  CMSContentGrid: () =>
    import("@/features/editor/components/elements").then(
      (m) => m.CMSContentGridComponent,
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
