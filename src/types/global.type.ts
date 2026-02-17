import {
  CONTAINER_ELEMENT_TYPES,
  EDITABLE_ELEMENT_TYPES,
  type ElementType,
} from "@/constants/elements";
import {
  ButtonElement,
  FormElement,
  FrameElement,
  ImageElement,
  InputElement,
  ListElement,
  SectionElement,
  SelectElement,
  TextElement,
  CarouselElement,
  CMSContentListElement,
  CMSContentItemElement,
  CMSContentGridElement,
  LinkElement,
} from "@/interfaces/elements.interface";

type ContainerElement =
  | FrameElement
  | SectionElement
  | FormElement
  | ListElement
  | SelectElement
  | CarouselElement
  | CMSContentListElement
  | CMSContentItemElement
  | CMSContentGridElement;

type EditorElement =
  | FrameElement
  | ButtonElement
  | ImageElement
  | LinkElement
  | ListElement
  | InputElement
  | SelectElement
  | FormElement
  | SectionElement
  | TextElement
  | CarouselElement
  | CMSContentListElement
  | CMSContentItemElement
  | CMSContentGridElement;

type ExcludeType = "id" | "pageId" | "parentId";

type ContainerElementTemplate = Partial<Omit<EditorElement, ExcludeType>> & {
  type: ContainerElementType;
  elements?: ElementTemplate[];
};

type LeafElementTemplate = Partial<Omit<EditorElement, ExcludeType>> & {
  type: Exclude<ElementType, ContainerElementType>;
};

type ElementTemplate = ContainerElementTemplate | LeafElementTemplate;
type ContainerElementType = (typeof CONTAINER_ELEMENT_TYPES)[number];

type EditableElementType = (typeof EDITABLE_ELEMENT_TYPES)[number];

export type {
  EditorElement,
  EditableElementType,
  ContainerElement,
  ElementType,
  ContainerElementType,
  ContainerElementTemplate,
  LeafElementTemplate,
  ElementTemplate,
};

export type { ElementTypeMap } from "@/interfaces/elements.interface";
