import React, { useState, useEffect } from "react";
import { CMSContentListElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import PreviewElementLoader from "./PreviewElementLoader";

interface PreviewCMSContentListComponentProps {
  element: CMSContentListElement;
  data?: any;
}

const PreviewCMSContentListComponent = ({
  element,
  data,
}: PreviewCMSContentListComponentProps) => {
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};
  const {
    contentTypeId,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = settings;

  useEffect(() => {
    if (!contentTypeId) return;

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        // This would need to be implemented based on your CMS API
        // For now, using a placeholder
        const response = await fetch(
          `/api/cms/${contentTypeId}?limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setContentItems(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentTypeId, limit, sortBy, sortOrder]);

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
