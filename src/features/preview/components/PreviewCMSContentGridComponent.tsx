import React from "react";
import { CMSContentGridElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import PreviewElementLoader from "./PreviewElementLoader";
import { PreviewCMSFeedback } from "./PreviewCMSFeedback";
import { useCMSItemList } from "../hooks/useCMSFetch";

interface PreviewCMSContentGridComponentProps {
  element: CMSContentGridElement;
  data?: any;
}

const PreviewCMSContentGridComponent = ({
  element,
  data,
}: PreviewCMSContentGridComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};
  const {
    contentTypeId,
    limit = 6,
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
    <div
      id={element.id} data-element-id={element.id}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1rem",
      }}
    >
      {contentItems.map((item, index) => (
        <div key={item.id || index} style={{ width: "100%" }}>
          <PreviewElementLoader
            elements={element.elements}
            data={item as unknown as Record<string, unknown>}
          />
        </div>
      ))}
    </div>
  );
};

export default PreviewCMSContentGridComponent;
