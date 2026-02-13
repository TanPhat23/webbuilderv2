import { ElementType } from "@/types/global.type";
import { EditorElement } from "@/interfaces/elements.interface";
import React from "react";
import PreviewBaseComponent from "@/components/preview/PreviewBaseComponent";
import PreviewButtonComponent from "@/components/preview/PreviewButtonComponent";
import PreviewFrameComponent from "@/components/preview/PreviewFrameComponent";
import PreviewImageComponent from "@/components/preview/PreviewImageComponent";
import PreviewInputComponent from "@/components/preview/PreviewInputComponent";
import PreviewListComponent from "@/components/preview/PreviewListComponent";
import PreviewSectionComponent from "@/components/preview/PreviewSectionComponent";
import PreviewSelectComponent from "@/components/preview/PreviewSelectComponent";
import PreviewFormComponent from "@/components/preview/PreviewFormComponent";
import PreviewCarouselComponent from "@/components/preview/PreviewCarouselComponent";
import PreviewCMSContentListComponent from "@/components/preview/PreviewCMSContentListComponent";
import PreviewCMSContentItemComponent from "@/components/preview/PreviewCMSContentItemComponent";
import PreviewCMSContentGridComponent from "@/components/preview/PreviewCMSContentGridComponent";

/**
 * Props contract for all preview components.
 *
 * Each preview component receives the full `EditorElement` (which individual
 * components may narrow to a more specific type in their own interface) and an
 * optional `data` bag used to pass CMS content or other runtime values.
 */
export interface PreviewComponentProps {
  element: EditorElement;
  data?: Record<string, unknown>;
}

// Each preview component narrows `element` to a specific type (e.g. TextElement)
// which is contravariant with the broader `EditorElement` in PreviewComponentProps.
// The assertion is safe because the Map is keyed by ElementType, guaranteeing the
// correct element subtype is passed at runtime.
const PreviewComponentMap = new Map([
  ["Text", PreviewBaseComponent],
  ["Button", PreviewButtonComponent],
  ["Section", PreviewSectionComponent],
  ["Image", PreviewImageComponent],
  ["Input", PreviewInputComponent],
  ["Select", PreviewSelectComponent],
  ["Link", PreviewBaseComponent],
  ["Form", PreviewFormComponent],
  ["Frame", PreviewFrameComponent],
  ["Carousel", PreviewCarouselComponent],
  ["List", PreviewListComponent],
  ["CMSContentList", PreviewCMSContentListComponent],
  ["CMSContentItem", PreviewCMSContentItemComponent],
  ["CMSContentGrid", PreviewCMSContentGridComponent],
] as [ElementType, React.ComponentType<PreviewComponentProps>][]);

export const getPreviewComponentMap = (
  elementType: ElementType,
): React.ComponentType<PreviewComponentProps> | undefined => {
  return PreviewComponentMap.get(elementType);
};
