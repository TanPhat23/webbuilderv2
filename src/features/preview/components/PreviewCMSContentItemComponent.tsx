import React, { useState, useEffect } from "react";
import { CMSContentItemElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import PreviewElementLoader from "./PreviewElementLoader";

interface PreviewCMSContentItemComponentProps {
  element: CMSContentItemElement;
  data?: any;
}

const PreviewCMSContentItemComponent = ({
  element,
  data,
}: PreviewCMSContentItemComponentProps) => {
  const [contentItem, setContentItem] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};
  const { contentTypeId, itemSlug } = settings;

  useEffect(() => {
    if (!contentTypeId || !itemSlug) return;

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        // This would need to be implemented based on your CMS API
        const response = await fetch(
          `/api/cms/${contentTypeId}/item/${itemSlug}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setContentItem(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentTypeId, itemSlug]);

  if (loading) {
    return (
      <div
        style={{
          ...safeStyles,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading content...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          ...safeStyles,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "red",
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div className={element.tailwindStyles} style={safeStyles}>
      <PreviewElementLoader
        elements={element.elements}
        data={contentItem as unknown as Record<string, unknown>}
      />
    </div>
  );
};

export default PreviewCMSContentItemComponent;
