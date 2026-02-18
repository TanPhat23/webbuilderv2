import { ElementType } from "@/types/global.type";
import {
  ArticleElementCreateStrategy,
  AsideElementCreateStrategy,
  AudioElementCreateStrategy,
  BlockquoteElementCreateStrategy,
  ButtonElementCreateStrategy,
  IconElementCreateStrategy,
  CarouselElementCreateStrategy,
  CheckboxElementCreateStrategy,
  CMSContentGridElementCreateStrategy,
  CMSContentItemElementCreateStrategy,
  CMSContentListElementCreateStrategy,
  CodeElementCreateStrategy,
  ElementCreateStrategy,
  FooterElementCreateStrategy,
  FormElementCreateStrategy,
  FrameElementCreateStrategy,
  HeaderElementCreateStrategy,
  HeadingElementCreateStrategy,
  IFrameElementCreateStrategy,
  ImageElementCreateStrategy,
  InputElementCreateStrategy,
  LabelElementCreateStrategy,
  ListElementCreateStrategy,
  NavElementCreateStrategy,
  ProgressElementCreateStrategy,
  RadioElementCreateStrategy,
  SectionElementCreateStrategy,
  SelectElementCreateStrategy,
  SeparatorElementCreateStrategy,
  SpanElementCreateStrategy,
  TableElementCreateStrategy,
  TextElementCreateStrategy,
  TextareaElementCreateStrategy,
  VideoElementCreateStrategy,
} from "./elementCreateStrategy";

export const ElementStrategyMap: Map<ElementType, ElementCreateStrategy> =
  new Map([
    // Inline / Leaf
    ["Text", new TextElementCreateStrategy()],
    ["Span", new SpanElementCreateStrategy()],
    ["Heading", new HeadingElementCreateStrategy()],
    ["Label", new LabelElementCreateStrategy()],
    ["Blockquote", new BlockquoteElementCreateStrategy()],
    ["Code", new CodeElementCreateStrategy()],
    ["Separator", new SeparatorElementCreateStrategy()],
    ["Icon", new IconElementCreateStrategy()],
    // Media
    ["Image", new ImageElementCreateStrategy()],
    ["Video", new VideoElementCreateStrategy()],
    ["Audio", new AudioElementCreateStrategy()],
    ["IFrame", new IFrameElementCreateStrategy()],
    // Interactive
    ["Button", new ButtonElementCreateStrategy()],
    // Form
    ["Input", new InputElementCreateStrategy()],
    ["Textarea", new TextareaElementCreateStrategy()],
    ["Checkbox", new CheckboxElementCreateStrategy()],
    ["Radio", new RadioElementCreateStrategy()],
    ["Progress", new ProgressElementCreateStrategy()],
    ["List", new ListElementCreateStrategy()],
    ["Select", new SelectElementCreateStrategy()],
    ["Form", new FormElementCreateStrategy()],
    // Table
    ["Table", new TableElementCreateStrategy()],
    // Container / Layout
    ["Frame", new FrameElementCreateStrategy()],
    ["Section", new SectionElementCreateStrategy()],
    ["Nav", new NavElementCreateStrategy()],
    ["Header", new HeaderElementCreateStrategy()],
    ["Footer", new FooterElementCreateStrategy()],
    ["Article", new ArticleElementCreateStrategy()],
    ["Aside", new AsideElementCreateStrategy()],
    // Carousel
    ["Carousel", new CarouselElementCreateStrategy()],
    // CMS
    ["CMSContentList", new CMSContentListElementCreateStrategy()],
    ["CMSContentItem", new CMSContentItemElementCreateStrategy()],
    ["CMSContentGrid", new CMSContentGridElementCreateStrategy()],
  ]);

export const getElementStrategy = (
  type: ElementType,
): ElementCreateStrategy => {
  const strategy = ElementStrategyMap.get(type);
  if (!strategy) {
    throw new Error(`No strategy found for element type: ${type}`);
  }
  return strategy;
};
