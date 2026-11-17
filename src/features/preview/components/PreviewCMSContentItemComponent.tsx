import React from "react";
import { CMSContentItemElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import PreviewElementLoader from "./PreviewElementLoader";
import { PreviewCMSFeedback } from "./PreviewCMSFeedback";
import { useCMSFetch } from "../hooks/useCMSFetch";

interface PreviewCMSContentItemComponentProps {
  element: CMSContentItemElement;
  data?: any;
}

const parseItem = (body: unknown): any => body;

const PreviewCMSContentItemComponent = ({
  element,
  data,
}: PreviewCMSContentItemComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};
  const { contentTypeId, itemSlug } = settings;

  const {
    data: contentItem,
    loading,
    error,
  } = useCMSFetch<any>(
    contentTypeId && itemSlug
      ? `/api/cms/${contentTypeId}/item/${itemSlug}`
      : null,
    parseItem,
    null,
  );

  if (PreviewCMSFeedback.isActive(loading, error)) {
    return (
      <PreviewCMSFeedback
        elementId={element.id}
        styles={safeStyles}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <div id={element.id} data-element-id={element.id} className={element.tailwindStyles} style={safeStyles}>
      <PreviewElementLoader
        elements={element.elements}
        data={contentItem as unknown as Record<string, unknown>}
      />
    </div>
  );
};

export default PreviewCMSContentItemComponent;
