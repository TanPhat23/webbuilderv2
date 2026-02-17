import { EditorComponentProps } from "@/interfaces/editor.interface";

export const CONTAINER_ELEMENT_TYPES = [
  "Frame",
  "Form",
  "List",
  "Section",
  "Carousel",
  "CMSContentList",
  "CMSContentItem",
  "CMSContentGrid",
] as const;

export const EDITABLE_ELEMENT_TYPES = [
  "Text",
  "Button",
  "Input",
  "Select",
  "Link",
] as const;

export const ALL_ELEMENT_TYPES = [
  ...CONTAINER_ELEMENT_TYPES,
  ...EDITABLE_ELEMENT_TYPES,
  "Image",
] as const;

export type ElementType = (typeof ALL_ELEMENT_TYPES)[number];

export const ELEMENT_ICON_MAP: Record<ElementType, string> = {
  Text: "Type",
  Button: "MousePointerClick",
  Section: "CardSim",
  Image: "Image",
  Input: "FormInput",
  Select: "TextSelection",
  Link: "Link",
  Form: "FormInput",
  Frame: "CardSim",
  Carousel: "SlidersHorizontal",
  List: "List",
  CMSContentList: "List",
  CMSContentItem: "Database",
  CMSContentGrid: "Database",
} as const;

export const ELEMENT_LABELS: Record<ElementType, string> = {
  Text: "Text",
  Button: "Button",
  Section: "Section",
  Image: "Image",
  Input: "Input",
  Select: "Select",
  Link: "Link",
  Form: "Form",
  Frame: "Frame",
  Carousel: "Carousel",
  List: "List",
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
    Text: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.BaseComponent,
      ),
    Button: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.ButtonComponent,
      ),
    Section: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.SectionComponent,
      ),
    Image: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.ImageComponent,
      ),
    Input: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.InputComponent,
      ),
    Select: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.SelectComponent,
      ),
    Link: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.BaseComponent,
      ),
    Form: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.FormComponent,
      ),
    Frame: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.FrameComponent,
      ),
    Carousel: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.CarouselComponent,
      ),
    List: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.ListComponent,
      ),
    CMSContentList: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.CMSContentListComponent,
      ),
    CMSContentItem: () =>
      import("@/components/editor/editorcomponents").then(
        (m) => m.CMSContentItemComponent,
      ),
    CMSContentGrid: () =>
      import("@/components/editor/editorcomponents").then(
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
