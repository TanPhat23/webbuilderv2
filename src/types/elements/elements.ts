import type React from "react";
import type { CSSProperties } from "react";
import type { EmblaOptionsType } from "embla-carousel";
import type { ComponentSetting } from "./component-setting";
import type { ElementEvents } from "./events";
import type { ValidationRule } from "./validation";
import type { AuthVisibility, FormAuthAction } from "@/lib/site-auth";

export type CSSStyles = CSSProperties;
export type Breakpoint = "default" | "sm" | "md" | "lg" | "xl";
export type ResponsiveStyles = Partial<
  Record<Breakpoint | string, CSSProperties>
>;

export type ElementType = keyof ElementTypeMap;

export interface Element<
  Type extends ElementType = ElementType,
  Settings extends object = Record<string, unknown>,
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
  settings?: (Settings & { component?: ComponentSetting; authVisibility?: AuthVisibility }) | null;
  order?: number;
  orderKey?: string;
  events?: ElementEvents;
}

export interface TextElement extends Element<"Text"> {}

export interface SpanElement extends Element<"Span"> {}

export interface HeadingSettings {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface HeadingElement extends Element<"Heading", HeadingSettings> {}

export interface LabelSettings {
  htmlFor?: string;
}

export interface LabelElement extends Element<"Label", LabelSettings> {}

export interface BlockquoteSettings {
  cite?: string;
}

export interface BlockquoteElement extends Element<
  "Blockquote",
  BlockquoteSettings
> {}

export interface CodeSettings {
  language?: string;
  preformatted?: boolean;
}

export interface CodeElement extends Element<"Code", CodeSettings> {}

export interface SeparatorElement extends Element<"Separator"> {}

export interface IconSettings {
  iconName?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  fill?: string;
  absoluteStrokeWidth?: boolean;
}

export interface IconElement extends Element<"Icon", IconSettings> {}

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

export interface VideoSettings {
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  preload?: "none" | "metadata" | "auto";
  playsInline?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  width?: number;
  height?: number;
}

export interface VideoElement extends Element<"Video", VideoSettings> {
  src?: string;
}

export interface AudioSettings {
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto";
}

export interface AudioElement extends Element<"Audio", AudioSettings> {
  src?: string;
}

export interface IFrameSettings {
  sandbox?:
    | "allow-forms"
    | "allow-modals"
    | "allow-popups"
    | "allow-same-origin"
    | "allow-scripts"
    | "allow-top-navigation"
    | string;
  allow?: string;
  loading?: "lazy" | "eager";
  referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
  width?: number | string;
  height?: number | string;
}

export interface IFrameElement extends Element<"IFrame", IFrameSettings> {
  src?: string;
}

export interface LinkElement extends Element<"Link"> {
  href?: string;
  elements?: EditorElement[];
}

export interface ButtonSettings {
  buttonType?: "button" | "submit" | "reset";
  authAction?: "logout";
  target?: string;
  rel?: string;
  nofollow?: boolean;
  noopener?: boolean;
  noreferrer?: boolean;
}

export interface ButtonElement extends Element<"Button", ButtonSettings> {
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

export interface TextareaSettings {
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  wrap?: "hard" | "soft" | "off";
  autoComplete?: string;
  spellCheck?: boolean;
  resize?: "none" | "both" | "horizontal" | "vertical";
  validateRules?: ValidationRule[];
}

export interface TextareaElement extends Element<
  "Textarea",
  TextareaSettings
> {}

export interface CheckboxSettings {
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  required?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  value?: string;
  label?: string;
  validateRules?: ValidationRule[];
}

export interface CheckboxElement extends Element<
  "Checkbox",
  CheckboxSettings
> {}

export interface RadioSettings {
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  label?: string;
  validateRules?: ValidationRule[];
}

export interface RadioElement extends Element<"Radio", RadioSettings> {}

export interface ProgressSettings {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  label?: string;
}

export interface ProgressElement extends Element<
  "Progress",
  ProgressSettings
> {}

export interface ListElement extends Element<"List"> {
  elements: EditorElement[];
}

export interface SelectOption {
  id: string;
  label: string;
  value: string;
}

export interface SelectSettings {
  name?: string;
  selectOptions?: SelectOption[];
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface SelectElement extends Element<"Select", SelectSettings> {
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
  /** The form handles its own submit (a form library): generated interactions leave it alone. */
  customSubmit?: boolean;
  /** Extra props written in the code view, as source text, e.g. `onSubmit={handleSubmit(save)}`. */
  codeProps?: string[];
  /** Target CMS collection ID or slug for managed form submissions. */
  collectionId?: string;
  /** Project ID owning the target collection (falls back to element.projectId). */
  projectId?: string;
  /** Message displayed after a successful managed form submission. */
  successMessage?: string;
  /** Built-in Supabase Auth flow executed on form submit. */
  authAction?: FormAuthAction;
}

export interface FormElement extends Element<"Form", FormSettings> {
  elements: EditorElement[];
}

export interface TableSettings {
  caption?: string;
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  columns?: TableColumnDefinition[];
}

export interface TableColumnDefinition {
  id: string;
  header: string;
  accessor?: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

export interface TableElement extends Element<"Table", TableSettings> {
  elements: EditorElement[];
}

export interface FrameElement extends Element<"Frame"> {
  elements: EditorElement[];
}

export interface SectionElement extends Element<"Section"> {
  elements: EditorElement[];
}

export interface NavElement extends Element<"Nav"> {
  elements: EditorElement[];
}

export interface HeaderElement extends Element<"Header"> {
  elements: EditorElement[];
}

export interface FooterElement extends Element<"Footer"> {
  elements: EditorElement[];
}

export interface ArticleElement extends Element<"Article"> {
  elements: EditorElement[];
}

export interface AsideElement extends Element<"Aside"> {
  elements: EditorElement[];
}

export interface CMSContentSettings {
  contentTypeId?: string;
  displayMode?: "list" | "grid" | "single";
  limit?: number;
  sortBy?: "title" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  fieldsToShow?: string[];
  itemSlug?: string;
  filterBy?: Record<string, unknown>;
}

export interface CMSContentListElement extends Element<
  "CMSContentList",
  CMSContentSettings
> {
  elements: EditorElement[];
}

export interface CMSContentItemElement extends Element<
  "CMSContentItem",
  CMSContentSettings
> {
  elements: EditorElement[];
}

export interface CMSContentGridElement extends Element<
  "CMSContentGrid",
  CMSContentSettings
> {
  elements: EditorElement[];
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

export type EditorElement = ElementTypeMap[ElementType];

export type ElementTypeMap = {
  Text: TextElement;
  Span: SpanElement;
  Heading: HeadingElement;
  Label: LabelElement;
  Blockquote: BlockquoteElement;
  Code: CodeElement;
  Separator: SeparatorElement;
  Icon: IconElement;
  Image: ImageElement;
  Video: VideoElement;
  Audio: AudioElement;
  IFrame: IFrameElement;
  Button: ButtonElement;
  Link: LinkElement;
  Input: InputElement;
  Textarea: TextareaElement;
  Checkbox: CheckboxElement;
  Radio: RadioElement;
  Progress: ProgressElement;
  List: ListElement;
  Select: SelectElement;
  Form: FormElement;
  Table: TableElement;
  Frame: FrameElement;
  Section: SectionElement;
  Nav: NavElement;
  Header: HeaderElement;
  Footer: FooterElement;
  Article: ArticleElement;
  Aside: AsideElement;
  CMSContentList: CMSContentListElement;
  CMSContentItem: CMSContentItemElement;
  CMSContentGrid: CMSContentGridElement;
  Carousel: CarouselElement;
};
