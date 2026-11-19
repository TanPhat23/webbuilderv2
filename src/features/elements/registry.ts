import { createElement, lazy, Suspense, type ComponentType } from "react";
import type { EditorElement, ElementType } from "@/types/global.type";
import type { ViewProps } from "./view-props";
import ButtonView from "./views/ButtonView";
import FrameView from "./views/FrameView";
import ImageView from "./views/ImageView";
import LinkView from "./views/LinkView";
import SectionView from "./views/SectionView";
import TextView from "./views/TextView";
import InputView from "./views/InputView";
import TextareaView from "./views/TextareaView";
import SelectView from "./views/SelectView";
import FormView from "./views/FormView";
import ListView from "./views/ListView";
import ChoiceInputView from "./views/ChoiceInputView";
import CMSCollectionView from "./views/CMSCollectionView";
import ProgressView from "./views/ProgressView";
import SeparatorView from "./views/SeparatorView";
import IconView from "./views/IconView";
import IFrameView from "./views/IFrameView";
import MediaView from "./views/MediaView";

function lazyView<E extends EditorElement>(load: () => Promise<{ default: ComponentType<ViewProps<E>> }>) {
  const View = lazy(load);
  return function LazyView(props: ViewProps<E>) {
    return createElement(Suspense, { fallback: null }, createElement(View, props));
  };
}

type Views = { [T in ElementType]: ComponentType<ViewProps<Extract<EditorElement, { type: T }>>> };

const views: Views = {
  Text: TextView,
  Button: ButtonView,
  Link: LinkView,
  Image: ImageView,
  Section: SectionView,
  Header: SectionView,
  Footer: SectionView,
  Nav: SectionView,
  Frame: FrameView,
  IFrame: IFrameView,
  Icon: IconView,
  Separator: SeparatorView,
  Progress: ProgressView,
  List: ListView,
  Form: FormView,
  Select: SelectView,
  Textarea: TextareaView,
  Input: InputView,
  CMSContentItem: FrameView,
  CMSContentGrid: CMSCollectionView,
  CMSContentList: CMSCollectionView,
  Audio: MediaView,
  Video: MediaView,
  Radio: ChoiceInputView,
  Checkbox: ChoiceInputView,
  Table: lazyView(() => import("./views/TableView")),
  Code: lazyView(() => import("./views/CodeView")),
  Carousel: lazyView(() => import("./views/CarouselView")),
  Aside: SectionView,
  Article: SectionView,
  Blockquote: TextView,
  Heading: TextView,
  Label: TextView,
  Span: TextView,
};

export function getView(type: ElementType): ComponentType<ViewProps> | undefined {
  // The registry caller renders an element of the same type as the lookup key.
  return Object.hasOwn(views, type) ? views[type] as ComponentType<ViewProps> : undefined;
}
