import { EditorComponentProps } from "@/interfaces/editor.interface";

import { ElementType } from "@/types/global.type";
import {
  FormInput,
  Image,
  TextSelection,
  Type,
  CardSim,
  MousePointerClick,
  Link,
  SlidersHorizontal,
  List,
  Database,
} from "lucide-react";
import React from "react";
import {
  BaseComponent,
  ButtonComponent,
  CarouselComponent,
  FormComponent,
  FrameComponent,
  ImageComponent,
  InputComponent,
  ListComponent,
  SectionComponent,
  SelectComponent,
  CMSContentListComponent,
  CMSContentItemComponent,
  CMSContentGridComponent,
} from "@/components/editor/editorcomponents";

interface ElementHolder {
  type: ElementType;
  icon: React.ReactNode;
}

export const CONTAINER_ELEMENT_TYPES = [
  "Frame",
  "Form",
  "List",
  "Section",
  "Carousel",
  "DataLoader",
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

export const elementHolders: ElementHolder[] = [
  {
    type: "Text",
    icon: <Type className="w-4 h-4" />,
  },
  {
    type: "Button",
    icon: <MousePointerClick className="w-4 h-4" />,
  },
  {
    type: "Section",
    icon: <CardSim className="w-4 h-4" />,
  },
  {
    type: "Image",
    icon: <Image className="w-4 h-4" />,
  },
  {
    type: "Input",
    icon: <FormInput className="w-4 h-4" />,
  },
  {
    type: "Select",
    icon: <TextSelection className="w-4 h-4" />,
  },
  {
    type: "Link",
    icon: <Link className="w-4 h-4" />,
  },
  {
    type: "Form",
    icon: <FormInput className="w-4 h-4" />,
  },
  {
    type: "Frame",
    icon: <CardSim className="w-4 h-4" />,
  },
  {
    type: "Carousel",
    icon: <SlidersHorizontal className="w-4 h-4" />,
  },
  {
    type: "List",
    icon: <List className="w-4 h-4" />,
  },
  {
    type: "CMSContentList",
    icon: <List className="w-4 h-4" />,
  },
  {
    type: "CMSContentItem",
    icon: <Database className="w-4 h-4" />,
  },
  {
    type: "CMSContentGrid",
    icon: <Database className="w-4 h-4" />,
  },
] as const;

const ComponentMap = new Map<
  ElementType,
  React.ComponentType<EditorComponentProps>
>([
  ["Text", BaseComponent],
  ["Button", ButtonComponent],
  ["Section", SectionComponent],
  ["Image", ImageComponent],
  ["Input", InputComponent],
  ["Select", SelectComponent],
  ["Link", BaseComponent],
  ["Form", FormComponent],
  ["Frame", FrameComponent],
  ["Carousel", CarouselComponent],
  ["List", ListComponent],
  ["CMSContentList", CMSContentListComponent],
  ["CMSContentItem", CMSContentItemComponent],
  ["CMSContentGrid", CMSContentGridComponent],
]);

export const getComponentMap = (
  props: EditorComponentProps,
): React.ComponentType<EditorComponentProps> | undefined => {
  return ComponentMap.get(props.element.type);
};

export default elementHolders;
