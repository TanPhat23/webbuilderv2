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

export const ELEMENT_ICON_MAP: Record<ElementType, string> = {
  // Inline / Leaf
  Text: "Type",
  Span: "TextCursorInput",
  Heading: "Heading",
  Label: "Tag",
  Blockquote: "Quote",
  Code: "Code",
  Separator: "Minus",
  Icon: "Smile",
  // Media
  Image: "Image",
  Video: "Video",
  Audio: "Volume2",
  IFrame: "Globe",
  // Interactive
  Button: "MousePointerClick",
  Link: "Link",
  // Form
  Input: "FormInput",
  Textarea: "AlignLeft",
  Checkbox: "CheckSquare",
  Radio: "Circle",
  Select: "TextSelection",
  Form: "FormInput",
  Progress: "BarChart3",
  // Table
  Table: "Table",
  // Container / Layout
  Frame: "CardSim",
  Section: "CardSim",
  Nav: "Navigation",
  Header: "PanelTop",
  Footer: "PanelBottom",
  Article: "FileText",
  Aside: "PanelRight",
  // Carousel
  Carousel: "SlidersHorizontal",
  // List
  List: "List",
  // CMS
  CMSContentList: "List",
  CMSContentItem: "Database",
  CMSContentGrid: "Database",
} as const;

export const ELEMENT_LABELS: Record<ElementType, string> = {
  // Inline / Leaf
  Text: "Text",
  Span: "Span",
  Heading: "Heading",
  Label: "Label",
  Blockquote: "Blockquote",
  Code: "Code",
  Separator: "Separator",
  Icon: "Icon",
  // Media
  Image: "Image",
  Video: "Video",
  Audio: "Audio",
  IFrame: "IFrame",
  // Interactive
  Button: "Button",
  Link: "Link",
  // Form
  Input: "Input",
  Textarea: "Textarea",
  Checkbox: "Checkbox",
  Radio: "Radio",
  Select: "Select",
  Form: "Form",
  Progress: "Progress",
  // Table
  Table: "Table",
  // Container / Layout
  Frame: "Frame",
  Section: "Section",
  Nav: "Nav",
  Header: "Header",
  Footer: "Footer",
  Article: "Article",
  Aside: "Aside",
  // Carousel
  Carousel: "Carousel",
  // List
  List: "List",
  // CMS
  CMSContentList: "CMS List",
  CMSContentItem: "CMS Item",
  CMSContentGrid: "CMS Grid",
} as const;

interface ElementHolder {
  readonly type: ElementType;
  readonly icon: string;
  readonly label: string;
}

export const elementHolders: readonly ElementHolder[] = ALL_ELEMENT_TYPES.map(
  (type) => ({
    type,
    icon: ELEMENT_ICON_MAP[type],
    label: ELEMENT_LABELS[type],
  }),
);

type ComponentMapValue = (props: EditorComponentProps) => any;

export const getComponentFactory = (
  elementType: ElementType,
): (() => Promise<ComponentMapValue>) | undefined => {
  const componentMap: Record<ElementType, () => Promise<ComponentMapValue>> = {
    // Inline / Leaf
    Text: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.BaseComponent,
      ),
    Span: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.BaseComponent,
      ),
    Heading: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.HeadingComponent,
      ),
    Label: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.BaseComponent,
      ),
    Blockquote: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.BlockquoteComponent,
      ),
    Code: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.CodeComponent,
      ),
    Separator: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.SeparatorComponent,
      ),
    Icon: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.IconComponent,
      ),
    // Media
    Image: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.ImageComponent,
      ),
    Video: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.VideoComponent,
      ),
    Audio: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.AudioComponent,
      ),
    IFrame: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.IFrameComponent,
      ),
    // Interactive
    Button: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.ButtonComponent,
      ),
    Link: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.BaseComponent,
      ),
    // Form
    Input: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.InputComponent,
      ),
    Textarea: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.TextareaComponent,
      ),
    Checkbox: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.CheckboxComponent,
      ),
    Radio: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.RadioComponent,
      ),
    Select: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.SelectComponent,
      ),
    Form: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.FormComponent,
      ),
    Progress: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.ProgressComponent,
      ),
    // Table
    Table: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.TableComponent,
      ),
    // Container / Layout
    Frame: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.FrameComponent,
      ),
    Section: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.SectionComponent,
      ),
    Nav: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.SemanticContainerComponent,
      ),
    Header: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.SemanticContainerComponent,
      ),
    Footer: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.SemanticContainerComponent,
      ),
    Article: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.SemanticContainerComponent,
      ),
    Aside: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.SemanticContainerComponent,
      ),
    // Carousel
    Carousel: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.CarouselComponent,
      ),
    // List
    List: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.ListComponent,
      ),
    // CMS
    CMSContentList: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.CMSContentListComponent,
      ),
    CMSContentItem: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.CMSContentItemComponent,
      ),
    CMSContentGrid: () =>
      import("@/features/editor/components/editorcomponents").then(
        (m) => m.CMSContentGridComponent,
      ),
  };

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
