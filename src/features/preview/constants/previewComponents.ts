import { ElementType } from "@/types/global.type";
import { EditorElement } from "@/features/editor";
import React from "react";
import PreviewBaseComponent from "@/features/preview/components/PreviewBaseComponent";
import PreviewButtonComponent from "@/features/preview/components/PreviewButtonComponent";
import PreviewFrameComponent from "@/features/preview/components/PreviewFrameComponent";
import PreviewImageComponent from "@/features/preview/components/PreviewImageComponent";
import PreviewInputComponent from "@/features/preview/components/PreviewInputComponent";
import PreviewListComponent from "@/features/preview/components/PreviewListComponent";
import PreviewSectionComponent from "@/features/preview/components/PreviewSectionComponent";
import PreviewSelectComponent from "@/features/preview/components/PreviewSelectComponent";
import PreviewFormComponent from "@/features/preview/components/PreviewFormComponent";
import PreviewCarouselComponent from "@/features/preview/components/PreviewCarouselComponent";
import PreviewCMSContentListComponent from "@/features/preview/components/PreviewCMSContentListComponent";
import PreviewCMSContentItemComponent from "@/features/preview/components/PreviewCMSContentItemComponent";
import PreviewCMSContentGridComponent from "@/features/preview/components/PreviewCMSContentGridComponent";

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
