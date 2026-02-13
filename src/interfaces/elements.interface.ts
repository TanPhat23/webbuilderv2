import { ElementType } from "@/types/global.type";
import { CSSProperties } from "react";
import type { EmblaOptionsType } from "embla-carousel";
import { ElementEvents } from "@/interfaces/events.interface";
import { ValidationRule } from "@/interfaces/validate.interface";

export type CSSStyles = CSSProperties;
export type Breakpoint = "default" | "sm" | "md" | "lg" | "xl";
export type ResponsiveStyles = Partial<
  Record<Breakpoint | string, CSSProperties>
>;

export interface Element<
  Type extends ElementType = ElementType,
  Settings extends Record<string, any> = Record<string, any>,
> extends Partial<React.HTMLAttributes<HTMLElement>> {
  readonly id: string;
  readonly type: Type;
  content: string;
  name?: string;
  styles?: ResponsiveStyles;
  tailwindStyles?: string;
  href?: string;
  src?: string;
  parentId?: string;
  readonly pageId: string;
  settings?: Settings | null;
  order?: number;
  events?: ElementEvents;
  eventWorkflowConnections?: string[];
}

export interface TextElement extends Element<"Text"> {}

export interface ImageSettings {
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  sizes?: string;
  srcset?: string;
}

export interface ImageElement extends Element<"Image", ImageSettings> {
  src?: string;
}

export interface LinkElement extends Element<"Link"> {
  href?: string;
}

export interface ButtonElement extends Element<"Button"> {
  href?: string;
}

export interface InputSettings {
  name?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "textarea";
  placeholder?: string;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  pattern?: string;
  validationMessage?: string;
  autoComplete?: string;
  validateRules?: ValidationRule[];
}

export interface InputElement extends Element<"Input", InputSettings> {}

export interface ListElement extends Element<"List"> {
  elements: EditorElement[];
}

export interface SelectElement extends Element<
  "Select",
  Partial<HTMLSelectElement>
> {
  elements: EditorElement[];
}

export interface FrameElement extends Element<"Frame"> {
  elements: EditorElement[];
}

export interface SectionElement extends Element<"Section"> {
  elements: EditorElement[];
}

export interface FormSettings {
  action?: string;
  method?: "get" | "post";
  autoComplete?: "on" | "off";
  target?: "_self" | "_blank" | "_parent" | "_top";
  encType?:
    | "application/x-www-form-urlencoded"
    | "multipart/form-data"
    | "text/plain";
  validateOnSubmit?: boolean;
  redirectUrl?: string;
  noValidate?: boolean;
  acceptCharset?: string;
}

export interface FormElement extends Element<"Form", FormSettings> {
  elements: EditorElement[];
}

export interface DataLoaderSettings {
  apiUrl: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
  authToken?: string;
}

export interface DataLoaderElement extends Element<
  "DataLoader",
  DataLoaderSettings
> {
  elements: EditorElement[];
}

export interface CMSContentSettings {
  contentTypeId?: string;
  displayMode?: "list" | "grid" | "single";
  limit?: number;
  sortBy?: "title" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  fieldsToShow?: string[];
  itemSlug?: string; // For single item display
  filterBy?: Record<string, any>;
}

export interface CMSContentListElement extends Element<
  "CMSContentList",
  CMSContentSettings
> {
  elements: EditorElement[]; // Template for each item
}

export interface CMSContentItemElement extends Element<
  "CMSContentItem",
  CMSContentSettings
> {
  elements: EditorElement[]; // Template for the item
}

export interface CMSContentGridElement extends Element<
  "CMSContentGrid",
  CMSContentSettings
> {
  elements: EditorElement[]; // Template for each grid item
}

export interface CarouselSettings extends EmblaOptionsType {
  withNavigation?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  slidesToShow?: number;
  slidesToScroll?: number;
  breakpoints?: Record<string, Partial<EmblaOptionsType>>;
}

export interface CarouselElement extends Element<"Carousel", CarouselSettings> {
  elements: EditorElement[];
}

export type EditorElement =
  | TextElement
  | ImageElement
  | LinkElement
  | ButtonElement
  | FrameElement
  | SectionElement
  | CarouselElement
  | InputElement
  | ListElement
  | SelectElement
  | FormElement
  | DataLoaderElement
  | CMSContentListElement
  | CMSContentItemElement
  | CMSContentGridElement;

export type { ElementEvents } from "@/interfaces/events.interface";
