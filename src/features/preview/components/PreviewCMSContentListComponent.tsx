import React from "react";
import { CMSContentListElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import PreviewElementLoader from "./PreviewElementLoader";
import { PreviewCMSFeedback } from "./PreviewCMSFeedback";
import { useCMSItemList } from "../hooks/useCMSFetch";

interface PreviewCMSContentListComponentProps {
  element: CMSContentListElement;
  data?: any;
}

const PreviewCMSContentListComponent = ({
  element,
  data,
}: PreviewCMSContentListComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};
  const {
    contentTypeId,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = settings;

  const {
    data: contentItems,
    loading,
    error,
  } = useCMSItemList({ contentTypeId, limit, sortBy, sortOrder });

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
      {contentItems.map((item, index) => (
        <div key={item.id || index}>
          <PreviewElementLoader
            elements={element.elements}
            data={item as unknown as Record<string, unknown>}
          />
        </div>
      ))}
    </div>
  );
};

export default PreviewCMSContentListComponent;
