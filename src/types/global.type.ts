import {
  CONTAINER_ELEMENT_TYPES,
  EDITABLE_ELEMENT_TYPES,
  type ElementType,
} from "@/constants/elements";
import {
  ArticleElement,
  AsideElement,
  AudioElement,
  BlockquoteElement,
  ButtonElement,
  CarouselElement,
  CheckboxElement,
  CMSContentGridElement,
  CMSContentItemElement,
  CMSContentListElement,
  CodeElement,
  FooterElement,
  FormElement,
  FrameElement,
  HeaderElement,
  HeadingElement,
  IconElement,
  IFrameElement,
  ImageElement,
  InputElement,
  LabelElement,
  LinkElement,
  ListElement,
  NavElement,
  ProgressElement,
  RadioElement,
  SectionElement,
  SelectElement,
  SeparatorElement,
  SpanElement,
  TableElement,
  TextElement,
  TextareaElement,
  VideoElement,
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
  | CMSContentGridElement
  | TableElement
  | NavElement
  | HeaderElement
  | FooterElement
  | ArticleElement
  | AsideElement;

type EditorElement =
  // Inline / Leaf
  | TextElement
  | SpanElement
  | HeadingElement
  | LabelElement
  | BlockquoteElement
  | CodeElement
  | SeparatorElement
  | IconElement
  // Media
  | ImageElement
  | VideoElement
  | AudioElement
  | IFrameElement
  // Interactive
  | LinkElement
  | ButtonElement
  // Form
  | InputElement
  | TextareaElement
  | CheckboxElement
  | RadioElement
  | ProgressElement
  | ListElement
  | SelectElement
  | FormElement
  // Table
  | TableElement
  // Container / Layout
  | FrameElement
  | SectionElement
  | NavElement
  | HeaderElement
  | FooterElement
  | ArticleElement
  | AsideElement
  // CMS
  | CMSContentListElement
  | CMSContentItemElement
  | CMSContentGridElement
  // Carousel
  | CarouselElement;

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
